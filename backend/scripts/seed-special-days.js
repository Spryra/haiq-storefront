#!/usr/bin/env node
/**
 * Seed script: Create test special days for 21-22 May 2026
 *
 * Run: node scripts/seed-special-days.js
 */

const { query } = require('../src/config/db');
const crypto = require('crypto');

const generateUUID = () => crypto.randomUUID();

async function seedSpecialDays() {
  try {
    console.log('🌟 Seeding special days for 21-22 May 2026...');

    // Check if special day already exists
    const { rows: existing } = await query(
      "SELECT id FROM special_days WHERE date_from = '2026-05-21' AND date_to = '2026-05-22' LIMIT 1"
    );

    if (existing.length > 0) {
      console.log('✅ Special day already exists. Skipping creation.');
      process.exit(0);
    }

    // Create the special day
    const id = generateUUID();
    const { rows: [day] } = await query(`
      INSERT INTO special_days (
        id, label, date_from, date_to, is_active, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, label, date_from, date_to, is_active
    `, [
      id,
      'Special Day Test — May 2026',
      '2026-05-21',
      '2026-05-22',
      true,  // is_active
      new Date().toISOString(),
    ]);

    console.log('✅ Special day created:');
    console.log(`   ID: ${day.id}`);
    console.log(`   Label: ${day.label}`);
    console.log(`   Date: ${day.date_from} to ${day.date_to}`);
    console.log(`   Active: ${day.is_active}`);
    console.log('\n📝 Build Your Box page should now show:');
    console.log('   - Box price: UGX 40,000 (strikethrough UGX 80,000)');
    console.log('   - "Special Day" badge');
    console.log('\n✨ Special day seed complete!');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seedSpecialDays();
