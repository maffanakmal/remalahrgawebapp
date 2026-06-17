export { appConfig } from './env.js';
export { corsConfig } from './cors.js';
export { cookieConfig, cookieTtl } from './cookie.js';
export { jwtConfig } from './jwt.js';
export { sheetsConfig } from './sheets.js';
export { databaseConfig } from './database.js';
export { emailConfig } from './email.js';

// ← tambahkan ini
export const bcryptConfig = {
  saltRounds: 10,
};