import { AppError } from "../utils/index.js";
import { HTTP_STATUS, MESSAGES } from "../constants/index.js";
import { generateId } from "../utils/encryption.js";
import { getCache, setCache, clearCacheByPrefix } from "../utils/cache.js";

import {
  getAllLocation as getAllLocationRepo,
  getLocationById as getLocationByIdRepo,
  getAllStock as getAllStockRepo,
  getStockById as getStockByIdRepo,
  getStockByLocationId as getStockByLocationIdRepo,
  getAllTransaction as getAllTransactionRepo,
  getTransactionById as getTransactionByIdRepo,
  getTransactionDataTableRepo,
  getStockDataTableRepo,
  updateTransaction as updateTransactionRepo,
  updateStock as updateStockRepo,
  bulkCreateTransactionRepo,
} from "../repositories/sheets/belanjabulanan.repository.js";

// ── TTL Config ───────────────────────────────────────────────────────────────
const TTL_LOCATION = 30 * 60_000; // 30 menit (jarang berubah)
const TTL_STOCK = 2 * 60_000; // 2 menit (sering berubah karena transaksi)
const TTL_TRANSACTION = 30_000; // 30 detik (paling sering berubah)

// ── Whitelist kolom yang boleh di-search per entity ─────────────────────────
// Mencegah round-trip sia-sia ke Apps Script saat searchColumn salah/typo,
// dan mencegah eksposur nama kolom internal yang tidak relevan untuk search.
const SEARCHABLE_COLUMNS = {
  transaction: ["product_name", "status_request", "location_name"],
  stock: ["product_name"],
};

/**
 * Validasi & normalisasi parameter search terhadap whitelist kolom.
 * Mengembalikan `undefined` jika search tidak diberikan / value kosong,
 * atau `{ column, value }` jika valid.
 *
 * @throws {AppError} jika column diberikan tapi tidak ada di whitelist
 */
const buildSearchParam = (entity, column, value) => {
  if (value === undefined || value === null || value === "") return undefined;
  if (!column) return undefined;

  const allowed = SEARCHABLE_COLUMNS[entity] || [];
  if (!allowed.includes(column)) {
    throw new AppError(
      `Kolom pencarian '${column}' tidak didukung. Gunakan salah satu: ${allowed.join(", ")}`,
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  return { column, value: String(value) };
};

/**
 * Bangun suffix cache key dari parameter search.
 * Mengembalikan string kosong jika tidak ada search (agar key tetap
 * backward-compatible dengan cache lama saat tidak ada search).
 */
const searchCacheKeySuffix = (search) =>
  search ? `:${search.column}:${search.value}` : "";

// Helper untuk membungkus standarisasi data rows
const formatListResponse = (response) => ({
  rows: response?.data?.rows || [],
  // Gunakan nullish coalescing (bukan ||) agar total: 0 (hasil filter kosong)
  // tidak ter-override oleh fallback rows.length.
  total: response?.data?.total ?? response?.data?.rows?.length ?? 0,
  offset: response?.data?.offset ?? 0,
  limit: response?.data?.limit ?? 0,
});

// ── Location ──────────────────────────────────────────────────────────────────

export const getAllLocationService = async (limit, offset) => {
  const cacheKey = `locations:all:${limit ?? "all"}:${offset ?? 0}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const response = await getAllLocationRepo(limit, offset);
  const result = formatListResponse(response);

  setCache(cacheKey, result, TTL_LOCATION);
  return result;
};

export const getLocationByIdService = async (locationId) => {
  if (!locationId) {
    throw new AppError("Location ID wajib diisi", HTTP_STATUS.BAD_REQUEST);
  }

  const cacheKey = `locations:id:${locationId}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const response = await getLocationByIdRepo(locationId);
  const location = response?.data?.rows?.[0];

  if (!location) {
    throw new AppError(MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  setCache(cacheKey, location, TTL_LOCATION);
  return location;
};

// ── Stock ─────────────────────────────────────────────────────────────────────

/**
 * Mengambil daftar stok dengan SSR pagination & search opsional.
 *
 * @param {number} limit
 * @param {number} offset
 * @param {{ column?: string, value?: string }} [searchInput] - opsional,
 *   `column` harus termasuk dalam SEARCHABLE_COLUMNS.stock (misal 'product_name').
 * @throws {AppError} jika searchInput.column tidak didukung
 */
export const getAllStockService = async (limit, offset, searchInput) => {
  const search = buildSearchParam(
    "stock",
    searchInput?.column,
    searchInput?.value,
  );

  const cacheKey = `stocks:all:${limit ?? "all"}:${offset ?? 0}${searchCacheKeySuffix(search)}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const response = await getAllStockRepo(limit, offset, search);
  const result = formatListResponse(response);

  setCache(cacheKey, result, TTL_STOCK);
  return result;
};

export const getStockByIdService = async (stockId) => {
  if (!stockId) {
    throw new AppError("Stock ID wajib diisi", HTTP_STATUS.BAD_REQUEST);
  }

  const cacheKey = `stocks:id:${stockId}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const response = await getStockByIdRepo(stockId);
  const stock = response?.data?.rows?.[0];

  if (!stock) {
    throw new AppError(MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  setCache(cacheKey, stock, TTL_STOCK);
  return stock;
};

export const getStockByLocationIdService = async (locationId) => {
  if (!locationId) {
    throw new AppError("Location ID wajib diisi", HTTP_STATUS.BAD_REQUEST);
  }

  const cacheKey = `stocks:location:${locationId}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const response = await getStockByLocationIdRepo(locationId);
  const result = response?.data?.rows || [];

  setCache(cacheKey, result, TTL_STOCK);
  return result;
};

// ── Transaction ───────────────────────────────────────────────────────────────

/**
 * Mengambil daftar transaksi dengan SSR pagination & search opsional.
 *
 * @param {number} limit
 * @param {number} offset
 * @param {{ column?: string, value?: string }} [searchInput] - opsional,
 *   `column` harus termasuk dalam SEARCHABLE_COLUMNS.transaction
 *   (misal 'product_name', 'status_request', 'location_name').
 * @throws {AppError} jika searchInput.column tidak didukung
 */
export const getAllTransactionService = async (limit, offset, searchInput) => {
  const search = buildSearchParam(
    "transaction",
    searchInput?.column,
    searchInput?.value,
  );

  const cacheKey = `transactions:all:${limit ?? "all"}:${offset ?? 0}${searchCacheKeySuffix(search)}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const response = await getAllTransactionRepo(limit, offset, search);
  const result = formatListResponse(response);

  setCache(cacheKey, result, TTL_TRANSACTION);
  return result;
};

export const getTransactionByIdService = async (transactionId) => {
  if (!transactionId) {
    throw new AppError("Transaction ID wajib diisi", HTTP_STATUS.BAD_REQUEST);
  }

  const cacheKey = `transactions:id:${transactionId}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const response = await getTransactionByIdRepo(transactionId);
  const transaction = response?.data?.rows?.[0];

  if (!transaction) {
    throw new AppError(MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  setCache(cacheKey, transaction, TTL_TRANSACTION);
  return transaction;
};

export const updateTransactionService = async (transactionId, payload) => {
  if (!transactionId) {
    throw new AppError("Transaction ID wajib diisi", HTTP_STATUS.BAD_REQUEST);
  }

  if (!payload || !Object.keys(payload).length) {
    throw new AppError("Payload tidak boleh kosong", HTTP_STATUS.BAD_REQUEST);
  }

  const response = await getTransactionByIdRepo(transactionId);
  if (!response?.data?.rows?.[0]) {
    throw new AppError(MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  const result = await updateTransactionRepo(transactionId, payload);
  clearCacheByPrefix("transactions:");

  return result;
};

export const updateStockService = async (stockId, payload) => {
  if (!stockId) {
    throw new AppError("Stock ID wajib diisi", HTTP_STATUS.BAD_REQUEST);
  }

  if (!payload || !Object.keys(payload).length) {
    throw new AppError("Payload tidak boleh kosong", HTTP_STATUS.BAD_REQUEST);
  }

  const response = await getStockByIdRepo(stockId);
  if (!response?.data?.rows?.[0]) {
    throw new AppError(MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  const result = await updateStockRepo(stockId, payload);
  clearCacheByPrefix("stocks:");

  return result;
};

// ── Create Belanja Bulanan ────────────────────────────────────────────────────

export const createBelanjaBulananService = async (dataBelanja, userId) => {
  if (!dataBelanja) {
    throw new AppError(
      "Data belanja tidak boleh kosong",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const { location_id, items, notes } = dataBelanja;

  if (!location_id) {
    throw new AppError("Location wajib diisi", HTTP_STATUS.BAD_REQUEST);
  }

  if (!items?.length) {
    throw new AppError("Item belanja wajib diisi", HTTP_STATUS.BAD_REQUEST);
  }

  if (items.length > 5) {
    throw new AppError("Maksimal 5 item belanja", HTTP_STATUS.BAD_REQUEST);
  }

  // 1. Validasi field tiap item secara Synchronous
  for (const [index, item] of items.entries()) {
    const label = `Item ${index + 1}`;

    if (!item.stock_id && !item.manual_item_name?.trim()) {
      throw new AppError(
        `${label}: Item wajib dipilih atau diisi manual`,
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    if (item.qty === undefined || item.qty === null) {
      throw new AppError(
        `${label}: Jumlah wajib diisi`,
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    if (!Number.isInteger(item.qty)) {
      throw new AppError(
        `${label}: Jumlah harus bilangan bulat`,
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    if (item.qty < 1) {
      throw new AppError(`${label}: Jumlah minimal 1`, HTTP_STATUS.BAD_REQUEST);
    }
    if (item.qty > 999) {
      throw new AppError(
        `${label}: Jumlah maksimal 999`,
        HTTP_STATUS.BAD_REQUEST,
      );
    }
  }

  const stockIds = items
    .filter((item) => item.stock_id)
    .map((item) => item.stock_id);
  if (stockIds.length !== new Set(stockIds).size) {
    throw new AppError(
      "Terdapat item duplikat dalam pengajuan",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  // Validasi lokasi
  const location = await getLocationByIdRepo(location_id);

  if (!location?.data?.rows?.[0]) {
    throw new AppError("Lokasi tidak ditemukan", HTTP_STATUS.NOT_FOUND);
  }

  // Ambil seluruh stock sekaligus
  const stocks = await Promise.all(stockIds.map((id) => getStockByIdRepo(id)));

  const stockMap = new Map();

  stocks.forEach((stock) => {
    const row = stock?.data?.rows?.[0];

    if (row) {
      stockMap.set(String(row.stock_id), row);
    }
  });

  // Validasi stock
  for (const [index, item] of items.entries()) {
    if (!item.stock_id) continue;

    const stock = stockMap.get(String(item.stock_id));

    if (!stock) {
      throw new AppError(
        `Item ${index + 1}: Stock tidak ditemukan`,
        HTTP_STATUS.NOT_FOUND,
      );
    }

    const currentStock = Number(stock.current_stock ?? 0);

    if (item.qty > currentStock) {
      throw new AppError(
        `Item ${index + 1}: Stok tidak mencukupi`,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Opsional: pastikan stock milik lokasi yang sama
    if (String(stock.location_id) !== String(location_id)) {
      throw new AppError(
        `Item ${index + 1}: Stock tidak berada di lokasi yang dipilih`,
        HTTP_STATUS.BAD_REQUEST,
      );
    }
  }

  // 2. Format payload array data dengan penjamin keunikan ID baris (ditambah index milidetik)
  const timestampSeed = Date.now().toString().slice(-3);
  const formattedItems = items.map((item, idx) => ({
    ...item,
    transaction_id: generateId(`TRX${timestampSeed}${idx}`, 5),
  }));

  // 3. Eksekusi Single POST ke Google Apps Script Bulk Endpoint
  const response = await bulkCreateTransactionRepo({
    location_id,
    userId: userId ?? "User",
    notes: notes ?? null,
    items: formattedItems,
  });

  // Invalidasi cache terikat setelah mutasi data berhasil
  clearCacheByPrefix("transactions:");
  clearCacheByPrefix("stocks:");

  return response?.data ?? [];
};

export const getTransactionDataTableService =
  async payload => {

    const response =
      await getTransactionDataTableRepo(
        payload
      );

    return {
      draw:
        response.draw,

      recordsTotal:
        response.recordsTotal,

      recordsFiltered:
        response.recordsFiltered,

      data:
        response.data || []
    };
};

export const getStockDataTableService = async (payload) => {
  const response = await getStockDataTableRepo(payload);

  return {
    draw: response?.draw ?? payload.draw,

    rows: response?.data || [],

    total: response?.recordsTotal || 0,

    filteredTotal: response?.recordsFiltered || 0,
  };
};
