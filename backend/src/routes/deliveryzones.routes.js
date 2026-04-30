'use strict';
const router    = require('express').Router();
const { query } = require('../config/db');

// GET /v1/delivery-zones — public, no auth required
// Returns all active zones in sort order
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT id, name, price, sort_order
       FROM delivery_zones
       WHERE is_active = true
       ORDER BY sort_order ASC`
    );
    res.json({ success: true, zones: rows });
  } catch (err) { next(err); }
});

module.exports = router;
