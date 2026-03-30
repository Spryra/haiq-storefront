const router = require('express').Router();
const productsCtrl = require('../controllers/products.controller');
const reviewsCtrl = require('../controllers/reviews.controller');

router.get('/', productsCtrl.list);
router.get('/featured', productsCtrl.featured);
router.get('/:slug', productsCtrl.getBySlug);
router.get('/:slug/reviews', reviewsCtrl.getByProductSlug);
router.post('/:slug/reviews', reviewsCtrl.create);

module.exports = router;