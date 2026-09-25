// PUBLIC route — no auth required
'use strict';

const router = require('express').Router();
const { query } = require('../config/db');

/**
 * GET /v1/events
 * Published events that haven't finished yet, soonest first.
 * An event with no ends_at counts as running until the end of its start day.
 */
router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 12, 50);
    const { rows } = await query(
      `SELECT id, title, description, location, starts_at, ends_at,
              image_url, cta_label, cta_url
       FROM events
       WHERE is_published = true
         AND COALESCE(ends_at, date_trunc('day', starts_at) + INTERVAL '1 day') >= NOW()
       ORDER BY starts_at ASC
       LIMIT $1`,
      [limit]
    );
    res.json({ success: true, events: rows });
  } catch (err) { next(err); }
});

module.exports = router;
