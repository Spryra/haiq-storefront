// admin.auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../../config/db');

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const { rows: [admin] } = await query(
      'SELECT id, email, full_name, role, password_hash, is_active FROM admin_users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (!admin || !admin.is_active) {
      return res.status(401).json({ success: false, error: 'Invalid credentials or inactive account' });
    }

    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    await query('UPDATE admin_users SET last_login = NOW() WHERE id = $1', [admin.id]);

    const token = jwt.sign(
      { sub: admin.id, email: admin.email, role: admin.role, isAdmin: true },
      process.env.ADMIN_JWT_SECRET,
      { expiresIn: process.env.ADMIN_JWT_EXPIRES_IN || '8h' }
    );

    res.json({
      success: true,
      access_token: token,
      admin: { id: admin.id, email: admin.email, full_name: admin.full_name, role: admin.role },
    });
  } catch (err) { next(err); }
}

async function getMe(req, res, next) {
  try {
    const { rows: [admin] } = await query(
      'SELECT id, email, full_name, role, last_login FROM admin_users WHERE id = $1',
      [req.admin.id]
    );
    res.json({ success: true, admin });
  } catch (err) { next(err); }
}

async function changePassword(req, res, next) {
  try {
    const { current_password, new_password } = req.body;
    const { rows: [admin] } = await query(
      'SELECT password_hash FROM admin_users WHERE id = $1', [req.admin.id]
    );
    const valid = await bcrypt.compare(current_password, admin.password_hash);
    if (!valid) return res.status(400).json({ success: false, error: 'Current password incorrect' });

    const hash = await bcrypt.hash(new_password, 12);
    await query('UPDATE admin_users SET password_hash = $1 WHERE id = $2', [hash, req.admin.id]);
    res.json({ success: true, message: 'Password updated' });
  } catch (err) { next(err); }
}

module.exports = { login, getMe, changePassword };
