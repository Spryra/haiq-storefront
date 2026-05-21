// backend/src/routes/admin/admin.orders.routes.js
const router = require('express').Router()
const { validate } = require('../../middleware/validate')
const { requireStaff } = require('../../middleware/adminAuth')
const adminOrdersCtrl = require('../../controllers/admin/admin.orders.controller')
const { ORDER_STATUSES } = require('../../config/constants')
const { query, getClient } = require('../../config/db')
const emailService = require('../../services/email.service')
const { logger } = require('../../config/logger')
const { updateOrderStatusSchema } = require('../../middleware/schemas')

router.get('/',     requireStaff, adminOrdersCtrl.list)
router.get('/:id',  requireStaff, adminOrdersCtrl.getOne)
router.patch('/:id/status', requireStaff, validate(updateOrderStatusSchema), adminOrdersCtrl.updateStatus)

// ── Admin cancel order with reason ────────────────────────────────────────────
router.post('/:id/cancel', requireStaff, async (req, res, next) => {
  const client = await getClient()
  try {
    const { reason } = req.body
    if (!reason || String(reason).trim().length < 3) {
      return res.status(400).json({ success: false, error: 'Cancellation reason required.' })
    }

    await client.query('BEGIN')

    const { rows: [order] } = await client.query(
      'SELECT id, status, email, first_name, order_number, payment_status FROM orders WHERE id = $1 FOR UPDATE',
      [req.params.id]
    )

    if (!order) {
      await client.query('ROLLBACK')
      return res.status(404).json({ success: false, error: 'Order not found.' })
    }

    if (['delivered','cancelled'].includes(order.status)) {
      await client.query('ROLLBACK')
      return res.status(400).json({
        success: false,
        error: `Cannot cancel an order with status "${order.status}".`,
      })
    }

    // Update order status AND payment_status to 'refunded'
    await client.query(
      `UPDATE orders
       SET status = 'cancelled', payment_status = 'refunded', cancellation_reason = $1, cancelled_by = 'admin', updated_at = NOW()
       WHERE id = $2`,
      [reason.trim(), order.id]
    )

    // Log the order status change
    await client.query(
      `INSERT INTO order_events (order_id, event_type, old_value, new_value, actor_type, actor_id, note)
       VALUES ($1, 'status_change', $2, 'cancelled', 'admin', $3, $4)`,
      [order.id, order.status, req.admin.id, `Admin cancelled: ${reason.trim()}`]
    )

    // Log the payment status change
    await client.query(
      `INSERT INTO order_events (order_id, event_type, old_value, new_value, actor_type, actor_id, note)
       VALUES ($1, 'payment_status_change', $2, 'refunded', 'admin', $3, 'Order cancelled - payment status marked as refunded')`,
      [order.id, order.payment_status, req.admin.id]
    )

    await client.query('COMMIT')

    // Notify customer
    emailService.sendStatusUpdate({
      email:      order.email,
      first_name: order.first_name,
      status:     'cancelled',
    }).catch(e => logger.warn('Cancel email failed', { error: e.message }))

    res.json({ success: true, message: 'Order cancelled and payment status marked as refunded.' })
  } catch (err) {
    try { await client.query('ROLLBACK') } catch (_) {}
    next(err)
  } finally {
    client.release()
  }
})

module.exports = router
