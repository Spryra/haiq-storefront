// routes/admin/admin.specialdays.routes.js
const router = require('express').Router();
const { query } = require('../../config/db');
const { requireStaff, requireSuperAdmin } = require('../../middleware/adminAuth');

/**
 * GET /admin/special-days
 */
router.get('/', requireStaff, async (req, res, next) => {
  try {
    const { rows } = await query(`
      SELECT sd.*, au.name AS created_by_name
      FROM special_days sd
      LEFT JOIN admin_users au ON au.id = sd.created_by
      ORDER BY sd.date_from ASC
    `);
    res.json({ days: rows });
  } catch (err) { next(err); }
});

/**
 * POST /admin/special-days
 */
router.post('/', requireSuperAdmin, async (req, res, next) => {
  try {
    const { label, date_from, date_to } = req.body;
    if (!label || !date_from || !date_to) {
      return res.status(400).json({ error: 'label, date_from, date_to required' });
    }
    const { rows: [day] } = await query(
      `INSERT INTO special_days (label, date_from, date_to, is_active, created_by)
       VALUES ($1, $2, $3, true, $4) RETURNING *`,
      [label, date_from, date_to, req.admin.id]
    );
    res.status(201).json({ day });
  } catch (err) { next(err); }
});

/**
 * PATCH /admin/special-days/:id/toggle
 */
router.patch('/:id/toggle', requireSuperAdmin, async (req, res, next) => {
  try {
    const { rows: [day] } = await query(
      `UPDATE special_days SET is_active = NOT is_active WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    res.json({ day });
  } catch (err) { next(err); }
});

/**
 * DELETE /admin/special-days/:id
 */
router.delete('/:id', requireSuperAdmin, async (req, res, next) => {
  try {
    await query('DELETE FROM special_days WHERE id = $1', [req.params.id]);
    res.json({ deleted: true });
  } catch (err) { next(err); }
});

/**
 * GET /special-days/active  — PUBLIC: frontend checks if today is a special day
 */
router.get('/active-today', async (req, res, next) => {
  try {
    const { rows } = await query(`
      SELECT id, label FROM special_days
      WHERE is_active = true
        AND date_from <= CURRENT_DATE
        AND date_to   >= CURRENT_DATE
    `);
    res.json({ isSpecialDay: rows.length > 0, day: rows[0] ?? null });
  } catch (err) { next(err); }
});

module.exports = router;
