import { catchAsync, sendSuccess } from "../utils/index.js";
import { HTTP_STATUS, MESSAGES } from "../constants/index.js";
import { getPagination, getPaginationMeta } from "../utils/pagination.js";

import {
  getAllKendaraanService,
  getAllKendaraanDataTableService,
  getKendaraanByPlateNumberService,
  getKendaraanDataTableService,
  getReportingByIdService,
  getReportingByPlateNumberService,
  getReportingDataTableService,
  createReportingKendaraanService,
} from "../services/inventorykendaraan.service.js";

// ── Kendaraan ────────────────────────────────────────────────────────────────

/**
 * Mengambil semua data kendaraan tanpa batasan (Tanpa limit & offset).
 * Sangat cocok digunakan untuk dropdown list atau komponen statis di Astro.
 */
export const getAllKendaraan = catchAsync(async (req, res) => {
  const { rows, total } = await getAllKendaraanService();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: MESSAGES.SUCCESS,
    data: rows,
    total,
  });
});

/**
 * Mengambil data kendaraan dengan pagination biasa (Page & Limit standar).
 */
export const getAllKendaraanPaginated = catchAsync(async (req, res) => {
  const { page, limit, offset } = getPagination(
    req.query.page,
    req.query.limit
  );

  // Menggunakan service DataTable yang menerima limit, offset, dan search objek kosong
  const { rows, total } = await getAllKendaraanDataTableService(limit, offset, {});

  const meta = getPaginationMeta({
    page,
    limit,
    total,
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: MESSAGES.SUCCESS,
    data: rows,
    meta,
  });
});

/**
 * Mengambil spesifik data kendaraan berdasarkan Plat Nomor.
 */
export const getKendaraanByPlateNumber = catchAsync(async (req, res) => {
  const kendaraan = await getKendaraanByPlateNumberService(
    req.params.plate_number
  );

  sendSuccess(res, {
    message: MESSAGES.SUCCESS,
    data: kendaraan,
  });
});

/**
 * SSR DataTable Kendaraan (Format Server-Side JQuery DataTables).
 * Menggunakan draw, start, length, dan search[value].
 */
export const getAllKendaraanDataTable = catchAsync(async (req, res) => {
  const result = await getKendaraanDataTableService({
    draw: Number(req.query.draw) || 1,
    start: Number(req.query.start) || 0,
    length: Number(req.query.length) || 10,
    search: {
      value: req.query["search[value]"] || "",
    },
    order: [
      {
        column: req.query["order[0][column]"] || 0,
        dir: req.query["order[0][dir]"] || "desc",
      },
    ],
  });

  res.status(HTTP_STATUS.OK).json(result);
});

// ── Reporting ────────────────────────────────────────────────────────────────

/**
 * SSR DataTable Reporting (Format Server-Side JQuery DataTables).
 */
export const getAllReporting = catchAsync(async (req, res) => {
  const result = await getReportingDataTableService({
    draw: Number(req.query.draw) || 1,
    start: Number(req.query.start) || 0,
    length: Number(req.query.length) || 10,
    search: {
      value: req.query["search[value]"] || "",
    },
    order: [
      {
        column: req.query["order[0][column]"] || 0,
        dir: req.query["order[0][dir]"] || "desc",
      },
    ],
  });

  res.status(HTTP_STATUS.OK).json(result);
});

/**
 * Mengambil detail laporan berdasarkan Report ID.
 */
export const getReportingById = catchAsync(async (req, res) => {
  const report = await getReportingByIdService(req.params.report_id);

  sendSuccess(res, {
    message: MESSAGES.SUCCESS,
    data: report,
  });
});

/**
 * Mengambil daftar laporan berdasarkan Plat Nomor Kendaraan.
 */
export const getReportingByPlateNumber = catchAsync(async (req, res) => {
  const reports = await getReportingByPlateNumberService(
    req.params.plate_number
  );

  sendSuccess(res, {
    message: MESSAGES.SUCCESS,
    data: reports,
  });
});

// ── Create ───────────────────────────────────────────────────────────────────

/**
 * Membuat data laporan inventory kendaraan baru.
 */
export const createReportingKendaraan = catchAsync(async (req, res) => {
  const created = await createReportingKendaraanService(
    req.body,
    req.user?.user_id
  );

  sendSuccess(res, {
    statusCode: HTTP_STATUS.CREATED,
    message: MESSAGES.CREATED,
    data: created,
  });
});