// seed-testdata.js  (FIXED — matches real DB schema)
// Run AFTER seed-products.js:  node seed-testdata.js
'use strict';

require('dotenv').config();
const { Pool } = require('pg');
const bcrypt   = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const pick  = arr => arr[Math.floor(Math.random() * arr.length)];
const rInt  = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const daysAgo = n => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString(); };

let _seq = 2000;
const nextOrderNum = () => `HAIQ-${++_seq}`;
const nextToken    = () => Math.random().toString(36).substring(2, 14).toUpperCase();

const ADDRESSES = [
  'Plot 12, Muyenga Hill, Kampala',
  'Kololo, Parliament Avenue, Kampala',
  'Ntinda, Old Kiira Road, Kampala',
  'Nakasero, Kampala Road, Kampala',
  'Bugolobi, Luthuli Rise, Kampala',
  'Kisaasi, Bukoto Road, Kampala',
  'Entebbe Road, Munyonyo, Kampala',
  'Kansanga, Ggaba Road, Kampala',
];

// Real order status values from DB constraint
const STATUSES_EARLY    = ['pending', 'freshly_kneaded'];
const STATUSES_MID      = ['ovenbound', 'on_the_cart', 'en_route'];
const STATUSES_COMPLETE = ['delivered'];
const PAY_METHODS       = ['mtn_momo', 'airtel', 'bank_transfer'];

const CUSTOMERS = [
  { first_name:'Amara',  last_name:'Nakato',    email:'amara@example.com',  phone:'+256701000001', points:1720, tier:'Crown'   },
  { first_name:'Brian',  last_name:'Ssemakula', email:'brian@example.com',  phone:'+256701000002', points:870,  tier:'Reserve' },
  { first_name:'Chloe',  last_name:'Achieng',   email:'chloe@example.com',  phone:'+256701000003', points:620,  tier:'Reserve' },
  { first_name:'David',  last_name:'Okello',    email:'david@example.com',  phone:'+256701000004', points:310,  tier:'Classic' },
  { first_name:'Eve',    last_name:'Namukasa',  email:'eve@example.com',    phone:'+256701000005', points:190,  tier:'Classic' },
  { first_name:'Frank',  last_name:'Lubega',    email:'frank@example.com',  phone:'+256701000006', points:95,   tier:'Classic' },
  { first_name:'Grace',  last_name:'Atim',      email:'grace@example.com',  phone:'+256701000007', points:60,   tier:'Classic' },
  { first_name:'Henry',  last_name:'Kagwa',     email:'henry@example.com',  phone:'+256701000008', points:20,   tier:'Classic' },
];

const REVIEW_DATA = [
  { slug:'venom',               name:'Amara N.',  rating:5, comment:'The Venom is dangerously smooth. Ordered twice in one week.',                          status:'approved' },
  { slug:'blackout',            name:'Brian S.',  rating:5, comment:'Blackout is next level. Dense, chocolatey. Nothing else matters.',                     status:'approved' },
  { slug:'campfire-after-dark', name:'Chloe A.',  rating:5, comment:'Campfire After Dark tastes exactly like its name. Late nights and marshmallow.',       status:'approved' },
  { slug:'coconut',             name:'David O.',  rating:4, comment:'Perfectly crispy and tropical. Classic but satisfying.',                               status:'approved' },
  { slug:'crimson-sin',         name:'Eve N.',    rating:5, comment:'Smooth, rich and slightly dangerous. Exactly what the description says.',              status:'approved' },
  { slug:'venom',               name:'Grace A.',  rating:4, comment:'Great packaging, great cookies. The Venom will have you addicted.',                    status:'pending'  },
  { slug:'the-unboxing',        name:'Henry K.',  rating:5, comment:'The box made the whole experience. Every cookie was individually wrapped. 10/10.',     status:'pending'  },
];

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // ── Customers ─────────────────────────────────────────────────────────
    const pwHash = await bcrypt.hash('TestPass1!', 10);
    const userRows = [];

    for (const c of CUSTOMERS) {
      // full_name added by migration 005; first_name/last_name are original columns
      const { rows: [u] } = await client.query(`
        INSERT INTO users (
          first_name, last_name, email, phone, password_hash,
          full_name, loyalty_points, loyalty_tier,
          email_verified, consent_given, created_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true,true,$9)
        ON CONFLICT (email) DO UPDATE SET
          first_name     = EXCLUDED.first_name,
          last_name      = EXCLUDED.last_name,
          full_name      = EXCLUDED.full_name,
          loyalty_points = EXCLUDED.loyalty_points,
          loyalty_tier   = EXCLUDED.loyalty_tier
        RETURNING id, first_name, last_name, email, loyalty_points, loyalty_tier
      `, [
        c.first_name, c.last_name, c.email, c.phone, pwHash,
        `${c.first_name} ${c.last_name}`,
        c.points, c.tier,
        daysAgo(rInt(60, 180)),
      ]);
      userRows.push(u);
    }
    console.log(`✓  ${userRows.length} test customers`);

    // ── Loyalty cards ──────────────────────────────────────────────────────
    const loyaltySetups = [
      { userIdx:0, status:'delivered',  cardNumber:'HAIQ-0001' },
      { userIdx:1, status:'dispatched', cardNumber:'HAIQ-0002' },
      { userIdx:2, status:'pending',    cardNumber:null        },
    ];
    for (const ls of loyaltySetups) {
      const u = userRows[ls.userIdx];
      await client.query(`
        INSERT INTO loyalty_cards
          (user_id, status, delivery_address, card_number, points, tier, applied_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7)
        ON CONFLICT DO NOTHING
      `, [
        u.id, ls.status, pick(ADDRESSES), ls.cardNumber,
        u.loyalty_points, u.loyalty_tier, daysAgo(rInt(5, 30)),
      ]);
    }
    console.log('✓  3 loyalty card records');

    // ── Get product variants ───────────────────────────────────────────────
    const { rows: variants } = await client.query(`
      SELECT pv.id AS variant_id, pv.price, p.id AS product_id, p.name, p.slug
      FROM   product_variants pv
      JOIN   products p ON p.id = pv.product_id
      WHERE  p.is_box_item = false
    `);
    if (variants.length === 0) {
      throw new Error('No product variants found — run seed-products.js first');
    }

    // ── 25 Orders ─────────────────────────────────────────────────────────
    const createdOrders = [];
    for (let i = 0; i < 25; i++) {
      const user     = pick(userRows);
      const variant  = pick(variants);
      const qty      = rInt(1, 4);
      const subtotal = parseFloat(variant.price) * qty;
      const dFee     = 5000;
      const total    = subtotal + dFee;
      const daysBack = rInt(0, 30);

      // Pick a realistic status based on how old the order is
      let status;
      if (daysBack === 0)      status = pick(STATUSES_EARLY);
      else if (daysBack <= 2)  status = pick(STATUSES_MID);
      else                     status = pick(STATUSES_COMPLETE);

      const payStatus = status === 'delivered' ? 'paid' : pick(['paid', 'pending']);
      const orderNum  = nextOrderNum();
      const token     = nextToken();

      const { rows: [order] } = await client.query(`
        INSERT INTO orders (
          order_number, tracking_token, user_id,
          first_name, last_name, email, phone,
          delivery_address, subtotal, delivery_fee, total,
          payment_method, payment_status, status,
          consent_given, created_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,true,$15)
        RETURNING id
      `, [
        orderNum, token, user.id,
        user.first_name, user.last_name, user.email,
        user.phone || '+256700000000',
        pick(ADDRESSES),
        subtotal, dFee, total,
        pick(PAY_METHODS), payStatus, status,
        daysAgo(daysBack),
      ]);

      await client.query(`
        INSERT INTO order_items
          (order_id, product_id, variant_id, product_name, variant_label,
           unit_price, quantity, line_total)
        VALUES ($1,$2,$3,$4,'4-Pack',$5,$6,$7)
      `, [
        order.id, variant.product_id, variant.variant_id,
        variant.name, variant.price, qty, subtotal,
      ]);

      createdOrders.push(order);
    }
    console.log('✓  25 test orders');

    // ── Order messages (4 realistic customer messages on orders) ─────────
    // messages table: sender_type IN ('customer','admin','system'), body, is_read
    for (let i = 0; i < 4 && i < createdOrders.length; i++) {
      const order = createdOrders[i];
      const user  = userRows[i];
      const bodies = [
        'Hi, can I change my delivery address to Kololo please?',
        'Is my order still on track for today? I need it before 3pm.',
        'Just wanted to say the Blackout cookies were absolutely incredible. Thank you!',
        'Can I add a gift note to the box? It is for a birthday.',
      ];
      await client.query(`
        INSERT INTO messages (order_id, sender_type, sender_id, body, is_read, created_at)
        VALUES ($1, 'customer', $2, $3, false, $4)
      `, [order.id, user.id, bodies[i], daysAgo(rInt(0, 5))]);
    }
    console.log('✓  4 order messages');

    // ── Newsletter subscribers ─────────────────────────────────────────────
    // Use only columns that exist (email + subscribed + created_at from 001;
    // name + subscribed_at + is_active added by 005b)
    const subs = [
      { email:'sub1@example.com', name:'Amara Nakato'   },
      { email:'sub2@example.com', name:'Chloe Achieng'  },
      { email:'sub3@example.com', name:'Irene Birungi'  },
      { email:'sub4@example.com', name:'Joseph Mwesige' },
      { email:'sub5@example.com', name:'Liz Tendo'      },
    ];
    for (const s of subs) {
      // Use INSERT with only base columns — 005b columns will be NULL/default
      await client.query(`
        INSERT INTO newsletter_subscribers (email, name, subscribed_at, is_active)
        VALUES ($1, $2, $3, true)
        ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      `, [s.email, s.name, daysAgo(rInt(1, 60))]);
    }
    console.log('✓  5 newsletter subscribers');

    // ── Product reviews ────────────────────────────────────────────────────
    for (const r of REVIEW_DATA) {
      const { rows: [prod] } = await client.query(
        'SELECT id FROM products WHERE slug = $1', [r.slug]
      );
      if (!prod) { console.warn(`  ! Product not found: ${r.slug}`); continue; }
      await client.query(`
        INSERT INTO product_reviews
          (product_id, name, rating, comment, status, verified_purchase, created_at)
        VALUES ($1,$2,$3,$4,$5,true,$6)
        ON CONFLICT DO NOTHING
      `, [prod.id, r.name, r.rating, r.comment, r.status, daysAgo(rInt(1, 20))]);
    }
    console.log('✓  7 product reviews (5 approved, 2 pending)');

    // ── Special days ───────────────────────────────────────────────────────
    const { rows: admins } = await client.query('SELECT id FROM admin_users LIMIT 1');
    const adminId = admins[0]?.id ?? null;

    const specialDays = [
      { label:"Valentine's Day 2026", from:'2026-02-13', to:'2026-02-15' },
      { label:'Easter Weekend 2026',  from:'2026-04-03', to:'2026-04-06' },
    ];
    for (const sd of specialDays) {
      await client.query(`
        INSERT INTO special_days (label, date_from, date_to, is_active, created_by)
        VALUES ($1,$2,$3,true,$4)
        ON CONFLICT DO NOTHING
      `, [sd.label, sd.from, sd.to, adminId]);
    }
    console.log("✓  2 special days (Valentine's Day, Easter)");

    await client.query('COMMIT');
    console.log('\n✅  All test data seeded successfully.');
    console.log('    Admin dashboard is now fully populated.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n✗  Seed failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    pool.end();
  }
}

run();
