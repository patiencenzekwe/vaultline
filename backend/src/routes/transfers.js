const express = require('express');
const router = express.Router();
const { createTransfer, getTransfers } = require('../controllers/transfers');
const { authenticate } = require('../middleware/auth');
const { validateTransfer } = require('../middleware/validate');

router.post('/', authenticate, validateTransfer, createTransfer);
router.get('/', authenticate, getTransfers);

module.exports = router;