// PUBLIC route — no auth required
'use strict';

const router = require('express').Router();
const { query } = require('../config/db');
const { logger } = require('../config/logger');
const emailService = require('../services/email.service');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * GET /v1/events
 * Published events that haven't finished yet, soonest first.
 * An event with no ends_at counts as running until the end of its start day.
 */
router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 12, 50);
    const { rows } = await query(
      `SELECT id, title, description, location, starts_at, ends_at,
              image_url, cta_label, cta_url
       FROM events
       WHERE is_published = true
         AND COALESCE(ends_at, date_trunc('day', starts_at) + INTERVAL '1 day') >= NOW()
       ORDER BY starts_at ASC
       LIMIT $1`,
      [limit]
    );
    res.json({ success: true, events: rows });
  } catch (err) { next(err); }
});

/**
 * GET /v1/events/:id
 * A single published event, plus its photo gallery. Powers the event detail page —
 * available whether the event is upcoming, live, or already ended (so the page can
 * still show "Ended" instead of 404ing on old links).
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { rows: [event] } = await query(
      `SELECT id, title, description, location, starts_at, ends_at,
              image_url, cta_label, cta_url
       FROM events WHERE id = $1 AND is_published = true`,
      [req.params.id]
    );
    if (!event) return res.status(404).json({ success: false, error: 'Event not found.' });

    const { rows: images } = await query(
      `SELECT id, url, alt_text FROM event_images WHERE event_id = $1 ORDER BY sort_order ASC, created_at ASC`,
      [req.params.id]
    );
    res.json({ success: true, event: { ...event, images } });
  } catch (err) { next(err); }
});

/**
 * POST /v1/events/:id/book
 * Instant booking — no approval step. Name, phone, email in; a confirmation
 * email out immediately, in the HAIQ brand theme.
 */
router.post('/:id/book', async (req, res, next) => {
  try {
    const name  = (req.body.name  || '').trim();
    const phone = (req.body.phone || '').trim();
    const email = (req.body.email || '').trim().toLowerCase();

    if (!name || name.length < 2) {
      return res.status(400).json({ success: false, error: 'Please enter your full name.' });
    }
    if (!phone || phone.replace(/\D/g, '').length < 7) {
      return res.status(400).json({ success: false, error: 'Please enter a valid phone number.' });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    }

    const { rows: [event] } = await query(
      `SELECT id, title, location, starts_at, ends_at FROM events WHERE id = $1 AND is_published = true`,
      [req.params.id]
    );
    if (!event) return res.status(404).json({ success: false, error: 'Event not found.' });

    const hasEnded = event.ends_at
      ? new Date(event.ends_at) < new Date()
      : new Date(event.starts_at).setHours(23, 59, 59, 999) < Date.now();
    if (hasEnded) {
      return res.status(400).json({ success: false, error: 'This event has already ended.' });
    }

    const { rows: [booking] } = await query(
      `INSERT INTO event_bookings (event_id, name, phone, email) VALUES ($1,$2,$3,$4) RETURNING id, created_at`,
      [event.id, name, phone, email]
    );

    emailService
      .sendEventBookingConfirmation({ email, name, event, bookingId: booking.id })
      .catch(err => logger.error('Event booking email failed', { error: err.message, email, eventId: event.id }));

    res.status(201).json({ success: true, booking_id: booking.id });
  } catch (err) { next(err); }
});

module.exports = router;
