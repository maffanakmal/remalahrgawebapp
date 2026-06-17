import { api } from "./client.js";

const BASE = "/api/inventorykendaraan";

export const inventoryKendaraanApi = {
  ga: {
    getAllKendaraan({ serverCookie } = {}) {
      return api.get(`${BASE}/ga/kendaraan`, { serverCookie });
    },

    getKendaraanByPlateNumber(plateNumber, { serverCookie } = {}) {
      return api.get(`${BASE}/ga/kendaraan/search/${plateNumber}`, null, { serverCookie });
    },

    getAllReporting(params = {}, { serverCookie } = {}) {
      return api.get(`${BASE}/ga/reporting`, params, { serverCookie });
    },

    getReportingById(reportId, { serverCookie } = {}) {
      return api.get(`${BASE}/ga/reporting/${reportId}`, null, { serverCookie });
    },

    getReportingByPlateNumber(plateNumber, { serverCookie } = {}) {
      return api.get(`${BASE}/ga/reporting/search/${plateNumber}`, null, { serverCookie });
    },

    createReporting(payload) {
      return api.post(`${BASE}/ga/reporting`, payload);
    },
  },
};