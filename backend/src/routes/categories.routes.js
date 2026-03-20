const router = require('express').Router();
const { query } = require('../config/db');

/**
 * @swagger
 * /categories:
 *   get:
 *     tags: [Products]
 *     summary: List all product categories
 *     responses:
 *       200:
 *         description: Category list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: integer }
 *                       name: { type: string }
 *                       slug: { type: string }
 *                       description: { type: string }
 */
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT id, name, slug, description FROM categories ORDER BY sort_order ASC'
    );
    res.json({ success: true, categories: rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
