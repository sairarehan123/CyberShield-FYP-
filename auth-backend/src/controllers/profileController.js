const profileService = require('../services/profileService');
const asyncHandler = require('../middleware/asyncHandler');
const { ok } = require('../utils/response');

exports.getProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.getProfile(req.accessToken, req.user.id);
  return ok(res, { profile });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.updateProfile(req.accessToken, req.user.id, req.body);
  return ok(res, { profile });
});
