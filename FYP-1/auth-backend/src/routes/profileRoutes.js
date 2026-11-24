const router = require('express').Router();
const controller = require('../controllers/profileController');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const { validateProfileUpdate } = require('../utils/validation');

// Authentication runs first, so unauthenticated callers get 401 before anything else.
router.get('/', authenticate, controller.getProfile);
router.patch('/', authenticate, validate(validateProfileUpdate), controller.updateProfile);

module.exports = router;
