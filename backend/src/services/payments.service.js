// backend/src/services/payments.service.js

const { query } = require('../config/db');
const { generatePaymentRef } = require('../utils/tokenGenerator');

async function initiate({ order_id, amount, method, payer_phone, order_number }) {
  const internal_ref = generatePaymentRef();

  await query(
    `INSERT INTO payments (order_id, payment_method, internal_ref, amount, payer_phone, status)
     VALUES ($1, $2, $3, $4, $5, 'pending')`,
    [order_id, method, internal_ref, amount, payer_phone || null]
  );

  await query(
    `UPDATE orders SET payment_status = 'pending' WHERE id = $1`,
    [order_id]
  );

  return {
    type: method,
    internal_ref,
    message: `Payment initiated (${method}) — simulation mode`
  };
}

// ─────────────────────────────
// Simulation confirm
// ─────────────────────────────
async function confirm({ internal_ref, status }) {
  const { rows: [payment] } = await query(
    `SELECT * FROM payments WHERE internal_ref = $1`,
    [internal_ref]
  );

  if (!payment) {
    throw new Error('Payment not found');
  }

  const mapped = status === 'success' ? 'successful' : 'failed';

  await query(
    `UPDATE payments SET status = $1, updated_at = NOW() WHERE internal_ref = $2`,
    [mapped, internal_ref]
  );

  if (mapped === 'successful') {
    await query(
      `UPDATE orders SET payment_status = 'paid' WHERE id = $1`,
      [payment.order_id]
    );
  }

  return {
    internal_ref,
    status: mapped
  };
}

// Optional placeholders for compatibility
async function handleWebhook() {
  return { message: 'Webhook not implemented in simulation mode' };
}

async function uploadBankProof() {
  return { message: 'Upload handled elsewhere' };
}

module.exports = {
  initiate,
  confirm,
  handleWebhook,
  uploadBankProof
};