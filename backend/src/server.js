require('dotenv').config();
const http = require('http');
const app = require('./app');
const { logger } = require('./config/logger');
const { testConnection } = require('./config/db');

const PORT = process.env.PORT || 3001;

async function start() {
  // Test DB connection before accepting traffic
  await testConnection();

  const server = http.createServer(app);

  server.listen(PORT, () => {
    logger.info(`🍞 HAIQ API running on port ${PORT} [${process.env.NODE_ENV}]`);
    logger.info(`📄 API base: http://localhost:${PORT}/v1`);
    logger.info(`❤️  Health:  http://localhost:${PORT}/health`);

    if (process.env.NODE_ENV === 'development') {
      logger.info(`📚 Swagger UI: http://localhost:${process.env.SWAGGER_PORT || 5010}`);
    }
  });

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
