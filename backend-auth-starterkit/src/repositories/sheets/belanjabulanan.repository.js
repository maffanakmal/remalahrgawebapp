import { sheetsConfig } from '../../config/sheets.js';
import { sheetsFetch } from './base.js';

const { url: SHEETS_URL, apiKey: SHEETS_API_KEY } = sheetsConfig.belanjaBulanan;

// Helper untuk membungkus response standard kosong
const emptyResponse = () => ({ data: { rows: [], total: 0, offset: 0, limit: 0 } });

// ── Location ──────────────────────────────────────────────────────────────────

/**
 * Mengambil semua lokasi dengan dukungan pagination (default 100 baris)
 */
export async function getAllLocation(limit = 1000, offset = 0) {
  return sheetsFetch(SHEETS_URL, SHEETS_API_KEY, {
    action: 'read',
    sheet: 'Location',
    limit,
    offset,
  });
}

export async function getLocationById(locationId) {
  if (!locationId) return emptyResponse();

  // NOTE: Batasi pengambilan data untuk pencarian internal ID (max 500)
  const data = await getAllLocation(500, 0);
  const rows = data?.data?.rows || [];

  const location = rows.find((s) => String(s.location_id) === String(locationId));
  return { data: { rows: location ? [location] : [] } };
}

// ── Stock ─────────────────────────────────────────────────────────────────────

/**
 * Mengambil semua stok dengan dukungan SSR pagination & search.
 *
 * @param {number} limit - jumlah baris per halaman
 * @param {number} offset - offset baris (untuk pagination)
 * @param {{ column: string, value: string }} [search] - opsional, partial
 *   case-insensitive match pada kolom tertentu (misal product_name).
 *   Filter dilakukan di sisi Apps Script SEBELUM pagination, sehingga
 *   `total` pada response merepresentasikan jumlah hasil filter.
 */
export async function getAllStock(limit = 1000, offset = 0, search) {
  const payload = {
    action: 'read',
    sheet: 'Stock',
    limit,
    offset,
  };

  if (search?.column && search?.value !== undefined && search?.value !== '') {
    payload.searchColumn = search.column;
    payload.search = search.value;
  }

  return sheetsFetch(SHEETS_URL, SHEETS_API_KEY, payload);
}

export async function getStockById(stockId) {
  if (!stockId) return emptyResponse();

  const data = await getAllStock(1000, 0);
  const rows = data?.data?.rows || [];

  const stock = rows.find((s) => String(s.stock_id) === String(stockId));
  return { data: { rows: stock ? [stock] : [] } };
}

export async function getStockByLocationId(locationId) {
  if (!locationId) return emptyResponse();

  const data = await getAllStock(1000, 0);
  const rows = data?.data?.rows || [];

  const stocks = rows.filter((s) => String(s.location_id) === String(locationId));
  return { data: { rows: stocks } };
}

// ── Transaction ───────────────────────────────────────────────────────────────

/**
 * Mengambil semua transaksi belanja dengan dukungan SSR pagination & search.
 * WAJIB menggunakan pagination karena data ini akan terus membengkak.
 *
 * @param {number} limit - jumlah baris per halaman
 * @param {number} offset - offset baris (untuk pagination)
 * @param {{ column: string, value: string }} [search] - opsional, partial
 *   case-insensitive match pada kolom tertentu (misal product_name atau
 *   status_request). Filter dilakukan di sisi Apps Script SEBELUM
 *   pagination, sehingga `total` pada response merepresentasikan jumlah
 *   hasil filter (bukan total seluruh sheet) — penting untuk perhitungan
 *   jumlah halaman di SSR.
 */
export async function getAllTransaction(limit = 50, offset = 0, search) {
  const payload = {
    action: 'read',
    sheet: 'Transaction',
    limit,
    offset,
  };

  if (search?.column && search?.value !== undefined && search?.value !== '') {
    payload.searchColumn = search.column;
    payload.search = search.value;
  }

  return sheetsFetch(SHEETS_URL, SHEETS_API_KEY, payload);
}

export async function getTransactionById(transactionId) {
  if (!transactionId) return emptyResponse();

  // Ambil 1000 transaksi terbaru saja untuk pencarian ID demi menjaga performa
  const data = await getAllTransaction(1000, 0);
  const rows = data?.data?.rows || [];

  const transaction = rows.find((s) => String(s.transaction_id) === String(transactionId));
  return { data: { rows: transaction ? [transaction] : [] } };
}

export async function createTransaction(data) {
  return sheetsFetch(SHEETS_URL, SHEETS_API_KEY, {
    action: 'create',
    sheet: 'Transaction',
    data,
  });
}

export async function bulkCreateTransactionRepo(payload) {
  return sheetsFetch(SHEETS_URL, SHEETS_API_KEY, {
    action: 'bulk_create_transaction',
    sheet: 'Transaction', // Induk routing utama
    ...payload,
  });
}

export async function updateTransaction(transactionId, transactionData) {
  return sheetsFetch(SHEETS_URL, SHEETS_API_KEY, {
    action: 'update',
    sheet: 'Transaction',
    searchKey: 'transaction_id',
    searchValue: transactionId,
    data: transactionData,
  });
}

export async function updateStock(stockId, stockData) {
  return sheetsFetch(SHEETS_URL, SHEETS_API_KEY, {
    action: 'update',
    sheet: 'Stock',
    searchKey: 'stock_id',
    searchValue: stockId,
    data: stockData,
  });
}

export async function getTransactionDataTableRepo(
  payload
) {
  return sheetsFetch(
    SHEETS_URL,
    SHEETS_API_KEY,
    {
      action: "read_datatable",
      sheet: "Transaction",
      ...payload
    }
  );
}

export async function getStockDataTableRepo(payload) {
  return sheetsFetch(
    SHEETS_URL,
    SHEETS_API_KEY,
    {
      action: 'read_datatable',
      sheet: 'Stock',
      ...payload
    }
  );
}
