const router = require('express').Router();
const { z } = require('zod');
const { validate } = require('../middleware/validate');
const { paymentLimiter } = require('../middleware/rateLimiter');
const { idempotencyMiddleware } = require('../utils/idempotency');
const { requireStaff } = require('../middleware/adminAuth');
const paymentsCtrl = require('../controllers/payments.controller');
const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Only JPEG, PNG, or WebP images allowed'));
  },
});

const initiateSchema = z.object({
  order_id:    z.string().uuid(),
  payer_phone: z.string().regex(/^\+?[0-9]{9,15}$/),
});

// ─── MTN MoMo ─────────────────────────────────────────────────
/**
 * @swagger
 * /payments/mtn/initiate:
 *   post:
 *     tags: [Payments]
 *     summary: Initiate MTN MoMo payment request
 *     description: |
 *       Sends a payment request to the customer's MTN MoMo account.
 *       The customer will receive a prompt on their phone to approve.
 *       Poll `/payments/mtn/status/{ref}` every 3 seconds to check result.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentInitiateRequest'
 *     responses:
 *       200:
 *         description: Payment request sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 internal_ref: { type: string }
 *                 message: { type: string, example: "Payment request sent to +256701234567" }
 *       400:
 *         description: Order already paid or invalid state
 */
router.post('/mtn/initiate',
  paymentLimiter,
  idempotencyMiddleware,
  validate(initiateSchema),
  paymentsCtrl.initiateMTN
);

/**
 * @swagger
 * /payments/mtn/status/{ref}:
 *   get:
 *     tags: [Payments]
 *     summary: Poll MTN MoMo payment status
 *     parameters:
 *       - in: path
 *         name: ref
 *         required: true
 *         schema: { type: string }
 *         description: Internal payment reference from initiate call
 *     responses:
 *       200:
 *         description: Payment status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentStatusResponse'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/mtn/status/:ref', paymentsCtrl.statusMTN);

/**
 * @swagger
 * /payments/mtn/webhook:
 *   post:
 *     tags: [Payments]
 *     summary: MTN MoMo payment callback (webhook)
 *     description: |
 *       **⚠️ Internal endpoint — not for client use.**
 *       Called by MTN when payment status changes.
 *       Validates HMAC signature, checks idempotency, updates order.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed
 *       400:
 *         description: Invalid signature or stale timestamp
 */
router.post('/mtn/webhook', paymentsCtrl.webhookMTN);

// ─── Airtel Money ──────────────────────────────────────────────
/**
 * @swagger
 * /payments/airtel/initiate:
 *   post:
 *     tags: [Payments]
 *     summary: Initiate Airtel Money payment request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentInitiateRequest'
 *     responses:
 *       200:
 *         description: Airtel payment request sent
 */
router.post('/airtel/initiate',
  paymentLimiter,
  idempotencyMiddleware,
  validate(initiateSchema),
  paymentsCtrl.initiateAirtel
);

/**
 * @swagger
 * /payments/airtel/status/{ref}:
 *   get:
 *     tags: [Payments]
 *     summary: Poll Airtel Money payment status
 *     parameters:
 *       - in: path
 *         name: ref
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Payment status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentStatusResponse'
 */
router.get('/airtel/status/:ref', paymentsCtrl.statusAirtel);

/**
 * @swagger
 * /payments/airtel/webhook:
 *   post:
 *     tags: [Payments]
 *     summary: Airtel Money payment callback (webhook)
 *     description: |
 *       **⚠️ Internal endpoint — not for client use.**
 *     responses:
 *       200:
 *         description: Webhook processed
 */
router.post('/airtel/webhook', paymentsCtrl.webhookAirtel);

// ─── Bank Transfer ─────────────────────────────────────────────
/**
 * @swagger
 * /payments/bank/details/{order_id}:
 *   get:
 *     tags: [Payments]
 *     summary: Get bank transfer details for an order
 *     parameters:
 *       - in: path
 *         name: order_id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Bank transfer details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 bank_name: { type: string, example: "Stanbic Bank Uganda" }
 *                 account_name: { type: string, example: "HAIQ Bakery Ltd" }
 *                 account_number: { type: string, example: "1234567890" }
 *                 reference: { type: string, example: "HAIQ-REF-A1B2C3D4" }
 *                 amount: { type: number, example: 185000 }
 *                 currency: { type: string, example: "UGX" }
 */
router.get('/bank/details/:order_id', paymentsCtrl.bankDetails);

/**
 * @swagger
 * /payments/bank/upload-proof:
 *   post:
 *     tags: [Payments]
 *     summary: Upload bank transfer proof of payment
 *     description: |
 *       Customer uploads a screenshot/photo of their bank transfer receipt.
 *       File is stored securely in Cloudinary (private bucket).
 *       Admin will review and confirm manually.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [order_id, proof]
 *             properties:
 *               order_id: { type: string, format: uuid }
 *               proof:
 *                 type: string
 *                 format: binary
 *                 description: JPEG/PNG/WebP image, max 5MB
 *     responses:
 *       200:
 *         description: Proof uploaded successfully
 *       400:
 *         description: Invalid file type or size
 *       404:
 *         description: Order not found
 */
router.post('/bank/upload-proof',
  upload.single('proof'),
  paymentsCtrl.uploadBankProof
);

module.exports = router;
