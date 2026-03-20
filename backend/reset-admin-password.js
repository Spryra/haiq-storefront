// reset-admin-password.js
// ─────────────────────────────────────────────────────────────────────────────
// Run this from the backend folder to reset the admin password safely.
// bcrypt hashes contain $ characters which PowerShell mangles — this script
// generates and stores the hash entirely inside Node, bypassing the shell.
//
//   cd "D:\Junior Reactive Projects\HAIQ\backend"
//   node reset-admin-password.js
// ─────────────────────────────────────────────────────────────────────────────
'use strict';

require('dotenv').config();
const { Pool }  = require('pg');
const bcrypt    = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const ADMIN_EMAIL    = 'admin@haiq.ug';
const ADMIN_PASSWORD = 'HAIQAdmin2024!';
const ADMIN_NAME     = 'HAIQ Admin';
const ADMIN_ROLE     = 'superadmin';

async function run() {
  const client = await pool.connect();
  try {
    console.log('\nGenerating bcrypt hash inside Node (no shell interpolation)…');
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    console.log('Hash generated successfully.');

    // Check if admin exists
    const { rows: [existing] } = await client.query(
      'SELECT id FROM admin_users WHERE email = $1',
      [ADMIN_EMAIL]
    );

    if (existing) {
      await client.query(
        'UPDATE admin_users SET password_hash = $1, is_active = true WHERE id = $2',
        [hash, existing.id]
      );
      console.log(`Updated password for existing admin: ${ADMIN_EMAIL}`);
    } else {
      await client.query(
        `INSERT INTO admin_users (email, password_hash, full_name, role, is_active)
         VALUES ($1, $2, $3, $4, true)`,
        [ADMIN_EMAIL, hash, ADMIN_NAME, ADMIN_ROLE]
      );
      console.log(`Created new admin: ${ADMIN_EMAIL}`);
    }

    // Verify the hash works
    const ok = await bcrypt.compare(ADMIN_PASSWORD, hash);
    if (!ok) throw new Error('Hash verification failed — something went wrong.');

    console.log('\n✅  Password reset complete.');
    console.log(`   Email:    ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log('\n   You can now log in at http://localhost:5174\n');
  } catch (err) {
    console.error('\n✗  Reset failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    pool.end();
  }
}

run();
