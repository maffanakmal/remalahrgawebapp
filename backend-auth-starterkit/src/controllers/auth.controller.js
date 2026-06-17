import { catchAsync, sendSuccess, sendError } from '../utils/index.js';
import { HTTP_STATUS, MESSAGES } from '../constants/index.js';
import { cookieConfig, cookieTtl } from '../config/cookie.js';
import {
  loginService,
  registerService,
  refreshSessionService,
  logoutService,
  logoutAllService,
} from '../services/auth.service.js';

// ── Cookie helpers ────────────────────────────────────────────────────────────

const setAuthCookies = (res, { accessToken, refreshToken, rememberMe }) => {
  res.cookie('access_token', accessToken, {
    ...cookieConfig,
    maxAge: rememberMe ? cookieTtl.rememberMe : cookieTtl.access,
  });

  res.cookie('refresh_token', refreshToken, {
    ...cookieConfig,
    maxAge: rememberMe ? cookieTtl.rememberMe : cookieTtl.default,
  });
};

const clearAuthCookies = (res) => {
  res.clearCookie('access_token', cookieConfig);
  res.clearCookie('refresh_token', cookieConfig);
};

// ── Controllers ───────────────────────────────────────────────────────────────

export const login = catchAsync(async (req, res) => {
  const { email, password, rememberMe = false } = req.body;

  const { user, tokens } = await loginService({
    email: email.trim().toLowerCase(),
    password,
    rememberMe,
  });

  setAuthCookies(res, tokens);

  sendSuccess(res, {
    statusCode: HTTP_STATUS.OK,
    message: MESSAGES.AUTH.LOGIN_SUCCESS,
    data: { user },
  });
});

export const register = catchAsync(async (req, res) => {
  const { username, email, password } = req.body;

  const result = await registerService({
    username: username.trim(),
    email: email.trim().toLowerCase(),
    password,
  });

  sendSuccess(res, {
    statusCode: HTTP_STATUS.CREATED,
    message: MESSAGES.AUTH.REGISTER_SUCCESS,
    data: result,
  });
});

export const refresh = catchAsync(async (req, res) => {
  const rawRefreshToken = req.cookies?.refresh_token;

  if (!rawRefreshToken) {
    return sendError(res, {
      statusCode: HTTP_STATUS.UNAUTHORIZED,
      message: MESSAGES.AUTH.TOKEN_INVALID,
    });
  }

  // Fix: destructure sesuai return value service
  const { accessToken, refreshToken, refreshDays } = await refreshSessionService(rawRefreshToken);

  // Hitung maxAge dari refreshDays yang dikembalikan service
  const maxAge = refreshDays * 24 * 60 * 60 * 1000;

  res.cookie('access_token', accessToken, {
    ...cookieConfig,
    maxAge: cookieTtl.access,
  });

  res.cookie('refresh_token', refreshToken, {
    ...cookieConfig,
    maxAge,
  });

  sendSuccess(res, { message: MESSAGES.SUCCESS });
});

export const logout = catchAsync(async (req, res) => {
  const rawRefreshToken = req.cookies?.refresh_token;

  await logoutService(rawRefreshToken);
  clearAuthCookies(res);

  sendSuccess(res, { message: MESSAGES.AUTH.LOGOUT_SUCCESS });
});

export const logoutAll = catchAsync(async (req, res) => {
  const userId = req.user?.user_id;
  const rawRefreshToken = req.cookies?.refresh_token;

  // Revoke semua session user di sheets
  await logoutAllService(userId);

  // Tetap clear cookie device ini
  clearAuthCookies(res);

  sendSuccess(res, { message: MESSAGES.AUTH.LOGOUT_ALL_SUCCESS });
});

// ── Placeholder — aktifkan setelah pindah ke Supabase ────────────────────────

// export const verifyEmail = catchAsync(async (req, res) => {});
// export const resendVerification = catchAsync(async (req, res) => {});
// export const forgotPassword = catchAsync(async (req, res) => {});
// export const verifyOtp = catchAsync(async (req, res) => {});
// export const resendOtp = catchAsync(async (req, res) => {});
// export const resetPassword = catchAsync(async (req, res) => {});