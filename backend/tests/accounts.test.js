const request = require('supertest');
const app = require('../src/server');
const pool = require('../src/config/database');

let token;

beforeAll(async () => {
    const response = await request(app)
        .post('/api/auth/register')
        .send({
            email: 'accounts.test@vaultline.com',
            password: 'Vaultline1!',
            full_name: 'Accounts Test User'
        });
    token = response.body.token;
});

afterAll(async () => {
    await pool.query(`
    DELETE FROM transfers;
    DELETE FROM transactions;
    DELETE FROM accounts WHERE user_id IN (
      SELECT id FROM users WHERE email = 'accounts.test@vaultline.com'
    );
    DELETE FROM users WHERE email = 'accounts.test@vaultline.com';
  `);
});

describe('GET /api/accounts', () => {
    it('should return accounts for authenticated user', async () => {
        const response = await request(app)
            .get('/api/accounts')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('accounts');
        expect(Array.isArray(response.body.accounts)).toBe(true);
        expect(response.body.accounts.length).toBeGreaterThan(0);
        expect(response.body.accounts[0]).toHaveProperty('balance');
        expect(response.body.accounts[0]).toHaveProperty('account_number');
    });

    it('should reject request without token', async () => {
        const response = await request(app)
            .get('/api/accounts');

        expect(response.status).toBe(401);
    });

    it('should not expose sensitive data', async () => {
        const response = await request(app)
            .get('/api/accounts')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.accounts[0]).not.toHaveProperty('password');
    });
});