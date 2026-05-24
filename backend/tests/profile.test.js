const request = require('supertest');
const app = require('../src/server');
const pool = require('../src/config/database');

let token;
let accountId;

beforeAll(async () => {
    await pool.query(`
        DELETE FROM transfers;
        DELETE FROM transactions;
        DELETE FROM accounts;
        DELETE FROM users WHERE email = 'profile@vaultline.com';
    `);

    const register = await request(app)
        .post('/api/auth/register')
        .send({
            email: 'profile@vaultline.com',
            password: 'Vaultline1!',
            full_name: 'Profile User'
        });

    token = register.body.token;

    const accounts = await request(app)
        .get('/api/accounts')
        .set('Authorization', `Bearer ${token}`);

    accountId = accounts.body.accounts[0].id;
});

afterAll(async () => {
    await pool.query(`
        DELETE FROM transfers;
        DELETE FROM transactions;
        DELETE FROM accounts;
        DELETE FROM users WHERE email = 'profile@vaultline.com';
    `);
    await pool.end();
});

describe('PUT /api/auth/profile', () => {
    it('should update profile successfully', async () => {
        const response = await request(app)
            .put('/api/auth/profile')
            .set('Authorization', `Bearer ${token}`)
            .send({
                full_name: 'Updated User',
                phone: '+447911123456'
            });

        expect(response.status).toBe(200);
        expect(response.body.user.full_name).toBe('Updated User');
        expect(response.body.user.phone).toBe('+447911123456');
    });

    it('should reject short full name', async () => {
        const response = await request(app)
            .put('/api/auth/profile')
            .set('Authorization', `Bearer ${token}`)
            .send({ full_name: 'A' });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
    });

    it('should reject request without token', async () => {
        const response = await request(app)
            .put('/api/auth/profile')
            .send({ full_name: 'No Token' });

        expect(response.status).toBe(401);
    });
});

describe('GET /api/auth/sessions', () => {
    it('should return session info', async () => {
        const response = await request(app)
            .get('/api/auth/sessions')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('sessions');
        expect(response.body.sessions.length).toBeGreaterThan(0);
        expect(response.body.sessions[0]).toHaveProperty('login_time');
        expect(response.body.sessions[0].current).toBe(true);
    });

    it('should reject request without token', async () => {
        const response = await request(app)
            .get('/api/auth/sessions');

        expect(response.status).toBe(401);
    });
});

describe('PUT /api/auth/change-password', () => {
    it('should change password successfully', async () => {
        const response = await request(app)
            .put('/api/auth/change-password')
            .set('Authorization', `Bearer ${token}`)
            .send({
                current_password: 'Vaultline1!',
                new_password: 'Vaultline2!'
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Password changed successfully.');
    });

    it('should reject wrong current password', async () => {
        const response = await request(app)
            .put('/api/auth/change-password')
            .set('Authorization', `Bearer ${token}`)
            .send({
                current_password: 'WrongPass1!',
                new_password: 'Vaultline3!'
            });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error');
    });

    it('should reject short new password', async () => {
        const response = await request(app)
            .put('/api/auth/change-password')
            .set('Authorization', `Bearer ${token}`)
            .send({
                current_password: 'Vaultline2!',
                new_password: 'short'
            });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
    });
});

describe('GET /api/transactions/export', () => {
    it('should export transactions as CSV', async () => {
        const response = await request(app)
            .get(`/api/transactions/export?account_id=${accountId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toContain('text/csv');
        expect(response.headers['content-disposition']).toContain('attachment');
    });

    it('should reject export for another user account', async () => {
        const response = await request(app)
            .get('/api/transactions/export?account_id=00000000-0000-0000-0000-000000000000')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(403);
    });
});

describe('GET /api/accounts/spending', () => {
    it('should return spending analytics', async () => {
        const response = await request(app)
            .get(`/api/accounts/spending?account_id=${accountId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('current_month');
        expect(response.body).toHaveProperty('monthly_totals');
    });

    it('should reject spending for another user account', async () => {
        const response = await request(app)
            .get('/api/accounts/spending?account_id=00000000-0000-0000-0000-000000000000')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(403);
    });
});

describe('GET /api/accounts/:id/limits', () => {
    it('should return account limits', async () => {
        const response = await request(app)
            .get(`/api/accounts/${accountId}/limits`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.limits).toHaveProperty('single_transfer_limit');
        expect(response.body.limits).toHaveProperty('daily_transfer_limit');
        expect(response.body.limits.single_transfer_limit).toBe(10000);
    });

    it('should reject limits for non-existent account', async () => {
        const response = await request(app)
            .get('/api/accounts/00000000-0000-0000-0000-000000000000/limits')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(404);
    });
});