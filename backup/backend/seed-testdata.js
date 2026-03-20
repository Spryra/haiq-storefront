// seed-testdata.js
// Populates admin dashboard with realistic test data for all modules
// Run AFTER seed-products.js
// node seed-testdata.js

require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const CUSTOMERS = [
  { full_name: 'Amara Nakato',    email: 'amara@gmail.com',    phone: '+256701000001', loyalty_points: 1650, loyalty_tier: 'Crown' },
  { full_name: 'Brian Ssemakula', email: 'brian@gmail.com',    phone: '+256701000002', loyalty_points: 820,  loyalty_tier: 'Reserve' },
  { full_name: 'Chloe Achieng',   email: 'chloe@gmail.com',    phone: '+256701000003', loyalty_points: 600,  loyalty_tier: 'Reserve' },
  { full_name: 'David Okello',    email: 'david@gmail.com',    phone: '+256701000004', loyalty_points: 380,  loyalty_tier: 'Classic' },
  { full_name: 'Eve Namukasa',    email: 'eve@gmail.com',      phone: '+256701000005', loyalty_points: 250,  loyalty_tier: 'Classic' },
  { full_name: 'Frank Lubega',    email: 'frank@gmail.com',    phone: '+256701000006', loyalty_points: 110,  loyalty_tier: 'Classic' },
  { full_name: 'Grace Atim',      email: 'grace@gmail.com',    phone: '+256701000007', loyalty_points: 90,   loyalty_tier: 'Classic' },
  { full_name: 'Henry Kagwa',     email: 'henry@gmail.com',    phone: '+256701000008', loyalty_points: 45,   loyalty_tier: 'Classic' },
];

const ADDRESSES = [
  'Plot 12, Muyenga Hill, Kampala',
  'Kololo, Kampala Road, Kampala',
  'Ntinda, Old Kiira Road, Kampala',
  'Nakasero, Parliament Avenue, Kampala',
  'Bugolobi, Luthuli Rise, Kampala',
  'Kisaasi, Bukoto Road, Kampala',
];

const STATUS_SEQ = ['pending','confirmed','preparing','ready','out_for_delivery','delivered'];
const PAYMENT_METHODS = ['mtn_momo','airtel','bank_transfer'];

function randOf(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return d; }

let orderCounter = 1000;
function nextOrderNumber() { return `HAIQ-${++orderCounter}`; }
function nextToken() { return Math.random().toString(36).substring(2, 12).toUpperCase(); }

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // ── Get product variants ─────────────────────────────────────────────
    const { rows: variants } = await client.query(`
      SELECT pv.id AS variant_id, pv.price, p.id AS product_id, p.name, p.slug
      FROM product_variants pv JOIN products p ON p.id = pv.product_id
    `);
    if (variants.length === 0) {
      console.error('No products found. Run seed-products.js first.');
      process.exit(1);
    }

    // ── Insert test customers ────────────────────────────────────────────
    const hash = await bcrypt.hash('HAIQ2024!', 10);
    const userIds = [];
    for (const c of CUSTOMERS) {
      const { rows: [u] } = await client.query(`
        INSERT INTO users (full_name, email, phone, password_hash, loyalty_points, loyalty_tier, is_verified, created_at)
        VALUES ($1,$2,$3,$4,$5,$6,true,$7)
        ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
        RETURNING id
      `, [c.full_name, c.email, c.phone, hash, c.loyalty_points, c.loyalty_tier, daysAgo(randInt(30,180))]);
      userIds.push({ id: u.id, ...c });
    }
    console.log(`✓ ${CUSTOMERS.length} test customers`);

    // ── Insert loyalty cards for top 3 ──────────────────────────────────
    const cardStatuses = ['delivered', 'delivered', 'dispatched'];
    for (let i = 0; i < 3; i++) {
      await client.query(`
        INSERT INTO loyalty_cards (user_id, status, delivery_address, card_number, points, tier)
        VALUES ($1,$2,$3,$4,$5,$6)
        ON CONFLICT DO NOTHING
      `, [userIds[i].id, cardStatuses[i], randOf(ADDRESSES),
          `HAIQ-${String(i+1).padStart(4,'0')}`, userIds[i].loyalty_points, userIds[i].loyalty_tier]);
    }
    // 2 pending applications
    for (let i = 3; i < 5; i++) {
      await client.query(`
        INSERT INTO loyalty_cards (user_id, status, delivery_address, points, tier)
        VALUES ($1,'pending',$2,$3,$4)
        ON CONFLICT DO NOTHING
      `, [userIds[i].id, randOf(ADDRESSES), userIds[i].loyalty_points, userIds[i].loyalty_tier]);
    }
    console.log('✓ Loyalty cards seeded');

    // ── Insert newsletter subscribers ────────────────────────────────────
    const subscribers = [
      { email: 'newsletter1@gmail.com', name: 'Amara Nakato' },
      { email: 'newsletter2@gmail.com', name: 'Chloe Achieng' },
      { email: 'newsletter3@gmail.com', name: 'Irene Birungi' },
      { email: 'newsletter4@gmail.com', name: 'Joseph Mwesige' },
      { email: 'newsletter5@gmail.com', name: 'Liz Tendo' },
    ];
    for (const s of subscribers) {
      await client.query(`
        INSERT INTO newsletter_subscribers (email, name)
        VALUES ($1,$2) ON CONFLICT (email) DO NOTHING
      `, [s.email, s.name]);
    }
    console.log('✓ Newsletter subscribers seeded');

    // ── Insert 25 test orders ────────────────────────────────────────────
    let totalRevenue = 0;
    for (let i = 0; i < 25; i++) {
      const customer = randOf(userIds);
      const variant  = randOf(variants);
      const qty      = randInt(1, 4);
      const subtotal = parseFloat(variant.price) * qty;
      const delivery_fee = 5000;
      const total    = subtotal + delivery_fee;
      totalRevenue  += total;

      const daysBack  = randInt(0, 30);
      const statusIdx = daysBack === 0 ? randInt(0, 2) : randInt(3, STATUS_SEQ.length - 1);
      const status    = STATUS_SEQ[Math.min(statusIdx, STATUS_SEQ.length - 1)];
      const payMethod = randOf(PAYMENT_METHODS);
      const orderNum  = nextOrderNumber();
      const token     = nextToken();

      const { rows: [order] } = await client.query(`
        INSERT INTO orders (
          order_number, tracking_token, user_id,
          first_name, last_name, email, phone,
          delivery_address, subtotal, delivery_fee, total,
          payment_method, status, payment_status, consent_given, created_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'paid',true,$14)
        RETURNING id
      `, [
        orderNum, token, customer.id,
        customer.full_name.split(' ')[0], customer.full_name.split(' ')[1] ?? '',
        customer.email, customer.phone,
        randOf(ADDRESSES),
        subtotal, delivery_fee, total,
        payMethod, status,
        daysAgo(daysBack),
      ]);

      await client.query(`
        INSERT INTO order_items (order_id, product_id, variant_id, product_name, variant_label, unit_price, quantity, line_total)
        VALUES ($1,$2,$3,$4,'4-Pack',$5,$6,$7)
      `, [order.id, variant.product_id, variant.variant_id, variant.name, variant.price, qty, subtotal]);
    }
    console.log('✓ 25 test orders seeded');

    // ── Insert test messages ─────────────────────────────────────────────
    const messages = [
      { name: 'Amara Nakato',    email: 'amara@gmail.com',  subject: 'Custom order for event',   body: 'Hi, I want to order 20 packs of Crimson Sin for a birthday party on Saturday. Is that possible?' },
      { name: 'Brian Ssemakula', email: 'brian@gmail.com',  subject: 'Delivery question',         body: 'Do you deliver to Entebbe? I am based there and would love to order.' },
      { name: 'Grace Atim',      email: 'grace@gmail.com',  subject: 'Loved the Blackout!',       body: 'Just wanted to say the Blackout cookies are incredible. My whole office is addicted now. 10/10.' },
      { name: 'Eve Namukasa',    email: 'eve@gmail.com',    subject: 'The Unboxing as a gift',    body: 'I want to send a box to a friend in Kololo. Can you include a handwritten note?' },
    ];
    for (const m of messages) {
      await client.query(`
        INSERT INTO messages (name, email, subject, body, status, created_at)
        VALUES ($1,$2,$3,$4,'unread', NOW() - INTERVAL '${randInt(1,48)} hours')
      `, [m.name, m.email, m.subject, m.body]);
    }
    console.log('✓ 4 test messages seeded');

    // ── Insert test reviews ──────────────────────────────────────────────
    const nonBoxVariants = variants.filter(v => !['the-unboxing'].includes(v.slug));
    const reviews = [
      { name: 'Amara N.',  rating: 5, comment: 'The Crimson Sin is unreal. Soft, rich, and dangerously addictive.', slug: 'crimson-sin', status: 'approved' },
      { name: 'Brian S.',  rating: 5, comment: 'Blackout is next level. Dense, chocolatey, perfect.', slug: 'blackout', status: 'approved' },
      { name: 'Chloe A.',  rating: 5, comment: 'Campfire After Dark tastes exactly like its name. 10/10.', slug: 'campfire-after-dark', status: 'approved' },
      { name: 'David O.',  rating: 4, comment: 'Coconut cookies are crispy and sweet. Classic choice.', slug: 'coconut', status: 'approved' },
      { name: 'Grace A.',  rating: 5, comment: 'Venom is smooth and dangerous. I ordered twice in one week.', slug: 'venom', status: 'approved' },
      { name: 'Henry K.',  rating: 4, comment: 'Great packaging, great cookies. Will order again.', slug: 'venom', status: 'pending' },
      { name: 'Eve N.',    rating: 5, comment: 'The box made me feel special. Every cookie was wrapped individually.', slug: 'the-unboxing', status: 'pending' },
    ];

    for (const r of reviews) {
      const prod = variants.find(v => v.slug === r.slug);
      if (!prod) continue;
      await client.query(`
        INSERT INTO product_reviews (product_id, name, rating, comment, status, verified_purchase)
        VALUES ($1,$2,$3,$4,$5,true)
        ON CONFLICT DO NOTHING
      `, [prod.product_id, r.name, r.rating, r.comment, r.status]);
    }
    console.log('✓ 7 test reviews seeded');

    // ── Insert a special day for Valentine's ────────────────────────────
    const { rows: [admin] } = await client.query(`SELECT id FROM admin_users LIMIT 1`);
    if (admin) {
      await client.query(`
        INSERT INTO special_days (label, date_from, date_to, is_active, created_by)
        VALUES ('Valentine''s Day 2026', '2026-02-13', '2026-02-15', true, $1)
        ON CONFLICT DO NOTHING
      `, [admin.id]);
      await client.query(`
        INSERT INTO special_days (label, date_from, date_to, is_active, created_by)
        VALUES ('Easter Weekend 2026', '2026-04-03', '2026-04-06', true, $1)
        ON CONFLICT DO NOTHING
      `, [admin.id]);
      console.log('✓ Special days seeded');
    }

    await client.query('COMMIT');
    console.log('\n✅ All test data seeded successfully.');
    console.log('   Admin can now see: 25 orders, 8 customers, 4 messages, 7 reviews, 5 newsletter subs, 2 special days');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err.message);
  } finally {
    client.release();
    pool.end();
  }
}

seed();
