const pool = require('../config/database');

const getGoals = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, target_amount, saved_amount, color, created_at
             FROM savings_goals
             WHERE user_id = $1
             ORDER BY created_at ASC`,
            [req.user.id]
        );
        res.json({ goals: result.rows });
    } catch (err) {
        console.error('Get goals error:', err);
        res.status(500).json({ error: 'Failed to retrieve savings goals.' });
    }
};

const createGoal = async (req, res) => {
    const { name, target_amount, color } = req.body;
    try {
        if (!name || name.trim().length < 2) {
            return res.status(400).json({ error: 'Goal name must be at least 2 characters.' });
        }
        if (!target_amount || parseFloat(target_amount) <= 0) {
            return res.status(400).json({ error: 'Target amount must be greater than zero.' });
        }
        const result = await pool.query(
            `INSERT INTO savings_goals (user_id, name, target_amount, color)
             VALUES ($1, $2, $3, $4)
             RETURNING id, name, target_amount, saved_amount, color, created_at`,
            [req.user.id, name.trim(), parseFloat(target_amount), color || '#8B5CF6']
        );
        res.status(201).json({
            message: 'Savings goal created successfully.',
            goal: result.rows[0]
        });
    } catch (err) {
        console.error('Create goal error:', err);
        res.status(500).json({ error: 'Failed to create savings goal.' });
    }
};

const updateGoal = async (req, res) => {
    const { id } = req.params;
    const { name, target_amount, saved_amount, color } = req.body;
    try {
        const check = await pool.query(
            'SELECT id FROM savings_goals WHERE id = $1 AND user_id = $2',
            [id, req.user.id]
        );
        if (check.rows.length === 0) {
            return res.status(404).json({ error: 'Savings goal not found.' });
        }
        const result = await pool.query(
            `UPDATE savings_goals
             SET name = COALESCE($1, name),
                 target_amount = COALESCE($2, target_amount),
                 saved_amount = COALESCE($3, saved_amount),
                 color = COALESCE($4, color),
                 updated_at = NOW()
             WHERE id = $5 AND user_id = $6
             RETURNING id, name, target_amount, saved_amount, color, created_at`,
            [name, target_amount, saved_amount, color, id, req.user.id]
        );
        res.json({
            message: 'Savings goal updated successfully.',
            goal: result.rows[0]
        });
    } catch (err) {
        console.error('Update goal error:', err);
        res.status(500).json({ error: 'Failed to update savings goal.' });
    }
};

const deleteGoal = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'DELETE FROM savings_goals WHERE id = $1 AND user_id = $2 RETURNING id',
            [id, req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Savings goal not found.' });
        }
        res.json({ message: 'Savings goal deleted successfully.' });
    } catch (err) {
        console.error('Delete goal error:', err);
        res.status(500).json({ error: 'Failed to delete savings goal.' });
    }
};

module.exports = { getGoals, createGoal, updateGoal, deleteGoal };