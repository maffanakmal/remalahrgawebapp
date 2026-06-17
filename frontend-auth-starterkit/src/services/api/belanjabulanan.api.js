import { api } from "./client.js";

// Pastikan prefix ini sesuai dengan app.use('/api/belanjabulanan', ...) di server.js backend Anda
const BASE = "/api/belanjabulanan";

export const belanjaBulananApi = {
  // ── Public / User Endpoints ────────────────────────────────────────────────
  
  getAllLocations(params = {}, { serverCookie } = {}) {
    // params bisa berisi { page, limit }
    return api.get(`${BASE}/locations`, params, { serverCookie });
  },

  getAllStocks(params = {}, { serverCookie } = {}) {
    return api.get(`${BASE}/stocks`, params, { serverCookie });
  },

  getStockById(stockId, { serverCookie } = {}) {
    return api.get(`${BASE}/stocks/${stockId}`, null, { serverCookie });
  },

  getStockByLocationId(locationId, { serverCookie } = {}) {
    return api.get(`${BASE}/stocks/by-location/${locationId}`, null, { serverCookie });
  },

  getAllTransactions(params = {}, { serverCookie } = {}) {
    return api.get(`${BASE}/transactions`, params, { serverCookie });
  },

  getTransactionById(transactionId, { serverCookie } = {}) {
    return api.get(`${BASE}/transactions/${transactionId}`, null, { serverCookie });
  },

  updateTransaction(transactionId, payload) {
    return api.patch(`${BASE}/transactions/${transactionId}`, payload);
  },

  createTransaction(payload) {
    return api.post(`${BASE}/transactions`, payload);
  },

  // ── GA Only Endpoints (Namespaced) ─────────────────────────────────────────
  ga: {
    getAllLocations(params = {}, { serverCookie } = {}) {
      // 💡 Diperbaiki ke rute /ga/locations
      return api.get(`${BASE}/ga/locations`, params, { serverCookie });
    },

    getLocationById(locationId, { serverCookie } = {}) {
      return api.get(`${BASE}/ga/locations/${locationId}`, null, { serverCookie });
    },

    getAllStocks(params = {}, { serverCookie } = {}) {
      return api.get(`${BASE}/ga/stocks`, params, { serverCookie });
    },

    getStockById(stockId, { serverCookie } = {}) {
      return api.get(`${BASE}/ga/stocks/${stockId}`, null, { serverCookie });
    },

    getStockByLocationId(locationId, { serverCookie } = {}) {
      return api.get(`${BASE}/ga/stocks/by-location/${locationId}`, null, { serverCookie });
    },

    updateStock(stockId, payload) {
      return api.patch(`${BASE}/ga/stocks/${stockId}`, payload);
    },

    getAllTransactions(params = {}, { serverCookie } = {}) {
      // Menerima params untuk dikirim sebagai ?page=X&limit=Y
      return api.get(`${BASE}/ga/transactions`, params, { serverCookie });
    },

    getTransactionById(transactionId, { serverCookie } = {}) {
      return api.get(`${BASE}/ga/transactions/${transactionId}`, null, { serverCookie });
    },

    updateTransaction(transactionId, payload) {
      return api.patch(`${BASE}/ga/transactions/${transactionId}`, payload);
    },

    createTransaction(payload) {
      return api.post(`${BASE}/ga/transactions`, payload);
    },
  },
};