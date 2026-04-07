const router = require('express').Router();
const { z } = require('zod');
const { validate } = require('../middleware/validate');
const { paymentLimiter } = require('../middleware/rateLimiter');
const { idempotencyMiddleware } = require('../utils/idempotency');
const paymentsCtrl = require('../controllers/payments.controller');

console.log('paymentsCtrl:', paymentsCtrl);

const initiateSchema = z.object({
  order_id: z.string().uuid(),
  amount: z.number(),
  method: z.enum([
    'mtn_momo',
    'airtel',
    'bank_transfer',
    'cash_on_delivery'
  ]),
  payer_phone: z.string().optional(),
  order_number: z.string().optional(),
});

const confirmSchema = z.object({
  internal_ref: z.string(),
  status: z.enum(['success', 'failed']),
});

const safe = (fn, name) => {
  if (!fn) {
    console.error('❌ Missing controller function:');
    throw new Error('Missing controller function: ');
  }
  return fn;
};

router.post(
  '/initiate',
  paymentLimiter,
  idempotencyMiddleware,
  validate(initiateSchema),
  safe(paymentsCtrl.initiate, 'initiate')
);

router.post(
  '/confirm',
  paymentLimiter,
  validate(confirmSchema),
  safe(paymentsCtrl.confirm, 'confirm')
);

module.exports = router;
