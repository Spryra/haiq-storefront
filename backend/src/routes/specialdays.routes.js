// src/routes/specialdays.routes.js
// PUBLIC route — no auth required
// Used by the frontend to determine if today is a special day (Build Your Box price)
'use strict';

const router = require('express').Router();
const { query } = require('../config/db');

/**
 * GET /v1/special-days/active-today
 * Returns whether today falls within any active special day window.
 * Response: { isSpecialDay: boolean, day: { id, label } | null }
 */
router.get('/active-today', async (req, res, next) => {
  try {
    const { rows } = await query(`
      SELECT id, label
      FROM special_days
      WHERE is_active  = true
        AND date_from <= CURRENT_DATE
        AND date_to   >= CURRENT_DATE
      LIMIT 1
    `);

    const day = rows[0] ?? null;
    res.json({ isSpecialDay: !!day, day });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
