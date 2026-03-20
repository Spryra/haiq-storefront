// mtn.service.js
const axios = require('axios');
const { logger } = require('../config/logger');

let _accessToken = null;
let _tokenExpiry  = 0;

async function getAccessToken() {
  if (_accessToken && Date.now() < _tokenExpiry - 30000) return _accessToken;

  const credentials = Buffer.from(
    `${process.env.MTN_MOMO_API_USER}:${process.env.MTN_MOMO_API_KEY}`
  ).toString('base64');

  const { data } = await axios.post(
    `${process.env.MTN_MOMO_BASE_URL}/collection/token/`,
    {},
    {
      headers: {
        Authorization:              `Basic ${credentials}`,
        'Ocp-Apim-Subscription-Key': process.env.MTN_MOMO_SUBSCRIPTION_KEY,
      },
    }
  );

  _accessToken = data.access_token;
  _tokenExpiry  = Date.now() + (data.expires_in * 1000);
  return _accessToken;
}

async function requestToPay({ internal_ref, amount, payer_phone, order_number }) {
  const token = await getAccessToken();
  const phone = payer_phone.replace(/^\+/, '');

  await axios.post(
    `${process.env.MTN_MOMO_BASE_URL}/collection/v1_0/requesttopay`,
    {
      amount:     String(Math.round(amount)),
      currency:   process.env.MTN_MOMO_CURRENCY || 'UGX',
      externalId: internal_ref,
      payer:      { partyIdType: 'MSISDN', partyId: phone },
      payerMessage: `HAIQ Bakery Order ${order_number}`,
      payeeNote:    `Payment for HAIQ order ${order_number}`,
    },
    {
      headers: {
        Authorization:               `Bearer ${token}`,
        'X-Reference-Id':             internal_ref,
        'X-Target-Environment':       process.env.MTN_MOMO_TARGET_ENVIRONMENT || 'sandbox',
        'X-Callback-Url':             process.env.MTN_MOMO_CALLBACK_URL,
        'Ocp-Apim-Subscription-Key':  process.env.MTN_MOMO_SUBSCRIPTION_KEY,
        'Content-Type':               'application/json',
      },
    }
  );

  logger.info('MTN MoMo request-to-pay sent', { internal_ref, phone });
}

async function getTransactionStatus(internal_ref) {
  const token = await getAccessToken();
  const { data } = await axios.get(
    `${process.env.MTN_MOMO_BASE_URL}/collection/v1_0/requesttopay/${internal_ref}`,
    {
      headers: {
        Authorization:               `Bearer ${token}`,
        'X-Target-Environment':       process.env.MTN_MOMO_TARGET_ENVIRONMENT || 'sandbox',
        'Ocp-Apim-Subscription-Key':  process.env.MTN_MOMO_SUBSCRIPTION_KEY,
      },
    }
  );
  return data;
}

module.exports = { requestToPay, getTransactionStatus };
