const { logger } = require('../config/logger');

function errorHandler(err, req, res, next) {
  // Log full error
  logger.error('Unhandled error', {
    message:  err.message,
    stack:    err.stack,
    path:     req.path,
    method:   req.method,
    userId:   req.user?.id,
    adminId:  req.admin?.id,
  });

  // Determine status code
  let status = err.status || err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // CORS error
  if (message.startsWith('CORS:')) {
    status  = 403;
    message = 'Origin not allowed';
  }

  // Postgres unique violation
  if (err.code === '23505') {
    status  = 409;
    message = 'Duplicate entry — resource already exists';
  }

  // Postgres foreign key violation
  if (err.code === '23503') {
    status  = 400;
    message = 'Referenced resource not found';
  }

  // JWT errors (should be caught in middleware but just in case)
  if (err.name === 'JsonWebTokenError') {
    status  = 401;
    message = 'Invalid token';
  }

  // Never leak internal messages in production
  if (status === 500 && process.env.NODE_ENV === 'production') {
    message = 'An unexpected error occurred. Please try again.';
  }

  res.status(status).json({
    success: false,
    error:   message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = { errorHandler };
