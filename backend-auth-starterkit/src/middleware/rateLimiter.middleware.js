import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { HTTP_STATUS, MESSAGES } from '../constants/index.js';

const makeHandler = (message) => (req, res) => {
  res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
    success: false,
    code: 'TOO_MANY_REQUESTS',
    message,
  });
};

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: makeHandler(MESSAGES.TOO_MANY_REQUESTS),
});

export const refreshRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: makeHandler(MESSAGES.TOO_MANY_REQUESTS),
});

export const registerRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: makeHandler(MESSAGES.TOO_MANY_REQUESTS),
});

export const registerSlowDown = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 2,
  delayMs: () => 1000,
});