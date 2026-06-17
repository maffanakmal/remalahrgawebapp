export const jwtConfig = {
  access: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '30m',
    algorithm: 'HS256',                              // ← tambahkan
  },
  refresh: {
    secret: process.env.JWT_REFRESH_SECRET,
    expiresIn: process.env.JWT_REFRESH_EXPIRES_DAYS
      ? `${process.env.JWT_REFRESH_EXPIRES_DAYS}d`
      : '7d',
  },
  rememberMe: {
    expiresIn: process.env.JWT_REMEMBER_ME_EXPIRES || '14d',
    refreshExpiresIn: process.env.JWT_REFRESH_REMEMBER_ME_EXPIRES_DAYS
      ? `${process.env.JWT_REFRESH_REMEMBER_ME_EXPIRES_DAYS}d`
      : '30d',
  },
};