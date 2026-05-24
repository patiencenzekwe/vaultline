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
        res.status(500).json({ error: 'Failed to retrieve accounts.' });
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
            return res.status(404).json({ error: 'Account not found.' });
        }
        res.json({ account: result.rows[0] });
    } catch (err) {
        console.error('Get account error:', err);
        res.status(500).json({ error: 'Failed to retrieve account.' });
    }
};

const getSpending = async (req, res) => {
    try {
        const { account_id } = req.query;

        const accountCheck = await pool.query(
            'SELECT id FROM accounts WHERE id = $1 AND user_id = $2',
            [account_id, req.user.id]
        );

        if (accountCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Access denied to this account.' });
        }

        // Get spending by description category for current month
        const currentMonth = await pool.query(
            `SELECT
                description,
                SUM(amount) as total,
                COUNT(*) as count
             FROM transactions
             WHERE account_id = $1
               AND type = 'debit'
               AND created_at >= date_trunc('month', NOW())
             GROUP BY description
             ORDER BY total DESC
             LIMIT 10`,
            [account_id]
        );

        // Get monthly totals for last 6 months
        const monthlyTotals = await pool.query(
            `SELECT
                to_char(date_trunc('month', created_at), 'Mon YYYY') as month,
                SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END) as spent,
                SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) as received
             FROM transactions
             WHERE account_id = $1
               AND created_at >= NOW() - INTERVAL '6 months'
             GROUP BY date_trunc('month', created_at)
             ORDER BY date_trunc('month', created_at) DESC`,
            [account_id]
        );

        // Get total spent this month
        const monthTotal = await pool.query(
            `SELECT
                COALESCE(SUM(amount), 0) as total_spent,
                COUNT(*) as transaction_count
             FROM transactions
             WHERE account_id = $1
               AND type = 'debit'
               AND created_at >= date_trunc('month', NOW())`,
            [account_id]
        );

        res.json({
            current_month: {
                total_spent: monthTotal.rows[0].total_spent,
                transaction_count: monthTotal.rows[0].transaction_count,
                breakdown: currentMonth.rows
            },
            monthly_totals: monthlyTotals.rows
        });

    } catch (err) {
        console.error('Get spending error:', err);
        res.status(500).json({ error: 'Failed to retrieve spending data.' });
    }
};

const getLimits = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, account_type, balance FROM accounts WHERE id = $1 AND user_id = $2',
            [req.params.id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Account not found.' });
        }

        const account = result.rows[0];

        res.json({
            limits: {
                account_id: account.id,
                account_type: account.account_type,
                single_transfer_limit: 10000.00,
                daily_transfer_limit: 25000.00,
                daily_transfers_used: 0,
                daily_transfers_remaining: 25000.00,
                atm_daily_limit: 500.00,
                contactless_limit: 100.00,
                currency: 'GBP'
            }
        });

    } catch (err) {
        console.error('Get limits error:', err);
        res.status(500).json({ error: 'Failed to retrieve account limits.' });
    }
};

module.exports = { getAccounts, getAccount, getSpending, getLimits };