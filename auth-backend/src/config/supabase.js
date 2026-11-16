const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

const baseOptions = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } };

// A NEW client per request, so one user's session never leaks into another request.
// Anon client: sign up / sign in / refresh / verify tokens.
const createAnonClient = () => createClient(env.supabaseUrl, env.supabaseAnonKey, baseOptions);

// User-scoped client: anon key + the caller's access token.
// Database queries run AS that user, so Row Level Security is enforced.
const createUserClient = (accessToken) =>
  createClient(env.supabaseUrl, env.supabaseAnonKey, {
    ...baseOptions,
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

// Admin client (service role). Used ONLY to revoke a session on logout. Never for profile data.
const createAdminClient = () => createClient(env.supabaseUrl, env.supabaseServiceRoleKey, baseOptions);

module.exports = { createAnonClient, createUserClient, createAdminClient };
