const request = require('supertest');
const app = require('../src/server');
const pool = require('../src/config/database');

let tokenOne;
let tokenTwo;
let accountOneId;
let accountTwoId;

beforeAll(async () => {
    const registerOne = await request(app)
        .post('/api/auth/register')
        .send({
            email: 'transfer.one@vaultline.com',
            password: 'Vaultline1!',
            full_name: 'Transfer User One'
        });
    tokenOne = registerOne.body.token;

    const registerTwo = await request(app)
        .post('/api/auth/register')
        .send({
            email: 'transfer.two@vaultline.com',
            password: 'Vaultline1!',
            full_name: 'Transfer User Two'
        });
    tokenTwo = registerTwo.body.token;

    const accountsOne = await request(app)
        .get('/api/accounts')
        .set('Authorization', `Bearer ${tokenOne}`);
    accountOneId = accountsOne.body.accounts[0].id;

    const accountsTwo = await request(app)
        .get('/api/accounts')
        .set('Authorization', `Bearer ${tokenTwo}`);
    accountTwoId = accountsTwo.body.accounts[0].id;
});

afterAll(async () => {
    await pool.query(`
    DELETE FROM transfers;
    DELETE FROM transactions;
    DELETE FROM accounts WHERE user_id IN (
      SELECT id FROM users WHERE email IN (
        'transfer.one@vaultline.com',
        'transfer.two@vaultline.com'
      )
    );
    DELETE FROM users WHERE email IN (
      'transfer.one@vaultline.com',
      'transfer.two@vaultline.com'
    );
  `);
});

describe('POST /api/transfers', () => {
    it('should transfer funds successfully', async () => {
        const response = await request(app)
            .post('/api/transfers')
            .set('Authorization', `Bearer ${tokenOne}`)
            .send({
                from_account_id: accountOneId,
                to_account_id: accountTwoId,
                amount: 100,
                description: 'Test transfer'
            });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Transfer completed successfully.');
        expect(response.body).toHaveProperty('reference');
    });

    it('should reject transfer exceeding £10,000 limit', async () => {
        const response = await request(app)
            .post('/api/transfers')
            .set('Authorization', `Bearer ${tokenOne}`)
            .send({
                from_account_id: accountOneId,
                to_account_id: accountTwoId,
                amount: 50000,
                description: 'Exceeds limit'
            });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
    });

    it('should reject transfer with insufficient funds', async () => {
        const response = await request(app)
            .post('/api/transfers')
            .set('Authorization', `Bearer ${tokenOne}`)
            .send({
                from_account_id: accountOneId,
                to_account_id: accountTwoId,
                amount: 9999,
                description: 'Insufficient funds'
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Insufficient funds.');
    });

    it('should reject transfer without token', async () => {
        const response = await request(app)
            .post('/api/transfers')
            .send({
                from_account_id: accountOneId,
                to_account_id: accountTwoId,
                amount: 10,
                description: 'No auth'
            });

        expect(response.status).toBe(401);
    });

    it('should reject transfer to same account', async () => {
        const response = await request(app)
            .post('/api/transfers')
            .set('Authorization', `Bearer ${tokenOne}`)
            .send({
                from_account_id: accountOneId,
                to_account_id: accountOneId,
                amount: 10,
                description: 'Same account'
            });

        expect(response.status).toBe(400);
    });
});

describe('GET /api/transfers', () => {
    it('should return transfer history', async () => {
        const response = await request(app)
            .get('/api/transfers')
            .set('Authorization', `Bearer ${tokenOne}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('transfers');
        expect(Array.isArray(response.body.transfers)).toBe(true);
    });

    it('should reject request without token', async () => {
        const response = await request(app)
            .get('/api/transfers');

        expect(response.status).toBe(401);
    });
});