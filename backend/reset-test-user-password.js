// reset-test-user-password.js
// ─────────────────────────────────────────────────────────────────────────────
// Run this from the backend folder to reset test user password
//
//   cd "D:\Junior Reactive Projects\HAIQ\backend"
//   node reset-test-user-password.js
// ─────────────────────────────────────────────────────────────────────────────
'use strict';

require('dotenv').config();
const { Pool }  = require('pg');
const bcrypt    = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const TEST_EMAIL    = 'aaronmugumya04@gmail.com';
const TEST_PASSWORD = 'TestPassword@123';

async function run() {
  const client = await pool.connect();
  try {
    console.log('\nResetting test user password...');
    console.log(`Email: ${TEST_EMAIL}`);
    
    const hash = await bcrypt.hash(TEST_PASSWORD, 12);
    console.log('Hash generated successfully.');

    // Check if user exists
    const { rows: [existing] } = await client.query(
      'SELECT id, email FROM users WHERE email = $1',
      [TEST_EMAIL]
    );

    if (existing) {
      await client.query(
        'UPDATE users SET password_hash = $1 WHERE id = $2',
        [hash, existing.id]
      );
      console.log(`✅ Updated password for user: ${TEST_EMAIL}`);
      console.log(`   New password: ${TEST_PASSWORD}`);
    } else {
      console.log(`❌ User not found: ${TEST_EMAIL}`);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

run();
