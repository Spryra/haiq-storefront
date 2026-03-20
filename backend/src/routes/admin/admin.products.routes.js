// admin.products.routes.js
const router = require('express').Router();
const { requireStaff, requireSuperAdmin } = require('../../middleware/adminAuth');
const adminProductsCtrl = require('../../controllers/admin/admin.products.controller');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

/**
 * @swagger
 * /admin/products:
 *   get:
 *     tags: [Admin Products]
 *     summary: List all products (including inactive)
 *     security:
 *       - AdminAuth: []
 *     responses:
 *       200:
 *         description: Product list for admin
 */
router.get('/', requireStaff, adminProductsCtrl.list);

/**
 * @swagger
 * /admin/products:
 *   post:
 *     tags: [Admin Products]
 *     summary: Create a new product (superadmin only)
 *     security:
 *       - AdminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, slug, base_price]
 *             properties:
 *               name: { type: string }
 *               slug: { type: string }
 *               subtitle: { type: string }
 *               description: { type: string }
 *               tasting_notes: { type: string }
 *               category_id: { type: integer }
 *               base_price: { type: number }
 *               is_featured: { type: boolean }
 *               is_limited: { type: boolean }
 *               variants:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     label: { type: string }
 *                     price: { type: number }
 *                     stock_qty: { type: integer }
 *     responses:
 *       201:
 *         description: Product created
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/', requireSuperAdmin, adminProductsCtrl.create);

/**
 * @swagger
 * /admin/products/{id}:
 *   put:
 *     tags: [Admin Products]
 *     summary: Update a product (superadmin only)
 *     security:
 *       - AdminAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Product updated
 */
router.put('/:id', requireSuperAdmin, adminProductsCtrl.update);

/**
 * @swagger
 * /admin/products/{id}/toggle:
 *   patch:
 *     tags: [Admin Products]
 *     summary: Toggle product active/inactive
 *     security:
 *       - AdminAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Toggled
 */
router.patch('/:id/toggle', requireSuperAdmin, adminProductsCtrl.toggle);

/**
 * @swagger
 * /admin/products/{id}/images:
 *   post:
 *     tags: [Admin Products]
 *     summary: Upload product image to Cloudinary
 *     security:
 *       - AdminAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Image uploaded
 */
router.post('/:id/images', requireSuperAdmin, upload.single('image'), adminProductsCtrl.uploadImage);

/**
 * @swagger
 * /admin/products/{id}:
 *   delete:
 *     tags: [Admin Products]
 *     summary: Soft-delete a product (superadmin only)
 *     security:
 *       - AdminAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Product deactivated
 */
router.delete('/:id', requireSuperAdmin, adminProductsCtrl.softDelete);

module.exports = router;
