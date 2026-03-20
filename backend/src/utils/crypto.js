const crypto = require('crypto');
const { WEBHOOK_REPLAY_WINDOW_S } = require('../config/constants');

/**
 * Generate HMAC-SHA256 signature
 */
function signPayload(payload, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(typeof payload === 'string' ? payload : JSON.stringify(payload))
    .digest('hex');
}

/**
 * Timing-safe comparison of two signatures
 */
function verifySignature(payload, secret, receivedSig) {
  const expected = signPayload(payload, secret);
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(receivedSig.replace(/^sha256=/, ''), 'hex')
    );
  } catch {
    return false;
  }
}

/**
 * Check webhook timestamp is within replay window
 * @param {string|number} timestamp - Unix timestamp from webhook
 */
function isTimestampFresh(timestamp) {
  const now = Math.floor(Date.now() / 1000);
  const ts = parseInt(timestamp, 10);
  if (isNaN(ts)) return false;
  return Math.abs(now - ts) <= WEBHOOK_REPLAY_WINDOW_S;
}

/**
 * Generate a secure random token
 */
function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate a secure UUID v4
 */
function generateUUID() {
  return crypto.randomUUID();
}

/**
 * Hash a string with SHA-256
 */
function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

module.exports = {
  signPayload,
  verifySignature,
  isTimestampFresh,
  generateToken,
  generateUUID,
  sha256,
};
