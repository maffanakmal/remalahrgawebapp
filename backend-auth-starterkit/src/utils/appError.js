export class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode >= 500 ? 'error' : 'fail';
    this.isOperational = true;
    this.code = code; // ← tambah ini

    Error.captureStackTrace(this, this.constructor);
  }
}