// routes/loyalty.routes.js
const router = require('express').Router();
const { query } = require('../config/db');
const { requireAuth } = require('../middleware/auth');

/**
 * GET /loyalty/me  — get current user's loyalty info
 */
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const { rows: [card] } = await query(
      `SELECT lc.status, lc.card_number, lc.points, lc.tier, lc.delivery_address,
              lc.applied_at, lc.dispatched_at, lc.delivered_at
       FROM loyalty_cards lc
       WHERE lc.user_id = $1
       ORDER BY lc.applied_at DESC LIMIT 1`,
      [req.user.id]
    );

    const { rows: [user] } = await query(
      'SELECT loyalty_points, loyalty_tier FROM users WHERE id = $1',
      [req.user.id]
    );

    res.json({ card: card || null, points: user?.loyalty_points ?? 0, tier: user?.loyalty_tier ?? 'Classic' });
  } catch (err) { next(err); }
});

/**
 * POST /loyalty/apply
 */
router.post('/apply', requireAuth, async (req, res, next) => {
  try {
    const { delivery_address } = req.body;
    if (!delivery_address || delivery_address.trim().length < 5) {
      return res.status(400).json({ error: 'Delivery address required' });
    }

    // Check for existing active application
    const { rows: [existing] } = await query(
      `SELECT id, status FROM loyalty_cards WHERE user_id = $1 AND status NOT IN ('rejected') ORDER BY applied_at DESC LIMIT 1`,
      [req.user.id]
    );
    if (existing) {
      return res.status(409).json({
        error: `You already have a card application (${existing.status}).`
      });
    }

    const { rows: [card] } = await query(
      `INSERT INTO loyalty_cards (user_id, delivery_address, status)
       VALUES ($1, $2, 'pending')
       RETURNING id, status, delivery_address, applied_at`,
      [req.user.id, delivery_address.trim()]
    );

    res.status(201).json({ card });
  } catch (err) { next(err); }
});

module.exports = router;
