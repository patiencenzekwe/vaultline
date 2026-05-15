const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/auth');
const { authenticate } = require('../middleware/auth');
const { validateLogin, validateRegister } = require('../middleware/validate');

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/profile', authenticate, getProfile);

module.exports = router;