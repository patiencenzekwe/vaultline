const express = require('express');
const router = express.Router();
const { getBeneficiaries, createBeneficiary, deleteBeneficiary } = require('../controllers/beneficiaries');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, getBeneficiaries);
router.post('/', authenticate, createBeneficiary);
router.delete('/:id', authenticate, deleteBeneficiary);

module.exports = router;