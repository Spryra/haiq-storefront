// routes/newsletter.routes.js
const router = require('express').Router();
const { query } = require('../config/db');
const emailService = require('../services/email.service');

/**
 * POST /newsletter/subscribe
 */
router.post('/subscribe', async (req, res, next) => {
  try {
    const { email, name } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Valid email required' });
    }

    const { rows: [existing] } = await query(
      'SELECT id, is_active FROM newsletter_subscribers WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existing) {
      if (existing.is_active) {
        return res.json({ success: true, message: 'Already subscribed' });
      }
      // Reactivate
      await query('UPDATE newsletter_subscribers SET is_active = true WHERE id = $1', [existing.id]);
    } else {
      await query(
        'INSERT INTO newsletter_subscribers (email, name) VALUES ($1, $2)',
        [email.toLowerCase(), name || null]
      );
    }

    // Send welcome email
    await emailService.sendNewsletterWelcome({ email, name: name || 'Cookie Lover' });

    res.json({ success: true, message: 'Subscribed successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
