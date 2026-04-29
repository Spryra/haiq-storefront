require('dotenv').config();
const http = require('http');
const app = require('./app');
const { logger } = require('./config/logger');
const { testConnection } = require('./config/db');

const PORT = process.env.PORT || 3001;

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
