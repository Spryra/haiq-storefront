#!/usr/bin/env node
/**
 * One-time setup script: Creates the "Box Office" product for Build Your Box feature
 * Run this once to seed the database with the required product and variant
 *
 * Usage: node scripts/setup-box-office.js
 */

const { query } = require('../config/db');
const crypto = require('crypto');

const generateUUID = () => crypto.randomUUID();

async function setupBoxOffice() {
  try {
    console.log('🔧 Setting up Box Office product...');

    // Check if product already exists
    const { rows: existingProducts } = await query(
      "SELECT id FROM products WHERE slug = 'box-office' LIMIT 1"
    );

    if (existingProducts.length > 0) {
      console.log('✅ Box Office product already exists. Skipping creation.');
      process.exit(0);
    }

    // Create the product
    const productId = generateUUID();
    const variantId = generateUUID();

    console.log(`📦 Creating product (ID: ${productId})...`);
    console.log(`📦 Creating variant (ID: ${variantId})...`);

    const { rows: [product] } = await query(`
      INSERT INTO products (
        id, slug, name, subtitle, description, base_price,
        is_active, is_featured, is_limited, sort_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, slug, name
    `, [
      productId,
      'box-office',
      'Box Office',
      'Build Your Own Box',
      'Create your perfect box of 4 cookies',
      40000,  // base_price (special day price)
      true,   // is_active
      false,  // is_featured
      false,  // is_limited
      999,    // sort_order
    ]);

    console.log(`✅ Product created: ${product.name} (${product.slug})`);

    // Create the default variant
    const { rows: [variant] } = await query(`
      INSERT INTO product_variants (
        id, product_id, label, price, stock_qty, is_default, sku
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, label, price
    `, [
      variantId,
      productId,
      'Standard Box',
      80000,  // off_peak_price
      999,    // unlimited stock
      true,   // is_default
      'BOX-001',
    ]);

    console.log(`✅ Variant created: ${variant.label} (${variant.price})`);

    console.log(`\n✨ Box Office setup complete!`);
    console.log(`\n📝 Update the products controller to use these IDs:`);
    console.log(`   Product ID: ${productId}`);
    console.log(`   Variant ID: ${variantId}`);
    console.log(`\n   In backend/src/controllers/products.controller.js, line 115:`);
    console.log(`   Change: id: 999,`);
    console.log(`   To:     id: '${productId}',`);
    console.log(`\n   Line 131:`);
    console.log(`   Change: { id: 999, ...`);
    console.log(`   To:     { id: '${variantId}', ...`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Setup failed:', err.message);
    process.exit(1);
  }
}

setupBoxOffice();
