// OK

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { jwtConfig } from '../config/index.js';

const JWT_OPTIONS = {
  issuer: 'remalahrgawebapp',
  audience: 'authenticated-users',
  algorithm: 'HS256',
};

/**
 * Generate access token (JWT)
 */
export const generateAccessToken = (payload, expiresIn) => {
  return jwt.sign(payload, jwtConfig.access.secret, {
    ...JWT_OPTIONS,
    expiresIn: expiresIn || jwtConfig.access.expiresIn,
  });
};

/**
 * Generate refresh token — random string, bukan JWT
 * JWT tidak diperlukan untuk refresh token karena:
 * - di-hash dan disimpan di DB/Sheets
 * - tidak perlu decode payload dari token
 */
export const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString('hex');
};

/**
 * Verify access token
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.access.secret, JWT_OPTIONS);
  } catch (err) {
    if (err.name === 'TokenExpiredError') throw new Error('TOKEN_EXPIRED');
    if (err.name === 'JsonWebTokenError') throw new Error('TOKEN_INVALID');
    throw new Error('TOKEN_INVALID');
  }
};

/**
 * Decode token tanpa verifikasi
 * Hati-hati: jangan pakai untuk auth decision
 */
export const decodeToken = (token) => {
  return jwt.decode(token);
};

/**
 * Extract Bearer token dari Authorization header
 */
export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) return null;
  const [type, token] = authHeader.split(' ');
  if (type !== 'Bearer') return null;
  return token;
};

/**
 * Hash refresh token pakai HMAC
 * Pakai JWT_REFRESH_SECRET — pisah dari access secret
 */
export const hashRefreshToken = (token) => {
  return crypto
    .createHmac('sha256', jwtConfig.refresh.secret)
    .update(token)
    .digest('hex');
};