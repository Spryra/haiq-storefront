const { query, getClient } = require('../config/db');
const { logger } = require('../config/logger');
const { generateTrackingToken, generateOrderNumber } = require('../utils/tokenGenerator');
const { calculateDeliveryFee } = require('../utils/ugxFormat');
const { STATUS_LABELS, SSE_HEARTBEAT_MS } = require('../config/constants');
const paymentService = require('../services/payment.service');
const emailService = require('../services/email.service');

// Active SSE clients: Map<trackingToken, Set<res>>
const sseClients = new Map();

async function create(req, res, next) {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const {
      first_name, last_name, email, phone,
      delivery_address, delivery_note, gift_note,
      items, payment_method, payer_phone, consent_given,
    } = req.body;

    // Validate and price all items
    let subtotal = 0;
    const resolvedItems = [];

    for (const item of items) {
      const { rows: [variant] } = await client.query(`
        SELECT pv.id, pv.price, pv.label, pv.stock_qty, p.id AS product_id, p.name AS product_name
        FROM product_variants pv
        JOIN products p ON p.id = pv.product_id
        WHERE pv.id = $1 AND pv.product_id = $2 AND p.is_active = true
      `, [item.variant_id, item.product_id]);

      if (!variant) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: `Product variant not found for item with product_id ${item.product_id}`,
        });
      }
      if (variant.stock_qty < item.quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for "${variant.product_name}" — only ${variant.stock_qty} available`,
        });
      }

      const line_total = parseFloat(variant.price) * item.quantity;
      subtotal += line_total;
      resolvedItems.push({ ...variant, quantity: item.quantity, line_total });
    }

    const delivery_fee = calculateDeliveryFee(delivery_address);
    const total = subtotal + delivery_fee;
    const order_number   = generateOrderNumber();
    const tracking_token = generateTrackingToken();
    const user_id = req.user?.id || null;

    // Create order
    const { rows: [order] } = await client.query(`
      INSERT INTO orders (
        order_number, tracking_token, user_id, first_name, last_name, email, phone,
        delivery_address, delivery_note, gift_note, subtotal, delivery_fee, total,
        payment_method, consent_given
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      RETURNING id, order_number, tracking_token, total
    `, [
      order_number, tracking_token, user_id, first_name, last_name,
      email.toLowerCase(), phone, delivery_address,
      delivery_note || null, gift_note || null,
      subtotal, delivery_fee, total, payment_method, consent_given,
    ]);

    // Insert order items
    for (const item of resolvedItems) {
      await client.query(`
        INSERT INTO order_items (order_id, product_id, variant_id, product_name, variant_label, unit_price, quantity, line_total)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      `, [
        order.id, item.product_id, item.id,
        item.product_name, item.label, item.price,
        item.quantity, item.line_total,
      ]);
    }

    // Log creation event
    await client.query(`
      INSERT INTO order_events (order_id, event_type, new_value, actor_type, note)
      VALUES ($1, 'order_created', 'pending', 'customer', $2)
    `, [order.id, `Order created via ${payment_method}`]);

    await client.query('COMMIT');

    // Initiate payment (async, after commit)
    let payment_intent = {};
    try {
      payment_intent = await paymentService.initiate({
        order_id:    order.id,
        amount:      total,
        method:      payment_method,
        payer_phone: payer_phone || phone,
        order_number: order_number,
      });
    } catch (payErr) {
      logger.error('Payment initiation failed after order creation', {
        order_id: order.id, error: payErr.message,
      });
    }

    // Send confirmation email (non-blocking)
    emailService.sendOrderConfirmation({ ...order, email, first_name, items: resolvedItems })
      .catch(err => logger.error('Order email failed', { error: err.message }));

    res.status(201).json({
      success: true,
      order_id:       order.id,
      order_number:   order.order_number,
      tracking_token: order.tracking_token,
      total,
      currency: 'UGX',
      payment_intent,
    });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    next(err);
  } finally {
    client.release();
  }
}

async function track(req, res, next) {
  try {
    const { rows: [order] } = await query(`
      SELECT
        o.order_number, o.status, o.estimated_delivery, o.created_at,
        o.payment_status,
        COUNT(oi.id) AS items_count
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE o.tracking_token = $1
      GROUP BY o.id
    `, [req.params.token]);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const { rows: events } = await query(`
      SELECT event_type, new_value, created_at
      FROM order_events
      WHERE order_id = (SELECT id FROM orders WHERE tracking_token = $1)
        AND event_type = 'status_change'
      ORDER BY created_at ASC
    `, [req.params.token]);

    const statusTimestamps = {};
    for (const ev of events) {
      statusTimestamps[ev.new_value] = ev.created_at;
    }
    statusTimestamps['pending'] = order.created_at; // always set

    const allStatuses = ['pending', 'freshly_kneaded', 'ovenbound', 'on_the_cart', 'en_route', 'delivered'];
    const currentIdx = allStatuses.indexOf(order.status);

    const timeline = allStatuses.map((s, idx) => {
      const meta = STATUS_LABELS[s];
      return {
        status:    s,
        label:     `${meta.label} ${meta.emoji}`,
        timestamp: statusTimestamps[s] || null,
        done:      idx <= currentIdx && order.status !== 'cancelled',
      };
    });

    const statusMeta = STATUS_LABELS[order.status] || STATUS_LABELS['pending'];

    res.json({
      success: true,
      order_number:       order.order_number,
      status:             order.status,
      status_label:       `${statusMeta.label} ${statusMeta.emoji}`,
      payment_status:     order.payment_status,
      timeline,
      estimated_delivery: order.estimated_delivery,
      items_count:        parseInt(order.items_count),
    });
  } catch (err) { next(err); }
}

// Server-Sent Events for real-time tracking
function statusStream(req, res, next) {
  const { token } = req.params;

  res.setHeader('Content-Type',  'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection',    'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  if (!sseClients.has(token)) sseClients.set(token, new Set());
  sseClients.get(token).add(res);

  // Send initial heartbeat
  res.write(': connected\n\n');

  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, SSE_HEARTBEAT_MS);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.get(token)?.delete(res);
    if (sseClients.get(token)?.size === 0) sseClients.delete(token);
  });
}

/**
 * Broadcast a status update to all SSE listeners for a tracking token
 */
function broadcastStatusUpdate(tracking_token, payload) {
  const clients = sseClients.get(tracking_token);
  if (!clients || clients.size === 0) return;
  const data = JSON.stringify(payload);
  clients.forEach(client => {
    try {
      client.write(`event: status_update\ndata: ${data}\n\n`);
    } catch (_) {}
  });
}

async function listMine(req, res, next) {
  try {
    const page  = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);

    const { rows } = await query(`
      SELECT id, order_number, tracking_token, status, payment_status,
             total, created_at, items_count
      FROM orders,
        LATERAL (SELECT COUNT(*) AS items_count FROM order_items oi WHERE oi.order_id = orders.id) _
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `, [req.user.id, limit, (page - 1) * limit]);

    res.json({ success: true, orders: rows });
  } catch (err) { next(err); }
}

async function getOne(req, res, next) {
  try {
    const { rows: [order] } = await query(
      'SELECT * FROM orders WHERE id = $1', [req.params.id]
    );
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    if (order.user_id !== req.user.id) return res.status(403).json({ success: false, error: 'Access denied' });

    const { rows: items } = await query(
      'SELECT * FROM order_items WHERE order_id = $1', [order.id]
    );
    res.json({ success: true, order: { ...order, items } });
  } catch (err) { next(err); }
}

module.exports = { create, track, statusStream, listMine, getOne, broadcastStatusUpdate };
