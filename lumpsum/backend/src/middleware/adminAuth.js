const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const { ROLES } = require('../config/constants');

/**
 * Verify admin JWT and check role.
 * @param {string[]} allowedRoles - roles permitted; defaults to all admin roles
 */
function requireAdmin(allowedRoles = [ROLES.STAFF, ROLES.SUPERADMIN]) {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({ success: false, error: 'Admin authentication required' });
    }

    try {
      const payload = jwt.verify(token, process.env.ADMIN_JWT_SECRET);

      if (!payload.isAdmin) {
        return res.status(403).json({ success: false, error: 'Not an admin token' });
      }

      // Verify admin still active in DB
      const { rows } = await query(
        'SELECT id, role, is_active FROM admin_users WHERE id = $1',
        [payload.sub]
      );

      if (!rows[0] || !rows[0].is_active) {
        return res.status(403).json({ success: false, error: 'Admin account inactive' });
      }

      if (!allowedRoles.includes(rows[0].role)) {
        return res.status(403).json({
          success: false,
          error: `Requires role: ${allowedRoles.join(' or ')}`,
        });
      }

      req.admin = { id: rows[0].id, role: rows[0].role, email: payload.email };
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, error: 'Admin token expired', code: 'TOKEN_EXPIRED' });
      }
      return res.status(401).json({ success: false, error: 'Invalid admin token' });
    }
  };
}

const requireSuperAdmin = requireAdmin([ROLES.SUPERADMIN]);
const requireStaff      = requireAdmin([ROLES.STAFF, ROLES.SUPERADMIN]);

module.exports = { requireAdmin, requireSuperAdmin, requireStaff };
