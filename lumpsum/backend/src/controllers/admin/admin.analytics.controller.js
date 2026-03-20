// admin.analytics.controller.js
const { query } = require('../../config/db');

// ── Summary card stats ────────────────────────────────────────────────────────
const summary = async (req, res, next) => {
  try {
    const [ordersRes, revenueRes, customersRes, pendingRes] = await Promise.all([
      query(`SELECT COUNT(*) AS total FROM orders`),
      query(`SELECT COALESCE(SUM(total), 0) AS total FROM orders WHERE payment_status = 'paid'`),
      query(`SELECT COUNT(*) AS total FROM users WHERE is_guest = false`),
      query(`SELECT COUNT(*) AS total FROM orders WHERE status NOT IN ('delivered','cancelled') AND payment_status = 'paid'`),
    ]);

    // This week vs last week revenue
    const thisWeek = await query(`
      SELECT COALESCE(SUM(total), 0) AS amount
      FROM orders
      WHERE payment_status = 'paid'
        AND created_at >= date_trunc('week', NOW())
    `);
    const lastWeek = await query(`
      SELECT COALESCE(SUM(total), 0) AS amount
      FROM orders
      WHERE payment_status = 'paid'
        AND created_at >= date_trunc('week', NOW()) - interval '7 days'
        AND created_at <  date_trunc('week', NOW())
    `);

    const thisRevenue = parseFloat(thisWeek.rows[0].amount);
    const lastRevenue = parseFloat(lastWeek.rows[0].amount);
    const weeklyChange = lastRevenue === 0
      ? null
      : Math.round(((thisRevenue - lastRevenue) / lastRevenue) * 100);

    res.json({
      success: true,
      summary: {
        total_orders:     parseInt(ordersRes.rows[0].total),
        total_revenue:    parseFloat(revenueRes.rows[0].total),
        total_customers:  parseInt(customersRes.rows[0].total),
        active_orders:    parseInt(pendingRes.rows[0].total),
        revenue_this_week: thisRevenue,
        revenue_last_week: lastRevenue,
        weekly_change_pct: weeklyChange,
      },
    });
  } catch (err) { next(err); }
};

// ── Revenue chart (last 30 days) ──────────────────────────────────────────────
const revenue = async (req, res, next) => {
  try {
    const { rows } = await query(`
      SELECT
        DATE(created_at AT TIME ZONE 'Africa/Kampala') AS day,
        COALESCE(SUM(total), 0)                         AS revenue,
        COUNT(*)                                         AS orders
      FROM orders
      WHERE payment_status = 'paid'
        AND created_at >= NOW() - interval '30 days'
      GROUP BY 1
      ORDER BY 1 ASC
    `);

    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

// ── Top products by units sold ────────────────────────────────────────────────
const topProducts = async (req, res, next) => {
  try {
    const { rows } = await query(`
      SELECT
        p.id, p.name, p.slug,
        SUM(oi.quantity)   AS units_sold,
        SUM(oi.line_total) AS revenue
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      JOIN orders   o ON o.id = oi.order_id
      WHERE o.payment_status = 'paid'
      GROUP BY p.id, p.name, p.slug
      ORDER BY units_sold DESC
      LIMIT 6
    `);

    res.json({ success: true, products: rows });
  } catch (err) { next(err); }
};

// ── Top customers by spend ────────────────────────────────────────────────────
const topCustomers = async (req, res, next) => {
  try {
    const { rows } = await query(`
      SELECT
        u.id,
        COALESCE(u.full_name, u.first_name || ' ' || u.last_name) AS full_name,
        u.email,
        u.phone,
        u.loyalty_tier,
        u.loyalty_points,
        COUNT(o.id)        AS total_orders,
        SUM(o.total)       AS total_spent,
        MAX(o.created_at)  AS last_order_at
      FROM users u
      JOIN orders o ON o.user_id = u.id
      WHERE o.payment_status = 'paid' AND u.is_guest = false
      GROUP BY u.id, u.full_name, u.first_name, u.last_name, u.email, u.phone,
               u.loyalty_tier, u.loyalty_points
      ORDER BY total_spent DESC
      LIMIT 10
    `);

    res.json({ success: true, customers: rows });
  } catch (err) { next(err); }
};

// ── Payment method breakdown ──────────────────────────────────────────────────
const paymentBreakdown = async (req, res, next) => {
  try {
    const { rows } = await query(`
      SELECT
        payment_method,
        COUNT(*)         AS count,
        SUM(total)       AS revenue
      FROM orders
      WHERE payment_status = 'paid'
      GROUP BY payment_method
      ORDER BY revenue DESC
    `);

    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

// ── Orders by status ──────────────────────────────────────────────────────────
const ordersByStatus = async (req, res, next) => {
  try {
    const { rows } = await query(`
      SELECT status, COUNT(*) AS count
      FROM orders
      GROUP BY status
      ORDER BY count DESC
    `);

    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

module.exports = { summary, revenue, topProducts, topCustomers, paymentBreakdown, ordersByStatus };
