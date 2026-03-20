const { query, getClient } = require('../config/db');
const { logger } = require('../config/logger');
const { verifySignature, isTimestampFresh } = require('../utils/crypto');
const { generatePaymentRef } = require('../utils/tokenGenerator');
const mtnService    = require('../services/mtn.service');
const airtelService = require('../services/airtel.service');
const cloudinary    = require('../config/cloudinary');
const { PAYMENT_STATUSES } = require('../config/constants');

async function initiateMTN(req, res, next) {
  try {
    const { order_id, payer_phone } = req.body;

    const { rows: [order] } = await query(
      'SELECT id, total, payment_status, order_number FROM orders WHERE id = $1',
      [order_id]
    );
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    if (order.payment_status === 'paid') return res.status(400).json({ success: false, error: 'Order already paid' });

    const internal_ref = generatePaymentRef();

    await query(`
      INSERT INTO payments (order_id, payment_method, internal_ref, amount, payer_phone, status)
      VALUES ($1, 'mtn_momo', $2, $3, $4, 'initiated')
    `, [order_id, internal_ref, order.total, payer_phone]);

    await mtnService.requestToPay({
      internal_ref,
      amount: order.total,
      payer_phone,
      order_number: order.order_number,
    });

    await query(
      `UPDATE payments SET status = 'pending', updated_at = NOW() WHERE internal_ref = $1`,
      [internal_ref]
    );
    await query(
      `UPDATE orders SET payment_status = 'pending' WHERE id = $1`,
      [order_id]
    );

    res.json({
      success: true,
      internal_ref,
      message: `Payment request sent to ${payer_phone}. Approve on your phone.`,
    });
  } catch (err) { next(err); }
}

async function statusMTN(req, res, next) {
  try {
    const { rows: [payment] } = await query(
      'SELECT * FROM payments WHERE internal_ref = $1',
      [req.params.ref]
    );
    if (!payment) return res.status(404).json({ success: false, error: 'Payment not found' });

    // If still pending, check with MTN
    if (payment.status === 'pending') {
      try {
        const mtnStatus = await mtnService.getTransactionStatus(payment.internal_ref);
        if (mtnStatus.status !== payment.status) {
          await query(
            `UPDATE payments SET status = $1, provider_ref = $2, updated_at = NOW() WHERE internal_ref = $3`,
            [mapMTNStatus(mtnStatus.status), mtnStatus.financialTransactionId || null, payment.internal_ref]
          );
          if (mtnStatus.status === 'SUCCESSFUL') {
            await query(
              `UPDATE orders SET payment_status = 'paid', status = 'freshly_kneaded' WHERE id = $1`,
              [payment.order_id]
            );
          }
        }
      } catch (_) { /* MTN API call failed — return cached status */ }
    }

    const { rows: [fresh] } = await query(
      'SELECT internal_ref, status, amount, currency, provider_ref, updated_at FROM payments WHERE internal_ref = $1',
      [req.params.ref]
    );
    res.json({ success: true, ...fresh });
  } catch (err) { next(err); }
}

async function webhookMTN(req, res, next) {
  try {
    const rawBody = req.body;
    const sig = req.headers['x-callback-signature'] || req.headers['x-momo-signature'] || '';

    if (!verifySignature(rawBody, process.env.MTN_MOMO_CALLBACK_SECRET, sig)) {
      logger.warn('MTN webhook: invalid signature');
      return res.status(400).json({ success: false, error: 'Invalid signature' });
    }

    const payload = typeof rawBody === 'Buffer' ? JSON.parse(rawBody.toString()) : rawBody;

    if (!isTimestampFresh(payload.timestamp || payload.createdAt)) {
      logger.warn('MTN webhook: stale timestamp', { payload });
      return res.status(400).json({ success: false, error: 'Stale timestamp' });
    }

    const { externalId, status, financialTransactionId, amount } = payload;

    const { rows: [payment] } = await query(
      'SELECT * FROM payments WHERE internal_ref = $1', [externalId]
    );
    if (!payment) return res.status(404).json({ success: false, error: 'Payment not found' });
    if (payment.status === 'successful') return res.status(200).json({ success: true, message: 'Already processed' });

    // Amount integrity check
    if (parseFloat(amount) !== parseFloat(payment.amount)) {
      logger.error('MTN webhook: amount mismatch', { expected: payment.amount, received: amount });
      return res.status(400).json({ success: false, error: 'Amount mismatch' });
    }

    const mapped = mapMTNStatus(status);
    await query(`
      UPDATE payments SET
        status = $1, provider_ref = $2, webhook_payload = $3, signature_valid = true, updated_at = NOW()
      WHERE internal_ref = $4
    `, [mapped, financialTransactionId || null, JSON.stringify(payload), externalId]);

    if (mapped === 'successful') {
      await query(
        `UPDATE orders SET payment_status = 'paid', status = 'freshly_kneaded', updated_at = NOW() WHERE id = $1`,
        [payment.order_id]
      );
      await query(
        `INSERT INTO order_events (order_id, event_type, old_value, new_value, actor_type, note)
         VALUES ($1, 'payment_received', 'unpaid', 'paid', 'webhook', 'MTN MoMo payment confirmed')`,
        [payment.order_id]
      );
    }

    res.status(200).json({ success: true });
  } catch (err) { next(err); }
}

function mapMTNStatus(s) {
  const map = { SUCCESSFUL: 'successful', FAILED: 'failed', PENDING: 'pending', CANCELLED: 'cancelled' };
  return map[s?.toUpperCase()] || 'pending';
}

async function initiateAirtel(req, res, next) {
  try {
    const { order_id, payer_phone } = req.body;
    const { rows: [order] } = await query(
      'SELECT id, total, payment_status, order_number FROM orders WHERE id = $1', [order_id]
    );
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    if (order.payment_status === 'paid') return res.status(400).json({ success: false, error: 'Order already paid' });

    const internal_ref = generatePaymentRef();
    await query(
      `INSERT INTO payments (order_id, payment_method, internal_ref, amount, payer_phone, status)
       VALUES ($1, 'airtel', $2, $3, $4, 'initiated')`,
      [order_id, internal_ref, order.total, payer_phone]
    );

    await airtelService.requestPayment({ internal_ref, amount: order.total, payer_phone });

    await query(`UPDATE payments SET status = 'pending' WHERE internal_ref = $1`, [internal_ref]);
    await query(`UPDATE orders SET payment_status = 'pending' WHERE id = $1`, [order_id]);

    res.json({ success: true, internal_ref, message: `Airtel Money request sent to ${payer_phone}` });
  } catch (err) { next(err); }
}

async function statusAirtel(req, res, next) {
  try {
    const { rows: [payment] } = await query(
      'SELECT internal_ref, status, amount, currency, provider_ref, updated_at FROM payments WHERE internal_ref = $1',
      [req.params.ref]
    );
    if (!payment) return res.status(404).json({ success: false, error: 'Payment not found' });
    res.json({ success: true, ...payment });
  } catch (err) { next(err); }
}

async function webhookAirtel(req, res, next) {
  try {
    const rawBody = req.body;
    const sig = req.headers['x-airtel-signature'] || '';
    if (!verifySignature(rawBody, process.env.AIRTEL_WEBHOOK_SECRET, sig)) {
      return res.status(400).json({ success: false, error: 'Invalid signature' });
    }
    const payload = typeof rawBody === 'Buffer' ? JSON.parse(rawBody.toString()) : rawBody;
    const { transaction } = payload;
    if (!transaction) return res.status(400).json({ success: false, error: 'Invalid payload' });

    const { rows: [payment] } = await query(
      'SELECT * FROM payments WHERE internal_ref = $1', [transaction.id]
    );
    if (!payment || payment.status === 'successful') return res.status(200).json({ success: true });

    const status = transaction.status === 'TS' ? 'successful' : 'failed';
    await query(
      `UPDATE payments SET status=$1, provider_ref=$2, webhook_payload=$3, signature_valid=true WHERE internal_ref=$4`,
      [status, transaction.airtel_money_id || null, JSON.stringify(payload), transaction.id]
    );
    if (status === 'successful') {
      await query(
        `UPDATE orders SET payment_status='paid', status='freshly_kneaded' WHERE id=$1`, [payment.order_id]
      );
    }
    res.status(200).json({ success: true });
  } catch (err) { next(err); }
}

async function bankDetails(req, res, next) {
  try {
    const { rows: [order] } = await query(
      'SELECT id, order_number, total FROM orders WHERE id = $1', [req.params.order_id]
    );
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    const { rows: [payment] } = await query(
      `SELECT internal_ref FROM payments WHERE order_id = $1 AND payment_method = 'bank_transfer' LIMIT 1`,
      [order.id]
    );

    let ref = payment?.internal_ref;
    if (!ref) {
      ref = require('../utils/tokenGenerator').generateBankRef();
      await query(
        `INSERT INTO payments (order_id, payment_method, internal_ref, amount, status)
         VALUES ($1, 'bank_transfer', $2, $3, 'initiated')`,
        [order.id, ref, order.total]
      );
    }

    res.json({
      success:        true,
      bank_name:      process.env.BANK_NAME,
      account_name:   process.env.BANK_ACCOUNT_NAME,
      account_number: process.env.BANK_ACCOUNT_NUMBER,
      branch:         process.env.BANK_BRANCH,
      swift:          process.env.BANK_SWIFT,
      reference:      ref,
      amount:         order.total,
      currency:       'UGX',
    });
  } catch (err) { next(err); }
}

async function uploadBankProof(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });

    const { order_id } = req.body;
    const { rows: [payment] } = await query(
      `SELECT id FROM payments WHERE order_id = $1 AND payment_method = 'bank_transfer' LIMIT 1`,
      [order_id]
    );
    if (!payment) return res.status(404).json({ success: false, error: 'Bank transfer payment not found' });

    // Upload to Cloudinary (private folder)
    const b64 = req.file.buffer.toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${b64}`;
    const result = await require('../config/cloudinary').uploader.upload(dataUri, {
      folder:  'haiq/bank-proofs',
      type:    'private',
      use_filename: false,
    });

    await query(
      `UPDATE payments SET bank_proof_url=$1, bank_proof_public_id=$2, status='pending', updated_at=NOW() WHERE id=$3`,
      [result.secure_url, result.public_id, payment.id]
    );

    res.json({ success: true, message: 'Proof uploaded. Admin will verify within 24 hours.' });
  } catch (err) { next(err); }
}

module.exports = {
  initiateMTN, statusMTN, webhookMTN,
  initiateAirtel, statusAirtel, webhookAirtel,
  bankDetails, uploadBankProof,
};
