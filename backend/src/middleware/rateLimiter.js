const rateLimit = require('express-rate-limit');

const createLimiter = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: message || 'Too many requests, please try again later.' },
    skip: (req) => process.env.NODE_ENV === 'test',
  });

// General API limiter
const generalLimiter = createLimiter(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
  parseInt(process.env.RATE_LIMIT_MAX || '100'),
  'Rate limit exceeded. Please slow down.'
);

// Auth endpoints (stricter)
const authLimiter = createLimiter(15 * 60 * 1000, 10, 'Too many auth attempts. Try again in 15 minutes.');

// Order creation
const orderLimiter = createLimiter(10 * 60 * 1000, 5, 'Too many orders submitted. Wait 10 minutes.');

// Payment initiation
const paymentLimiter = createLimiter(5 * 60 * 1000, 3, 'Too many payment attempts. Wait 5 minutes.');

// Newsletter
const newsletterLimiter = createLimiter(60 * 60 * 1000, 3, 'Already subscribed or too many attempts.');

module.exports = {
  generalLimiter,
  authLimiter,
  orderLimiter,
  paymentLimiter,
  newsletterLimiter,
};
