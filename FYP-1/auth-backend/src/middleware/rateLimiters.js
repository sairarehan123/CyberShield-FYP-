const rateLimit = require('express-rate-limit');
const { fail } = require('../utils/response');

const handler = (req, res) => fail(res, 429, 'TOO_MANY_REQUESTS', 'Too many requests. Please try again later.');
const base = { standardHeaders: true, legacyHeaders: false, handler };

// General limit for the whole API.
const apiLimiter = rateLimit({ ...base, windowMs: 15 * 60 * 1000, limit: 200 });

// Stricter limit for register / login / refresh (slows down password guessing).
const authLimiter = rateLimit({ ...base, windowMs: 15 * 60 * 1000, limit: 20 });

module.exports = { apiLimiter, authLimiter };
