const router = require('express').Router();
const { validate } = require('../../middleware/validate');
const { authLimiter } = require('../../middleware/rateLimiter');
const { requireStaff } = require('../../middleware/adminAuth');
const adminAuthCtrl = require('../../controllers/admin/admin.auth.controller');
const { adminLoginSchema } = require('../../middleware/schemas');

/**
 * @swagger
 * /admin/auth/login:
 *   post:
 *     tags: [Admin Auth]
 *     summary: Admin login
 *     description: Returns a short-lived admin JWT (8h, no refresh)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Admin login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 access_token: { type: string }
 *                 admin:
 *                   type: object
 *                   properties:
 *                     id: { type: string }
 *                     email: { type: string }
 *                     full_name: { type: string }
 *                     role: { type: string, enum: [staff, superadmin] }
 *       401:
 *         description: Invalid credentials or inactive account
 */
router.post('/login', authLimiter, validate(adminLoginSchema), adminAuthCtrl.login);

/**
 * @swagger
 * /admin/auth/me:
 *   get:
 *     tags: [Admin Auth]
 *     summary: Get current admin profile
 *     security:
 *       - AdminAuth: []
 *     responses:
 *       200:
 *         description: Admin profile
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/me', requireStaff, adminAuthCtrl.getMe);

/**
 * @swagger
 * /admin/auth/change-password:
 *   post:
 *     tags: [Admin Auth]
 *     summary: Change admin password
 *     security:
 *       - AdminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [current_password, new_password]
 *             properties:
 *               current_password: { type: string }
 *               new_password: { type: string, minLength: 8 }
 *     responses:
 *       200:
 *         description: Password changed
 */
router.post('/change-password', requireStaff, adminAuthCtrl.changePassword);

module.exports = router;
