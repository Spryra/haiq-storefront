const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

/**
 * Verify customer JWT. Sets req.user on success.
 * Pass next() even if no token when `optional: true`.
 */
function authenticate(options = {}) {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    if (!token) {
      if (options.optional) return next();
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);

      // Check token is not revoked
      const revoked = await query(
        'SELECT 1 FROM revoked_tokens WHERE jti = $1',
        [payload.jti]
      );
      if (revoked.rowCount > 0) {
        return res.status(401).json({ success: false, error: 'Token has been revoked' });
      }

      req.user = { id: payload.sub, email: payload.email, jti: payload.jti };
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, error: 'Token expired', code: 'TOKEN_EXPIRED' });
      }
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }
  };
}

// Convenience exports
const requireAuth     = authenticate({ optional: false });
const optionalAuth    = authenticate({ optional: true });

module.exports = { requireAuth, optionalAuth, authenticate };
