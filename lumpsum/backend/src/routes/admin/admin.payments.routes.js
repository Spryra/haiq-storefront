const router = require('express').Router();
const { requireStaff } = require('../../middleware/adminAuth');
const { query } = require('../../config/db');

/**
 * @swagger
 * /admin/payments/{id}/confirm:
 *   patch:
 *     tags: [Admin Orders]
 *     summary: Admin confirms a bank transfer payment
 *     description: |
 *       Manually marks a bank transfer as paid after reviewing the proof of payment.
 *       Triggers order status change to `freshly_kneaded`.
 *     security:
 *       - AdminAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Payment ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes: { type: string, example: "Verified receipt #UG20240315" }
 *     responses:
 *       200:
 *         description: Payment confirmed, order advanced to Freshly Kneaded
 *       400:
 *         description: Payment not in pending state
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch('/:id/confirm', requireStaff, async (req, res, next) => {
  const client = await require('../../config/db').getClient();
  try {
    await client.query('BEGIN');

    const { rows: [payment] } = await client.query(
      'SELECT * FROM payments WHERE id = $1 FOR UPDATE',
      [req.params.id]
    );
    if (!payment) { await client.query('ROLLBACK'); return res.status(404).json({ success: false, error: 'Payment not found' }); }
    if (payment.status === 'successful') { await client.query('ROLLBACK'); return res.status(400).json({ success: false, error: 'Payment already confirmed' }); }

    await client.query(
      `UPDATE payments SET status = 'successful', notes = $1, updated_at = NOW() WHERE id = $2`,
      [req.body.notes || null, payment.id]
    );
    await client.query(
      `UPDATE orders SET payment_status = 'paid', status = 'freshly_kneaded', updated_at = NOW() WHERE id = $1`,
      [payment.order_id]
    );
    await client.query(
      `INSERT INTO order_events (order_id, event_type, old_value, new_value, actor_type, actor_id, note)
       VALUES ($1, 'payment_confirmed', 'pending', 'paid', 'admin', $2, $3)`,
      [payment.order_id, req.admin.id, `Bank transfer confirmed by admin ${req.admin.email}`]
    );

    await client.query('COMMIT');
    res.json({ success: true, message: 'Bank transfer confirmed. Order is Freshly Kneaded 🤲' });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

module.exports = router;
