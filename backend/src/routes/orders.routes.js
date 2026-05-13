const router = require('express').Router();
const { validate } = require('../middleware/validate');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { orderLimiter } = require('../middleware/rateLimiter');
const ordersCtrl = require('../controllers/orders.controller');
const { query, getClient } = require('../config/db');
const emailService = require('../services/email.service');
const { logger } = require('../config/logger');
const { createOrderSchema, cancelOrderSchema } = require('../middleware/schemas');

router.post('/', orderLimiter, optionalAuth, validate(createOrderSchema), ordersCtrl.create);
router.get('/track/:token', ordersCtrl.track);
router.get('/track/:token/stream', ordersCtrl.statusStream);
router.get('/my', requireAuth, ordersCtrl.listMine);
router.get('/:id', requireAuth, ordersCtrl.getOne);

// ── Customer cancel order ─────────────────────────────────────────────────────
router.post('/:id/cancel', requireAuth, validate(cancelOrderSchema), async (req, res, next) => {
  const client = await getClient();
  try {
    const { reason } = req.body;

    await client.query('BEGIN');

    const { rows: [order] } = await client.query(
      `SELECT id, status, user_id, payment_status, email, first_name
       FROM orders WHERE id = $1 AND user_id = $2 FOR UPDATE`,
      [req.params.id, req.user.id]
    );

    if (!order) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    // Customers can only cancel before en_route
    const nonCancellable = ['en_route', 'delivered', 'cancelled'];
    if (nonCancellable.includes(order.status)) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: `Orders that are "${order.status}" cannot be cancelled. Please contact us directly.`,
      });
    }

    // Note: if en_route, delivery fee will be charged (handled in billing separately)
    const deliveryFeeApplies = order.status === 'on_the_cart';

    // Update order status AND payment_status to 'refunded'
    await client.query(
      `UPDATE orders
       SET status = 'cancelled', payment_status = 'refunded', cancellation_reason = $1, cancelled_by = 'customer', updated_at = NOW()
       WHERE id = $2`,
      [reason.trim(), order.id]
    );

    // Log order status change
    await client.query(
      `INSERT INTO order_events (order_id, event_type, old_value, new_value, actor_type, note)
       VALUES ($1, 'status_change', $2, 'cancelled', 'customer', $3)`,
      [order.id, order.status, `Customer cancelled: ${reason.trim()}`]
    );

    // Log payment status change
    await client.query(
      `INSERT INTO order_events (order_id, event_type, old_value, new_value, actor_type, note)
       VALUES ($1, 'payment_status_change', $2, 'refunded', 'customer', 'Order cancelled - payment status marked as refunded')`,
      [order.id, order.payment_status]
    );

    await client.query('COMMIT');

    // Notify customer
    emailService.sendStatusUpdate({
      email:       order.email,
      first_name:  order.first_name,
      status:      'cancelled',
    }).catch(e => logger.warn('Cancel email failed', { error: e.message }));

    res.json({
      success: true,
      message: 'Order cancelled.',
      delivery_fee_applies: deliveryFeeApplies,
    });
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch (_) {}
    next(err);
  } finally {
    client.release();
  }
});

module.exports = router;
