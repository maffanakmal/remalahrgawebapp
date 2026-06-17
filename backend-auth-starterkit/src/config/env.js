import 'dotenv/config';

const requiredEnvs = [
  'JWT_SECRET',          
  'JWT_REFRESH_SECRET',
  'APPS_SCRIPT_URL_BELANJA_BULANAN',   
  'APPS_SCRIPT_API_KEY_BELANJA_BULANAN',
  'APPS_SCRIPT_URL_INVENTORY_KENDARAAN',
  'APPS_SCRIPT_API_KEY_INVENTORY_KENDARAAN',
  'APPS_SCRIPT_URL_USERS',
  'APPS_SCRIPT_API_KEY_USERS',
];

for (const key of requiredEnvs) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const appConfig = {
  port: parseInt(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV !== 'production',
  isProd: process.env.NODE_ENV === 'production',
  logLevel: process.env.LOG_LEVEL || 'debug',
};