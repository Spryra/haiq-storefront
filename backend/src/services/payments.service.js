// backend/src/services/payments.service.js

const { query } = require('../config/db');
const mtnService = require('./mtn.service');
const airtelService = require('./airtel.service');
const { generatePaymentRef, generateBankRef } = require('../utils/tokenGenerator');

async function initiate({ order_id, amount, method, payer_phone, order_number }) {
  const internal_ref = method === 'bank_transfer' ? generateBankRef() : generatePaymentRef();

  if (method === 'mtn_momo') {
    await query(
      `INSERT INTO payments (order_id, payment_method, internal_ref, amount, payer_phone, status)
       VALUES ($1, 'mtn_momo', $2, $3, $4, 'initiated')`,
      [order_id, internal_ref, amount, payer_phone]
    );
    await mtnService.requestToPay({ internal_ref, amount, payer_phone, order_number });
    await query(`UPDATE payments SET status='pending' WHERE internal_ref=$1`, [internal_ref]);
    await query(`UPDATE orders SET payment_status='pending' WHERE id=$1`, [order_id]);

    return { type: 'mtn_momo', internal_ref, message: `Payment request sent to ${payer_phone}. Approve on your phone.` };
  }

  if (method === 'airtel') {
    await query(
      `INSERT INTO payments (order_id, payment_method, internal_ref, amount, payer_phone, status)
       VALUES ($1, 'airtel', $2, $3, $4, 'initiated')`,
      [order_id, internal_ref, amount, payer_phone]
    );
    await airtelService.requestPayment({ internal_ref, amount, payer_phone });
    await query(`UPDATE payments SET status='pending' WHERE internal_ref=$1`, [internal_ref]);
    await query(`UPDATE orders SET payment_status='pending' WHERE id=$1`, [order_id]);

    return { type: 'airtel', internal_ref, message: `Airtel Money request sent to ${payer_phone}. Approve on your phone.` };
  }

  if (method === 'bank_transfer') {
    await query(
      `INSERT INTO payments (order_id, payment_method, internal_ref, amount, status)
       VALUES ($1, 'bank_transfer', $2, $3, 'initiated')`,
      [order_id, internal_ref, amount]
    );
    await query(`UPDATE orders SET payment_status='pending' WHERE id=$1`, [order_id]);
    return { type: 'bank_transfer', internal_ref, message: 'Bank transfer reference generated. Upload proof to complete the order.' };
  }

  if (method === 'cash_on_delivery') {
    return { type: 'cash_on_delivery', internal_ref: null, message: 'Cash on delivery confirmed. Pay on delivery.' };
  }

  throw new Error(`Unsupported payment method: ${method}`);
}

/**
 * Centralized webhook handler
 * @param {'mtn_momo'|'airtel'} provider
 * @param {object} payload
 */
async function handleWebhook(provider, payload) {
  let internal_ref, amount, mappedStatus, providerRef;

  if (provider === 'mtn_momo') {
    internal_ref = payload.externalId;
    amount = parseFloat(payload.amount);
    mappedStatus = mapMTNStatus(payload.status);
    providerRef = payload.financialTransactionId || null;
  } else if (provider === 'airtel') {
    const transaction = payload.transaction;
    if (!transaction) throw new Error('Invalid Airtel payload');
    internal_ref = transaction.id;
    amount = null; // Airtel may not include amount for webhook
    mappedStatus = transaction.status === 'TS' ? 'successful' : 'failed';
    providerRef = transaction.airtel_money_id || null;
  } else {
    throw new Error('Unsupported provider for webhook');
  }

  const { rows: [payment] } = await query(
    'SELECT * FROM payments WHERE internal_ref=$1', [internal_ref]
  );
  if (!payment) throw new Error('Payment not found');
  if (payment.status === 'successful') return { message: 'Already processed' };

  // Amount integrity check for MTN
  if (provider === 'mtn_momo' && amount !== parseFloat(payment.amount)) {
    throw new Error('Amount mismatch');
  }

  await query(
    `UPDATE payments SET status=$1, provider_ref=$2, webhook_payload=$3, signature_valid=true, updated_at=NOW()
     WHERE internal_ref=$4`,
    [mappedStatus, providerRef, JSON.stringify(payload), internal_ref]
  );

  if (mappedStatus === 'successful') {
    await query(
      `UPDATE orders SET payment_status='paid', status='freshly_kneaded', updated_at=NOW() WHERE id=$1`,
      [payment.order_id]
    );
    await query(
      `INSERT INTO order_events (order_id, event_type, old_value, new_value, actor_type, note)
       VALUES ($1, 'payment_received', 'unpaid', 'paid', 'webhook', $2)`,
      [payment.order_id, `${provider} payment confirmed`]
    );
  }

  return { internal_ref, status: mappedStatus };
}

/**
 * Map MTN statuses to internal statuses
 */
function mapMTNStatus(s) {
  const map = { SUCCESSFUL: 'successful', FAILED: 'failed', PENDING: 'pending', CANCELLED: 'cancelled' };
  return map[s?.toUpperCase()] || 'pending';
}

/**
 * Upload bank proof (used by controller)
 */
async function uploadBankProof(order_id, file) {
  const { rows: [payment] } = await query(
    `SELECT id FROM payments WHERE order_id=$1 AND payment_method='bank_transfer' LIMIT 1`,
    [order_id]
  );
  if (!payment) throw new Error('Bank transfer payment not found');

  const b64 = file.buffer.toString('base64');
  const dataUri = `data:${file.mimetype};base64,${b64}`;
  const result = await require('../config/cloudinary').uploader.upload(dataUri, {
    folder: 'haiq/bank-proofs',
    type: 'private',
    use_filename: false,
  });

  await query(
    `UPDATE payments SET bank_proof_url=$1, bank_proof_public_id=$2, status='pending', updated_at=NOW() WHERE id=$3`,
    [result.secure_url, result.public_id, payment.id]
  );

  return result;
}

module.exports = { initiate, handleWebhook, uploadBankProof };