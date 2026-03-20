const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const { logger } = require('../config/logger');
const { generateGuestToken, generateResetToken } = require('../utils/tokenGenerator');
const emailService = require('../services/email.service');

function signAccessToken(userId, email) {
  const jti = require('crypto').randomUUID();
  return jwt.sign(
    { sub: userId, email, jti },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
}

function signRefreshToken(userId) {
  return jwt.sign(
    { sub: userId },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
  );
}

async function register(req, res, next) {
  try {
    const { email, password, first_name, last_name, phone } = req.body;

    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rowCount > 0) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists' });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const { rows: [user] } = await query(
      `INSERT INTO users (email, phone, first_name, last_name, password_hash, is_guest, consent_given)
       VALUES ($1, $2, $3, $4, $5, false, true)
       RETURNING id, email, first_name, last_name`,
      [email.toLowerCase(), phone || null, first_name, last_name, password_hash]
    );

    // Send verification email (non-blocking)
    emailService.sendWelcome(user).catch(err => logger.error('Welcome email failed', { error: err.message }));

    res.status(201).json({
      success: true,
      message: 'Account created. Welcome to HAIQ! 🍞',
      user: { id: user.id, email: user.email },
    });
  } catch (err) { next(err); }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const { rows: [user] } = await query(
      'SELECT id, email, first_name, last_name, password_hash, is_guest FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (!user || !user.password_hash) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const access_token  = signAccessToken(user.id, user.email);
    const refresh_token = signRefreshToken(user.id);

    // Set refresh token as HttpOnly cookie
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:   7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      access_token,
      user: {
        id: user.id, email: user.email,
        first_name: user.first_name, last_name: user.last_name,
      },
    });
  } catch (err) { next(err); }
}

async function logout(req, res, next) {
  try {
    const payload = jwt.decode(req.headers.authorization?.slice(7));
    if (payload?.jti) {
      await query(
        'INSERT INTO revoked_tokens (jti, expires_at) VALUES ($1, to_timestamp($2)) ON CONFLICT DO NOTHING',
        [payload.jti, payload.exp]
      );
    }
    res.clearCookie('refresh_token');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) { next(err); }
}

async function refresh(req, res, next) {
  try {
    const token = req.cookies?.refresh_token;
    if (!token) return res.status(401).json({ success: false, error: 'No refresh token' });

    const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const { rows: [user] } = await query(
      'SELECT id, email FROM users WHERE id = $1', [payload.sub]
    );
    if (!user) return res.status(401).json({ success: false, error: 'User not found' });

    const access_token = signAccessToken(user.id, user.email);
    res.json({ success: true, access_token });
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Refresh token invalid or expired' });
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const { rows: [user] } = await query(
      'SELECT id FROM users WHERE email = $1', [email.toLowerCase()]
    );

    // Always return 200 to prevent email enumeration
    if (user) {
      const token = generateResetToken();
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await query(
        `UPDATE users SET guest_token = $1, updated_at = NOW() WHERE id = $2`,
        [token, user.id] // reuse guest_token field for reset token
      );
      emailService.sendPasswordReset(email, token).catch(err =>
        logger.error('Reset email failed', { error: err.message })
      );
    }

    res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  } catch (err) { next(err); }
}

async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;
    const { rows: [user] } = await query(
      'SELECT id FROM users WHERE guest_token = $1', [token]
    );
    if (!user) return res.status(400).json({ success: false, error: 'Invalid or expired reset token' });

    const password_hash = await bcrypt.hash(password, 12);
    await query(
      'UPDATE users SET password_hash = $1, guest_token = NULL, updated_at = NOW() WHERE id = $2',
      [password_hash, user.id]
    );
    res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
  } catch (err) { next(err); }
}

async function getMe(req, res, next) {
  try {
    const { rows: [user] } = await query(
      'SELECT id, email, first_name, last_name, phone, email_verified, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, user });
  } catch (err) { next(err); }
}

module.exports = { register, login, logout, refresh, forgotPassword, resetPassword, getMe };
