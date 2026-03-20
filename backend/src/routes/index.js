// src/routes/index.js
'use strict';

const router = require('express').Router();

// ── Existing routes ────────────────────────────────────────────────────────
router.use('/auth',       require('./auth.routes'));
router.use('/products',   require('./products.routes'));
router.use('/categories', require('./categories.routes'));
router.use('/orders',     require('./orders.routes'));
router.use('/payments',   require('./payments.routes'));
router.use('/messages',   require('./messages.routes'));

// ── New public routes added in Phase 1 & 5 ───────────────────────────────
router.use('/newsletter', require('./newsletter.routes'));
router.use('/loyalty',    require('./loyalty.routes'));

// ── Public special-days endpoint (no auth) ────────────────────────────────
// GET /v1/special-days/active-today — used by frontend to determine box price
router.use('/special-days', require('./specialdays.routes'));

// ── All admin routes (protected inside each router) ───────────────────────
router.use('/admin', require('./admin'));

module.exports = router;
