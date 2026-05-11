require('dotenv').config();
const http = require('http');
const path = require('path');
const fs = require('fs');
const app = require('./app');
const { logger } = require('./config/logger');
const { testConnection, pool } = require('./config/db');

const PORT = process.env.PORT || 3001;

async function runMigrations() {
  logger.info('🔄 Running database migrations...');
  const migrationsDir = path.join(__dirname, 'db', 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  let client;
  try {
    client = await pool.connect();
    logger.info(`✅ DB connected for migrations`);
  } catch (err) {
    logger.error('❌ Failed to connect to database for migrations', {
      error: err.message,
      code: err.code
    });
    throw err;
  }

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        filename VARCHAR(255) PRIMARY KEY,
        run_at   TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    for (const file of files) {
      try {
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
      } catch (fileErr) {
        await client.query('ROLLBACK').catch(() => {});
        logger.error(`❌ Migration failed for ${file}`, {
          error: fileErr.message,
          detail: fileErr.detail,
          code: fileErr.code
        });
        throw fileErr;
      }
    }

    logger.info('🎉 All migrations complete');
  } catch (err) {
    logger.error('❌ Critical migration error', { error: err.message });
    throw err;
  } finally {
    if (client) client.release();
  }
}

async function start() {
  try {
    // Test DB connection before accepting traffic
    logger.info('🔗 Testing database connection...');
    await testConnection();
    logger.info('✅ Database connection successful');
  } catch (err) {
    logger.error('❌ Database connection failed', {
      error: err.message,
      code: err.code,
      host: process.env.DB_HOST || 'from DATABASE_URL',
    });
    logger.info('🔄 Retrying database connection in 2 seconds...');

    // Retry once after 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
      await testConnection();
      logger.info('✅ Database connection successful on retry');
    } catch (retryErr) {
      logger.error('❌ Database connection failed on retry', { error: retryErr.message });
      process.exit(1);
    }
  }

  // Run migrations before starting server
  try {
    await runMigrations();
  } catch (err) {
    logger.error('❌ Failed to run migrations', { error: err.message });
    process.exit(1);
  }

  const server = http.createServer(app);

  server.listen(PORT, () => {
    logger.info(`🍞 HAIQ API running on port ${PORT} [${process.env.NODE_ENV}]`);
    logger.info(`📄 API base: http://localhost:${PORT}/v1`);
    logger.info(`❤️  Health:  http://localhost:${PORT}/health`);

    if (process.env.NODE_ENV === 'development') {
      logger.info(`📚 Swagger UI: http://localhost:${process.env.SWAGGER_PORT || 5010}`);
    }
  });

  // Clean up expired revoked tokens every hour
  setInterval(async () => {
    try {
      await require('./config/db').query('DELETE FROM revoked_tokens WHERE expires_at < NOW()');
    } catch (err) {
      logger.error('Revoked token cleanup failed', { error: err.message });
    }
  }, 60 * 60 * 1000);

  // Graceful shutdown
  const shutdown = (signal) => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Promise Rejection', { reason });
  });

  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception', { error: err.message, stack: err.stack });
    process.exit(1);
  });
}

start();
