// admin.analytics.routes.js
const router = require('express').Router();
const { adminAuth } = require('../../../middleware/adminAuth');
const ctrl = require('../../../controllers/admin/admin.analytics.controller');

router.use(adminAuth);

router.get('/summary',           ctrl.summary);
router.get('/revenue',           ctrl.revenue);
router.get('/top-products',      ctrl.topProducts);
router.get('/top-customers',     ctrl.topCustomers);       // hidden from frontend
router.get('/payment-breakdown', ctrl.paymentBreakdown);
router.get('/orders-by-status',  ctrl.ordersByStatus);

module.exports = router;
