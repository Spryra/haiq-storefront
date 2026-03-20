// routes/index.js — main API router
const router = require('express').Router();

router.use('/auth',         require('./auth.routes'));
router.use('/products',     require('./products.routes'));
router.use('/orders',       require('./orders.routes'));
router.use('/payments',     require('./payments.routes'));
router.use('/tracking',     require('./tracking.routes'));
router.use('/messages',     require('./messages.routes'));
router.use('/categories',   require('./categories.routes'));
router.use('/newsletter',   require('./newsletter.routes'));
router.use('/loyalty',      require('./loyalty.routes'));

// Public special days check (frontend uses this for box pricing)
router.use('/special-days', require('./admin/admin.specialdays.routes'));

// Admin routes (all protected by adminAuth middleware inside)
router.use('/admin', require('./admin/index'));

module.exports = router;
