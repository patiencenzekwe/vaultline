const express = require('express');
const router = express.Router();
const { getTransactions } = require('../controllers/transactions');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, getTransactions);

module.exports = router;