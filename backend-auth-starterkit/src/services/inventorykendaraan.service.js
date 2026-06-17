import { AppError } from "../utils/index.js";
import { HTTP_STATUS } from "../constants/index.js";
import { generateId } from "../utils/encryption.js";
import { getCache, setCache, clearCacheByPrefix } from "../utils/cache.js";

import {
  getAllKendaraanRepo,
  getKendaraanByPlateNumber as getKendaraanByPlateNumberRepo,
  getKendaraanDataTableRepo,
  getAllReportingKendaraan as getAllReportingKendaraanRepo,
  getReportingById as getReportingByIdRepo,
  getReportingByPlateNumber as getReportingByPlateNumberRepo,
  getReportingDataTableRepo,
  getAllKendaraanDataTableRepo,
  createReportingKendaraan as createReportingKendaraanRepo,
} from "../repositories/sheets/inventorykendaraan.repository.js";

import { getUserById as getUserByIdRepo } from "../repositories/sheets/users.repository.js";

// ── Cache TTL ────────────────────────────────────────────────────────────────

const TTL_VEHICLE_MASTER = 60 * 60_000; // 1 Jam
const TTL_REPORTING = 1 * 60_000;      // 1 Menit

// ── Helpers ──────────────────────────────────────────────────────────────────

const formatListResponse = (response) => ({
  rows: response?.data?.rows || [],
  total: response?.data?.total || response?.data?.rows?.length || 0,
});

// ── Kendaraan ────────────────────────────────────────────────────────────────

/**
 * Mengambil semua data kendaraan tanpa batasan limit, offset, dan search.
 * Sangat cocok untuk sinkronisasi data menyeluruh atau dropdown di Astro.
 */
export const getAllKendaraanService = async () => {
  const cacheKey = "vehicles:master:all";
  const cached = getCache(cacheKey);

  if (cached) {
    return cached;
  }

  const response = await getAllKendaraanRepo();
  const result = formatListResponse(response);

  setCache(cacheKey, result, TTL_VEHICLE_MASTER);
  return result;
};

/**
 * Mengambil data kendaraan menggunakan server-side pagination, limit, dan search.
 * Digunakan khusus untuk komponen Datatable yang membutuhkan efisiensi data.
 */
export const getAllKendaraanDataTableService = async (limit, offset, search) => {
  const cacheKey = `vehicles:master:${limit}:${offset}:${JSON.stringify(search || {})}`;
  const cached = getCache(cacheKey);

  if (cached) {
    return cached;
  }

  const response = await getAllKendaraanDataTableRepo(limit, offset, search);
  const result = formatListResponse(response);

  setCache(cacheKey, result, TTL_VEHICLE_MASTER);
  return result;
};

/**
 * Mencari spesifik data kendaraan berdasarkan Plat Nomor.
 */
export const getKendaraanByPlateNumberService = async (plateNumber) => {
  if (!plateNumber) {
    throw new AppError("Plat Nomor wajib diisi", HTTP_STATUS.BAD_REQUEST);
  }

  const cleanPlate = plateNumber.trim().toUpperCase();
  const cacheKey = `vehicles:master:plate:${cleanPlate}`;
  const cached = getCache(cacheKey);

  if (cached) {
    return cached;
  }

  const response = await getKendaraanByPlateNumberRepo(cleanPlate);
  const kendaraan = response?.data?.rows?.[0];

  if (!kendaraan) {
    throw new AppError("Kendaraan tidak ditemukan", HTTP_STATUS.NOT_FOUND);
  }

  setCache(cacheKey, kendaraan, TTL_VEHICLE_MASTER);
  return kendaraan;
};

export const getKendaraanDataTableService = async (payload) => {
  return await getKendaraanDataTableRepo(payload);
};

// ── Reporting ────────────────────────────────────────────────────────────────

export const getAllReportingService = async (limit, offset, search) => {
  const cacheKey = `vehicles:reporting:${limit}:${offset}:${JSON.stringify(search || {})}`;
  const cached = getCache(cacheKey);

  if (cached) {
    return cached;
  }

  const response = await getAllReportingKendaraanRepo(limit, offset, search);
  const result = formatListResponse(response);

  setCache(cacheKey, result, TTL_REPORTING);
  return result;
};

export const getReportingByIdService = async (reportId) => {
  if (!reportId) {
    throw new AppError("Report ID wajib diisi", HTTP_STATUS.BAD_REQUEST);
  }

  const cacheKey = `vehicles:reporting:id:${reportId}`;
  const cached = getCache(cacheKey);

  if (cached) {
    return cached;
  }

  const response = await getReportingByIdRepo(reportId);
  const report = response?.data?.rows?.[0];

  if (!report) {
    throw new AppError("Data laporan tidak ditemukan", HTTP_STATUS.NOT_FOUND);
  }

  setCache(cacheKey, report, TTL_REPORTING);
  return report;
};

export const getReportingByPlateNumberService = async (plateNumber) => {
  if (!plateNumber) {
    throw new AppError("Plat Nomor wajib diisi", HTTP_STATUS.BAD_REQUEST);
  }

  const cleanPlate = plateNumber.trim().toUpperCase();
  const cacheKey = `vehicles:reporting:plate:${cleanPlate}`;
  const cached = getCache(cacheKey);

  if (cached) {
    return cached;
  }

  const response = await getReportingByPlateNumberRepo(cleanPlate);
  const reports = response?.data?.rows || [];

  setCache(cacheKey, reports, TTL_REPORTING);
  return reports;
};

export const getReportingDataTableService = async (payload) => {
  return await getReportingDataTableRepo(payload);
};

// ── Create Reporting ─────────────────────────────────────────────────────────

export const createReportingKendaraanService = async (dataReporting, userId) => {
  if (!userId) {
    throw new AppError("User tidak terautentikasi", HTTP_STATUS.UNAUTHORIZED);
  }

  const userResponse = await getUserByIdRepo(userId);
  const user = userResponse?.data?.rows?.[0];

  if (!user) {
    throw new AppError("User tidak ditemukan", HTTP_STATUS.NOT_FOUND);
  }

  if (!dataReporting) {
    throw new AppError("Data laporan tidak boleh kosong", HTTP_STATUS.BAD_REQUEST);
  }

  const {
    plate_number,
    vehicle_inventory_date,
    vehicle_color,
    vehicle_milage,
    equipment_detail,
    physical_condition,
  } = dataReporting;

  // Validasi Input Menyeluruh
  if (!plate_number) {
    throw new AppError("Plat Nomor wajib diisi", HTTP_STATUS.BAD_REQUEST);
  }
  if (!vehicle_inventory_date) {
    throw new AppError("Tanggal inventory wajib diisi", HTTP_STATUS.BAD_REQUEST);
  }
  if (!vehicle_color) {
    throw new AppError("Warna kendaraan wajib diisi", HTTP_STATUS.BAD_REQUEST);
  }
  if (vehicle_milage === undefined || vehicle_milage === null) {
    throw new AppError("KM kendaraan wajib diisi", HTTP_STATUS.BAD_REQUEST);
  }
  if (Number(vehicle_milage) < 0) {
    throw new AppError("KM kendaraan tidak boleh negatif", HTTP_STATUS.BAD_REQUEST);
  }
  if (!equipment_detail) {
    throw new AppError("Detail peralatan wajib diisi", HTTP_STATUS.BAD_REQUEST);
  }
  if (!physical_condition) {
    throw new AppError("Kondisi fisik wajib diisi", HTTP_STATUS.BAD_REQUEST);
  }

  // Memastikan kendaraan terdaftar sebelum membuat laporan
  await getKendaraanByPlateNumberService(plate_number);

  const response = await createReportingKendaraanRepo({
    report_id: generateId("RPT", 5),
    user_id: userId,
    plate_number: plate_number.trim().toUpperCase(),
    vehicle_inventory_date,
    vehicle_color,
    vehicle_milage,
    equipment_detail,
    physical_condition,
    created_at: new Date().toISOString(),
  });

  // Hapus semua cache laporan lama karena ada data baru masuk
  clearCacheByPrefix("vehicles:reporting:");

  return response?.data ?? null;
};