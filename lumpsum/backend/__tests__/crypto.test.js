const { verifySignature } = require('../src/utils/crypto');

describe('Crypto utils', () => {
  test('verifySignature should return true for valid signature', () => {
    const payload = { test: 'data' };
    const secret = 'secret';
    const signature = require('crypto').createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
    expect(verifySignature(payload, signature, secret)).toBe(true);
  });

  test('verifySignature should return false for invalid signature', () => {
    const payload = { test: 'data' };
    const secret = 'secret';
    const signature = 'wrong';
    expect(verifySignature(payload, signature, secret)).toBe(false);
  });
});
