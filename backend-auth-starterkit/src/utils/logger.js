/**
 * Logger sederhana tanpa import config
 * Sengaja standalone untuk hindari circular dependency
 */

const isProd = process.env.NODE_ENV === 'production';
const logLevel = process.env.LOG_LEVEL || 'debug';

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };

const shouldLog = (level) => {
  return LEVELS[level] <= LEVELS[logLevel] ?? true;
};

const getTimestamp = () => new Date().toISOString();

const formatMessage = (level, args) => {
  const message = args
    .map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg)
    .join(' ');
  return `[${getTimestamp()}] [${level.toUpperCase()}] ${message}`;
};

export const logger = {
  info: (...args) => {
    if (shouldLog('info')) console.info(formatMessage('info', args));
  },
  error: (...args) => {
    // error selalu tampil, tidak peduli log level
    console.error(formatMessage('error', args));
  },
  warn: (...args) => {
    if (shouldLog('warn')) console.warn(formatMessage('warn', args));
  },
  debug: (...args) => {
    if (!isProd && shouldLog('debug')) console.debug(formatMessage('debug', args));
  },
};

export default logger;