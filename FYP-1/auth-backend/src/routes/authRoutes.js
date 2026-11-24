const router = require('express').Router();
const controller = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiters');
const { validateRegister, validateLogin } = require('../utils/validation');

router.post('/register', authLimiter, validate(validateRegister), controller.register);
router.post('/login', authLimiter, validate(validateLogin), controller.login);
router.post('/refresh', authLimiter, controller.refresh);
router.post('/logout', authenticate, controller.logout);

module.exports = router;
