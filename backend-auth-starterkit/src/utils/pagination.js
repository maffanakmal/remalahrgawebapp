export function getPagination(pageQuery, limitQuery) {
  const page = Math.max(parseInt(pageQuery) || 1, 1);
  const limit = Math.min(parseInt(limitQuery) || 10, 100);

  // Perhitungan dasar
  const offset = (page - 1) * limit; // 💡 Tambahkan ini untuk Google Sheets!
  
  const from = offset;
  const to = from + limit - 1; // Untuk kebutuhan Supabase kelak

  return { page, limit, offset, from, to };
}

export function getPaginationMeta({ page, limit, total }) {
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}