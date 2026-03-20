// admin.messages.routes.js
const router = require('express').Router();
const { requireStaff } = require('../../middleware/adminAuth');
const { query } = require('../../config/db');

/**
 * @swagger
 * /admin/messages:
 *   get:
 *     tags: [Admin Messages]
 *     summary: List all message threads (grouped by order)
 *     security:
 *       - AdminAuth: []
 *     parameters:
 *       - in: query
 *         name: unread
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Message threads
 */
router.get('/', requireStaff, async (req, res, next) => {
  try {
    const { rows } = await query(`
      SELECT
        m.order_id,
        o.order_number,
        o.first_name || ' ' || o.last_name AS customer_name,
        o.email AS customer_email,
        COUNT(m.id) AS total_messages,
        COUNT(m.id) FILTER (WHERE m.is_read = false AND m.sender_type = 'customer') AS unread_count,
        MAX(m.created_at) AS last_message_at
      FROM messages m
      LEFT JOIN orders o ON o.id = m.order_id
      GROUP BY m.order_id, o.order_number, o.first_name, o.last_name, o.email
      ORDER BY last_message_at DESC
    `);
    res.json({ success: true, threads: rows });
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /admin/messages/{order_id}/read:
 *   patch:
 *     tags: [Admin Messages]
 *     summary: Mark all customer messages in a thread as read
 *     security:
 *       - AdminAuth: []
 *     parameters:
 *       - in: path
 *         name: order_id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Marked as read
 */
router.patch('/:order_id/read', requireStaff, async (req, res, next) => {
  try {
    await query(
      `UPDATE messages SET is_read = true
       WHERE order_id = $1 AND sender_type = 'customer'`,
      [req.params.order_id]
    );
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
