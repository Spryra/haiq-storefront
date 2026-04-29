const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const compression = require('compression');
const { requestLogger } = require('./middleware/requestLogger');
const { errorHandler } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');
const routes = require('./routes');

const app = express();

// ✅ TRUST PROXY (Render / production safe)
app.set('trust proxy', 1);

// ─── Security Headers ──────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

// Redirect HTTP → HTTPS in production behind proxy
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
});

// ─── CORS (FIXED + SAFE) ───────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGINS || process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return cb(null, true);

    if (allowedOrigins.includes(origin)) {
      return cb(null, true);
    }

    console.warn(`❌ Blocked by CORS: ${origin}`);
    return cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// ─── Body Parsing ──────────────────────────────────────────────
// Keep raw body for webhook verification
app.use((req, res, next) => {
  if (req.path.includes('/webhook')) {
    express.raw({ type: 'application/json' })(req, res, next);
  } else {
    express.json({ limit: '10mb' })(req, res, next);
  }
});
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Cookie Parsing ────────────────────────────────────────────
app.use(cookieParser());

// ─── Compression ───────────────────────────────────────────────
app.use(compression());

// ─── Request Logging ───────────────────────────────────────────
app.use(requestLogger);

// ─── Rate Limiting ─────────────────────────────────────────────
app.use('/v1', generalLimiter);

// ─── Health Check ──────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'haiq-api',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    env: process.env.NODE_ENV,
  });
});

// ─── API Routes ────────────────────────────────────────────────
app.use('/v1', routes);

// ─── 404 ───────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
  });
});

// ─── Error Handler (must be last) ──────────────────────────────
app.use(errorHandler);

module.exports = app;