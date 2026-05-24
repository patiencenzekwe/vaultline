const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const register = async (req, res) => {
    const { email, password, full_name, phone } = req.body;
    try {
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email.toLowerCase()]
        );
        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                error: 'An account with this email already exists.'
            });
        }
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const accountNumber = `GB${Date.now()}${Math.floor(Math.random() * 1000)}`;
        const result = await pool.query(
            `INSERT INTO users (email, password, full_name, phone)
             VALUES ($1, $2, $3, $4)
             RETURNING id, email, full_name, created_at`,
            [email.toLowerCase(), hashedPassword, full_name, phone]
        );
        const user = result.rows[0];
        await pool.query(
            `INSERT INTO accounts (user_id, account_number, account_type, balance)
             VALUES ($1, $2, $3, $4)`,
            [user.id, accountNumber, 'current', 1000.00]
        );
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                iat: Math.floor(Date.now() / 1000)
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );
        res.status(201).json({
            message: 'Account created successfully.',
            token,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name
            }
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1 AND is_active = true',
            [email.toLowerCase()]
        );
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }
        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                iat: Math.floor(Date.now() / 1000)
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );
        res.json({
            message: 'Login successful.',
            token,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed. Please try again.' });
    }
};

const getProfile = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, email, full_name, phone, created_at FROM users WHERE id = $1',
            [req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }
        res.json({ user: result.rows[0] });
    } catch (err) {
        console.error('Profile error:', err);
        res.status(500).json({ error: 'Failed to retrieve profile.' });
    }
};

const updateProfile = async (req, res) => {
    const { full_name, phone } = req.body;
    try {
        if (!full_name || full_name.trim().length < 2) {
            return res.status(400).json({ error: 'Full name must be at least 2 characters.' });
        }
        const result = await pool.query(
            `UPDATE users
             SET full_name = $1, phone = $2, updated_at = NOW()
             WHERE id = $3
             RETURNING id, email, full_name, phone, created_at`,
            [full_name.trim(), phone || null, req.user.id]
        );
        res.json({
            message: 'Profile updated successfully.',
            user: result.rows[0]
        });
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ error: 'Failed to update profile.' });
    }
};

const getSessions = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const decoded = jwt.decode(token);
        const sessions = [
            {
                id: 1,
                device: 'Current session',
                location: 'United Kingdom',
                ip: req.ip || '127.0.0.1',
                login_time: new Date(decoded.iat * 1000).toISOString(),
                expires_at: new Date(decoded.exp * 1000).toISOString(),
                current: true
            }
        ];
        res.json({ sessions });
    } catch (err) {
        console.error('Sessions error:', err);
        res.status(500).json({ error: 'Failed to retrieve sessions.' });
    }
};

const changePassword = async (req, res) => {
    const { current_password, new_password } = req.body;
    try {
        if (!current_password || !new_password) {
            return res.status(400).json({ error: 'Current and new password are required.' });
        }
        if (new_password.length < 8) {
            return res.status(400).json({ error: 'New password must be at least 8 characters.' });
        }
        const result = await pool.query(
            'SELECT password FROM users WHERE id = $1',
            [req.user.id]
        );
        const validPassword = await bcrypt.compare(current_password, result.rows[0].password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Current password is incorrect.' });
        }
        const hashedPassword = await bcrypt.hash(new_password, 12);
        await pool.query(
            'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
            [hashedPassword, req.user.id]
        );
        res.json({ message: 'Password changed successfully.' });
    } catch (err) {
        console.error('Change password error:', err);
        res.status(500).json({ error: 'Failed to change password.' });
    }
};

module.exports = { register, login, getProfile, updateProfile, getSessions, changePassword };