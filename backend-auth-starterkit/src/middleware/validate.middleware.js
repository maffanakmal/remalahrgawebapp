import { AppError } from '../utils/index.js';
import { HTTP_STATUS, MESSAGES } from '../constants/index.js';

export const validate = (schema) => {
  return (req, res, next) => {
    const errors = [];

    for (const [source, fields] of Object.entries(schema)) {
      const data = req[source]; // req.body / req.params / req.query

      for (const [field, rules] of Object.entries(fields)) {
        const value = data?.[field];
        // Menggunakan trim jika nilainya string agar spasi kosong tidak dianggap isi
        const isEmpty = value === undefined || value === null || (typeof value === 'string' && value.trim() === '');

        // 1. Required Check
        if (rules.required && isEmpty) {
          errors.push(MESSAGES.VALIDATION.REQUIRED(field));
          continue;
        }

        if (isEmpty) continue; // Jika opsional dan kosong, skip aturan lainnya

        // 2. Type Check
        if (rules.type && typeof value !== rules.type) {
          errors.push(`${field} harus berupa ${rules.type}`);
          continue; // Jika tipe salah, skip pengecekan length agar tidak crash
        }

        // 3. MinLength Check (Aman untuk string maupun number)
        const stringValue = value.toString();
        if (rules.minLength && stringValue.length < rules.minLength) {
          errors.push(`${field} minimal ${rules.minLength} karakter`);
        }

        // 4. MaxLength Check
        if (rules.maxLength && stringValue.length > rules.maxLength) {
          errors.push(`${field} maksimal ${rules.maxLength} karakter`);
        }

        // 5. Email Format Check (Regex diperbaiki dengan escape karakter titik)
        if (rules.isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stringValue)) {
          errors.push(MESSAGES.VALIDATION.INVALID_EMAIL || `${field} format email tidak valid`);
        }

        // 6. Custom Validator
        if (rules.custom) {
          const customError = rules.custom(value, data);
          if (customError) errors.push(customError);
        }
      }
    }

    if (errors.length > 0) {
      // PERBAIKAN: Kirim array `errors` sebagai argumen ketiga ke AppError 
      // agar Global Error Handler Express bisa mengirimkannya ke frontend
      return next(new AppError(
        MESSAGES.BAD_REQUEST,
        HTTP_STATUS.BAD_REQUEST,
        errors // Pastikan class AppError milikmu menerima parameter detail error ini
      ));
    }

    next();
  };
};

// --- Sinkronisasi Schema dengan Frontend ---

export const validateLogin = validate({
  body: {
    email: { required: true, isEmail: true },
    password: { required: true, minLength: 6 }, // Disamakan dengan frontend (6 karakter)
  },
});

export const validateRegister = validate({
  body: {
    username: { required: true, minLength: 5, maxLength: 50 },
    email: { required: true, isEmail: true },
    password: { required: true, minLength: 6 }, // Disamakan dengan frontend (6 karakter)
  },
});