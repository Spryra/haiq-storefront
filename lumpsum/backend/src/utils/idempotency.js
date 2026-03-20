const { query } = require('../config/db');

/**
 * Check if an idempotency key was already processed.
 * If yes, replay the stored response.
 * If no, process and store the response after.
 */
function idempotencyMiddleware(req, res, next) {
  const key = req.headers['x-idempotency-key'];
  if (!key) return next();

  // Attach helper to store result after processing
  const originalJson = res.json.bind(res);
  res.json = async (body) => {
    if (res.statusCode < 400) {
      await query(
        `INSERT INTO idempotency_keys (key, response)
         VALUES ($1, $2)
         ON CONFLICT (key) DO NOTHING`,
        [key, JSON.stringify({ status: res.statusCode, body })]
      ).catch(() => {});
    }
    return originalJson(body);
  };

  // Check for existing key
  query('SELECT response FROM idempotency_keys WHERE key = $1', [key])
    .then(({ rows }) => {
      if (rows[0]) {
        const { status, body } = rows[0].response;
        return res.status(status).json(body);
      }
      next();
    })
    .catch(() => next());
}

module.exports = { idempotencyMiddleware };
