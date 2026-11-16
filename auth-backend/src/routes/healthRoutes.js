const router = require('express').Router();
const { ok } = require('../utils/response');

// Public. Does not touch Supabase and returns no secrets.
router.get('/', (req, res) => ok(res, { status: 'ok', service: 'cybershield-backend', timestamp: new Date().toISOString() }));

module.exports = router;
