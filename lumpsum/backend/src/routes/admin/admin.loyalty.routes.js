// routes/admin/admin.loyalty.routes.js
const router = require('express').Router();
const { query } = require('../../config/db');
const { requireStaff } = require('../../middleware/adminAuth');
const emailService = require('../../services/email.service');

/**
 * GET /admin/loyalty — list all card applications
 */
router.get('/', requireStaff, async (req, res, next) => {
  try {
    const { status } = req.query;
    const params = [];
    let where = '';
    if (status) { params.push(status); where = `WHERE lc.status = $1`; }

    const { rows } = await query(`
      SELECT
        lc.id, lc.status, lc.card_number, lc.points, lc.tier,
        lc.delivery_address, lc.applied_at, lc.dispatched_at, lc.delivered_at,
        u.id AS user_id, u.full_name, u.email, u.phone, u.loyalty_points, u.loyalty_tier
      FROM loyalty_cards lc
      JOIN users u ON u.id = lc.user_id
      ${where}
      ORDER BY lc.applied_at DESC
    `, params);

    res.json({ cards: rows });
  } catch (err) { next(err); }
});

/**
 * PATCH /admin/loyalty/:id — approve / reject / dispatch / deliver
 */
router.patch('/:id', requireStaff, async (req, res, next) => {
  try {
    const { action, notes, card_number } = req.body;
    const validActions = ['approve', 'reject', 'dispatch', 'deliver'];
    if (!validActions.includes(action)) {
      return res.status(400).json({ error: `action must be one of: ${validActions.join(', ')}` });
    }

    // Get card + user info
    const { rows: [card] } = await query(
      `SELECT lc.*, u.email, u.full_name FROM loyalty_cards lc
       JOIN users u ON u.id = lc.user_id WHERE lc.id = $1`,
      [req.params.id]
    );
    if (!card) return res.status(404).json({ error: 'Card not found' });

    let updateSql, params;

    if (action === 'approve') {
      const num = card_number || `HAIQ-${Date.now().toString(36).toUpperCase()}`;
      updateSql = `UPDATE loyalty_cards SET status='approved', card_number=$1, reviewed_at=NOW(), reviewed_by=$2, notes=$3 WHERE id=$4 RETURNING *`;
      params    = [num, req.admin.id, notes || null, req.params.id];

      // Update user tier
      await query(`UPDATE users SET loyalty_status='approved' WHERE id=$1`, [card.user_id]);

      // Email customer
      await emailService.sendLoyaltyApproved({ email: card.email, name: card.full_name, card_number: num });

    } else if (action === 'reject') {
      updateSql = `UPDATE loyalty_cards SET status='rejected', reviewed_at=NOW(), reviewed_by=$1, notes=$2 WHERE id=$3 RETURNING *`;
      params    = [req.admin.id, notes || null, req.params.id];

      await emailService.sendLoyaltyRejected({ email: card.email, name: card.full_name });

    } else if (action === 'dispatch') {
      updateSql = `UPDATE loyalty_cards SET status='dispatched', dispatched_at=NOW() WHERE id=$1 RETURNING *`;
      params    = [req.params.id];

      await emailService.sendLoyaltyDispatched({ email: card.email, name: card.full_name, delivery_address: card.delivery_address });

    } else if (action === 'deliver') {
      updateSql = `UPDATE loyalty_cards SET status='delivered', delivered_at=NOW() WHERE id=$1 RETURNING *`;
      params    = [req.params.id];
    }

    const { rows: [updated] } = await query(updateSql, params);
    res.json({ card: updated });
  } catch (err) { next(err); }
});

/**
 * POST /admin/loyalty/manual-upgrade — manually set a user's tier + points
 */
router.post('/manual-upgrade', requireStaff, async (req, res, next) => {
  try {
    const { user_id, tier, points } = req.body;
    await query(
      `UPDATE users SET loyalty_tier=$1, loyalty_points=COALESCE($2, loyalty_points) WHERE id=$3`,
      [tier, points ?? null, user_id]
    );
    await query(
      `UPDATE loyalty_cards SET tier=$1 WHERE user_id=$2 AND status IN ('approved','dispatched','delivered')`,
      [tier, user_id]
    );
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
