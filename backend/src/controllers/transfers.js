const pool = require('../config/database');

const createTransfer = async (req, res) => {
  const { from_account_id, to_account_id, amount, description } = req.body;
  const transferAmount = parseFloat(amount);

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const fromAccount = await client.query(
      'SELECT * FROM accounts WHERE id = $1 AND user_id = $2 AND is_active = true FOR UPDATE',
      [from_account_id, req.user.id]
    );

    if (fromAccount.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        error: 'Source account not found.'
      });
    }

    const toAccount = await client.query(
      'SELECT * FROM accounts WHERE id = $1 AND is_active = true FOR UPDATE',
      [to_account_id]
    );

    if (toAccount.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        error: 'Destination account not found.'
      });
    }

    if (parseFloat(fromAccount.rows[0].balance) < transferAmount) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: 'Insufficient funds.'
      });
    }

    if (from_account_id === to_account_id) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: 'Cannot transfer to the same account.'
      });
    }

    const newFromBalance = parseFloat(fromAccount.rows[0].balance) - transferAmount;
    const newToBalance = parseFloat(toAccount.rows[0].balance) + transferAmount;

    await client.query(
      'UPDATE accounts SET balance = $1, updated_at = NOW() WHERE id = $2',
      [newFromBalance, from_account_id]
    );

    await client.query(
      'UPDATE accounts SET balance = $1, updated_at = NOW() WHERE id = $2',
      [newToBalance, to_account_id]
    );

    const reference = `VL${Date.now()}`;

    await client.query(
      `INSERT INTO transactions (account_id, type, amount, balance_after, description, reference)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [from_account_id, 'debit', transferAmount, newFromBalance, description || 'Transfer', reference]
    );

    await client.query(
      `INSERT INTO transactions (account_id, type, amount, balance_after, description, reference)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [to_account_id, 'credit', transferAmount, newToBalance, description || 'Transfer', `${reference}-CR`]
    );

    const transfer = await client.query(
      `INSERT INTO transfers (from_account_id, to_account_id, amount, description, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [from_account_id, to_account_id, transferAmount, description || 'Transfer', 'completed']
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Transfer completed successfully.',
      transfer: transfer.rows[0],
      reference
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Transfer error:', err);
    res.status(500).json({
      error: 'Transfer failed. Please try again.'
    });
  } finally {
    client.release();
  }
};

const getTransfers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*,
        fa.account_number as from_account_number,
        ta.account_number as to_account_number
       FROM transfers t
       JOIN accounts fa ON t.from_account_id = fa.id
       JOIN accounts ta ON t.to_account_id = ta.id
       WHERE fa.user_id = $1 OR ta.user_id = $1
       ORDER BY t.created_at DESC
       LIMIT 20`,
      [req.user.id]
    );

    res.json({ transfers: result.rows });

  } catch (err) {
    console.error('Get transfers error:', err);
    res.status(500).json({
      error: 'Failed to retrieve transfers.'
    });
  }
};

module.exports = { createTransfer, getTransfers };