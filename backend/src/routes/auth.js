const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile, getSessions, changePassword } = require('../controllers/auth');
const { authenticate } = require('../middleware/auth');
const { validateLogin, validateRegister } = require('../middleware/validate');

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.get('/sessions', authenticate, getSessions);
router.put('/change-password', authenticate, changePassword);

module.exports = router;