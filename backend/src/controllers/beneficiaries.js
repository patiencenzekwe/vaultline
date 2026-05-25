const pool = require('../config/database');

const getBeneficiaries = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, account_number, account_id, created_at
             FROM beneficiaries
             WHERE user_id = $1
             ORDER BY name ASC`,
            [req.user.id]
        );
        res.json({ beneficiaries: result.rows });
    } catch (err) {
        console.error('Get beneficiaries error:', err);
        res.status(500).json({ error: 'Failed to retrieve beneficiaries.' });
    }
};

const createBeneficiary = async (req, res) => {
    const { name, account_number, account_id } = req.body;
    try {
        if (!name || name.trim().length < 2) {
            return res.status(400).json({ error: 'Beneficiary name must be at least 2 characters.' });
        }
        if (!account_number) {
            return res.status(400).json({ error: 'Account number is required.' });
        }

        const existing = await pool.query(
            'SELECT id FROM beneficiaries WHERE user_id = $1 AND account_number = $2',
            [req.user.id, account_number]
        );
        if (existing.rows.length > 0) {
            return res.status(409).json({ error: 'This account is already saved as a beneficiary.' });
        }

        const result = await pool.query(
            `INSERT INTO beneficiaries (user_id, name, account_number, account_id)
             VALUES ($1, $2, $3, $4)
             RETURNING id, name, account_number, account_id, created_at`,
            [req.user.id, name.trim(), account_number, account_id || null]
        );
        res.status(201).json({
            message: 'Beneficiary saved successfully.',
            beneficiary: result.rows[0]
        });
    } catch (err) {
        console.error('Create beneficiary error:', err);
        res.status(500).json({ error: 'Failed to save beneficiary.' });
    }
};

const deleteBeneficiary = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'DELETE FROM beneficiaries WHERE id = $1 AND user_id = $2 RETURNING id',
            [id, req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Beneficiary not found.' });
        }
        res.json({ message: 'Beneficiary removed successfully.' });
    } catch (err) {
        console.error('Delete beneficiary error:', err);
        res.status(500).json({ error: 'Failed to remove beneficiary.' });
    }
};

module.exports = { getBeneficiaries, createBeneficiary, deleteBeneficiary };