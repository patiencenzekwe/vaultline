const express = require('express');
const router = express.Router();
const { getTransactions, exportTransactions } = require('../controllers/transactions');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, getTransactions);
router.get('/export', authenticate, exportTransactions);

module.exports = router;