import { api } from "./client.js";

const BASE = "/api/users";

export const usersApi = {
  me(config = {}) {
    return api.get(`${BASE}/me`, null, config);
  },

  ga: 
  {
    getAllUsers(params = {}, { serverCookie } = {}) {
      return api.get(`${BASE}/ga`, params, { serverCookie });
    },
    getUserById(userId, { serverCookie } = {}) {
      return api.get(`${BASE}/ga/${userId}`, null, { serverCookie });
    },
  }

};
