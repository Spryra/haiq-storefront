// backend/src/routes/admin/admin.orders.routes.js
const router = require('express').Router()
const { validate } = require('../../middleware/validate')
const { requireStaff } = require('../../middleware/adminAuth')
const adminOrdersCtrl = require('../../controllers/admin/admin.orders.controller')
const { ORDER_STATUSES } = require('../../config/constants')
const { query } = require('../../config/db')
const emailService = require('../../services/email.service')
const { logger } = require('../../config/logger')
const { updateOrderStatusSchema } = require('../../middleware/schemas')

router.get('/',     requireStaff, adminOrdersCtrl.list)
router.get('/:id',  requireStaff, adminOrdersCtrl.getOne)
router.patch('/:id/status', requireStaff, validate(updateOrderStatusSchema), adminOrdersCtrl.updateStatus)

// ── Admin cancel order with reason ────────────────────────────────────────────
router.post('/:id/cancel', requireStaff, async (req, res, next) => {
  try {
    const { reason } = req.body
    if (!reason || String(reason).trim().length < 3) {
      return res.status(400).json({ success: false, error: 'Cancellation reason required.' })
    }

    const { rows: [order] } = await query(
      'SELECT id, status, email, first_name, order_number FROM orders WHERE id = $1',
      [req.params.id]
    )

    if (!order) return res.status(404).json({ success: false, error: 'Order not found.' })

    if (['delivered','cancelled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        error: `Cannot cancel an order with status "${order.status}".`,
      })
    }

    await query(
      `UPDATE orders
       SET status = 'cancelled', cancellation_reason = $1, cancelled_by = 'admin', updated_at = NOW()
       WHERE id = $2`,
      [reason.trim(), order.id]
    )

    await query(
      `INSERT INTO order_events (order_id, event_type, old_value, new_value, actor_type, actor_id, note)
       VALUES ($1, 'status_change', $2, 'cancelled', 'admin', $3, $4)`,
      [order.id, order.status, req.admin.id, `Admin cancelled: ${reason.trim()}`]
    )

    // Notify customer
    emailService.sendStatusUpdate({
      email:      order.email,
      first_name: order.first_name,
      status:     'cancelled',
    }).catch(e => logger.warn('Cancel email failed', { error: e.message }))

    res.json({ success: true, message: 'Order cancelled.' })
  } catch (err) { next(err) }
})

module.exports = router
