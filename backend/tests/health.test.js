const request = require('supertest');
const app = require('../src/server');
const pool = require('../src/config/database');

afterAll(async () => {
    await pool.end();
});

describe('GET /api/health', () => {
    it('should return healthy status', async () => {
        const response = await request(app)
            .get('/api/health');

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('healthy');
        expect(response.body.service).toBe('vaultline-api');
        expect(response.body).toHaveProperty('timestamp');
        expect(response.body).toHaveProperty('environment');
    });
});