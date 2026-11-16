const { createUserClient } = require('../config/supabase');
const HttpError = require('../utils/httpError');

const COLUMNS = 'id, full_name, email, created_at, updated_at';

const toApiProfile = (row) => ({
  id: row.id,
  name: row.full_name,
  email: row.email,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const dbError = (error, action) => {
  console.error(`[profile:${action}] database error`, error.code, error.message ? '(see Supabase logs)' : '');
  return new HttpError(500, 'DATABASE_ERROR', 'Could not process your profile request. Please try again.');
};

// userId always comes from the verified token (never from the client). RLS enforces the same rule again.
const getProfile = async (accessToken, userId) => {
  const supabase = createUserClient(accessToken);
  const { data, error } = await supabase.from('profiles').select(COLUMNS).eq('id', userId).maybeSingle();
  if (error) throw dbError(error, 'get');
  if (!data) throw new HttpError(404, 'PROFILE_NOT_FOUND', 'Profile not found.');
  return toApiProfile(data);
};

const updateProfile = async (accessToken, userId, { name }) => {
  const changes = {};
  if (name !== undefined) changes.full_name = name.trim();

  const supabase = createUserClient(accessToken);
  const { data, error } = await supabase.from('profiles').update(changes).eq('id', userId).select(COLUMNS).maybeSingle();
  if (error) throw dbError(error, 'update');
  if (!data) throw new HttpError(404, 'PROFILE_NOT_FOUND', 'Profile not found.');
  return toApiProfile(data);
};

module.exports = { getProfile, updateProfile };
