const BASE_URL = import.meta.env.PUBLIC_BACKEND_URL ?? "http://localhost:3000";

let isRefreshing = false;
let refreshPromise = null;
let authExpiredEmitted = false;

function emitAuthExpired() {
  if (authExpiredEmitted) return;
  authExpiredEmitted = true;

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("auth:expired"));
  }
}

export function resetAuthState() {
  authExpiredEmitted = false;
}

async function refreshToken() {
  if (!refreshPromise) {
    refreshPromise = import("./auth.api.js")
      .then((m) => m.authApi.refresh())
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

function buildHeaders(options = {}, body = null) {
  const headers = { ...options.headers };

  if (!(body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
  }

  return headers;
}

async function parseResponse(response) {
  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") ?? "";
  let data = null;

  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    console.error("[API ERROR]", response.url, response.status, data);
    const error = new Error(data?.message || `Request failed (${response.status})`);
    error.status = response.status;
    error.code = data?.code;
    error.data = data;
    throw error;
  }

  return contentType.includes("application/json") ? data : response;
}

async function request(method, endpoint, body = null, queryParams = null, options = {}, retry = true) {
  let url = `${BASE_URL}${endpoint}`;

  if (queryParams && typeof queryParams === 'object' && Object.keys(queryParams).length > 0) {
    const searchParams = new URLSearchParams();

    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        searchParams.append(key, value);
      }
    });

    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const isServer = typeof window === "undefined";

  const config = {
    credentials: "include",
    ...options,
    method,
    headers: buildHeaders(options, body),
  };

  if (isServer && options.serverCookie) {
    config.headers["Cookie"] = options.serverCookie;
    delete config.credentials;
  }

  if (body !== null) {
    config.body = body instanceof FormData ? body : JSON.stringify(body);
  }

  const response = await fetch(url, config);

  const isAuthEndpoint =
    endpoint.includes("/auth/login") ||
    endpoint.includes("/auth/register") ||
    endpoint.includes("/auth/refresh");

  if (response.status === 401 && retry && !isAuthEndpoint && !isServer) {
    try {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          await refreshToken();
        } finally {
          isRefreshing = false;
        }
      } else if (refreshPromise) {
        await refreshPromise;
      }

      return request(method, endpoint, body, queryParams, options, false);
    } catch (error) {
      isRefreshing = false;
      emitAuthExpired();
      throw error;
    }
  }

  return parseResponse(response);
}

export const api = {
  get: (endpoint, query = null, options = {}) => request("GET", endpoint, null, query, options),
  post: (endpoint, body, query = null, options = {}) => request("POST", endpoint, body, query, options),
  put: (endpoint, body, query = null, options = {}) => request("PUT", endpoint, body, query, options),
  patch: (endpoint, body, query = null, options = {}) => request("PATCH", endpoint, body, query, options),
  delete: (endpoint, body = null, query = null, options = {}) => request("DELETE", endpoint, body, query, options),
};