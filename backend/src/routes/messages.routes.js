// src/routes/messages.routes.js
const router = require('express').Router();
const { validate } = require('../middleware/validate');
const { optionalAuth, requireAuth } = require('../middleware/auth');
const messagesCtrl = require('../controllers/messages.controller');
const { query } = require('../config/db');
const { createMessageSchema } = require('../middleware/schemas');

// Contact form — public
router.post('/', optionalAuth, validate(createMessageSchema), messagesCtrl.create);

// Order thread (guest-accessible via x-tracking-token header)
router.get('/:order_id', optionalAuth, messagesCtrl.getThread);

// ── Direct user-to-admin messages ────────────────────────────────────────────

// GET /v1/messages/direct/me — get all direct messages for logged-in user
router.get('/direct/me', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await query(`
      SELECT id, sender_type, body, subject, is_read, created_at
      FROM   messages
      WHERE  user_id = $1
        AND  is_direct = true
      ORDER  BY created_at ASC
    `, [req.user.id]);

    // Mark admin messages as read
    await query(
      `UPDATE messages SET is_read = true
       WHERE user_id = $1 AND is_direct = true AND sender_type = 'admin'`,
      [req.user.id]
    );

    res.json({ success: true, messages: rows });
  } catch (err) { next(err); }
});

// POST /v1/messages/direct — send a direct message to admin
router.post('/direct', requireAuth, validate(createMessageSchema), async (req, res, next) => {
  try {
    const { body, subject } = req.body;
    if (!body?.trim()) return res.status(400).json({ success: false, error: 'Message body required.' });

    const { rows: [msg] } = await query(`
      INSERT INTO messages (user_id, sender_type, sender_id, body, subject, is_direct)
      VALUES ($1, 'customer', $1, $2, $3, true)
      RETURNING id, created_at
    `, [req.user.id, body.trim(), subject?.trim() || null]);

    res.status(201).json({ success: true, message: msg });
  } catch (err) { next(err); }
});

module.exports = router;
