import { catchAsync, sendSuccess } from '../utils/index.js';
import { HTTP_STATUS, MESSAGES } from '../constants/index.js'; // PERBAIKAN: Impor MESSAGES secara eksplisit
import { getPagination, getPaginationMeta } from '../utils/pagination.js'; 

import {
  getAllUsersService,
  getUserByIdService,
  getUserByEmailService,
  createUserService,
  updateUserService,
} from '../services/user.service.js'; // PERBAIKAN: Penyesuaian nama file service (jamak)

// ── Users Management ─────────────────────────────────────────────────────────

export const getAllUsers = catchAsync(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query.page, req.query.limit);

  // PERBAIKAN: Teruskan parameter limit & offset ke layer service
  const { rows, total } = await getAllUsersService(limit, offset);
  const meta = getPaginationMeta({ page, limit, total });

  // SINKRONISASI: Menggunakan native json response untuk list data ber-meta
  res.status(HTTP_STATUS.OK || 200).json({
    success: true,
    message: MESSAGES.SUCCESS || 'Success',
    data: rows,
    meta
  });
});

export const getUsersById = catchAsync(async (req, res, next) => {
  // Tambahkan log ini untuk inspect isi parameter yang masuk
  console.log("=== DEBUG BACKEND GET USER BY ID ===");
  console.log("req.params.user_id yang diterima:", req.params.user_id);
  console.log("Tipe data:", typeof req.params.user_id);

  const user = await getUserByIdService(req.params.user_id);
  sendSuccess(res, { message: MESSAGES.SUCCESS, data: user });
});

export const getMe = catchAsync(async (req, res) => {
  // Mengambil profile user yang sedang login via token autentikasi middleware
  const userId = req.user?.user_id; 
  const user = await getUserByIdService(userId);
  sendSuccess(res, { message: MESSAGES.SUCCESS, data: user });
});

export const getUsersByEmail = catchAsync(async (req, res) => {
  // Mengambil data user berdasarkan parameter email (/users/email/:email)
  const user = await getUserByEmailService(req.params.email);
  sendSuccess(res, { message: MESSAGES.SUCCESS, data: user });
});

export const createUser = catchAsync(async (req, res) => {
  const created = await createUserService(req.body);
  
  sendSuccess(res, {
    statusCode: HTTP_STATUS.CREATED,
    message: MESSAGES.CREATED,
    data: created,
  });
});

export const updateUser = catchAsync(async (req, res) => {
  const updated = await updateUserService(req.params.user_id, req.body);
  
  sendSuccess(res, {
    statusCode: HTTP_STATUS.OK,
    message: MESSAGES.UPDATED,
    data: updated,
  });
});