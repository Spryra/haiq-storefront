const axios = require('axios');
const { logger } = require('../config/logger');

let _accessToken = null;
let _tokenExpiry  = 0;

async function getAccessToken() {
  if (_accessToken && Date.now() < _tokenExpiry - 30000) return _accessToken;

  const { data } = await axios.post(
    `${process.env.AIRTEL_BASE_URL}/auth/oauth2/token`,
    {
      client_id:     process.env.AIRTEL_CLIENT_ID,
      client_secret: process.env.AIRTEL_CLIENT_SECRET,
      grant_type:    'client_credentials',
    },
    { headers: { 'Content-Type': 'application/json' } }
  );

  _accessToken = data.access_token;
  _tokenExpiry  = Date.now() + (data.expires_in * 1000);
  return _accessToken;
}

async function requestPayment({ internal_ref, amount, payer_phone }) {
  const token = await getAccessToken();
  const phone = payer_phone.replace(/^\+256/, '').replace(/^0/, '');

  const { data } = await axios.post(
    `${process.env.AIRTEL_BASE_URL}/merchant/v2/payments/`,
    {
      reference:   internal_ref,
      subscriber:  { country: 'UG', currency: 'UGX', msisdn: phone },
      transaction: { amount: Math.round(amount), country: 'UG', currency: 'UGX', id: internal_ref },
    },
    {
      headers: {
        Authorization:  `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Country':    'UG',
        'X-Currency':   'UGX',
      },
    }
  );

  logger.info('Airtel Money request sent', { internal_ref, phone });
  return data;
}

async function getPaymentStatus(internal_ref) {
  const token = await getAccessToken();
  const { data } = await axios.get(
    `${process.env.AIRTEL_BASE_URL}/standard/v1/payments/${internal_ref}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Country':   'UG',
        'X-Currency':  'UGX',
      },
    }
  );
  return data;
}

module.exports = { requestPayment, getPaymentStatus };
