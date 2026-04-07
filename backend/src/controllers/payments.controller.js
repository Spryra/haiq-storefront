
async function confirm(req, res, next) {
  try {
    const { internal_ref, status } = req.body;

    const result = await paymentsService.confirm({
      internal_ref,
      status
    });

    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

async function initiate(req, res, next) {
  try {
    const { order_id, amount, method, payer_phone, order_number } = req.body;

    const result = await paymentsService.initiate({
      order_id,
      amount,
      method,
      payer_phone,
      order_number
    });

    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}
// backend/src/controllers/payments.controller.js

const { query } = require('../config/db');
const { logger } = require('../config/logger');
const { verifySignature, isTimestampFresh } = require('../utils/crypto');
// backend/src/controllers/payments.controller.js
const paymentsService = require('../services/payments.service'); // now matches filename
async function initiateMTN(req, res, next) {
  try {
    const { order_id, payer_phone } = req.body;
    const { rows: [order] } = await query(
      'SELECT id, total, payment_status, order_number FROM orders WHERE id = $1',
      [order_id]
    );
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    if (order.payment_status === 'paid') return res.status(400).json({ success: false, error: 'Order already paid' });

    const result = await paymentsService.initiate({
      order_id,
      amount: order.total,
      method: 'mtn_momo',
      payer_phone,
      order_number: order.order_number
    });

    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

async function statusMTN(req, res, next) {
  try {
    const { rows: [payment] } = await query(
      'SELECT internal_ref, status, amount, currency, provider_ref, updated_at FROM payments WHERE internal_ref = $1',
      [req.params.ref]
    );
    if (!payment) return res.status(404).json({ success: false, error: 'Payment not found' });
    res.json({ success: true, ...payment });
  } catch (err) { next(err); }
}

async function webhookMTN(req, res, next) {
  try {
    const sig = req.headers['x-callback-signature'] || req.headers['x-momo-signature'] || '';
    const payload = typeof req.body === 'Buffer' ? JSON.parse(req.body.toString()) : req.body;

    if (!verifySignature(payload, process.env.MTN_MOMO_CALLBACK_SECRET, sig)) {
      logger.warn('MTN webhook: invalid signature');
      return res.status(400).json({ success: false, error: 'Invalid signature' });
    }

    if (!isTimestampFresh(payload.timestamp || payload.createdAt)) {
      logger.warn('MTN webhook: stale timestamp', { payload });
      return res.status(400).json({ success: false, error: 'Stale timestamp' });
    }

    const result = await paymentsService.handleWebhook('mtn_momo', payload);
    res.status(200).json({ success: true, ...result });
  } catch (err) { next(err); }
}

async function initiateAirtel(req, res, next) {
  try {
    const { order_id, payer_phone } = req.body;
    const { rows: [order] } = await query(
      'SELECT id, total, payment_status FROM orders WHERE id=$1', [order_id]
    );
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    if (order.payment_status === 'paid') return res.status(400).json({ success: false, error: 'Order already paid' });

    const result = await paymentsService.initiate({
      order_id,
      amount: order.total,
      method: 'airtel',
      payer_phone
    });

    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

async function statusAirtel(req, res, next) {
  try {
    const { rows: [payment] } = await query(
      'SELECT internal_ref, status, amount, currency, provider_ref, updated_at FROM payments WHERE internal_ref=$1',
      [req.params.ref]
    );
    if (!payment) return res.status(404).json({ success: false, error: 'Payment not found' });
    res.json({ success: true, ...payment });
  } catch (err) { next(err); }
}

async function webhookAirtel(req, res, next) {
  try {
    const sig = req.headers['x-airtel-signature'] || '';
    const payload = typeof req.body === 'Buffer' ? JSON.parse(req.body.toString()) : req.body;

    if (!verifySignature(payload, process.env.AIRTEL_WEBHOOK_SECRET, sig)) {
      return res.status(400).json({ success: false, error: 'Invalid signature' });
    }

    const result = await paymentsService.handleWebhook('airtel', payload);
    res.status(200).json({ success: true, ...result });
  } catch (err) { next(err); }
}

async function bankDetails(req, res, next) {
  try {
    const { rows: [order] } = await query(
      'SELECT id, order_number, total FROM orders WHERE id=$1', [req.params.order_id]
    );
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    const { rows: [payment] } = await query(
      `SELECT internal_ref FROM payments WHERE order_id=$1 AND payment_method='bank_transfer' LIMIT 1`,
      [order.id]
    );

    let ref = payment?.internal_ref;
    if (!ref) {
      const { generateBankRef } = require('../utils/tokenGenerator');
      ref = generateBankRef();
      await query(
        `INSERT INTO payments (order_id, payment_method, internal_ref, amount, status)
         VALUES ($1,'bank_transfer',$2,$3,'initiated')`,
        [order.id, ref, order.total]
      );
    }

    res.json({
      success: true,
      bank_name: process.env.BANK_NAME,
      account_name: process.env.BANK_ACCOUNT_NAME,
      account_number: process.env.BANK_ACCOUNT_NUMBER,
      branch: process.env.BANK_BRANCH,
      swift: process.env.BANK_SWIFT,
      reference: ref,
      amount: order.total,
      currency: 'UGX'
    });
  } catch (err) { next(err); }
}

async function uploadBankProof(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });
    const { order_id } = req.body;
    const result = await paymentsService.uploadBankProof(order_id, req.file);
    res.json({ success: true, message: 'Proof uploaded. Admin will verify within 24 hours.', url: result.secure_url });
  } catch (err) { next(err); }
}

module.exports = { initiate, confirm,
  initiateMTN,
  statusMTN,
  webhookMTN,
  initiateAirtel,
  statusAirtel,
  webhookAirtel,
  bankDetails,
  uploadBankProof
};
