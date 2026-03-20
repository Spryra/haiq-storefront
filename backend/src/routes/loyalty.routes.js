// src/routes/loyalty.routes.js — Simplified: application only, no points/tiers
'use strict';
const router        = require('express').Router();
const { query }     = require('../config/db');
const { requireAuth } = require('../middleware/auth');

// GET /v1/loyalty/me — card status only
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const { rows: [card] } = await query(`
      SELECT id, status, card_number, delivery_address, contact_phone,
             applied_at, dispatched_at, delivered_at
      FROM   loyalty_cards
      WHERE  user_id = $1
      ORDER  BY applied_at DESC
      LIMIT  1
    `, [req.user.id]);

    res.json({ success: true, card: card ?? null });
  } catch (err) { next(err); }
});

// POST /v1/loyalty/apply
router.post('/apply', requireAuth, async (req, res, next) => {
  try {
    const { delivery_address, contact_phone } = req.body;

    if (!delivery_address || String(delivery_address).trim().length < 5) {
      return res.status(400).json({ success: false, error: 'Please enter your full delivery address.' });
    }
    if (!contact_phone || String(contact_phone).trim().length < 7) {
      return res.status(400).json({ success: false, error: 'Please enter your phone number for card delivery.' });
    }

    // Block duplicate active applications
    const { rows: [existing] } = await query(
      `SELECT id, status FROM loyalty_cards
       WHERE user_id = $1 AND status NOT IN ('rejected')
       ORDER BY applied_at DESC LIMIT 1`,
      [req.user.id]
    );

    if (existing) {
      return res.status(409).json({
        success: false,
        error: `You already have a loyalty card application with status: ${existing.status}.`,
      });
    }

    const { rows: [card] } = await query(`
      INSERT INTO loyalty_cards
        (user_id, delivery_address, contact_phone, status)
      VALUES ($1, $2, $3, 'pending')
      RETURNING id, status, delivery_address, contact_phone, applied_at
    `, [req.user.id, delivery_address.trim(), contact_phone.trim()]);

    res.status(201).json({ success: true, card });
  } catch (err) { next(err); }
});

module.exports = router;
