const crypto = require('crypto');

/**
 * Generate a public order tracking token (URL-safe)
 */
function generateTrackingToken() {
  return 'trk_' + crypto.randomBytes(24).toString('base64url');
}

/**
 * Generate a payment internal reference
 */
function generatePaymentRef() {
  return 'pay_' + crypto.randomUUID().replace(/-/g, '');
}

/**
 * Generate a unique order number
 * Format: HAIQ-YYYYMMDD-XXXX
 */
function generateOrderNumber() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `HAIQ-${date}-${suffix}`;
}

/**
 * Generate a bank transfer reference code
 */
function generateBankRef() {
  return 'HAIQ-REF-' + crypto.randomBytes(4).toString('hex').toUpperCase();
}

/**
 * Generate a guest account link token
 */
function generateGuestToken() {
  return 'guest_' + crypto.randomBytes(30).toString('base64url');
}

/**
 * Generate a password reset token
 */
function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

module.exports = {
  generateTrackingToken,
  generatePaymentRef,
  generateOrderNumber,
  generateBankRef,
  generateGuestToken,
  generateResetToken,
};
