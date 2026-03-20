// newsletter.controller.js
const { query } = require('../config/db');
const { logger } = require('../config/logger');
const emailService = require('../services/email.service');

// ── Subscribe ─────────────────────────────────────────────────────────────────
const subscribe = async (req, res, next) => {
  try {
    const { email, name } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    }

    const { rows: [existing] } = await query(
      'SELECT id, is_active FROM newsletter_subscribers WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existing && existing.is_active) {
      return res.json({ success: true, message: 'You are already subscribed.' });
    }

    await query(
      `INSERT INTO newsletter_subscribers (email, name, is_active)
       VALUES ($1, $2, true)
       ON CONFLICT (email) DO UPDATE SET is_active = true, name = COALESCE(EXCLUDED.name, newsletter_subscribers.name)`,
      [email.toLowerCase(), name || null]
    );

    // Send confirmation email (non-blocking)
    emailService.sendNewsletterConfirmation(email, name).catch(err =>
      logger.error('Newsletter email failed', { error: err.message })
    );

    res.json({ success: true, message: 'Subscribed successfully. Check your inbox!' });
  } catch (err) { next(err); }
};

// ── Unsubscribe ───────────────────────────────────────────────────────────────
const unsubscribe = async (req, res, next) => {
  try {
    const { email } = req.body;
    await query(
      'UPDATE newsletter_subscribers SET is_active = false WHERE email = $1',
      [email.toLowerCase()]
    );
    res.json({ success: true, message: 'Unsubscribed successfully.' });
  } catch (err) { next(err); }
};

module.exports = { subscribe, unsubscribe };
