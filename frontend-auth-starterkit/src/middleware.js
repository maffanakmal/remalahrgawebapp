import { defineMiddleware } from "astro:middleware";
import { ROUTES } from "./constants/routes.js";

const ROLES = {
  ADMIN: "ADMIN",
  USER: "USER",
  GA: "GA",
  HR: "HR",
  WAREK3: "WAREK3",
  DIREKTUR: "DIREKTUR",
};

const ROLE_ROUTES_MAPPING = {
  [ROUTES.BerandaGA.path]: ROLES.GA,
  [ROUTES.BerandaHR.path]: ROLES.HR,
};

const PUBLIC_ROUTES = new Set([
  ROUTES.Home.path,
  ROUTES.Login.path,
  ROUTES.Register.path,
  ROUTES.Forms.children.BelanjaBulanan.path,
]);

const AUTH_ROUTES = new Set([
  ROUTES.Login.path,
  ROUTES.Register.path,
]);

function getPayloadFromToken(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function getRoleFromToken(token) {
  const payload = getPayloadFromToken(token);

  return payload?.role?.toUpperCase() ?? null;
}

function isTokenExpired(token) {
  const payload = getPayloadFromToken(token);

  if (!payload?.exp) {
    return true;
  }

  return payload.exp * 1000 < Date.now();
}

function getDashboardByRole(role) {
  switch (role) {
    case ROLES.GA:
      return ROUTES.BerandaGA.path;

    case ROLES.HR:
      return ROUTES.BerandaHR.path;

    default:
      return ROUTES.Home.path;
  }
}

export const onRequest = defineMiddleware(
  async (context, next) => {
    const pathname = context.url.pathname;

    if (
      pathname.startsWith("/_astro") ||
      pathname.startsWith("/assets") ||
      pathname === "/favicon.ico" ||
      pathname.startsWith("/api")
    ) {
      return next();
    }

    const accessToken =
      context.cookies.get("access_token")?.value;

    const isPublic = PUBLIC_ROUTES.has(pathname);
    const isAuthRoute = AUTH_ROUTES.has(pathname);

    if (!accessToken) {
      if (!isPublic) {
        return context.redirect(
          ROUTES.Login.path
        );
      }

      return next();
    }

    const isExpired =
      isTokenExpired(accessToken);

    if (isExpired) {

      context.cookies.delete("access_token");

      if (isAuthRoute) {
        return next();
      }

      return context.redirect(
        ROUTES.Login.path
      );
    }

    const userRole =
      getRoleFromToken(accessToken);

    if (isAuthRoute) {
      return context.redirect(
        getDashboardByRole(userRole)
      );
    }

    const matchedPrefix = Object.keys(
      ROLE_ROUTES_MAPPING
    ).find(
      (prefix) =>
        pathname === prefix ||
        pathname.startsWith(prefix + "/")
    );

    if (matchedPrefix) {
      const requiredRole =
        ROLE_ROUTES_MAPPING[matchedPrefix];

      if (userRole !== requiredRole) {
        return context.redirect(
          getDashboardByRole(userRole)
        );
      }
    }

    return next();
  }
);
