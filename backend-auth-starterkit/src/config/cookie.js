import { appConfig } from './env.js';

export const cookieConfig = {
  httpOnly: process.env.COOKIE_HTTP_ONLY !== 'false',
  secure: process.env.COOKIE_SECURE === 'true' || appConfig.isProd,
  sameSite: process.env.COOKIE_SAMESITE || 'lax',
  path: '/',
};

// durasi cookie refresh token (ms)
export const cookieTtl = {
  default: 7 * 24 * 60 * 60 * 1000,
  rememberMe: 30 * 24 * 60 * 60 * 1000,
};