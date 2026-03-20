// payment.service.js — Payment orchestrator
const mtnService    = require('./mtn.service');
const airtelService = require('./airtel.service');
const { generatePaymentRef } = require('../utils/tokenGenerator');
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
    const ref = require('../utils/tokenGenerator').generateBankRef();
    await query(
      `INSERT INTO payments (order_id, payment_method, internal_ref, amount, status)
       VALUES ($1, 'bank_transfer', $2, $3, 'initiated')`,
      [order_id, ref, amount]
    );

    return {
      type: 'bank_transfer',
      internal_ref: ref,
      bank_details: {
        bank_name:      process.env.BANK_NAME,
        account_name:   process.env.BANK_ACCOUNT_NAME,
        account_number: process.env.BANK_ACCOUNT_NUMBER,
        branch:         process.env.BANK_BRANCH,
        reference:      ref,
        amount,
        currency:       'UGX',
      },
    };
  }

  throw new Error(`Unknown payment method: ${method}`);
}

module.exports = { initiate };
