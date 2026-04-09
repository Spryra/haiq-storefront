// seed-products.js  (FIXED — matches real DB schema)
// Run: node seed-products.js
'use strict';

require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const PRODUCTS = [
  {
    name: 'Venom', slug: 'venom', subtitle: 'Chocolate Cookies',
    description: 'Rich, and irresistibly smooth — a deep cocoa flavour for true chocolate lovers, with a fine centre and slightly curvy crunchy edge.',
    tasting_notes: 'Deep cocoa · Fine smooth centre · Curvy crunchy edge',
    base_price: 5000, is_featured: true, is_limited: false,
    is_box_item: false, off_peak_price: null,
    image_url: '/images/products/venom.jpg',
    items: ['Dark cocoa dough', 'Chocolate chips', 'Fine cocoa centre'],
    variant_label: '4-Pack', stock_qty: 50,
  },
  {
    name: 'Coconut', slug: 'coconut', subtitle: 'Coconut Cookies',
    description: "Delicately crisp on the outside and inside, these golden coconut cookies are tropical, buttery, and perfectly sweet. A choice you won't regret.",
    tasting_notes: 'Tropical coconut · Golden crisp · Buttery sweet',
    base_price: 5000, is_featured: true, is_limited: false,
    is_box_item: false, off_peak_price: null,
    image_url: '/images/products/coconut.jpg',
    items: ['Desiccated coconut', 'Buttery dough', 'Brown sugar'],
    variant_label: '4-Pack', stock_qty: 50,
  },
  {
    name: 'Crimson Sin', slug: 'crimson-sin', subtitle: 'Red Velvet',
    description: 'Deep red, soft-baked velvet with a quiet cocoa bitterness, broken open by pools of melting white chocolate. Smooth, rich, and slightly dangerous. This is indulgence you lean into — slow bites, closed eyes, no explanations. A cookie for when restraint is no longer the goal.',
    tasting_notes: 'Red velvet dough · Quiet cocoa bitterness · Melting white chocolate',
    base_price: 5000, is_featured: true, is_limited: false,
    is_box_item: false, off_peak_price: null,
    image_url: '/images/products/crimson_sin.jpg',
    items: ['Red velvet dough', 'Cocoa', 'White chocolate'],
    variant_label: '4-Pack', stock_qty: 45,
  },
  {
    name: 'Campfire After Dark', slug: 'campfire-after-dark', subtitle: "S'mores",
    description: "Golden dough wrapped around molten chocolate and soft toasted marshmallow that stretches and sticks. Sweet, smoky and intimate. It tastes like late nights, low voices, and staying longer than you planned. Messy, nostalgic, and completely intentional.",
    tasting_notes: 'Toasted marshmallow · Molten milk chocolate · Golden buttery dough',
    base_price: 5000, is_featured: true, is_limited: false,
    is_box_item: false, off_peak_price: null,
    image_url: '/images/products/campfire.jpg',
    items: ['Toasted marshmallow', 'Milk chocolate', 'Buttery dough'],
    variant_label: '4-Pack', stock_qty: 40,
  },
  {
    name: 'Blackout', slug: 'blackout', subtitle: 'Double Chocolate',
    description: "Dense, fudgy cocoa dough packed with layers of chocolate that melt into one heavy, indulgent bite. Dark, intense, and consuming. This isn't a casual cookie — it's a full stop. Everything else fades, and you let it.",
    tasting_notes: 'Dark cocoa dough · Chocolate chunks · Chocolate chips',
    base_price: 5000, is_featured: false, is_limited: true,
    is_box_item: false, off_peak_price: null,
    image_url: '/images/products/blackout.jpg',
    items: ['Dark cocoa dough', 'Chocolate chunks', 'Chocolate chips'],
    variant_label: '4-Pack', stock_qty: 35,
  },

];

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Upsert Cookies category
    const { rows: [cat] } = await client.query(`
      INSERT INTO categories (name, slug, description, sort_order)
      VALUES ('Cookies', 'cookies', 'Handcrafted cookies baked fresh daily', 1)
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `);
    const categoryId = cat.id;
    console.log(`Category: cookies (${categoryId})`);

    for (let idx = 0; idx < PRODUCTS.length; idx++) {
      const p = PRODUCTS[idx];

      // Upsert product
      const { rows: [product] } = await client.query(`
        INSERT INTO products (
          name, slug, subtitle, description, tasting_notes,
          base_price, is_featured, is_limited, is_active,
          is_box_item, off_peak_price, category_id
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true,$9,$10,$11)
        ON CONFLICT (slug) DO UPDATE SET
          name           = EXCLUDED.name,
          subtitle       = EXCLUDED.subtitle,
          description    = EXCLUDED.description,
          tasting_notes  = EXCLUDED.tasting_notes,
          base_price     = EXCLUDED.base_price,
          is_featured    = EXCLUDED.is_featured,
          is_limited     = EXCLUDED.is_limited,
          is_active      = true,
          is_box_item    = EXCLUDED.is_box_item,
          off_peak_price = EXCLUDED.off_peak_price
        RETURNING id
      `, [
        p.name, p.slug, p.subtitle, p.description, p.tasting_notes,
        p.base_price, p.is_featured, p.is_limited,
        p.is_box_item, p.off_peak_price, categoryId,
      ]);
      const productId = product.id;

      // Re-insert variant
      await client.query('DELETE FROM product_variants WHERE product_id = $1', [productId]);
      await client.query(`
        INSERT INTO product_variants (product_id, label, price, stock_qty, is_default)
        VALUES ($1, $2, $3, $4, true)
      `, [productId, p.variant_label, p.base_price, p.stock_qty]);

      // Re-insert items  (column is sort_order)
      await client.query('DELETE FROM product_items WHERE product_id = $1', [productId]);
      for (let i = 0; i < p.items.length; i++) {
        await client.query(`
          INSERT INTO product_items (product_id, label, sort_order)
          VALUES ($1, $2, $3)
        `, [productId, p.items[i], i]);
      }

      // Re-insert primary image  (column is sort_order)
      await client.query(`
        DELETE FROM product_images WHERE product_id = $1 AND sort_order = 0
      `, [productId]);
      await client.query(`
        INSERT INTO product_images (product_id, url, alt_text, sort_order)
        VALUES ($1, $2, $3, 0)
      `, [productId, p.image_url, p.name]);

      console.log(`  ✓ ${p.name}`);
    }

    await client.query('COMMIT');
    console.log('\n✅  All 6 HAIQ products seeded.');
    console.log('    Run seed-testdata.js next.');
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
