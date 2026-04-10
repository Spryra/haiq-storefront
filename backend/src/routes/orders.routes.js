const router = require('express').Router();
const { z } = require('zod');
const { validate } = require('../middleware/validate');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { orderLimiter } = require('../middleware/rateLimiter');
const ordersCtrl = require('../controllers/orders.controller');
const { query } = require('../config/db');
const emailService = require('../services/email.service');
const { logger } = require('../config/logger');

const createOrderSchema = z.object({
  first_name:        z.string().min(1).max(100),
  last_name:         z.string().min(1).max(100),
  email:             z.string().email(),
  phone:             z.string().regex(/^\+?[0-9]{9,15}$/),
  delivery_address:  z.string().min(5).max(500),
  delivery_note:     z.string().max(300).optional(),
  gift_note:         z.string().max(300).optional(),
  items: z.array(z.object({
    product_id: z.string().uuid(),
    variant_id: z.string().uuid(),
    quantity:   z.number().int().min(1).max(100),
  })).min(1),
  payment_method: z.enum(['mtn_momo', 'airtel', 'cash_on_delivery']),
  consent_given:  z.literal(true, { errorMap: () => ({ message: 'You must consent to proceed' }) }),
});

router.post('/', orderLimiter, optionalAuth, validate(createOrderSchema), ordersCtrl.create);
router.get('/track/:token', ordersCtrl.track);
router.get('/track/:token/stream', ordersCtrl.statusStream);
router.get('/my', requireAuth, ordersCtrl.listMine);
router.get('/:id', requireAuth, ordersCtrl.getOne);

// ── Customer cancel order ─────────────────────────────────────────────────────
router.post('/:id/cancel', requireAuth, async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason || String(reason).trim().length < 5) {
      return res.status(400).json({ success: false, error: 'Please provide a reason for cancellation (at least 5 characters).' });
    }

    const { rows: [order] } = await query(
      `SELECT id, status, user_id, payment_status, email, first_name
       FROM orders WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );

    if (!order) return res.status(404).json({ success: false, error: 'Order not found.' });

    // Customers can only cancel before en_route
    const nonCancellable = ['en_route', 'delivered', 'cancelled'];
    if (nonCancellable.includes(order.status)) {
      return res.status(400).json({
        success: false,
        error: `Orders that are "${order.status}" cannot be cancelled. Please contact us directly.`,
      });
    }

    // Note: if en_route, delivery fee will be charged (handled in billing separately)
    const deliveryFeeApplies = order.status === 'on_the_cart';

    await query(
      `UPDATE orders
       SET status = 'cancelled', cancellation_reason = $1, cancelled_by = 'customer', updated_at = NOW()
       WHERE id = $2`,
      [reason.trim(), order.id]
    );

    // Log event
    await query(
      `INSERT INTO order_events (order_id, event_type, old_value, new_value, actor_type, note)
       VALUES ($1, 'status_change', $2, 'cancelled', 'customer', $3)`,
      [order.id, order.status, `Customer cancelled: ${reason.trim()}`]
    );

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
  } catch (err) { next(err); }
});

module.exports = router;
