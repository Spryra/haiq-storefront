const router = require('express').Router();
const productsCtrl = require('../controllers/products.controller');

/**
 * @swagger
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: List all active products
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *         example: cakes
 *       - in: query
 *         name: featured
 *         schema: { type: boolean }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [sort_order, price_asc, price_desc, name_asc] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 12 }
 *     responses:
 *       200:
 *         description: Product list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/', productsCtrl.list);

/**
 * @swagger
 * /products/featured:
 *   get:
 *     tags: [Products]
 *     summary: Get featured products (max 3)
 *     responses:
 *       200:
 *         description: Featured products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 products:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Product' }
 */
router.get('/featured', productsCtrl.featured);

/**
 * @swagger
 * /products/{slug}:
 *   get:
 *     tags: [Products]
 *     summary: Get single product by slug
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *         example: the-kampala-classic
 *     responses:
 *       200:
 *         description: Product detail
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 product: { $ref: '#/components/schemas/Product' }
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:slug', productsCtrl.getBySlug);

module.exports = router;
