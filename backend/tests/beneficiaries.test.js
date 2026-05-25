const request = require('supertest');
const app = require('../src/server');
const pool = require('../src/config/database');

let token;
let accountId;
let beneficiaryId;

beforeAll(async () => {
    await pool.query(`
        DELETE FROM beneficiaries WHERE user_id IN (
            SELECT id FROM users WHERE email = 'beneficiary@vaultline.com'
        );
        DELETE FROM transfers WHERE from_account_id IN (
            SELECT id FROM accounts WHERE user_id IN (
                SELECT id FROM users WHERE email = 'beneficiary@vaultline.com'
            )
        );
        DELETE FROM transactions WHERE account_id IN (
            SELECT id FROM accounts WHERE user_id IN (
                SELECT id FROM users WHERE email = 'beneficiary@vaultline.com'
            )
        );
        DELETE FROM accounts WHERE user_id IN (
            SELECT id FROM users WHERE email = 'beneficiary@vaultline.com'
        );
        DELETE FROM users WHERE email = 'beneficiary@vaultline.com';
    `);

    const register = await request(app)
        .post('/api/auth/register')
        .send({
            email: 'beneficiary@vaultline.com',
            password: 'Vaultline1!',
            full_name: 'Beneficiary User'
        });

    token = register.body.token;

    const accounts = await request(app)
        .get('/api/accounts')
        .set('Authorization', `Bearer ${token}`);

    accountId = accounts.body.accounts[0].id;
});

afterAll(async () => {
    await pool.query(`
        DELETE FROM beneficiaries WHERE user_id IN (
            SELECT id FROM users WHERE email = 'beneficiary@vaultline.com'
        );
        DELETE FROM transfers WHERE from_account_id IN (
            SELECT id FROM accounts WHERE user_id IN (
                SELECT id FROM users WHERE email = 'beneficiary@vaultline.com'
            )
        );
        DELETE FROM transactions WHERE account_id IN (
            SELECT id FROM accounts WHERE user_id IN (
                SELECT id FROM users WHERE email = 'beneficiary@vaultline.com'
            )
        );
        DELETE FROM accounts WHERE user_id IN (
            SELECT id FROM users WHERE email = 'beneficiary@vaultline.com'
        );
        DELETE FROM users WHERE email = 'beneficiary@vaultline.com';
    `);
    await pool.end();
});

describe('POST /api/beneficiaries', () => {
    it('should create a beneficiary successfully', async () => {
        const response = await request(app)
            .post('/api/beneficiaries')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Sarah Mitchell',
                account_number: 'GB17779629449714',
                account_id: accountId
            });

        expect(response.status).toBe(201);
        expect(response.body.beneficiary.name).toBe('Sarah Mitchell');
        beneficiaryId = response.body.beneficiary.id;
    });

    it('should reject duplicate account number', async () => {
        const response = await request(app)
            .post('/api/beneficiaries')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Sarah Again',
                account_number: 'GB17779629449714'
            });

        expect(response.status).toBe(409);
        expect(response.body).toHaveProperty('error');
    });

    it('should reject short name', async () => {
        const response = await request(app)
            .post('/api/beneficiaries')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'A',
                account_number: 'GB99999999999'
            });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
    });

    it('should reject missing account number', async () => {
        const response = await request(app)
            .post('/api/beneficiaries')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'No Account' });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
    });

    it('should reject request without token', async () => {
        const response = await request(app)
            .post('/api/beneficiaries')
            .send({ name: 'No Token', account_number: 'GB123' });

        expect(response.status).toBe(401);
    });
});

describe('GET /api/beneficiaries', () => {
    it('should return beneficiaries list', async () => {
        const response = await request(app)
            .get('/api/beneficiaries')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('beneficiaries');
        expect(response.body.beneficiaries.length).toBeGreaterThan(0);
    });

    it('should reject request without token', async () => {
        const response = await request(app)
            .get('/api/beneficiaries');

        expect(response.status).toBe(401);
    });
});

describe('DELETE /api/beneficiaries/:id', () => {
    it('should delete a beneficiary', async () => {
        const response = await request(app)
            .delete(`/api/beneficiaries/${beneficiaryId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Beneficiary removed successfully.');
    });

    it('should reject delete for non-existent beneficiary', async () => {
        const response = await request(app)
            .delete('/api/beneficiaries/00000000-0000-0000-0000-000000000000')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(404);
    });
});