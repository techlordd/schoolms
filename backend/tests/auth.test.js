// tests/auth.test.js
const request = require('supertest');
const { app } = require('../src/app');

describe('Auth API', () => {
  describe('POST /v1/auth/login', () => {
    it('should return 401 with invalid credentials', async () => {
      const res = await request(app)
        .post('/v1/auth/login')
        .send({ email: 'wrong@email.com', password: 'wrongpass' });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when fields are missing', async () => {
      const res = await request(app)
        .post('/v1/auth/login')
        .send({ email: 'test@test.com' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /health', () => {
    it('should return 200 OK', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });
});
