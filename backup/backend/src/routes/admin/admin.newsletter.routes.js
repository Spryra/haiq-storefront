// routes/admin/admin.newsletter.routes.js
const router = require('express').Router();
const { query } = require('../../config/db');
const { requireStaff } = require('../../middleware/adminAuth');

/**
 * GET /admin/newsletter — list all subscribers
 */
router.get('/', requireStaff, async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT id, email, name, subscribed_at, is_active
       FROM newsletter_subscribers
       ORDER BY subscribed_at DESC`
    );
    res.json({ subscribers: rows });
  } catch (err) { next(err); }
});

module.exports = router;
