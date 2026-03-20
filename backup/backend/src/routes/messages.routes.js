// messages.routes.js
const router = require('express').Router();
const { z } = require('zod');
const { validate } = require('../middleware/validate');
const { optionalAuth } = require('../middleware/auth');
const messagesCtrl = require('../controllers/messages.controller');

const createMsgSchema = z.object({
  order_id: z.string().uuid().optional(),
  body:     z.string().min(1).max(2000),
  email:    z.string().email().optional(),
  name:     z.string().max(200).optional(),
});

/**
 * @swagger
 * /messages:
 *   post:
 *     tags: [Messages]
 *     summary: Send a message to HAIQ (optionally linked to an order)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [body]
 *             properties:
 *               order_id: { type: string, format: uuid, description: "Link to an order" }
 *               body: { type: string, maxLength: 2000 }
 *               email: { type: string, format: email, description: "Required if not authenticated" }
 *               name: { type: string }
 *     responses:
 *       201:
 *         description: Message sent
 */
router.post('/', optionalAuth, validate(createMsgSchema), messagesCtrl.create);

/**
 * @swagger
 * /messages/{order_id}:
 *   get:
 *     tags: [Messages]
 *     summary: Get message thread for an order
 *     description: Uses tracking token in header for guest access
 *     parameters:
 *       - in: path
 *         name: order_id
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: header
 *         name: x-tracking-token
 *         schema: { type: string }
 *         description: Order tracking token for guest access
 *     responses:
 *       200:
 *         description: Message thread
 */
router.get('/:order_id', optionalAuth, messagesCtrl.getThread);

module.exports = router;
