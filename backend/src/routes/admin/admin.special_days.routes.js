// src/routes/admin/admin.special_days.routes.js
'use strict';

const router    = require('express').Router();
const { query } = require('../../config/db');
const { requireStaff, requireSuperAdmin } = require('../../middleware/adminAuth');
const { validate } = require('../../middleware/validate');
const { specialDayCreateSchema } = require('../../middleware/schemas');

// ─────────────────────────────────────────────────────────────────────────────
// GET /v1/admin/special-days
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', requireStaff, async (req, res, next) => {
  try {
    const { rows } = await query(`
      SELECT
        sd.*,
        au.full_name AS created_by_name
      FROM   special_days sd
      LEFT   JOIN admin_users au ON au.id = sd.created_by
      ORDER  BY sd.date_from ASC
    `);
    res.json({ success: true, days: rows });
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /v1/admin/special-days
// Body: { label, date_from, date_to }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', requireSuperAdmin, validate(specialDayCreateSchema), async (req, res, next) => {
  try {
    const { label, date_from, date_to } = req.body;

    const { rows: [day] } = await query(`
      INSERT INTO special_days (label, date_from, date_to, is_active, created_by)
      VALUES ($1, $2, $3, true, $4)
      RETURNING *
    `, [label.trim(), date_from, date_to, req.admin.id]);

    res.status(201).json({ success: true, day });
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /v1/admin/special-days/:id/toggle
// Toggles is_active between true and false.
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/:id/toggle', requireSuperAdmin, async (req, res, next) => {
  try {
    const { rows: [day] } = await query(`
      UPDATE special_days
      SET    is_active = NOT is_active
      WHERE  id = $1
      RETURNING *
    `, [req.params.id]);

    if (!day) return res.status(404).json({ success: false, error: 'Special day not found.' });
    res.json({ success: true, day });
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /v1/admin/special-days/:id
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id', requireSuperAdmin, async (req, res, next) => {
  try {
    const { rows: [day] } = await query(
      'DELETE FROM special_days WHERE id = $1 RETURNING id, label',
      [req.params.id]
    );
    if (!day) return res.status(404).json({ success: false, error: 'Special day not found.' });
    res.json({ success: true, deleted: day });
  } catch (err) { next(err); }
});

module.exports = router;
