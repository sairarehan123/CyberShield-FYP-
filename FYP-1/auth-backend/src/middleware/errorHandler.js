const { fail } = require('../utils/response');

const notFound = (req, res) => fail(res, 404, 'NOT_FOUND', 'Route not found.');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return fail(res, 400, 'INVALID_JSON', 'Request body must be valid JSON.');
  if (err.type === 'entity.too.large') return fail(res, 413, 'PAYLOAD_TOO_LARGE', 'Request body is too large.');
  if (err.status && err.code) return fail(res, err.status, err.code, err.message, err.fields);
  if (err.message === 'CORS_NOT_ALLOWED') return fail(res, 403, 'CORS_NOT_ALLOWED', 'Origin not allowed.');

  console.error('[unhandled]', err.name); // never print request bodies, tokens or secrets
  return fail(res, 500, 'INTERNAL_ERROR', 'Something went wrong. Please try again.');
};

module.exports = { notFound, errorHandler };
