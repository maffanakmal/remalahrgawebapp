import express from 'express';
import {
  login,
  register,
  refresh,
  logout,
  logoutAll,
  // verifyEmail,          // aktifkan setelah email verif siap
  // resendVerification,
  // forgotPassword,
  // verifyOtp,
  // resendOtp,
  // resetPassword,
} from '../controllers/auth.controller.js';

import {
  authenticate,
  validateLogin,
  validateRegister,
  loginRateLimiter,
  registerRateLimiter,
  registerSlowDown,
  refreshRateLimiter,
} from '../middleware/index.js';

const router = express.Router();

// ── Public ─────────────────────────────────────────
router.post('/login',
  loginRateLimiter,
  validateLogin,
  login,
);

router.post('/register',
  registerRateLimiter,
  registerSlowDown,
  validateRegister,
  register,
);

router.post('/refresh',
  refreshRateLimiter,
  refresh,
);

// ── Email verifikasi — aktifkan setelah siap ───────
// router.post('/verify-email', verifyEmail);
// router.post('/resend-verification', resendVerificationLimiter, resendVerification);

// ── OTP / Reset password — aktifkan setelah siap ──
// router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
// router.post('/verify-otp', verifyOtpLimiter, verifyOtp);
// router.post('/resend-otp', resendOtpLimiter, resendOtp);
// router.post('/reset-password', resetPassword);

// ── Protected ──────────────────────────────────────
router.post('/logout', authenticate, logout);
router.post('/logout-all', authenticate, logoutAll);

export default router;