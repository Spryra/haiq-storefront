// backend/src/controllers/orders.controller.js
// KEY FIX: prices come from the database, never from the client request
// This ensures what admin sees = what customer paid
'use strict'

const { query, getClient } = require('../config/db')
const { logger } = require('../config/logger')
const { generateOrderNumber, generateTrackingToken } = require('../utils/tokenGenerator')
const emailService  = require('../services/email.service')
const paymentsService = require('../services/payments.service')

const DELIVERY_FEE = 0  // Delivery is confirmed separately — no fixed fee

async function create(req, res, next) {
  const client = await getClient()
  try {
    await client.query('BEGIN')

    const {
      first_name, last_name, email, phone,
      delivery_address, delivery_note, gift_note,
      items, payment_method, payer_phone, consent_given,
    } = req.body

    const user_id = req.user?.id || null

    // Validate: one email per account (if not guest)
    if (user_id) {
      const { rows: [existing] } = await client.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email.toLowerCase(), user_id]
      )
      if (existing) {
        await client.query('ROLLBACK')
        return res.status(409).json({
          success: false,
          error:   'This email is linked to another account.',
        })
      }
    }

    // Validate and price items — PRICES FROM DATABASE ONLY
    let subtotal = 0
    const resolvedItems = []

    for (const item of items) {
      const { rows: [variant] } = await client.query(`
        SELECT pv.id, pv.price, pv.label, pv.stock_qty,
               p.id AS product_id, p.name AS product_name, p.is_active
        FROM   product_variants pv
        JOIN   products p ON p.id = pv.product_id
        WHERE  pv.id = $1 AND pv.product_id = $2
      `, [item.variant_id, item.product_id])

      if (!variant) {
        await client.query('ROLLBACK')
        return res.status(400).json({
          success: false,
          error:   `Product not found for item ${item.product_id}`,
        })
      }
      if (variant.is_active === false) {
        await client.query('ROLLBACK')
        return res.status(400).json({ success: false, error: `${variant.product_name} is not available.` })
      }
      if (variant.stock_qty < item.quantity) {
        await client.query('ROLLBACK')
        return res.status(400).json({ success: false, error: `Not enough stock for ${variant.product_name}.` })
      }

      // Price is ALWAYS from the database
      const unit_price  = parseFloat(variant.price)
      const line_total  = unit_price * item.quantity
      subtotal         += line_total

      resolvedItems.push({
        product_id:    variant.product_id,
        variant_id:    variant.id,
        product_name:  variant.product_name,
        variant_label: variant.label,
        unit_price,
        quantity:      item.quantity,
        line_total,
        stock_qty:     variant.stock_qty,
      })
    }

    const total         = subtotal + DELIVERY_FEE
    const order_number  = generateOrderNumber()
    const tracking_token = generateTrackingToken()

    // Create order
    const { rows: [order] } = await client.query(`
      INSERT INTO orders (
        order_number, tracking_token, user_id,
        first_name, last_name, email, phone,
        delivery_address, delivery_note, gift_note,
        subtotal, delivery_fee, total,
        payment_method, consent_given
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      RETURNING id, order_number, tracking_token, total
    `, [
      order_number, tracking_token, user_id,
      first_name, last_name, email.toLowerCase(), phone,
      delivery_address, delivery_note || null, gift_note || null,
      subtotal, DELIVERY_FEE, total,
      payment_method, consent_given,
    ])

    // Insert order items with DB-sourced prices
    for (const item of resolvedItems) {
      await client.query(`
        INSERT INTO order_items
          (order_id, product_id, variant_id, product_name, variant_label, unit_price, quantity, line_total)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      `, [
        order.id, item.product_id, item.variant_id,
        item.product_name, item.variant_label,
        item.unit_price, item.quantity, item.line_total,
      ])

      // Decrement stock
      await client.query(
        'UPDATE product_variants SET stock_qty = stock_qty - $1 WHERE id = $2',
        [item.quantity, item.variant_id]
      )
    }

    // Log creation event
    await client.query(`
      INSERT INTO order_events (order_id, event_type, new_value, actor_type, note)
      VALUES ($1, 'status_change', 'pending', 'system', $2)
    `, [order.id, `Order created via ${payment_method}`])

    await client.query('COMMIT')

    // Initiate payment
    let payment_intent = {}
    try {
      payment_intent = await paymentsService.initiate({
        order_id:     order.id,
        amount:       total,
        method:       payment_method,
        payer_phone:  payer_phone || phone,
        order_number: order_number,
      })
    } catch (payErr) {
      logger.error('Payment initiation failed', { order_id: order.id, error: payErr.message })
    }

    // Send order confirmation email (non-blocking)
    emailService.sendOrderConfirmation({
      order_number:    order_number,
      tracking_token:  tracking_token,
      email:           email,
      first_name:      first_name,
      total:           total,
    }).catch(err => logger.error('Order email failed', { error: err.message }))

    res.status(201).json({
      success:         true,
      order_number,
      tracking_token,
      total,
      payment_intent,
    })
  } catch (err) {
    await client.query('ROLLBACK')
    next(err)
  } finally {
    client.release()
  }
}

async function track(req, res, next) {
  try {
    const { rows: [order] } = await query(`
      SELECT o.id, o.order_number, o.tracking_token, o.status, o.payment_status,
             o.first_name, o.last_name, o.delivery_address, o.subtotal, o.delivery_fee,
             o.total, o.created_at, o.cancellation_reason, o.cancelled_by,
             (SELECT json_agg(json_build_object(
               'product_name', oi.product_name,
               'variant_label', oi.variant_label,
               'unit_price', oi.unit_price,
               'quantity', oi.quantity,
               'line_total', oi.line_total
             )) FROM order_items oi WHERE oi.order_id = o.id) AS items
      FROM orders o
      WHERE o.tracking_token = $1
    `, [req.params.token])

    if (!order) return res.status(404).json({ success: false, error: 'Order not found.' })

    res.json({ success: true, order })
  } catch (err) { next(err) }
}

async function listMine(req, res, next) {
  try {
    const { page = 1, limit = 20 } = req.query
    const { rows: orders } = await query(`
      SELECT id, order_number, tracking_token, status, payment_status,
             total, created_at, cancellation_reason,
             (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = orders.id)::int AS items_count
      FROM orders
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `, [req.user.id, limit, (page - 1) * limit])

    res.json({ success: true, orders })
  } catch (err) { next(err) }
}

async function getOne(req, res, next) {
  try {
    const { rows: [order] } = await query(`
      SELECT o.*,
        (SELECT json_agg(json_build_object(
          'id', oi.id, 'product_name', oi.product_name,
          'variant_label', oi.variant_label,
          'unit_price', oi.unit_price,
          'quantity', oi.quantity,
          'line_total', oi.line_total
        ) ORDER BY oi.id) FROM order_items oi WHERE oi.order_id = o.id) AS items
      FROM orders o
      WHERE o.id = $1 AND o.user_id = $2
    `, [req.params.id, req.user.id])

    if (!order) return res.status(404).json({ success: false, error: 'Order not found.' })
    res.json({ success: true, order })
  } catch (err) { next(err) }
}

async function statusStream(req, res, next) {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')

  const sendEvent = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`)

  const poll = async () => {
    try {
      const { rows: [order] } = await query(
        'SELECT status, payment_status FROM orders WHERE tracking_token = $1',
        [req.params.token]
      )
      if (order) sendEvent(order)
    } catch {}
  }

  await poll()
  const interval = setInterval(poll, 10000)
  req.on('close', () => clearInterval(interval))
}

module.exports = { create, track, listMine, getOne, statusStream }
