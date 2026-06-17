export const MESSAGES = {
  // Generic
  SUCCESS: 'Success',
  CREATED: 'Data berhasil dibuat',
  UPDATED: 'Data berhasil diperbarui',
  DELETED: 'Data berhasil dihapus',
  NOT_FOUND: 'Data tidak ditemukan',
  BAD_REQUEST: 'Request tidak valid',
  INTERNAL_ERROR: 'Terjadi kesalahan pada server',
  TOO_MANY_REQUESTS: 'Terlalu banyak request, coba lagi nanti',

  AUTH: {
    REGISTER_SUCCESS: 'Registrasi berhasil',
    LOGIN_SUCCESS: 'Login berhasil',
    LOGOUT_SUCCESS: 'Logout berhasil',
    INVALID_CREDENTIALS: 'Email atau password salah',
    EMAIL_TAKEN: 'Email sudah digunakan',
    USERNAME_TAKEN: 'Username sudah digunakan',
    UNAUTHORIZED: 'Authentication required',
    FORBIDDEN: 'Anda tidak memiliki akses',
    TOKEN_EXPIRED: 'Access token expired',
    TOKEN_INVALID: 'Invalid access token',
    NO_TOKEN: 'Authentication required',
    ACCOUNT_LOCKED: 'Akun terkunci, hubungi admin',
    ACCOUNT_INACTIVE: 'Akun belum aktif, hubungi admin',
    WEAK_PASSWORD: 'Password terlalu lemah',
  },

  AUTH_CODE: {
    NO_TOKEN: 'NO_TOKEN',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    TOKEN_INVALID: 'TOKEN_INVALID',
    FORBIDDEN: 'FORBIDDEN',
  },
};