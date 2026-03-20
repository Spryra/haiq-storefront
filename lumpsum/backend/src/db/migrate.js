require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');
const { logger } = require('../config/logger');

async function runMigrations() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  const client = await pool.connect();
  try {
    // Create migrations tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        filename VARCHAR(255) PRIMARY KEY,
        run_at   TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    for (const file of files) {
      const { rows } = await client.query(
        'SELECT 1 FROM _migrations WHERE filename = $1',
        [file]
      );
      if (rows.length > 0) {
        logger.info(`⏭  Skipping ${file} (already run)`);
        continue;
      }

      logger.info(`▶  Running migration: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO _migrations (filename) VALUES ($1)', [file]);
      await client.query('COMMIT');
      logger.info(`✅ Completed: ${file}`);
    }

    logger.info('🎉 All migrations complete');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    logger.error('Migration failed', { error: err.message });
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
