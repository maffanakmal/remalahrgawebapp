import { authApi } from '../services/api/auth.api.js';

let _user = null;
let _initialized = false;

const listeners = new Set();

function notify() {
  listeners.forEach((fn) =>
    fn({
      user: _user,
      initialized: _initialized,
      loggedIn: _user !== null,
    })
  );
}

export const authStore = {
  subscribe(fn) {
    listeners.add(fn);

    fn({
      user: _user,
      initialized: _initialized,
      loggedIn: _user !== null,
    });

    return () => listeners.delete(fn);
  },

  getUser() {
    return _user;
  },

  isLoggedIn() {
    return _user !== null;
  },

  isInitialized() {
    return _initialized;
  },

  async initialize() {
    try {
      const response =
        await authApi.me();

      _user =
        response?.data?.user ?? null;
    } catch {
      _user = null;
    } finally {
      _initialized = true;
      notify();
    }
  },

  async login(
    email,
    password,
    rememberMe = false
  ) {
    const response =
      await authApi.login(
        email,
        password,
        rememberMe
      );

    _user =
      response?.data?.user ?? null;

    notify();

    return response;
  },

  async register(
    username,
    email,
    password
  ) {
    return authApi.register(
      username,
      email,
      password
    );
  },

  async logout() {
    try {
      await authApi.logout();
    } finally {
      this.clear();
    }
  },

  async logoutAll() {
    try {
      await authApi.logoutAll();
    } finally {
      this.clear();
    }
  },

  setUser(user) {
    _user = user ?? null;
    notify();
  },

  clear() {
    _user = null;
    notify();
  },
};

window.addEventListener(
  'auth:expired',
  () => {
    authStore.clear();
  }
);