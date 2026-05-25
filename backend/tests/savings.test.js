const request = require('supertest');
const app = require('../src/server');
const pool = require('../src/config/database');

let token;
let goalId;

beforeAll(async () => {
    await pool.query(`
        DELETE FROM savings_goals WHERE user_id IN (
            SELECT id FROM users WHERE email = 'savings@vaultline.com'
        );
        DELETE FROM transfers WHERE from_account_id IN (
            SELECT id FROM accounts WHERE user_id IN (
                SELECT id FROM users WHERE email = 'savings@vaultline.com'
            )
        );
        DELETE FROM transactions WHERE account_id IN (
            SELECT id FROM accounts WHERE user_id IN (
                SELECT id FROM users WHERE email = 'savings@vaultline.com'
            )
        );
        DELETE FROM accounts WHERE user_id IN (
            SELECT id FROM users WHERE email = 'savings@vaultline.com'
        );
        DELETE FROM users WHERE email = 'savings@vaultline.com';
    `);

    const register = await request(app)
        .post('/api/auth/register')
        .send({
            email: 'savings@vaultline.com',
            password: 'Vaultline1!',
            full_name: 'Savings User'
        });

    token = register.body.token;
});

afterAll(async () => {
    await pool.query(`
        DELETE FROM savings_goals WHERE user_id IN (
            SELECT id FROM users WHERE email = 'savings@vaultline.com'
        );
        DELETE FROM transfers WHERE from_account_id IN (
            SELECT id FROM accounts WHERE user_id IN (
                SELECT id FROM users WHERE email = 'savings@vaultline.com'
            )
        );
        DELETE FROM transactions WHERE account_id IN (
            SELECT id FROM accounts WHERE user_id IN (
                SELECT id FROM users WHERE email = 'savings@vaultline.com'
            )
        );
        DELETE FROM accounts WHERE user_id IN (
            SELECT id FROM users WHERE email = 'savings@vaultline.com'
        );
        DELETE FROM users WHERE email = 'savings@vaultline.com';
    `);
    await pool.end();
});

describe('POST /api/savings', () => {
    it('should create a savings goal successfully', async () => {
        const response = await request(app)
            .post('/api/savings')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Emergency fund',
                target_amount: 3000,
                color: '#8B5CF6'
            });

        expect(response.status).toBe(201);
        expect(response.body.goal.name).toBe('Emergency fund');
        expect(parseFloat(response.body.goal.target_amount)).toBe(3000);
        goalId = response.body.goal.id;
    });

    it('should reject short goal name', async () => {
        const response = await request(app)
            .post('/api/savings')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'A',
                target_amount: 1000
            });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
    });

    it('should reject zero target amount', async () => {
        const response = await request(app)
            .post('/api/savings')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Bad goal',
                target_amount: 0
            });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
    });

    it('should reject request without token', async () => {
        const response = await request(app)
            .post('/api/savings')
            .send({
                name: 'No token goal',
                target_amount: 1000
            });

        expect(response.status).toBe(401);
    });
});

describe('GET /api/savings', () => {
    it('should return savings goals', async () => {
        const response = await request(app)
            .get('/api/savings')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('goals');
        expect(response.body.goals.length).toBeGreaterThan(0);
    });

    it('should reject request without token', async () => {
        const response = await request(app)
            .get('/api/savings');

        expect(response.status).toBe(401);
    });
});

describe('PUT /api/savings/:id', () => {
    it('should update a savings goal', async () => {
        const response = await request(app)
            .put(`/api/savings/${goalId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                saved_amount: 500
            });

        expect(response.status).toBe(200);
        expect(parseFloat(response.body.goal.saved_amount)).toBe(500);
    });

    it('should reject update for non-existent goal', async () => {
        const response = await request(app)
            .put('/api/savings/00000000-0000-0000-0000-000000000000')
            .set('Authorization', `Bearer ${token}`)
            .send({ saved_amount: 100 });

        expect(response.status).toBe(404);
    });
});

describe('DELETE /api/savings/:id', () => {
    it('should delete a savings goal', async () => {
        const response = await request(app)
            .delete(`/api/savings/${goalId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Savings goal deleted successfully.');
    });

    it('should reject delete for non-existent goal', async () => {
        const response = await request(app)
            .delete('/api/savings/00000000-0000-0000-0000-000000000000')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(404);
    });
});