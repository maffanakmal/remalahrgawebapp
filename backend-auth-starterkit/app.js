import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';

import { appConfig } from './src/config/env.js';
import { corsConfig } from './src/config/cors.js';
import { HTTP_STATUS, MESSAGES } from './src/constants/index.js';

import authRoutes from './src/routes/auth.route.js';
import userRoutes from './src/routes/user.route.js';
import belanjaBulananRoutes from './src/routes/belanjabulanan.route.js';
import inventoryKendaraanRoutes from './src/routes/inventorykendaraan.route.js';

const app = express();

// ── Trust proxy ────────────────────────────────────
app.set('trust proxy', 1);

// ── Security ───────────────────────────────────────
app.use(helmet());
app.use(cors(corsConfig));

// ── Rate limiter global ────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: MESSAGES.TOO_MANY_REQUESTS,
  },
});
app.use(globalLimiter);

// ── Body parsers ───────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Routes ─────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/belanjabulanan', belanjaBulananRoutes);
app.use('/api/inventorykendaraan', inventoryKendaraanRoutes);

// ── Health check ───────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ success: true, env: appConfig.nodeEnv });
});

// ── 404 handler ────────────────────────────────────
app.use((req, res) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// ── Global error handler ───────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_ERROR;

  // isOperational = error yang kita sengaja throw via AppError
  // jika bukan, sembunyikan detail error di production
  const message = err.isOperational
    ? err.message
    : appConfig.isProd
      ? MESSAGES.INTERNAL_ERROR
      : err.message;

  if (appConfig.isDev) {
    console.error('GLOBAL ERROR:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(err.code && { code: err.code }),
    ...(appConfig.isDev && { stack: err.stack }),
  });
});

export default app;