#!/usr/bin/env node
/**
 * Migration: Add sender_name, sender_email, subject columns to messages table
 *
 * Run: node scripts/migrate-messages-table.js
 */

const { query } = require('../src/config/db');

async function migrate() {
  try {
    console.log('🔄 Migrating messages table...');

    // Check which columns already exist
    const { rows: columns } = await query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'messages'
      AND column_name IN ('sender_name', 'sender_email', 'subject')
    `);

    const existingCols = columns.map(c => c.column_name);
    console.log(`📋 Found existing columns: ${existingCols.length ? existingCols.join(', ') : 'none'}`);

    // Add missing columns
    const colsToAdd = [
      { name: 'sender_name', type: 'TEXT' },
      { name: 'sender_email', type: 'TEXT' },
      { name: 'subject', type: 'TEXT' },
    ];

    for (const col of colsToAdd) {
      if (!existingCols.includes(col.name)) {
        console.log(`➕ Adding column: ${col.name} (${col.type})`);
        await query(`
          ALTER TABLE messages
          ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}
        `);
        console.log(`✅ ${col.name} added`);
      }
    }

    console.log('\n✨ Migration complete!');
    console.log('\n📝 Columns in messages table:');
    console.log('   - id');
    console.log('   - order_id');
    console.log('   - sender_type (customer | contact_form)');
    console.log('   - sender_id');
    console.log('   - sender_name (new)');
    console.log('   - sender_email (new)');
    console.log('   - subject (new)');
    console.log('   - body');
    console.log('   - is_read');
    console.log('   - created_at');

    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
