import express from 'express';
import { getAllUsers, getMe, getUsersById } from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middleware/index.js';

const router = express.Router();

const isGA = [authenticate, authorize('GA')];

// ── Protected ──────────────────────────────────────
router.get('/me', authenticate, getMe);
// router.patch('/me', authenticate, updateMe);

// ── GA only ─────────────────────────────────────
router.get('/ga', ...isGA, getAllUsers);
router.get('/ga/:user_id', ...isGA, getUsersById);

export default router;