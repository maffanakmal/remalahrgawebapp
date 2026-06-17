export const databaseConfig = {
  supabase: {
    url: process.env.SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    anonKey: process.env.SUPABASE_ANON_KEY,
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
};