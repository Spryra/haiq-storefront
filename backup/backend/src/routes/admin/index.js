// routes/admin/index.js — registers all admin sub-routes
const router = require('express').Router();

router.use('/products',     require('./admin.products.routes'));
router.use('/orders',       require('./admin.orders.routes'));
router.use('/reviews',      require('./admin.reviews.routes'));
router.use('/messages',     require('./admin.messages.routes'));
router.use('/loyalty',      require('./admin.loyalty.routes'));
router.use('/newsletter',   require('./admin.newsletter.routes'));
router.use('/special-days', require('./admin.specialdays.routes'));
router.use('/analytics',    require('./admin.analytics.routes'));

module.exports = router;
