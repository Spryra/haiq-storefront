// src/routes/admin/admin.special_days.routes.js
'use strict';
const router    = require('express').Router();
const { query } = require('../../config/db');
const { requireStaff, requireSuperAdmin } = require('../../middleware/adminAuth');

// GET / — list all special days
router.get('/', requireStaff, async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM special_days ORDER BY date DESC');
    res.json({ success: true, special_days: rows });
  } catch (err) { next(err); }
});

// POST / — create a new special day
router.post('/', requireSuperAdmin, async (req, res, next) => {
  try {
    const { date, label, is_active } = req.body;
    if (!date || !label) return res.status(400).json({ success: false, error: 'date and label required.' });
    const { rows: [day] } = await query(
      `INSERT INTO special_days (date, label, is_active) VALUES ($1, $2, $3) RETURNING *`,
      [date, label, is_active ?? true]
    );
    res.status(201).json({ success: true, day });
  } catch (err) { next(err); }
});

// PATCH /:id/toggle — toggle active
router.patch('/:id/toggle', requireSuperAdmin, async (req, res, next) => {
  try {
    const { rows: [day] } = await query(
      `UPDATE special_days SET is_active = NOT is_active WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (!day) return res.status(404).json({ success: false, error: 'Not found.' });
    res.json({ success: true, day });
  } catch (err) { next(err); }
});

// DELETE /:id
router.delete('/:id', requireSuperAdmin, async (req, res, next) => {
  try {
    await query('DELETE FROM special_days WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
