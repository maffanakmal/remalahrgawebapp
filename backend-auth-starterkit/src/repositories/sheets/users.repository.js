import { sheetsConfig } from '../../config/sheets.js';
import { sheetsFetch } from './base.js';

const { url: SHEETS_URL, apiKey: SHEETS_API_KEY } = sheetsConfig.users;

// Helper untuk membungkus response standard kosong
const emptyResponse = () => ({ data: { rows: [] } });

/**
 * Mengambil semua user dengan dukungan pagination bawaan (default limit 100)
 */
export async function getAllUsers(limit = 100, offset = 0) {
  return sheetsFetch(SHEETS_URL, SHEETS_API_KEY, {
    action: 'read',
    sheet: 'Users',
    limit,
    offset,
  });
}

/**
 * Abstraksi internal untuk mengoptimalkan pencarian data tunggal.
 * Mengembalikan format konsisten { data: { rows: [user] atau [] } }
 */
async function findUserByCriteria(predicate) {
  const response = await getAllUsers(1000, 0); 
  const rows = response?.data?.rows || [];
  
  const user = rows.find(predicate);
  return { data: { rows: user ? [user] : [] } };
}

export async function getUserByEmail(email) {
  if (!email) return emptyResponse();
  return findUserByCriteria((u) => String(u.email).toLowerCase() === String(email).toLowerCase());
}

export async function getUserByUsername(username) {
  if (!username) return emptyResponse();
  return findUserByCriteria((u) => String(u.username).toLowerCase() === String(username).toLowerCase());
}

export async function getUserById(userId) {
  if (!userId) return emptyResponse();
  return findUserByCriteria((u) => String(u.user_id).toString() === String(userId).toString());
}

export async function createUser(userData) {
  return sheetsFetch(SHEETS_URL, SHEETS_API_KEY, {
    action: 'create',
    sheet: 'Users',
    data: userData,
  });
}

export async function updateUser(userId, userData) {
  return sheetsFetch(SHEETS_URL, SHEETS_API_KEY, {
    action: 'update',
    sheet: 'Users',
    searchKey: 'user_id',
    searchValue: userId,
    data: userData,
  });
}

export async function deleteUser(userId) {
  return sheetsFetch(SHEETS_URL, SHEETS_API_KEY, {
    action: 'delete',
    sheet: 'Users',
    searchKey: 'user_id',
    searchValue: userId,
  });
}