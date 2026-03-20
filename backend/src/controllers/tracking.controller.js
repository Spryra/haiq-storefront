const { pool } = require('../config/db');
const logger = require('../config/logger');
// SSE would require a more complex setup; here we just return JSON
const getTracking = async (req, res) => {
  try {
    const { token } = req.params;
    const order = await pool.query(
      SELECT order_number, status, created_at FROM orders WHERE tracking_token = ,
      [token]
    );
    if (!order.rows.length) return res.status(404).json({ error: 'Order not found' });
    // Build timeline (same as orders.track)
    res.json(order.rows[0]);
  } catch (err) {
    logger.error('Tracking error', err);
    res.status(500).json({ error: 'Internal error' });
  }
};

const streamStatus = (req, res) => {
  // Placeholder for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.write('data: {"message":"SSE not fully implemented"}\n\n');
  res.end();
};

module.exports = { getTracking, streamStatus };
