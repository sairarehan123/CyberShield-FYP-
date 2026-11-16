require('dotenv').config();

const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];
const missing = required.filter((k) => !process.env[k] || process.env[k].startsWith('your-'));

if (missing.length) {
  // Print only the NAMES of missing variables, never any values.
  console.error(`Missing or placeholder environment variables: ${missing.join(', ')}`);
  console.error('Copy .env.example to .env and fill in your Supabase values.');
  process.exit(1);
}

module.exports = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  corsOrigins: (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
};
