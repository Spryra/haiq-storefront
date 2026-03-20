// src/routes/admin/admin.analytics.routes.js
// Replaces the original — adds /summary with all dashboard stat card values
// and /top-customers for the internal-only leaderboard.
'use strict';

const router    = require('express').Router();
const { query } = require('../../config/db');
const { requireStaff } = require('../../middleware/adminAuth');

// ─────────────────────────────────────────────────────────────────────────────
// GET /v1/admin/analytics/summary
// All values needed for the 4 stat cards + 7-day revenue sparkline.
// ─────────────────────────────────────────────────────────────────────────────
router.get('/summary', requireStaff, async (req, res, next) => {
  try {
    const [
      revenueRow,
      ordersRow,
      customersRow,
      newsletterRow,
      revenue7dRows,
    ] = await Promise.all([

      // All-time total revenue
      query(`
        SELECT COALESCE(SUM(total), 0) AS total_revenue
        FROM   orders
        WHERE  payment_status = 'paid'
      `),

      // Orders today
      query(`
        SELECT COUNT(*) AS orders_today
        FROM   orders
        WHERE  created_at::date = CURRENT_DATE
      `),

      // Total registered customers
      query(`SELECT COUNT(*) AS total_customers FROM users`),

      // Active newsletter subscribers
      query(`
        SELECT COUNT(*) AS newsletter_count
        FROM   newsletter_subscribers
        WHERE  is_active = true
           OR  subscribed = true
      `),

      // Last 7 days revenue — one row per day
      query(`
        SELECT
          TO_CHAR(day, 'Dy')           AS label,
          COALESCE(SUM(o.total), 0)    AS total
        FROM   generate_series(
                 CURRENT_DATE - INTERVAL '6 days',
                 CURRENT_DATE,
                 INTERVAL '1 day'
               ) AS day
        LEFT   JOIN orders o
               ON  o.created_at::date = day::date
               AND o.payment_status   = 'paid'
        GROUP  BY day
        ORDER  BY day ASC
      `),
    ]);

    const revenue7d      = revenue7dRows.rows;
    const revenue7dTotal = revenue7d.reduce((s, r) => s + parseFloat(r.total), 0);

    res.json({
      success:          true,
      total_revenue:    parseFloat(revenueRow.rows[0].total_revenue),
      orders_today:     parseInt(ordersRow.rows[0].orders_today),
      total_customers:  parseInt(customersRow.rows[0].total_customers),
      newsletter_count: parseInt(newsletterRow.rows[0].newsletter_count),
      revenue_7d:       revenue7d,
      revenue_7d_total: revenue7dTotal,
    });
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /v1/admin/analytics/top-customers
// Top 10 customers by total spend — internal only, never shown on frontend.
// ─────────────────────────────────────────────────────────────────────────────
router.get('/top-customers', requireStaff, async (req, res, next) => {
  try {
    const { rows } = await query(`
      SELECT
        u.id,
        COALESCE(u.full_name, u.first_name || ' ' || COALESCE(u.last_name, '')) AS full_name,
        u.email,
        u.phone,
        u.loyalty_points,
        u.loyalty_tier,
        COUNT(o.id)::int               AS order_count,
        COALESCE(SUM(o.total), 0)      AS total_spent,
        MAX(o.created_at)              AS last_order_at
      FROM   users u
      LEFT   JOIN orders o ON o.user_id = u.id AND o.payment_status = 'paid'
      GROUP  BY u.id
      HAVING COUNT(o.id) > 0
      ORDER  BY total_spent DESC
      LIMIT  10
    `);

    res.json({ success: true, customers: rows });
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────────────────────────────────────────
// Keep existing routes: /revenue, /top-products, /payment-methods
// ─────────────────────────────────────────────────────────────────────────────
router.get('/revenue', requireStaff, async (req, res, next) => {
  try {
    const days = req.query.period === '7d' ? 7 : req.query.period === '90d' ? 90 : 30;
    const { rows } = await query(`
      SELECT
        DATE(created_at AT TIME ZONE 'Africa/Kampala') AS date,
        COALESCE(SUM(total), 0)                        AS revenue,
        COUNT(*)                                       AS order_count
      FROM   orders
      WHERE  payment_status = 'paid'
        AND  created_at >= NOW() - INTERVAL '${days} days'
      GROUP  BY DATE(created_at AT TIME ZONE 'Africa/Kampala')
      ORDER  BY date ASC
    `);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
});

router.get('/top-products', requireStaff, async (req, res, next) => {
  try {
    const { rows } = await query(`
      SELECT
        oi.product_name,
        SUM(oi.quantity)   AS total_units,
        SUM(oi.line_total) AS total_revenue
      FROM   order_items oi
      JOIN   orders o ON o.id = oi.order_id
      WHERE  o.payment_status = 'paid'
        AND  o.created_at >= NOW() - INTERVAL '30 days'
      GROUP  BY oi.product_name
      ORDER  BY total_revenue DESC
      LIMIT  5
    `);
    res.json({ success: true, products: rows });
  } catch (err) { next(err); }
});

router.get('/payment-methods', requireStaff, async (req, res, next) => {
  try {
    const { rows } = await query(`
      SELECT
        payment_method,
        COUNT(*)   AS order_count,
        SUM(total) AS revenue
      FROM   orders
      WHERE  payment_status = 'paid'
        AND  created_at >= NOW() - INTERVAL '30 days'
      GROUP  BY payment_method
    `);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
});

module.exports = router;
