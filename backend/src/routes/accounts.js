const express = require('express');
const router = express.Router();
const { getAccounts, getAccount } = require('../controllers/accounts');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, getAccounts);
router.get('/:id', authenticate, getAccount);

module.exports = router;