const authService = require('../services/authService');
const asyncHandler = require('../middleware/asyncHandler');
const HttpError = require('../utils/httpError');
const { ok } = require('../utils/response');

exports.register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  return ok(res, result, 201);
});

exports.login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  return ok(res, result);
});

// Extra (not in the original list): lets the app renew an expired access token for "Remember Me".
exports.refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body || {};
  if (typeof refreshToken !== 'string' || !refreshToken) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'refreshToken is required.', { refreshToken: 'refreshToken is required.' });
  }
  const result = await authService.refresh(refreshToken);
  return ok(res, result);
});

exports.logout = asyncHandler(async (req, res) => {
  await authService.logout(req.accessToken);
  return ok(res, { message: 'Logged out successfully.' });
});
