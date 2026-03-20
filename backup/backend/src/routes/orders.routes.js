const router = require('express').Router();
const { z } = require('zod');
const { validate } = require('../middleware/validate');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { orderLimiter } = require('../middleware/rateLimiter');
const ordersCtrl = require('../controllers/orders.controller');

const createOrderSchema = z.object({
  first_name:        z.string().min(1).max(100),
  last_name:         z.string().min(1).max(100),
  email:             z.string().email(),
  phone:             z.string().regex(/^\+?[0-9]{9,15}$/),
  delivery_address:  z.string().min(5).max(500),
  delivery_note:     z.string().max(300).optional(),
  gift_note:         z.string().max(300).optional(),
  items: z.array(z.object({
    product_id: z.string().uuid(),
    variant_id: z.string().uuid(),
    quantity:   z.number().int().min(1).max(100),
  })).min(1),
  payment_method:    z.enum(['mtn_momo', 'airtel', 'bank_transfer']),
  payer_phone:       z.string().regex(/^\+?[0-9]{9,15}$/).optional(),
  consent_given:     z.literal(true, { errorMap: () => ({ message: 'You must consent to proceed' }) }),
});

/**
 * @swagger
 * /orders:
 *   post:
 *     tags: [Orders]
 *     summary: Create a new order (guest or authenticated)
 *     description: |
 *       Creates an order and initiates payment.
 *       Works for both guest and authenticated customers.
 *       Returns a tracking token for public order tracking.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderRequest'
 *           example:
 *             first_name: Jane
 *             last_name: Nakato
 *             email: jane@example.com
 *             phone: "+256701234567"
 *             delivery_address: "Plot 12, Kampala Road, Kampala"
 *             delivery_note: Call on arrival
 *             gift_note: Happy Birthday Amara!
 *             items:
 *               - product_id: "00000000-0000-0000-0000-000000000001"
 *                 variant_id: "00000000-0000-0000-0000-000000000002"
 *                 quantity: 1
 *             payment_method: mtn_momo
 *             payer_phone: "+256701234567"
 *             consent_given: true
 *     responses:
 *       201:
 *         description: Order created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 order_id: { type: string, format: uuid }
 *                 order_number: { type: string, example: "HAIQ-20240315-0042" }
 *                 tracking_token: { type: string, example: "trk_abc123" }
 *                 total: { type: number, example: 185000 }
 *                 payment_intent:
 *                   type: object
 *                   properties:
 *                     type: { type: string }
 *                     internal_ref: { type: string }
 *                     bank_details:
 *                       type: object
 *                       description: Only for bank_transfer
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 */
router.post('/', orderLimiter, optionalAuth, validate(createOrderSchema), ordersCtrl.create);

/**
 * @swagger
 * /orders/track/{token}:
 *   get:
 *     tags: [Tracking]
 *     summary: Public order tracking by token (no auth required)
 *     description: Returns order status timeline. No PII exposed.
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema: { type: string }
 *         example: trk_abc123xyz789
 *     responses:
 *       200:
 *         description: Order tracking info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 order_number: { type: string }
 *                 status: { type: string }
 *                 status_label: { type: string }
 *                 timeline:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/TrackingStep' }
 *                 estimated_delivery: { type: string, format: date-time, nullable: true }
 *                 items_count: { type: integer }
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/track/:token', ordersCtrl.track);

/**
 * @swagger
 * /orders/track/{token}/stream:
 *   get:
 *     tags: [Tracking]
 *     summary: Server-Sent Events stream for real-time order status updates
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: SSE stream
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *               example: "event: status_update\ndata: {\"status\":\"en_route\"}\n\n"
 */
router.get('/track/:token/stream', ordersCtrl.statusStream);

/**
 * @swagger
 * /orders:
 *   get:
 *     tags: [Orders]
 *     summary: Get authenticated customer's order history
 *     security:
 *       - CustomerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Order list
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', requireAuth, ordersCtrl.listMine);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Get a specific order (authenticated owner only)
 *     security:
 *       - CustomerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Order detail
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', requireAuth, ordersCtrl.getOne);

module.exports = router;
