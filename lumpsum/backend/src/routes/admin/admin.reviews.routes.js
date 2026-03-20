// admin.reviews.routes.js
const router = require('express').Router();
const { requireStaff } = require('../../middleware/adminAuth');
const { query } = require('../../config/db');

/**
 * GET /admin/reviews
 * Returns all reviews with their associated product name, slug, and image.
 * Supports ?status=pending|approved|rejected&product_id=xxx
 */
router.get('/', requireStaff, async (req, res, next) => {
  try {
    const { status, product_id, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    const where  = [];

    if (status)     { params.push(status);     where.push(`pr.status = $${params.length}`); }
    if (product_id) { params.push(product_id); where.push(`pr.product_id = $${params.length}`); }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    params.push(parseInt(limit));
    params.push(parseInt(offset));

    const { rows } = await query(`
      SELECT
        pr.id,
        pr.product_id,
        pr.name,
        pr.rating,
        pr.comment,
        pr.status,
        pr.verified_purchase,
        pr.created_at,
        p.name        AS product_name,
        p.slug        AS product_slug,
        pi.url        AS product_image_url
      FROM product_reviews pr
      JOIN products p ON p.id = pr.product_id
      LEFT JOIN LATERAL (
        SELECT url FROM product_images
        WHERE product_id = p.id
        ORDER BY position ASC
        LIMIT 1
      ) pi ON true
      ${whereClause}
      ORDER BY pr.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `, params);

    // Count
    const countParams = params.slice(0, params.length - 2);
    const { rows: [{ count }] } = await query(
      `SELECT COUNT(*) FROM product_reviews pr ${whereClause}`,
      countParams
    );

    res.json({ reviews: rows, total: parseInt(count) });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /admin/reviews/:id
 * Approve or reject a review
 */
router.patch('/:id', requireStaff, async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be approved or rejected' });
    }
    const { rows } = await query(
      `UPDATE product_reviews SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, product_id, status`,
      [status, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Review not found' });
    res.json({ review: rows[0] });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /admin/reviews/:id
 */
router.delete('/:id', requireStaff, async (req, res, next) => {
  try {
    const { rows } = await query(
      'DELETE FROM product_reviews WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Review not found' });
    res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
