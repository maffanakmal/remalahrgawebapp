import { api, resetAuthState } from "./client.js";

const AUTH_BASE = "/api/auth";

export const authApi = {
  async login(email, password, rememberMe = false) {
    const response = await api.post(`${AUTH_BASE}/login`, {
      email,
      password,
      rememberMe,
    });

    // Reset flag agar auth:expired bisa ter-emit lagi jika sesi berikutnya expired
    resetAuthState();

    return response;
  },

  register(username, email, password) {
    return api.post(`${AUTH_BASE}/register`, {
      username,
      email,
      password,
    });
  },

  refresh(config = {}) {
    return api.post(`${AUTH_BASE}/refresh`, {}, config);
  },

  logout(config = {}) {
    return api.post(`${AUTH_BASE}/logout`, {}, config);
  },

  logoutAll(config = {}) {
    return api.post(`${AUTH_BASE}/logout-all`, {}, config);
  },
};