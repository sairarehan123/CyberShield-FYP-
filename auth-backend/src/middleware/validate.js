const HttpError = require('../utils/httpError');

// validate(fn): fn(body) returns an object of { field: message }. Empty object = valid.
module.exports = (fn) => (req, res, next) => {
  const fields = fn(req.body || {});
  if (Object.keys(fields).length) {
    return next(new HttpError(400, 'VALIDATION_ERROR', 'Please correct the highlighted fields.', fields));
  }
  next();
};
