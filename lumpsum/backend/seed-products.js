// seed-products.js
// Run: node seed-products.js
// Place in backend/ folder

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const PRODUCTS = [
  {
    name: 'Venom',
    slug: 'venom',
    subtitle: 'Chocolate Cookies',
    description: 'Rich, and irresistibly smooth — a deep cocoa flavour for true chocolate lovers, with a fine centre and slightly curvy crunchy edge.',
    tasting_notes: 'Deep cocoa · Smooth centre · Crunchy edge',
    base_price: 5000,
    is_featured: true,
    is_limited: false,
    is_box_item: false,
    off_peak_price: null,
    image_hint: 'venom',
    items: ['Dark cocoa dough', 'Chocolate chips', 'Sea salt'],
    variant: { label: '4-Pack', price: 5000, stock_qty: 50 },
  },
  {
    name: 'Coconut',
    slug: 'coconut',
    subtitle: 'Coconut Cookies',
    description: 'Delicately crisp on the outside and inside, these golden coconut cookies are tropical, buttery, and perfectly sweet. A choice you won\'t regret.',
    tasting_notes: 'Tropical coconut · Golden crisp · Buttery sweet',
    base_price: 5000,
    is_featured: true,
    is_limited: false,
    is_box_item: false,
    off_peak_price: null,
    image_hint: 'coconut',
    items: ['Desiccated coconut', 'Buttery dough', 'Brown sugar'],
    variant: { label: '4-Pack', price: 5000, stock_qty: 50 },
  },
  {
    name: 'Crimson Sin',
    slug: 'crimson-sin',
    subtitle: 'Red Velvet',
    description: 'Deep red, soft-baked velvet with a quiet cocoa bitterness, broken open by pools of melting white chocolate. Smooth, rich, and slightly dangerous. This is indulgence you lean into — slow bites, closed eyes, no explanations. A cookie for when restraint is no longer the goal.',
    tasting_notes: 'Red velvet · White chocolate pools · Quiet cocoa bitterness',
    base_price: 5000,
    is_featured: true,
    is_limited: false,
    is_box_item: false,
    off_peak_price: null,
    image_hint: 'crimson_sin',
    items: ['Red velvet dough', 'Cocoa', 'White chocolate'],
    variant: { label: '4-Pack', price: 5000, stock_qty: 45 },
  },
  {
    name: 'Campfire After Dark',
    slug: 'campfire-after-dark',
    subtitle: "S'mores",
    description: "Golden dough wrapped around molten chocolate and soft toasted marshmallow that stretches and sticks. Sweet, smoky and intimate. It tastes like late nights, low voices, and staying longer than you planned. Messy, nostalgic, and completely intentional.",
    tasting_notes: 'Toasted marshmallow · Milk chocolate · Buttery dough',
    base_price: 5000,
    is_featured: true,
    is_limited: false,
    is_box_item: false,
    off_peak_price: null,
    image_hint: 'campfire',
    items: ['Toasted marshmallow', 'Milk chocolate', 'Buttery dough'],
    variant: { label: '4-Pack', price: 5000, stock_qty: 40 },
  },
  {
    name: 'Blackout',
    slug: 'blackout',
    subtitle: 'Double Chocolate',
    description: 'Dense, fudgy cocoa dough packed with layers of chocolate that melt into one heavy, indulgent bite. Dark, intense, and consuming. This isn\'t a casual cookie — it\'s a full stop. Everything else fades, and you let it.',
    tasting_notes: 'Dark cocoa dough · Chocolate chunks · Chocolate chips',
    base_price: 5000,
    is_featured: false,
    is_limited: true,
    is_box_item: false,
    off_peak_price: null,
    image_hint: 'blackout',
    items: ['Dark cocoa dough', 'Chocolate chunks', 'Chocolate chips'],
    variant: { label: '4-Pack', price: 5000, stock_qty: 35 },
  },
  {
    name: 'The Unboxing',
    slug: 'the-unboxing',
    subtitle: 'Signature Gift Box',
    description: 'A smooth black box that makes you blush arrives at your door. This isn\'t just a delivery — it\'s a statement. Go on, embrace the moment and open the box to unveil your individually wrapped masterpieces.',
    tasting_notes: 'Choose your 4 cookies · Individually wrapped · Statement packaging',
    base_price: 40000,
    is_featured: true,
    is_limited: false,
    is_box_item: true,          // special day pricing applies
    off_peak_price: 80000,     // UGX 80,000 on non-special days
    image_hint: 'unboxing',
    items: ['4 individually wrapped cookies', 'Signature black box', 'Custom gift note'],
    variant: { label: 'Box of 4', price: 40000, stock_qty: 20 },
  },
];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get or create default category
    const { rows: cats } = await client.query(
      `INSERT INTO categories (name, slug) VALUES ('Cookies', 'cookies')
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`
    );
    const categoryId = cats[0].id;

    for (const p of PRODUCTS) {
      // Upsert product
      const { rows: [product] } = await client.query(`
        INSERT INTO products (
          name, slug, subtitle, description, tasting_notes,
          base_price, is_featured, is_limited, is_active,
          is_box_item, off_peak_price, category_id
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true,$9,$10,$11)
        ON CONFLICT (slug) DO UPDATE SET
          name          = EXCLUDED.name,
          subtitle      = EXCLUDED.subtitle,
          description   = EXCLUDED.description,
          tasting_notes = EXCLUDED.tasting_notes,
          base_price    = EXCLUDED.base_price,
          is_featured   = EXCLUDED.is_featured,
          is_limited    = EXCLUDED.is_limited,
          is_box_item   = EXCLUDED.is_box_item,
          off_peak_price = EXCLUDED.off_peak_price
        RETURNING id
      `, [
        p.name, p.slug, p.subtitle, p.description, p.tasting_notes,
        p.base_price, p.is_featured, p.is_limited,
        p.is_box_item, p.off_peak_price, categoryId,
      ]);

      const productId = product.id;

      // Delete old variants + items, re-insert clean
      await client.query('DELETE FROM product_variants WHERE product_id = $1', [productId]);
      await client.query('DELETE FROM product_items   WHERE product_id = $1', [productId]);

      // Insert variant
      await client.query(`
        INSERT INTO product_variants (product_id, label, price, stock_qty, is_default)
        VALUES ($1, $2, $3, $4, true)
      `, [productId, p.variant.label, p.variant.price, p.variant.stock_qty]);

      // Insert items
      for (let i = 0; i < p.items.length; i++) {
        await client.query(`
          INSERT INTO product_items (product_id, label, position)
          VALUES ($1, $2, $3)
        `, [productId, p.items[i], i]);
      }

      // Insert image reference (uses local path, will be replaced with Cloudinary in prod)
      await client.query(`
        INSERT INTO product_images (product_id, url, position)
        VALUES ($1, $2, 0)
        ON CONFLICT DO NOTHING
      `, [productId, `/images/products/${p.image_hint}.jpg`]);

      console.log(`✓ ${p.name} (${p.slug})`);
    }

    await client.query('COMMIT');
    console.log('\n✅ All 6 HAIQ products seeded.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err);
  } finally {
    client.release();
    pool.end();
  }
}

seed();
