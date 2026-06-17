import { sheetsConfig } from '../../config/sheets.js';
import { sheetsFetch } from './base.js';

const { url: SHEETS_URL, apiKey: SHEETS_API_KEY } = sheetsConfig.users;

// Helper untuk membungkus response standard kosong
const emptyResponse = () => ({ data: { rows: [] } });

/**
 * Mengambil data sesi dengan batasan limit agar backend tidak kelebihan beban.
 * Default mengambil 1000 sesi terakhir (asumsi sesi aktif berada di baris-baris terbaru).
 */
export async function getAllSessions(limit = 1000, offset = 0) {
  return sheetsFetch(SHEETS_URL, SHEETS_API_KEY, {
    action: 'read',
    sheet: 'Sessions',
    limit,
    offset,
  });
}

/**
 * Cari session aktif berdasarkan refresh_token_hash.
 * Batasi pencarian pada 1000 data sesi terbaru.
 */
export async function getActiveSessionByTokenHash(refreshTokenHash) {
  if (!refreshTokenHash) return emptyResponse();

  const data = await getAllSessions(1000, 0);
  const rows = data?.data?.rows || [];

  const now = new Date();
  const session = rows.find(
    (s) =>
      s.refresh_token === refreshTokenHash &&
      s.expires_at && new Date(s.expires_at) > now &&
      !s.revoked_at,
  );

  return { data: { rows: session ? [session] : [] } };
}

/**
 * Ambil semua session aktif milik satu user (untuk logoutAll).
 */
export async function getActiveSessionsByUserId(userId) {
  if (!userId) return emptyResponse();

  const data = await getAllSessions(1000, 0);
  const rows = data?.data?.rows || [];

  const now = new Date();
  const sessions = rows.filter(
    (s) =>
      String(s.user_id) === String(userId) &&
      s.expires_at && new Date(s.expires_at) > now &&
      !s.revoked_at,
  );

  return { data: { rows: sessions } };
}

export async function createSession(sessionData) {
  return sheetsFetch(SHEETS_URL, SHEETS_API_KEY, {
    action: 'create',
    sheet: 'Sessions',
    data: sessionData,
  });
}

/**
 * Revoke satu session berdasarkan refresh_token_hash.
 */
export async function revokeSessionByTokenHash(refreshTokenHash) {
  return sheetsFetch(SHEETS_URL, SHEETS_API_KEY, {
    action: 'update',
    sheet: 'Sessions',
    searchKey: 'refresh_token',
    searchValue: refreshTokenHash,
    data: { revoked_at: new Date().toISOString() },
  });
}

/**
 * Revoke semua session aktif milik satu user (untuk logoutAll).
 */
export async function revokeAllSessionsByUserId(userId) {
  return sheetsFetch(SHEETS_URL, SHEETS_API_KEY, {
    action: 'update', 
    sheet: 'Sessions',
    searchKey: 'user_id',
    searchValue: userId,
    data: { revoked_at: new Date().toISOString() },
  });
}

/**
 * Menyimpan data login sukses secara atomik di Apps Script
 */
export async function saveLoginSuccessSheets(userId, sessionData) {
  return sheetsFetch(SHEETS_URL, SHEETS_API_KEY, {
    action: 'login_success',
    sheet: 'Sessions', 
    userId,
    sessionData,
  });
}

/**
 * Melakukan rotasi session token lama ke token baru secara aman
 */
export async function rotateSessionSheets(oldTokenHash, newSessionData) {
  return sheetsFetch(SHEETS_URL, SHEETS_API_KEY, {
    action: 'refresh_session_rotation',
    sheet: 'Sessions',
    oldTokenHash,
    newSessionData,
  });
}