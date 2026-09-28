'use strict';
const router = require('express').Router();
const multer = require('multer');
const { query } = require('../../config/db');
const { requireStaff } = require('../../middleware/adminAuth');
const cloudinary = require('../../config/cloudinary');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype);
    cb(ok ? null : new Error('Only JPEG, PNG, and WebP images are allowed.'), ok);
  },
});

const clean = (v) => (typeof v === 'string' ? v.trim() || null : v ?? null);

function parseBody(body) {
  const { title, description, location, starts_at, ends_at, image_url, cta_label, cta_url, is_published } = body;
  return {
    title: clean(title),
    description: clean(description),
    location: clean(location),
    starts_at: clean(starts_at),
    ends_at: clean(ends_at),
    image_url: clean(image_url),
    cta_label: clean(cta_label),
    cta_url: clean(cta_url),
    is_published: is_published === undefined ? undefined : !!is_published,
  };
}

// GET /v1/admin/events — every event, drafts included, newest start first
router.get('/', requireStaff, async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM events ORDER BY starts_at DESC');
    res.json({ success: true, events: rows });
  } catch (err) { next(err); }
});

// POST /v1/admin/events
router.post('/', requireStaff, async (req, res, next) => {
  try {
    const e = parseBody(req.body);
    if (!e.title || !e.starts_at) {
      return res.status(400).json({ success: false, error: 'title and starts_at are required.' });
    }
    if (e.ends_at && new Date(e.ends_at) < new Date(e.starts_at)) {
      return res.status(400).json({ success: false, error: 'ends_at cannot be before starts_at.' });
    }
    const { rows: [event] } = await query(
      `INSERT INTO events (title, description, location, starts_at, ends_at, image_url, cta_label, cta_url, is_published)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [e.title, e.description, e.location, e.starts_at, e.ends_at, e.image_url, e.cta_label, e.cta_url, e.is_published ?? false]
    );
    res.status(201).json({ success: true, event });
  } catch (err) { next(err); }
});

// PUT /v1/admin/events/:id — full update of the editable fields
router.put('/:id', requireStaff, async (req, res, next) => {
  try {
    const e = parseBody(req.body);
    if (!e.title || !e.starts_at) {
      return res.status(400).json({ success: false, error: 'title and starts_at are required.' });
    }
    if (e.ends_at && new Date(e.ends_at) < new Date(e.starts_at)) {
      return res.status(400).json({ success: false, error: 'ends_at cannot be before starts_at.' });
    }
    const { rows: [event] } = await query(
      `UPDATE events
       SET title=$1, description=$2, location=$3, starts_at=$4, ends_at=$5,
           image_url=$6, cta_label=$7, cta_url=$8,
           is_published = COALESCE($9, is_published),
           updated_at = NOW()
       WHERE id = $10 RETURNING *`,
      [e.title, e.description, e.location, e.starts_at, e.ends_at, e.image_url, e.cta_label, e.cta_url, e.is_published, req.params.id]
    );
    if (!event) return res.status(404).json({ success: false, error: 'Event not found.' });
    res.json({ success: true, event });
  } catch (err) { next(err); }
});

// DELETE /v1/admin/events/:id
router.delete('/:id', requireStaff, async (req, res, next) => {
  try {
    await query('DELETE FROM events WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { next(err); }
});

// ── Gallery images (a few photos per event, shown on its detail page) ────────

// GET /v1/admin/events/:id/images
router.get('/:id/images', requireStaff, async (req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT * FROM event_images WHERE event_id = $1 ORDER BY sort_order ASC, created_at ASC',
      [req.params.id]
    );
    res.json({ success: true, images: rows });
  } catch (err) { next(err); }
});

// POST /v1/admin/events/:id/images — multipart, one file per request
router.post('/:id/images', requireStaff, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No image file provided.' });
    const b64 = req.file.buffer.toString('base64');
    const result = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${b64}`,
      { folder: 'haiq/events', transformation: [{ width: 1400, quality: 80, fetch_format: 'webp' }] }
    );
    const { rows: [{ next_sort }] } = await query(
      'SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_sort FROM event_images WHERE event_id = $1',
      [req.params.id]
    );
    const { rows: [image] } = await query(
      `INSERT INTO event_images (event_id, url, public_id, alt_text, sort_order) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [req.params.id, result.secure_url, result.public_id, req.body.alt_text || null, next_sort]
    );
    res.status(201).json({ success: true, image });
  } catch (err) { next(err); }
});

// DELETE /v1/admin/events/:id/images/:imageId
router.delete('/:id/images/:imageId', requireStaff, async (req, res, next) => {
  try {
    const { rows: [image] } = await query(
      'DELETE FROM event_images WHERE id = $1 AND event_id = $2 RETURNING public_id',
      [req.params.imageId, req.params.id]
    );
    if (image?.public_id) {
      cloudinary.uploader.destroy(image.public_id).catch(() => {});
    }
    res.json({ success: true });
  } catch (err) { next(err); }
});

// ── Bookings (read-only — name, phone, email, booked at) ─────────────────────

// GET /v1/admin/events/:id/bookings
router.get('/:id/bookings', requireStaff, async (req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT id, name, phone, email, created_at FROM event_bookings WHERE event_id = $1 ORDER BY created_at DESC',
      [req.params.id]
    );
    res.json({ success: true, bookings: rows });
  } catch (err) { next(err); }
});

module.exports = router;
