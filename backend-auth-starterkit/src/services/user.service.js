import { AppError } from '../utils/index.js';
import { HTTP_STATUS, MESSAGES } from '../constants/index.js';
import {
  getAllUsers as getAllUsersRepo,
  getUserByEmail as getUserByEmailRepo,
  getUserById as getUserByIdRepo,
  getUserByUsername as getUserByUsernameRepo,
  createUser as createUserRepo,
  updateUser as updateUserRepo
} from '../repositories/sheets/users.repository.js';

// Helper untuk standarisasi format list response user
const formatListResponse = (response) => {
  const rawRows = response?.data?.rows || [];
  // Otomatis membuang password untuk semua user di dalam list
  const cleanRows = rawRows.map(({ password, ...user }) => user);
  
  return {
    rows: cleanRows,
    total: response?.data?.total || cleanRows.length
  };
};

// ── Users Service ─────────────────────────────────────────────────────────────

export const getAllUsersService = async (limit, offset) => {
  // Meneruskan parameter limit dan offset demi skalabilitas data
  const response = await getAllUsersRepo(limit, offset);
  return formatListResponse(response);
};

export const getUserByIdService = async (userId) => {
  if (!userId) {
    throw new AppError('User ID wajib diisi', HTTP_STATUS.BAD_REQUEST);
  }

  const response = await getUserByIdRepo(userId);
  const user = response?.data?.rows?.[0]; // PERBAIKAN: Ekstrak dari indeks array pertama

  if (!user) {
    throw new AppError(MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND, 'USER_NOT_FOUND');
  }

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const getUserByEmailService = async (email) => {
  if (!email) {
    throw new AppError('Email wajib diisi', HTTP_STATUS.BAD_REQUEST);
  }

  const response = await getUserByEmailRepo(email);
  const user = response?.data?.rows?.[0];

  if (!user) {
    throw new AppError(MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND, 'USER_NOT_FOUND');
  }

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const createUserService = async (userData) => {
  if (!userData?.email || !userData?.username) {
    throw new AppError('Email dan Username wajib diisi', HTTP_STATUS.BAD_REQUEST);
  }

  // 1. Cek duplikasi email secara aman lewat ekstrak rows
  const emailCheck = await getUserByEmailRepo(userData.email);
  if (emailCheck?.data?.rows?.[0]) {
    throw new AppError(MESSAGES.ALREADY_EXISTS, HTTP_STATUS.CONFLICT, 'EMAIL_ALREADY_EXISTS');
  }

  // 2. Cek duplikasi username
  const usernameCheck = await getUserByUsernameRepo(userData.username);
  if (usernameCheck?.data?.rows?.[0]) {
    throw new AppError(MESSAGES.ALREADY_EXISTS, HTTP_STATUS.CONFLICT, 'USERNAME_ALREADY_EXISTS');
  }

  // 3. Simpan user baru ke Google Sheets
  const response = await createUserRepo(userData);
  
  // Asumsi response create langsung mengembalikan objek data user baru yang dibuat
  const newUser = response?.data;
  if (!newUser) {
    throw new AppError('Gagal membuat user baru', HTTP_STATUS.INTERNAL_ERROR);
  }

  const { password, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

export const updateUserService = async (userId, updateData) => {
  if (!userId) {
    throw new AppError('User ID wajib diisi', HTTP_STATUS.BAD_REQUEST);
  }

  // 1. Pastikan user exist sebelum melakukan pembaruan data
  const userCheck = await getUserByIdRepo(userId);
  if (!userCheck?.data?.rows?.[0]) {
    throw new AppError(MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND, 'USER_NOT_FOUND');
  }

  // 2. Eksekusi update ke Google Sheets
  const response = await updateUserRepo(userId, updateData);
  const updatedUser = response?.data;

  if (!updatedUser) {
    throw new AppError('Gagal memperbarui data user', HTTP_STATUS.INTERNAL_ERROR);
  }

  const { password, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
};