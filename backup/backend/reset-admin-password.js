/**
 * HAIQ — Reset Admin Password
 * Run from: D:\Junior Reactive Projects\HAIQ\backend
 * Usage:    node reset-admin-password.js
 *
 * This script generates a fresh bcrypt hash entirely inside Node
 * and writes it directly to the database — no PowerShell string
 * interpolation, no $ sign corruption.
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const EMAIL    = 'admin@haiq.ug';
const PASSWORD = 'HAIQAdmin2024!';

async function main() {
  console.log('\n🔑 HAIQ Admin Password Reset\n');

  // Connect using the same DATABASE_URL as the backend
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  // Check the admin user exists
  const check = await pool.query(
    'SELECT id, email, is_active FROM admin_users WHERE email = $1',
    [EMAIL]
  );

  if (check.rows.length === 0) {
    console.log(`❌ No admin user found with email: ${EMAIL}`);
    console.log('   Inserting one now...');

    const hash = await bcrypt.hash(PASSWORD, 12);
    await pool.query(`
      INSERT INTO admin_users (email, password_hash, full_name, role, is_active)
      VALUES ($1, $2, 'HAIQ Admin', 'superadmin', true)
    `, [EMAIL, hash]);

    console.log(`✅ Admin user created: ${EMAIL}`);
  } else {
    const admin = check.rows[0];
    console.log(`Found admin: ${admin.email} (active: ${admin.is_active})`);

    // Ensure is_active is true
    if (!admin.is_active) {
      await pool.query('UPDATE admin_users SET is_active = true WHERE email = $1', [EMAIL]);
      console.log('✅ Account re-activated');
    }

    // Generate fresh hash — entirely inside Node, no shell interpolation
    console.log('Generating fresh bcrypt hash...');
    const hash = await bcrypt.hash(PASSWORD, 12);
    console.log(`Hash (first 20 chars): ${hash.substring(0, 20)}...`);

    await pool.query(
      'UPDATE admin_users SET password_hash = $1 WHERE email = $2',
      [hash, EMAIL]
    );

    console.log(`\n✅ Password reset successfully`);
  }

  // Verify it works right now
  const verify = await pool.query(
    'SELECT password_hash FROM admin_users WHERE email = $1',
    [EMAIL]
  );

  const storedHash = verify.rows[0].password_hash;
  const isValid = await bcrypt.compare(PASSWORD, storedHash);

  if (isValid) {
    console.log('✅ Verification passed — bcrypt.compare returned true');
    console.log('\n─────────────────────────────────────');
    console.log('  Login at: http://localhost:5174');
    console.log(`  Email:    ${EMAIL}`);
    console.log(`  Password: ${PASSWORD}`);
    console.log('─────────────────────────────────────\n');
  } else {
    console.log('❌ Verification FAILED — something is still wrong');
    console.log('   Stored hash:', storedHash.substring(0, 30));
  }

  await pool.end();
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
