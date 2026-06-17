import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.js';
import { AppError } from '../utils/index.js';
import { HTTP_STATUS, MESSAGES } from '../constants/index.js';

const JWT_OPTIONS = {
  issuer: 'remalahrgawebapp',
  audience: 'authenticated-users',
};

export const authenticate = (req, res, next) => {
  try {
    const token = req.cookies?.access_token;

    if (!token) {
      throw new AppError(
        MESSAGES.AUTH.NO_TOKEN,
        HTTP_STATUS.UNAUTHORIZED,
        MESSAGES.AUTH_CODE.NO_TOKEN,
      );
    }

    const decoded = jwt.verify(token, jwtConfig.access.secret, JWT_OPTIONS);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError(
        MESSAGES.AUTH.TOKEN_EXPIRED,
        HTTP_STATUS.UNAUTHORIZED,
        MESSAGES.AUTH_CODE.TOKEN_EXPIRED,
      ));
    }
    if (err.name === 'JsonWebTokenError') {
      return next(new AppError(
        MESSAGES.AUTH.TOKEN_INVALID,
        HTTP_STATUS.UNAUTHORIZED,
        MESSAGES.AUTH_CODE.TOKEN_INVALID,
      ));
    }
    next(err); // unexpected error → global error handler
  }
};