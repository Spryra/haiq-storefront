// src/routes/newsletter.routes.js
'use strict';
const router = require('express').Router();
const { query } = require('../config/db');
const { logger } = require('../config/logger');
const { optionalAuth } = require('../middleware/auth');
const { newsletterLimiter } = require('../middleware/rateLimiter');
const { validate } = require('../middleware/validate');
const { newsletterSubscribeSchema } = require('../middleware/schemas');

router.post('/subscribe', newsletterLimiter, optionalAuth, validate(newsletterSubscribeSchema), async (req, res, next) => {
  try {
    const { email, name } = req.body;

    const normalised = email.trim().toLowerCase();

    // Check for existing subscription
    const { rows: [existing] } = await query(
      'SELECT id, is_active, subscribed FROM newsletter_subscribers WHERE email = $1',
      [normalised]
    );

    if (existing) {
      const isActive = existing.is_active ?? existing.subscribed;
      if (isActive) {
        // Already subscribed — return a clear message without re-sending email
        return res.json({
          success:  true,
          already:  true,
          message:  'This email is already subscribed.',
        });
      }
      // Was unsubscribed — reactivate
      await query(
        'UPDATE newsletter_subscribers SET is_active = true, subscribed = true, name = $1 WHERE id = $2',
        [name.trim(), existing.id]
      );
    } else {
      await query(
        'INSERT INTO newsletter_subscribers (email, name) VALUES ($1, $2)',
        [normalised, name.trim()]
      );
    }

    // Welcome email (non-blocking)
    try {
      const emailService = require('../services/email.service');
      await emailService.sendNewsletterWelcome({ email: normalised, name: name.trim() });
    } catch (emailErr) {
      logger.warn('Newsletter welcome email failed', { email: normalised, error: emailErr.message });
    }

    return res.status(201).json({ success: true, already: false, message: 'Subscribed successfully.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
