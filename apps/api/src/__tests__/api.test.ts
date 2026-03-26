import request from 'supertest';
import { app } from '../app';

/**
 * Health check endpoint tests.
 *
 * NOTE: These tests require a running PostgreSQL instance.
 * In CI, use the PostgreSQL service container.
 * For local development, run `docker compose up -d` first.
 */
describe('GET /api/v1/health', () => {
  it('should return health status', async () => {
    const response = await request(app).get('/api/v1/health');

    // If DB is running, expect 200; otherwise 503
    expect([200, 503]).toContain(response.status);

    if (response.status === 200) {
      expect(response.body).toMatchObject({
        success: true,
        data: {
          status: 'healthy',
        },
      });
      expect(response.body.data).toHaveProperty('uptime');
      expect(response.body.data).toHaveProperty('timestamp');
      expect(response.body.data.database).toHaveProperty('status', 'connected');
    }
  });
});

describe('404 handler', () => {
  it('should return 404 for unknown routes', async () => {
    const response = await request(app).get('/api/v1/nonexistent');

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      success: false,
      error: {
        code: 'NOT_FOUND',
      },
    });
  });
});

describe('Auth endpoints', () => {
  it('POST /api/v1/auth/register without body should return 400 validation error', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
      },
    });
  });

  it('POST /api/v1/auth/register with weak password should return 400', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test@test.com',
        password: 'weak',
        fullName: 'Test User',
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('POST /api/v1/auth/login without body should return 400 validation error', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
      },
    });
  });

  it('POST /api/v1/auth/refresh without cookie should return 401', async () => {
    const response = await request(app)
      .post('/api/v1/auth/refresh');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('POST /api/v1/auth/logout without token should return 401', async () => {
    const response = await request(app)
      .post('/api/v1/auth/logout');

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
      },
    });
  });

  it('GET /api/v1/users/me without token should return 401', async () => {
    const response = await request(app)
      .get('/api/v1/users/me');

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
      },
    });
  });

  it('PATCH /api/v1/users/me without token should return 401', async () => {
    const response = await request(app)
      .patch('/api/v1/users/me')
      .send({ fullName: 'New Name' });

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
      },
    });
  });
});
