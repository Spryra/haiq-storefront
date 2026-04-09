// backend/src/config/db.js — Production-ready version
// Supports both DATABASE_URL (Neon/Render) and individual env vars (local dev)
'use strict';

const { Pool } = require('pg');
const { logger } = require('./logger');

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 30000,  // Increased from 5s to 30s for cloud environments
      }
    : {
        host:     process.env.DB_HOST     || 'localhost',
        port:     parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME     || 'haiq_db',
        user:     process.env.DB_USER     || 'haiq_user',
        password: process.env.DB_PASSWORD || 'haiq_password_2024',
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 30000,  // Increased from 5s to 30s for cloud environments
      }
);

pool.on('connect', () => {
  logger.info(`✅ DB connected: ${process.env.DB_NAME || 'haiq_db'} at ${new Date().toString()}`);
});

pool.on('error', (err) => {
  logger.error('Unexpected DB error', { error: err.message });
});

const query = (text, params) => pool.query(text, params);

const getClient = () => pool.connect();

const testConnection = () => pool.query('SELECT 1');

module.exports = { query, getClient, pool, testConnection };
