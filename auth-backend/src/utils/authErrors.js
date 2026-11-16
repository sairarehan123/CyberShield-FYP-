const HttpError = require('./httpError');

// Turns a Supabase Auth error into a safe, friendly HttpError.
// Only the error code / name / status are logged -- never passwords, tokens or full payloads.
const mapAuthError = (error, context) => {
  const code = error?.code || '';
  const status = error?.status;
  const msg = String(error?.message || '').toLowerCase();

  if (code === 'user_already_exists' || code === 'email_exists' || msg.includes('already registered')) {
    return new HttpError(409, 'EMAIL_ALREADY_REGISTERED', 'An account with this email already exists.', {
      email: 'This email is already registered.',
    });
  }
  if (code === 'weak_password') {
    return new HttpError(400, 'WEAK_PASSWORD', 'This password is too weak. Try a longer or less common one.', {
      password: 'This password is too weak.',
    });
  }
  if (code === 'email_address_invalid' || code === 'validation_failed') {
    return new HttpError(400, 'VALIDATION_ERROR', 'Enter a valid email address.', { email: 'Enter a valid email address.' });
  }
  if (code === 'invalid_credentials' || msg.includes('invalid login credentials')) {
    return new HttpError(401, 'INVALID_CREDENTIALS', 'Incorrect email or password.');
  }
  if (code === 'email_not_confirmed') {
    return new HttpError(403, 'EMAIL_NOT_CONFIRMED', 'Please confirm your email address before logging in.');
  }
  if (code === 'signup_disabled') {
    return new HttpError(403, 'SIGNUP_DISABLED', 'Sign-ups are currently disabled.');
  }
  if (status === 429 || code === 'over_request_rate_limit' || code === 'over_email_send_rate_limit') {
    return new HttpError(429, 'TOO_MANY_REQUESTS', 'Too many attempts. Please wait a moment and try again.');
  }
  if (
    ['refresh_token_not_found', 'refresh_token_already_used', 'session_not_found', 'session_expired', 'bad_jwt'].includes(code)
  ) {
    return new HttpError(401, 'INVALID_SESSION', 'Your session is invalid or has expired. Please log in again.');
  }
  if (error?.name === 'AuthRetryableFetchError' || status === 0 || status >= 502) {
    console.error(`[auth:${context}] auth service unreachable`, error?.name, status);
    return new HttpError(503, 'SERVICE_UNAVAILABLE', 'The authentication service is unavailable. Please try again shortly.');
  }

  console.error(`[auth:${context}] unexpected auth error`, error?.name, code, status);
  return new HttpError(500, 'AUTH_ERROR', 'Something went wrong. Please try again.');
};

module.exports = { mapAuthError };
