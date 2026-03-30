// fix-db.js – run with node fix-db.js
const { query, pool } = require('./src/config/db');

const sqls = [
  // order_events columns
  `ALTER TABLE order_events ADD COLUMN IF NOT EXISTS actor_type VARCHAR(50)`,
  `ALTER TABLE order_events ADD COLUMN IF NOT EXISTS actor_id UUID`,
  `ALTER TABLE order_events ADD COLUMN IF NOT EXISTS note TEXT`,

  // orders columns
  `ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancellation_reason TEXT`,
  `ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_by VARCHAR(20)`,

  // Ensure box product is correct
  `UPDATE products SET is_box_item = true, off_peak_price = 80000, base_price = 40000 WHERE slug = 'box-office'`,

  // Ensure special_days has date_from and date_to (in case they were missed)
  `ALTER TABLE special_days ADD COLUMN IF NOT EXISTS date_from DATE`,
  `ALTER TABLE special_days ADD COLUMN IF NOT EXISTS date_to DATE`,
];

(async () => {
  for (const sql of sqls) {
    try {
      await query(sql);
      console.log('OK:', sql.slice(0, 60));
    } catch (err) {
      console.log('SKIP:', err.message);
    }
  }
  await pool.end();
  console.log('Database fixes completed.');
})();