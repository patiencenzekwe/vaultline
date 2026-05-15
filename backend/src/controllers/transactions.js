const pool = require('../config/database');

const getTransactions = async (req, res) => {
    try {
        const { account_id, limit = 20, offset = 0 } = req.query;

        const accountCheck = await pool.query(
            'SELECT id FROM accounts WHERE id = $1 AND user_id = $2',
            [account_id, req.user.id]
        );

        if (accountCheck.rows.length === 0) {
            return res.status(403).json({
                error: 'Access denied to this account.'
            });
        }

        const result = await pool.query(
            `SELECT id, type, amount, balance_after, description, reference, created_at
       FROM transactions
       WHERE account_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
            [account_id, limit, offset]
        );

        res.json({
            transactions: result.rows,
            pagination: {
                limit: Number(limit),
                offset: Number(offset),
                count: result.rows.length
            }
        });

    } catch (err) {
        console.error('Get transactions error:', err);
        res.status(500).json({
            error: 'Failed to retrieve transactions.'
        });
    }
};

module.exports = { getTransactions };