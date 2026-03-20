// routes/admin/admin.analytics.routes.js
const router = require('express').Router();
const { query } = require('../../config/db');
const { requireStaff } = require('../../middleware/adminAuth');

/**
 * GET /admin/analytics/summary
 * Returns all stat card values for the dashboard
 */
router.get('/summary', requireStaff, async (req, res, next) => {
  try {
    const [revenue, ordersToday, customers, newsletter, revenue7d] = await Promise.all([

      // Total all-time revenue
      query(`SELECT COALESCE(SUM(total),0) AS total FROM orders WHERE payment_status = 'paid'`),

      // Orders today
      query(`SELECT COUNT(*) FROM orders WHERE created_at::date = CURRENT_DATE`),

      // Total registered customers
      query(`SELECT COUNT(*) FROM users`),

      // Newsletter subscribers
      query(`SELECT COUNT(*) FROM newsletter_subscribers WHERE is_active = true`),

      // Last 7 days revenue per day
      query(`
        SELECT
          TO_CHAR(d::date, 'Dy') AS label,
          COALESCE(SUM(o.total), 0) AS total
        FROM generate_series(
          CURRENT_DATE - INTERVAL '6 days',
          CURRENT_DATE,
          INTERVAL '1 day'
        ) d
        LEFT JOIN orders o
          ON o.created_at::date = d::date AND o.payment_status = 'paid'
        GROUP BY d
        ORDER BY d
      `),
    ]);

    const revenue7dRows  = revenue7d.rows;
    const revenue7dTotal = revenue7dRows.reduce((s, r) => s + parseFloat(r.total), 0);

    res.json({
      total_revenue:    parseFloat(revenue.rows[0].total),
      orders_today:     parseInt(ordersToday.rows[0].count),
      total_customers:  parseInt(customers.rows[0].count),
      newsletter_count: parseInt(newsletter.rows[0].count),
      revenue_7d:       revenue7dRows,
      revenue_7d_total: revenue7dTotal,
    });
  } catch (err) { next(err); }
});

/**
 * GET /admin/analytics/top-customers
 * Top 10 customers by total spend — used for gifting reference in dashboard
 */
router.get('/top-customers', requireStaff, async (req, res, next) => {
  try {
    const { rows } = await query(`
      SELECT
        u.id,
        u.full_name,
        u.email,
        u.phone,
        u.loyalty_points,
        u.loyalty_tier,
        COUNT(o.id)       AS order_count,
        COALESCE(SUM(o.total), 0) AS total_spent,
        MAX(o.created_at) AS last_order_at
      FROM users u
      LEFT JOIN orders o ON o.user_id = u.id AND o.payment_status = 'paid'
      GROUP BY u.id
      HAVING COUNT(o.id) > 0
      ORDER BY total_spent DESC
      LIMIT 10
    `);
    res.json({ customers: rows });
  } catch (err) { next(err); }
});

module.exports = router;
