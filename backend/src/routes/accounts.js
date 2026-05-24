const express = require('express');
const router = express.Router();
const { getAccounts, getAccount, getSpending, getLimits } = require('../controllers/accounts');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, getAccounts);
router.get('/spending', authenticate, getSpending);
router.get('/:id', authenticate, getAccount);
router.get('/:id/limits', authenticate, getLimits);

module.exports = router;