'use strict';
const router = require('express').Router();
const { query } = require('../../config/db');
const { requireStaff } = require('../../middleware/adminAuth');

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

module.exports = router;
