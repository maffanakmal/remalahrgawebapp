import { AppError } from '../utils/index.js';
import { HTTP_STATUS, MESSAGES } from '../constants/index.js';

export const authorize = (...allowedRoles) => {
  if (!allowedRoles || allowedRoles.length === 0) {
    throw new Error('authorize() requires at least one role');
  }

  const normalizedRoles = allowedRoles.map((r) => r.toLowerCase());

  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError(
        MESSAGES.AUTH.UNAUTHORIZED,
        HTTP_STATUS.UNAUTHORIZED,
        MESSAGES.AUTH_CODE.NO_TOKEN,
      ));
    }

    // support req.user.roles (array) dan req.user.role (string)
    const userRoles = Array.isArray(req.user.roles)
      ? req.user.roles.map((r) => r.toLowerCase())
      : [req.user.role?.toLowerCase()].filter(Boolean);

    const hasAccess = userRoles.some((role) => normalizedRoles.includes(role));

    if (!hasAccess) {
      return next(new AppError(
        MESSAGES.AUTH.FORBIDDEN,
        HTTP_STATUS.FORBIDDEN,
        MESSAGES.AUTH_CODE.FORBIDDEN,
      ));
    }

    next();
  };
};