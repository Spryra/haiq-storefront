const router = require('express').Router();
const { z } = require('zod');
const { validate } = require('../../middleware/validate');
const { requireStaff } = require('../../middleware/adminAuth');
const adminOrdersCtrl = require('../../controllers/admin/admin.orders.controller');
const { ORDER_STATUSES } = require('../../config/constants');

const updateStatusSchema = z.object({
  status: z.enum(Object.values(ORDER_STATUSES)),
  note:   z.string().max(500).optional(),
});

/**
 * @swagger
 * /admin/orders:
 *   get:
 *     tags: [Admin Orders]
 *     summary: List all orders with filters
 *     security:
 *       - AdminAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, freshly_kneaded, ovenbound, on_the_cart, en_route, delivered, cancelled] }
 *       - in: query
 *         name: payment_status
 *         schema: { type: string, enum: [unpaid, pending, paid, failed] }
 *       - in: query
 *         name: payment_method
 *         schema: { type: string, enum: [mtn_momo, airtel, bank_transfer] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by name, email, or order number
 *       - in: query
 *         name: date_from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: date_to
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Orders list
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', requireStaff, adminOrdersCtrl.list);

/**
 * @swagger
 * /admin/orders/{id}:
 *   get:
 *     tags: [Admin Orders]
 *     summary: Get full order detail (items + payments + messages + events)
 *     security:
 *       - AdminAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Full order detail
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', requireStaff, adminOrdersCtrl.getOne);

/**
 * @swagger
 * /admin/orders/{id}/status:
 *   patch:
 *     tags: [Admin Orders]
 *     summary: Update order status (themed transitions)
 *     description: |
 *       Valid transitions:
 *       - `pending` → `freshly_kneaded` | `cancelled`
 *       - `freshly_kneaded` → `ovenbound` | `cancelled`
 *       - `ovenbound` → `on_the_cart` | `cancelled`
 *       - `on_the_cart` → `en_route` | `cancelled`
 *       - `en_route` → `delivered`
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, freshly_kneaded, ovenbound, on_the_cart, en_route, delivered, cancelled]
 *               note: { type: string, example: "Driver assigned: Okello Moses" }
 *     responses:
 *       200:
 *         description: Status updated
 *       400:
 *         description: Invalid status transition
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch('/:id/status', requireStaff, validate(updateStatusSchema), adminOrdersCtrl.updateStatus);

/**
 * @swagger
 * /admin/orders/{id}/messages:
 *   post:
 *     tags: [Admin Orders]
 *     summary: Admin reply to customer on an order thread
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
 *             required: [body]
 *             properties:
 *               body: { type: string, maxLength: 2000 }
 *     responses:
 *       201:
 *         description: Message sent
 */
router.post('/:id/messages', requireStaff, adminOrdersCtrl.sendMessage);

module.exports = router;
