// backend/src/routes/auth.routes.js
const router = require('express').Router()
const ctrl   = require('../controllers/auth.controller')
const { requireAuth } = require('../middleware/auth')
const { validate } = require('../middleware/validate')
const { authLimiter } = require('../middleware/rateLimiter')
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  changePasswordSchema,
} = require('../middleware/schemas')
const { query } = require('../config/db')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const emailService = require('../services/email.service')
const { logger } = require('../config/logger')

// Existing routes
router.post('/register', authLimiter, validate(registerSchema), ctrl.register);
router.post('/login', authLimiter, validate(loginSchema), ctrl.login);
router.post('/logout', ctrl.logout);

// ✅ SINGLE SOURCE OF TRUTH
router.post('/refresh', ctrl.refresh);
router.get('/refresh', ctrl.refresh);

router.get('/me', requireAuth, ctrl.getMe);
router.put('/profile', requireAuth, validate(updateProfileSchema), ctrl.updateProfile);
router.put('/password', requireAuth, validate(changePasswordSchema), ctrl.changePassword);

// ── Forgot password ───────────────────────────────────────────────────────────
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), async (req, res, next) => {
  try {
    const { email } = req.body

    const { rows: [user] } = await query(
      'SELECT id, email, first_name FROM users WHERE email = $1 AND is_guest = false',
      [email.trim().toLowerCase()]
    )

    // Always respond success to avoid email enumeration
    if (!user) return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' })

    // Generate token — 1 hour expiry
    const token    = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    await query(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id) DO UPDATE SET token = $2, expires_at = $3, used = false`,
      [user.id, token, expiresAt]
    )

    await emailService.sendPasswordReset(user.email, token)

    res.json({ success: true, message: 'If that email exists, a reset link has been sent.' })
  } catch (err) { next(err) }
})

// ── Reset password ────────────────────────────────────────────────────────────
router.post('/reset-password', validate(resetPasswordSchema), async (req, res, next) => {
  try {
    const { token, new_password } = req.body

    const { rows: [record] } = await query(
      `SELECT user_id, expires_at, used FROM password_reset_tokens
       WHERE token = $1`,
      [token]
    )

    if (!record)         return res.status(400).json({ success: false, error: 'Invalid or expired reset link.' })
    if (record.used)     return res.status(400).json({ success: false, error: 'This link has already been used.' })
    if (new Date() > record.expires_at)
                         return res.status(400).json({ success: false, error: 'This link has expired. Request a new one.' })

    const hash = await bcrypt.hash(new_password, 12)

    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, record.user_id])
    await query('UPDATE password_reset_tokens SET used = true WHERE token = $1', [token])

    res.json({ success: true, message: 'Password updated successfully.' })
  } catch (err) { next(err) }
})

module.exports = router
