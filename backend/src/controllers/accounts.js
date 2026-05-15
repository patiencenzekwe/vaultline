const pool = require('../config/database');

const getAccounts = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, account_number, account_type, balance, currency, created_at
       FROM accounts
       WHERE user_id = $1 AND is_active = true
       ORDER BY created_at ASC`,
            [req.user.id]
        );

        res.json({ accounts: result.rows });

    } catch (err) {
        console.error('Get accounts error:', err);
        res.status(500).json({
            error: 'Failed to retrieve accounts.'
        });
    }
};

const getAccount = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, account_number, account_type, balance, currency, created_at
       FROM accounts
       WHERE id = $1 AND user_id = $2 AND is_active = true`,
            [req.params.id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Account not found.'
            });
        }

        res.json({ account: result.rows[0] });

    } catch (err) {
        console.error('Get account error:', err);
        res.status(500).json({
            error: 'Failed to retrieve account.'
        });
    }
};

module.exports = { getAccounts, getAccount };