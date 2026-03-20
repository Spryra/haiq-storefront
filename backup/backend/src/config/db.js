const { Pool } = require('pg');
const { logger } = require('./logger');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: parseInt(process.env.DB_POOL_MAX || '10'),
  idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_MS || '30000'),
  connectionTimeoutMillis: 5000,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});

pool.on('error', (err) => {
  logger.error('Unexpected DB pool error', { error: err.message });
});

async function testConnection() {
  try {
    const client = await pool.connect();
    const { rows } = await client.query('SELECT NOW() AS now, current_database() AS db');
    client.release();
    logger.info(`✅ DB connected: ${rows[0].db} at ${rows[0].now}`);
  } catch (err) {
    logger.error('❌ DB connection failed', { error: err.message });
    process.exit(1);
  }
}

/**
 * Execute a parameterized query
 * @param {string} text - SQL with $1, $2 placeholders
 * @param {Array}  params - parameter values
 */
async function query(text, params = []) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV === 'development') {
    logger.debug('DB query', { text: text.substring(0, 100), duration, rows: result.rowCount });
  }
  return result;
}

/**
 * Get a dedicated client for transactions
 */
async function getClient() {
  return pool.connect();
}

module.exports = { pool, query, getClient, testConnection };
