// fix-schema.js — run with: node fix-schema.js
const { query, pool } = require('./src/config/db');

const steps = [
  // Products columns
  "ALTER TABLE products ADD COLUMN IF NOT EXISTS is_box_item BOOLEAN DEFAULT false",
  "ALTER TABLE products ADD COLUMN IF NOT EXISTS off_peak_price INTEGER",

  // Users columns
  "ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(200)",
  "ALTER TABLE users ADD COLUMN IF NOT EXISTS loyalty_points INTEGER DEFAULT 0",
  "ALTER TABLE users ADD COLUMN IF NOT EXISTS loyalty_tier VARCHAR(20) DEFAULT 'classic'",

  // Special days
  `CREATE TABLE IF NOT EXISTS special_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL UNIQUE,
    label VARCHAR(200),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  // Loyalty cards
  `CREATE TABLE IF NOT EXISTS loyalty_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(30) DEFAULT 'pending',
    card_number VARCHAR(50),
    delivery_address TEXT,
    contact_phone VARCHAR(30),
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    dispatched_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  // Newsletter subscribers
  `CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(320) UNIQUE NOT NULL,
    name VARCHAR(200),
    is_active BOOLEAN DEFAULT true,
    subscribed BOOLEAN DEFAULT true,
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  // Messages additions (006)
  "ALTER TABLE messages ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL",
  "ALTER TABLE messages ADD COLUMN IF NOT EXISTS subject VARCHAR(200)",
  "ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_direct BOOLEAN DEFAULT false",

  // Orders additions (006)
  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancellation_reason TEXT",
  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_by VARCHAR(20)",

  // Newsletter campaigns
  `CREATE TABLE IF NOT EXISTS newsletter_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject VARCHAR(300) NOT NULL,
    body_html TEXT NOT NULL,
    sent_at TIMESTAMPTZ,
    sent_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    recipient_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
];

(async () => {
  for (const sql of steps) {
    try {
      await query(sql);
      console.log('OK :', sql.slice(0, 70).replace(/\n/g, ' '));
    } catch (e) {
      console.log('SKIP:', e.message.split('\n')[0]);
    }
  }
  await pool.end();
  console.log('\nDone. Run: node seed-products.js');
})();
