const { query } = require('../config/db');

async function getByProductSlug(req, res, next) {
  try {
    const { rows: [product] } = await query(
      'SELECT id FROM products WHERE slug = $1',
      [req.params.slug]
    );
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const { rows } = await query(`
      SELECT name, rating, comment, verified_purchase, created_at
      FROM product_reviews
      WHERE product_id = $1 AND status = 'approved'
      ORDER BY created_at DESC
    `, [product.id]);

    res.json({ success: true, reviews: rows });
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { name, rating, comment, tracking_token } = req.body;
    if (!name || !comment || !rating) {
      return res.status(400).json({ success: false, message: 'name, rating, and comment are required' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const { rows: [product] } = await query(
      'SELECT id FROM products WHERE slug = $1',
      [req.params.slug]
    );
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    let verifiedPurchase = false;
    if (tracking_token) {
      const { rows: [order] } = await query(`
        SELECT oi.id
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        WHERE o.tracking_token = $1 AND oi.product_id = $2 AND o.status = 'delivered'
        LIMIT 1
      `, [tracking_token, product.id]);
      if (order) verifiedPurchase = true;
    }

    await query(`
      INSERT INTO product_reviews (product_id, name, rating, comment, verified_purchase)
      VALUES ($1, $2, $3, $4, $5)
    `, [product.id, name.trim(), rating, comment.trim(), verifiedPurchase]);

    res.status(201).json({ success: true, message: 'Review submitted and pending approval' });
  } catch (err) { next(err); }
}

module.exports = { getByProductSlug, create };