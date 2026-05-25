const express = require('express');
const router = express.Router();
const { getGoals, createGoal, updateGoal, deleteGoal } = require('../controllers/savings');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, getGoals);
router.post('/', authenticate, createGoal);
router.put('/:id', authenticate, updateGoal);
router.delete('/:id', authenticate, deleteGoal);

module.exports = router;