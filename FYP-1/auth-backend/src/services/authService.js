const { createAnonClient, createAdminClient } = require('../config/supabase');
const { mapAuthError } = require('../utils/authErrors');
const profileService = require('./profileService');

const toApiSession = (session) =>
  session
    ? {
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        tokenType: session.token_type || 'bearer',
        expiresIn: session.expires_in,
        expiresAt: session.expires_at,
      }
    : null;

const register = async ({ name, email, password }) => {
  const supabase = createAnonClient();
  const cleanName = name.trim();

  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    // The database trigger (supabase/schema.sql) reads full_name and creates the profiles row.
    options: { data: { full_name: cleanName } },
  });
  if (error) throw mapAuthError(error, 'register');

  // With "Confirm email" ON, Supabase hides duplicates by returning a fake user with no identities.
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    throw mapAuthError({ code: 'user_already_exists' }, 'register');
  }

  return {
    user: { id: data.user.id, name: cleanName, email: data.user.email },
    session: toApiSession(data.session), // null when email confirmation is required
    requiresEmailConfirmation: !data.session,
  };
};

const login = async ({ email, password }) => {
  const supabase = createAnonClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
  if (error) throw mapAuthError(error, 'login');

  const user = { id: data.user.id, email: data.user.email };
  try {
    const profile = await profileService.getProfile(data.session.access_token, data.user.id);
    user.name = profile.name;
  } catch (e) {
    // A missing profile should not block login; GET /api/profile will report it.
  }
  return { user, session: toApiSession(data.session) };
};

const refresh = async (refreshToken) => {
  const supabase = createAnonClient();
  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
  if (error) throw mapAuthError(error, 'refresh');
  return { session: toApiSession(data.session) };
};

// Revokes ONLY the current device's session (scope 'local') using the admin API.
const logout = async (accessToken) => {
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.signOut(accessToken, 'local');
  if (error) throw mapAuthError(error, 'logout');
};

module.exports = { register, login, refresh, logout };
