import { sheetsConfig } from "../../config/sheets.js";
import { sheetsFetch } from "./base.js";

const { url: SHEETS_URL, apiKey: SHEETS_API_KEY } = sheetsConfig.inventoryKendaraan;

const emptyResponse = () => ({
  data: {
    rows: [],
    total: 0,
    offset: 0,
    limit: 0,
  },
});

// ── KENDARAAN (REPOSITORIES) ──────────────────────────────────────────────────

/**
 * Mengambil SEMUA data kendaraan tanpa batasan limit, offset, dan search.
 * Sesuai untuk diconsume langsung atau di-filter secara lokal di backend/Astro.
 */
export async function getAllKendaraanRepo() {
  const payload = {
    action: "read",
    sheet: "Master Data Vehicle",
    limit: 1000,
    offset: 0
  };

  return sheetsFetch(SHEETS_URL, SHEETS_API_KEY, payload);
}

/**
 * 2. Mengambil data kendaraan DENGAN limit, offset, dan search column.
 * Fungsi ini yang dicari oleh Service kamu di baris 14!
 */
export async function getAllKendaraanDataTableRepo(limit = 1000, offset = 0, search) {
  const payload = {
    action: "read",
    sheet: "Master Data Vehicle",
    limit,
    offset,
  };

  // Jika ada parameter pencarian spesifik dari service, masukkan ke payload
  if (search?.column && search?.value !== undefined && search?.value !== "") {
    payload.searchColumn = search.column;
    payload.search = search.value;
  }

  return sheetsFetch(SHEETS_URL, SHEETS_API_KEY, payload);
}

/**
 * Mengambil data spesifik berdasarkan Plate Number menggunakan data dari getAllKendaraanRepo
 */
export async function getKendaraanByPlateNumber(plateNumber) {
  if (!plateNumber) {
    return emptyResponse();
  }

  // Memanggil repo yang bersih tanpa limit/search parameter eksternal
  const response = await getAllKendaraanRepo();
  
  const kendaraan = response?.data?.rows?.filter(
    (k) => String(k.plate_number).toLowerCase() === String(plateNumber).toLowerCase()
  ) || [];

  return {
    data: {
      rows: kendaraan,
    },
  };
}

/**
 * Ini tetap dipertahankan JIKA datatable di frontend membutuhkan server-side pagination/search
 */
export async function getKendaraanDataTableRepo(payload) {
  return sheetsFetch(SHEETS_URL, SHEETS_API_KEY, {
    action: "read_datatable",
    sheet: "Master Data Vehicle",
    ...payload,
  });
}


// ── REPORTING (REPOSITORIES) ──────────────────────────────────────────────────

export async function getAllReportingKendaraan(limit = 1000, offset = 0, search) {
  const payload = {
    action: "read",
    sheet: "Reporting",
    limit,
    offset,
  };

  if (search?.column && search?.value !== undefined && search?.value !== "") {
    payload.searchColumn = search.column;
    payload.search = search.value;
  }

  return sheetsFetch(SHEETS_URL, SHEETS_API_KEY, payload);
}

export async function getReportingById(reportId) {
  if (!reportId) {
    return emptyResponse();
  }

  const data = await getAllReportingKendaraan(1000, 0);
  const report = data?.data?.rows?.find(
    (r) => String(r.report_id) === String(reportId)
  );

  return {
    data: {
      rows: report ? [report] : [],
    },
  };
}

export async function getReportingByPlateNumber(plateNumber) {
  if (!plateNumber) {
    return emptyResponse();
  }

  const data = await getAllReportingKendaraan(1000, 0, {
    column: "plate_number",
    value: plateNumber,
  });

  const reporting = data?.data?.rows?.filter(
    (r) => String(r.plate_number) === String(plateNumber)
  ) || [];

  return {
    data: {
      rows: reporting,
    },
  };
}

export async function getReportingDataTableRepo(payload) {
  return sheetsFetch(SHEETS_URL, SHEETS_API_KEY, {
    action: "read_datatable",
    sheet: "Reporting",
    ...payload,
  });
}

export async function createReportingKendaraan(dataReportingKendaraan) {
  return sheetsFetch(SHEETS_URL, SHEETS_API_KEY, {
    action: "create",
    sheet: "Reporting",
    data: dataReportingKendaraan,
  });
}

export async function updateReportingKendaraan(reportId, reportData) {
  return sheetsFetch(SHEETS_URL, SHEETS_API_KEY, {
    action: "update",
    sheet: "Reporting",
    searchKey: "report_id",
    searchValue: reportId,
    data: reportData,
  });
}

export async function deleteReportingKendaraan(reportId) {
  return sheetsFetch(SHEETS_URL, SHEETS_API_KEY, {
    action: "delete",
    sheet: "Reporting",
    searchKey: "report_id",
    searchValue: reportId,
  });
}