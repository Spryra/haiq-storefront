// payment.service.js — Payment orchestrator
// Added: cash_on_delivery support (no external API call needed)
const mtnService    = require('./mtn.service');
const airtelService = require('./airtel.service');
const { generatePaymentRef, generateBankRef } = require('../utils/tokenGenerator');
const { query } = require('../config/db');

async function initiate({ order_id, amount, method, payer_phone, order_number }) {
  const internal_ref = generatePaymentRef();

  if (method === 'mtn_momo') {
    await query(
      `INSERT INTO payments (order_id, payment_method, internal_ref, amount, payer_phone, status)
       VALUES ($1, 'mtn_momo', $2, $3, $4, 'initiated')`,
      [order_id, internal_ref, amount, payer_phone]
    );
    await mtnService.requestToPay({ internal_ref, amount, payer_phone, order_number });
    await query(`UPDATE payments SET status = 'pending' WHERE internal_ref = $1`, [internal_ref]);
    await query(`UPDATE orders SET payment_status = 'pending' WHERE id = $1`, [order_id]);

    return {
      type: 'mtn_momo',
      internal_ref,
      message: `Payment request sent to ${payer_phone}. Approve on your phone.`,
    };
  }

  if (method === 'airtel') {
    await query(
      `INSERT INTO payments (order_id, payment_method, internal_ref, amount, payer_phone, status)
       VALUES ($1, 'airtel', $2, $3, $4, 'initiated')`,
      [order_id, internal_ref, amount, payer_phone]
    );
    await airtelService.requestPayment({ internal_ref, amount, payer_phone });
    await query(`UPDATE payments SET status = 'pending' WHERE internal_ref = $1`, [internal_ref]);
    await query(`UPDATE orders SET payment_status = 'pending' WHERE id = $1`, [order_id]);

    return {
      type: 'airtel',
      internal_ref,
      message: `Airtel Money request sent to ${payer_phone}. Approve on your phone.`,
    };
  }

  if (method === 'bank_transfer') {
    const ref = generateBankRef();
    await query(
      `INSERT INTO payments (order_id, payment_method, internal_ref, amount, status)
       VALUES ($1, 'bank_transfer', $2, $3, 'initiated')`,
      [order_id, ref, amount]
    );
    await query(`UPDATE orders SET payment_status = 'pending' WHERE id = $1`, [order_id]);

    return {
      type: 'bank_transfer',
      internal_ref: ref,
      message: 'Bank transfer reference generated. Upload your proof of payment to complete the order.',
    };
  }

  if (method === 'cash_on_delivery') {
    // No payment record or external API call needed.
    // Order stays at payment_status = 'unpaid' — admin marks paid on delivery.
    return {
      type: 'cash_on_delivery',
      internal_ref: null,
      message: 'Cash on delivery confirmed. Pay when your order arrives.',
    };
  }

  throw new Error(`Unsupported payment method: ${method}`);
}

module.exports = { initiate };
