import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { jwtConfig, bcryptConfig } from '../config/index.js';

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(bcryptConfig.saltRounds);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

export const generateRandomString = (length = 16) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randomBytes = crypto.randomBytes(length);
  return Array.from(randomBytes, (byte) => chars[byte % chars.length]).join('');
};

export const generateOTP = (length = 6) => {
  const digits = '0123456789';
  const randomBytes = crypto.randomBytes(length);
  return Array.from(randomBytes, (byte) => digits[byte % digits.length]).join('');
};

export const encrypt = (text, key = jwtConfig.access.secret) => {
  const encryptionKey = crypto.createHash('sha256').update(key).digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
  const encrypted = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
};

export const decrypt = (encryptedText, key = jwtConfig.access.secret) => {
  const encryptionKey = crypto.createHash('sha256').update(key).digest();
  const [ivHex, encrypted] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, iv);
  return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
};

export const hash = (data) => {
  return crypto.createHash('sha256').update(String(data).trim()).digest('hex');
};

export const createHMAC = (data, secret = jwtConfig.access.secret) => {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
};

export const verifyHMAC = (data, signature, secret = jwtConfig.access.secret) => {
  const expected = createHMAC(data, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expected, 'hex'),
  );
};

export function generateId(prefix = "TRX", currentLineNumber = 1) {
  const today = new Date();
  const day   = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year  = today.getFullYear();
  const formattedDate = `${day}${month}${year}`;

  const padRow = String(currentLineNumber).padStart(4, "0");

  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let randomSuffix = "";

  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const array = new Uint8Array(4);
    crypto.getRandomValues(array);
    for (let i = 0; i < 4; i++) {
      randomSuffix += characters.charAt(array[i] % characters.length);
    }
  } else {
    for (let i = 0; i < 4; i++) {
      randomSuffix += characters.charAt(Math.floor(Math.random() * characters.length));
    }
  }

  return `${prefix}-${formattedDate}${padRow}-${randomSuffix}`;
}

export const generateUUID = (dashes = true) => {
  const uuid = crypto.randomUUID();
  return dashes ? uuid : uuid.replaceAll('-', '');
};