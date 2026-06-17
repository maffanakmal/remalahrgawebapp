import { appConfig } from '../config/env.js';
import { HTTP_STATUS, MESSAGES } from '../constants/index.js';
import { logger } from '../utils/logger.js'; // ← tambahkan

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_ERROR;

  const message = err.isOperational
    ? err.message
    : appConfig.isProd
      ? MESSAGES.INTERNAL_ERROR
      : err.message;

  // hanya log error yang bukan operasional (bug/unexpected)
  if (!err.isOperational) {
    logger.error('GLOBAL ERROR:', err);
  }

  res.status(statusCode).json({
    success: false,
    ...(err.code && { code: err.code }),
    message,
    ...(appConfig.isDev && !err.isOperational && { stack: err.stack }),
  });
};

export const notFound = (req, res) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
};