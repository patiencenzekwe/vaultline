const request = require('supertest');
const app = require('../src/server');
const pool = require('../src/config/database');

beforeAll(async () => {
    await pool.query(`
    DELETE FROM transfers;
    DELETE FROM transactions;
    DELETE FROM accounts;
    DELETE FROM users;
  `);
});

afterAll(async () => {
    await pool.query(`
    DELETE FROM transfers;
    DELETE FROM transactions;
    DELETE FROM accounts;
    DELETE FROM users;
  `);
});

describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'test@vaultline.com',
                password: 'Vaultline1!',
                full_name: 'Test User'
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('token');
        expect(response.body.user.email).toBe('test@vaultline.com');
        expect(response.body.user.full_name).toBe('Test User');
    });

    it('should reject duplicate email', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'test@vaultline.com',
                password: 'Vaultline1!',
                full_name: 'Test User'
            });

        expect(response.status).toBe(409);
        expect(response.body).toHaveProperty('error');
    });

    it('should reject weak password', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'weak@vaultline.com',
                password: 'password',
                full_name: 'Weak User'
            });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
    });

    it('should reject missing required fields', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'missing@vaultline.com'
            });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
    });
});

describe('POST /api/auth/login', () => {
    it('should login with correct credentials', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@vaultline.com',
                password: 'Vaultline1!'
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
        expect(response.body.message).toBe('Login successful.');
    });

    it('should reject wrong password', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@vaultline.com',
                password: 'WrongPass1!'
            });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error');
    });

    it('should reject non-existent email', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'nobody@vaultline.com',
                password: 'Vaultline1!'
            });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error');
    });
});

describe('GET /api/auth/profile', () => {
    let token;

    beforeAll(async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@vaultline.com',
                password: 'Vaultline1!'
            });
        token = response.body.token;
    });

    it('should return profile with valid token', async () => {
        const response = await request(app)
            .get('/api/auth/profile')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.user).toHaveProperty('email');
        expect(response.body.user).not.toHaveProperty('password');
    });

    it('should reject request without token', async () => {
        const response = await request(app)
            .get('/api/auth/profile');

        expect(response.status).toBe(401);
    });
});