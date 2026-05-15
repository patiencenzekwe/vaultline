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
            { id: user.id, email: user.email },
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
        res.status(500).json({
            error: 'Registration failed. Please try again.'
        });
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
            return res.status(401).json({
                error: 'Invalid email or password.'
            });
        }

        const user = result.rows[0];

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({
                error: 'Invalid email or password.'
            });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
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
        res.status(500).json({
            error: 'Login failed. Please try again.'
        });
    }
};

const getProfile = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, email, full_name, phone, created_at FROM users WHERE id = $1',
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'User not found.'
            });
        }

        res.json({ user: result.rows[0] });

    } catch (err) {
        console.error('Profile error:', err);
        res.status(500).json({
            error: 'Failed to retrieve profile.'
        });
    }
};

module.exports = { register, login, getProfile };