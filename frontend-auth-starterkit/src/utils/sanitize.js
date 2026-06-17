export function sanitizeString(value) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/[<>"'`]/g, ""); // strip karakter berbahaya
}

export function sanitizeNumber(value) {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}

export function sanitizePayload(payload) {
  return Object.fromEntries(
    Object.entries(payload).map(([key, val]) => [
      key,
      typeof val === "number" ? sanitizeNumber(val) : sanitizeString(val),
    ])
  );
}