export const corsConfig = {
  origin: (origin, callback) => {
    const allowed = process.env.CORS_ORIGINS?.split(',').map(o => o.trim()) || [];

    // izinkan request tanpa origin (Postman, server-to-server)
    if (!origin || allowed.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,              // wajib untuk cookie cross-origin
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
};