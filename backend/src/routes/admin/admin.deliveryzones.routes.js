'use strict';
const router = require('express').Router();
const { query } = require('../../config/db');
const { requireStaff, requireSuperAdmin } = require('../../middleware/adminAuth');

// GET /v1/admin/delivery-zones
router.get('/', requireStaff, async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT * FROM delivery_zones ORDER BY sort_order ASC` 
    );
    res.json({ success: true, zones: rows });
  } catch (err) { next(err); }
});

// POST /v1/admin/delivery-zones — create
router.post('/', requireSuperAdmin, async (req, res, next) => {
  try {
    const { name, price, sort_order } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ success: false, error: 'name and price are required.' });
    }
    const { rows: [zone] } = await query(
      `INSERT INTO delivery_zones (name, price, sort_order)
       VALUES ($1, $2, $3) RETURNING *`,
      [name.trim(), parseFloat(price), parseInt(sort_order) || 99]
    );
    res.status(201).json({ success: true, zone });
  } catch (err) { next(err); }
});

// PUT /v1/admin/delivery-zones/:id — update
router.put('/:id', requireSuperAdmin, async (req, res, next) => {
  try {
    const { name, price, sort_order, is_active } = req.body;
    const { rows: [zone] } = await query(
      `UPDATE delivery_zones
       SET name = COALESCE($1, name),
           price = COALESCE($2, price),
           sort_order = COALESCE($3, sort_order),
           is_active = COALESCE($4, is_active),
           updated_at = NOW()
       WHERE id = $5 RETURNING *`,
      [name?.trim(), price !== undefined ? parseFloat(price) : null,
       sort_order !== undefined ? parseInt(sort_order) : null,
       is_active, req.params.id]
    );
    if (!zone) return res.status(404).json({ success: false, error: 'Zone not found.' });
    res.json({ success: true, zone });
  } catch (err) { next(err); }
});

// DELETE /v1/admin/delivery-zones/:id
router.delete('/:id', requireSuperAdmin, async (req, res, next) => {
  try {
    await query('DELETE FROM delivery_zones WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
