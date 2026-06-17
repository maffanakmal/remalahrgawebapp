import { AppError } from '../utils/index.js';
import { HTTP_STATUS, MESSAGES } from '../constants/index.js';
import { comparePassword, hashPassword, generateUUID } from '../utils/encryption.js';
import { generateAccessToken, generateRefreshToken, hashRefreshToken } from '../utils/jwt.js';
import { formatDate } from '../utils/helpers.js';
import {
  getAllUsers,
  getUserByEmail,
  getUserById,
  getUserByUsername,
  createUser,
  updateUser,
  deleteUser
} from '../repositories/sheets/users.repository.js';
import {
  createSession,
  getActiveSessionByTokenHash,
  getActiveSessionsByUserId,
  getAllSessions,
  revokeAllSessionsByUserId,
  revokeSessionByTokenHash,
  saveLoginSuccessSheets,
  rotateSessionSheets
} from '../repositories/sheets/sessions.repsitory.js';

const DUMMY_HASH = '$2b$10$CwTycUXWue0Thq9StjUM0uJ8D6Pt0b0e6b2H3j4QfVYy4ZC/7pG2a';
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;

// ── Login ─────────────────────────────────────────────────────────────────────

export const loginService = async ({ email, password, rememberMe = false }) => {
  const response = await getUserByEmail(email);

  // ── Ekstrak user langsung dari indeks pertama array rows ──
  const user = response?.data?.rows?.[0] ?? null;

  // Cek status akun terkunci di awal (Optimasi agar tidak membuang proses Bcrypt jika sudah dikunci)
  if (user && user.locked_until && new Date(user.locked_until) > new Date()) {
    const remaining = Math.ceil(
      (new Date(user.locked_until) - Date.now()) / 60000,
    );
    throw new AppError(
      `Akun terkunci. Coba lagi dalam ${remaining} menit.`,
      HTTP_STATUS.FORBIDDEN,
      'ACCOUNT_LOCKED',
    );
  }

  // Timing-safe: tetap jalankan comparePassword meski user tidak ada atau terkunci
  // Pastikan properti password benar-earthly dibaca dari user.password
  const userPassword = user ? user.password : DUMMY_HASH;
  const isValid = await comparePassword(password, userPassword);

  if (!user || !isValid) {
    // Increment failed_login_attempts jika user ditemukan tapi password salah
    if (user) {
      const attempts = (parseInt(user.failed_login_attempts, 10) || 0) + 1;
      const updateData = { failed_login_attempts: attempts };

      if (attempts >= MAX_FAILED_ATTEMPTS) {
        const lockedUntil = new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000);
        updateData.locked_until = lockedUntil.toISOString();
      }

      await updateUser(user.user_id, updateData);
    }

    throw new AppError(
      MESSAGES.AUTH.INVALID_CREDENTIALS,
      HTTP_STATUS.UNAUTHORIZED,
      'INVALID_CREDENTIALS',
    );
  }

  // Cek status aktifasi akun
  if (user.activation_status === 'Disabled') {
    throw new AppError('Akun dinonaktifkan', HTTP_STATUS.FORBIDDEN, 'ACCOUNT_DISABLED');
  }

  if (user.activation_status !== 'Active') {
    throw new AppError('Akun tidak aktif', HTTP_STATUS.FORBIDDEN, 'ACCOUNT_INACTIVE');
  }

  // Generate tokens
  const accessToken = generateAccessToken(
    { user_id: user.user_id, email: user.email, role: user.role },
    process.env.JWT_ACCESS_EXPIRES || '30m',
  );

  const rawRefreshToken = generateRefreshToken();
  const refreshTokenHash = hashRefreshToken(rawRefreshToken);
  const refreshDays = rememberMe ? 30 : 7;
  const expiresAt = new Date(Date.now() + refreshDays * 24 * 60 * 60 * 1000);

  const sessionPayload = {
    session_id: generateUUID(),
    user_id: user.user_id,
    refresh_token: refreshTokenHash,
    expires_at: expiresAt.toISOString(),
    revoked_at: '',
    created_at: new Date().toISOString(),
  };

  // Jalur Optimasi Google Sheets: 1 kali request HTTP
  await saveLoginSuccessSheets(user.user_id, sessionPayload);

  const { password: _, ...userWithoutPassword } = user;
  return {
    user: userWithoutPassword,
    tokens: { accessToken, refreshToken: rawRefreshToken, rememberMe },
    expiresAt,
  };
};

// ── Register ──────────────────────────────────────────────────────────────────

export const registerService = async ({ username, email, password }) => {
  const emailResponse = await getUserByEmail(email);
  const existingEmail = emailResponse?.data?.rows?.[0] ?? null;

  if (existingEmail) {
    throw new AppError(MESSAGES.AUTH.EMAIL_TAKEN, HTTP_STATUS.CONFLICT, 'EMAIL_TAKEN');
  }

  const usernameResponse = await getUserByUsername(username);
  const existingUsername = usernameResponse?.data?.rows?.[0] ?? null;

  if (existingUsername) {
    throw new AppError(MESSAGES.AUTH.USERNAME_TAKEN, HTTP_STATUS.CONFLICT, 'USERNAME_TAKEN');
  }

  const passwordHash = await hashPassword(password, 10);

  await createUser({
    user_id: generateUUID(),
    username,
    email,
    password: passwordHash,
    role: 'User',
    activation_status: 'Inactive',
    failed_login_attempts: 0,
    locked_until: null,
    last_login_at: null,
    created_at: new Date().toISOString(),
  });

  return { username, email };
};

// ── Refresh Session ───────────────────────────────────────────────────────────

export const refreshSessionService = async (rawRefreshToken) => {
  const refreshTokenHash = hashRefreshToken(rawRefreshToken);

  // Validasi session dari sheets
  const response = await getActiveSessionByTokenHash(refreshTokenHash);
  const session = response?.data ?? null;

  if (!session) {
    throw new AppError(
      MESSAGES.AUTH.TOKEN_INVALID,
      HTTP_STATUS.UNAUTHORIZED,
      'TOKEN_INVALID',
    );
  }

  // Ambil data user untuk payload token baru
  const userResponse = await getUserById(session.user_id);
  const user = userResponse?.data ?? null;

  if (!user || user.activation_status !== 'Active') {
    throw new AppError(
      MESSAGES.AUTH.TOKEN_INVALID,
      HTTP_STATUS.UNAUTHORIZED,
      'TOKEN_INVALID',
    );
  }

  const newRawRefreshToken = generateRefreshToken();
  const newRefreshTokenHash = hashRefreshToken(newRawRefreshToken);

  // Pertahankan sisa durasi dari session lama
  const oldExpiresAt = new Date(session.expires_at);
  const now = new Date();
  const remainingMs = oldExpiresAt - now;
  const newExpiresAt = new Date(now.getTime() + remainingMs);

  const accessToken = generateAccessToken(
    { user_id: user.user_id, email: user.email, role: user.role },
    process.env.JWT_ACCESS_EXPIRES || '30m',
  );

  // Sisa hari masa berlaku token baru, mengikuti sisa durasi session lama
  const remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));

  const newSessionPayload = {
    user_id: user.user_id,
    refresh_token: newRefreshTokenHash,
    expires_at: newExpiresAt.toISOString(),
    revoked_at: '',
    created_at: now.toISOString(),
  };

  // Jalur Optimasi Google Sheets: 1 kali request HTTP untuk rotasi token
  await rotateSessionSheets(refreshTokenHash, newSessionPayload);

  return {
    accessToken,
    refreshToken: newRawRefreshToken,
    refreshDays: remainingDays,
  };
};

// ── Logout ────────────────────────────────────────────────────────────────────

export const logoutService = async (rawRefreshToken) => {
  if (!rawRefreshToken) return;

  const refreshTokenHash = hashRefreshToken(rawRefreshToken);
  await revokeSessionByTokenHash(refreshTokenHash);
};

// ── Logout All Devices ────────────────────────────────────────────────────────

export const logoutAllService = async (userId) => {
  if (!userId) return;
  await revokeAllSessionsByUserId(userId);
};