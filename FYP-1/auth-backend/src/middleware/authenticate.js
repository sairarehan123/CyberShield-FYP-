const { createAnonClient } = require('../config/supabase');
const HttpError = require('../utils/httpError');

// Protects private routes. Expects:  Authorization: Bearer <access_token>
// The token is verified by Supabase Auth itself; the user id comes from that result, never from the client.
module.exports = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new HttpError(401, 'UNAUTHORIZED', 'Authentication required.');
    }

    const { data, error } = await createAnonClient().auth.getUser(token);
    if (error || !data?.user) {
      if (error?.name === 'AuthRetryableFetchError') {
        throw new HttpError(503, 'SERVICE_UNAVAILABLE', 'The authentication service is unavailable. Please try again shortly.');
      }
      throw new HttpError(401, 'UNAUTHORIZED', 'Your session is invalid or has expired. Please log in again.');
    }

    req.user = { id: data.user.id, email: data.user.email };
    req.accessToken = token;
    next();
  } catch (err) {
    next(err);
  }
};
