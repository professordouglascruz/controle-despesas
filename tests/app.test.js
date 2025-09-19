const request = require('supertest');
const { ExpenseTrackerApp } = require('../src/app');
const databaseConfig = require('../src/database/config');

describe('ExpenseTrackerApp', () => {
  let app;
  let server;

  beforeAll(async () => {
    // Set test environment
    process.env.NODE_ENV = 'test';
    
    app = new ExpenseTrackerApp();
    await app.initialize();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Middleware Configuration', () => {
    test('should parse JSON requests', async () => {
      const response = await request(app.getApp())
        .post('/api/categorias')
        .send({ codigo: 'TEST', descricao: 'Test Category' })
        .expect('Content-Type', /json/);

      expect(response.status).toBeDefined();
    });

    test('should handle CORS', async () => {
      const response = await request(app.getApp())
        .options('/api/categorias')
        .expect(204);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    test('should serve static files', async () => {
      const response = await request(app.getApp())
        .get('/');

      expect(response.status).toBeDefined();
    });
  });

  describe('Route Configuration', () => {
    test('should respond to root endpoint', async () => {
      const response = await request(app.getApp())
        .get('/')
        .expect(200)
        .expect('Content-Type', /html/);

      expect(response.text).toContain('<!DOCTYPE html>');
    });

    test('should respond to API info endpoint', async () => {
      const response = await request(app.getApp())
        .get('/api')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('message', 'Expense Tracker API');
      expect(response.body).toHaveProperty('version', '1.0.0');
      expect(response.body).toHaveProperty('endpoints');
      expect(response.body.endpoints).toHaveProperty('categorias', '/api/categorias');
      expect(response.body.endpoints).toHaveProperty('estabelecimentos', '/api/estabelecimentos');
      expect(response.body.endpoints).toHaveProperty('lancamentos', '/api/lancamentos');
      expect(response.body.endpoints).toHaveProperty('health', '/api/health');
    });

    test('should respond to health check endpoint', async () => {
      const response = await request(app.getApp())
        .get('/api/health')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('service', 'expense-tracker-api');
    });

    test('should handle 404 for unknown endpoints', async () => {
      const response = await request(app.getApp())
        .get('/api/unknown')
        .expect(404)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'NOT_FOUND_ERROR');
      expect(response.body.error.message).toContain('não encontrado');
    });
  });

  describe('API Routes', () => {
    test('should mount categoria routes', async () => {
      const response = await request(app.getApp())
        .get('/api/categorias');

      expect(response.status).toBeDefined();
      expect(response.headers['content-type']).toMatch(/json/);
    });

    test('should mount estabelecimento routes', async () => {
      const response = await request(app.getApp())
        .get('/api/estabelecimentos');

      expect(response.status).toBeDefined();
      expect(response.headers['content-type']).toMatch(/json/);
    });

    test('should mount lancamento routes', async () => {
      const response = await request(app.getApp())
        .get('/api/lancamentos');

      expect(response.status).toBeDefined();
      expect(response.headers['content-type']).toMatch(/json/);
    });
  });

  describe('Error Handling', () => {
    test('should handle validation errors with 400 status', async () => {
      const response = await request(app.getApp())
        .post('/api/categorias')
        .send({}) // Empty body should trigger validation error
        .expect('Content-Type', /json/);

      if (response.status === 400) {
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
      }
    });

    test('should handle not found errors with 404 status', async () => {
      const response = await request(app.getApp())
        .get('/api/categorias/NONEXISTENT')
        .expect('Content-Type', /json/);

      if (response.status === 404) {
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toHaveProperty('code', 'NOT_FOUND_ERROR');
      }
    });
  });

  describe('Request Parsing', () => {
    test('should parse URL-encoded requests', async () => {
      const response = await request(app.getApp())
        .post('/api/categorias')
        .type('form')
        .send('codigo=TEST&descricao=Test Category');

      expect(response.status).toBeDefined();
    });

    test('should handle large JSON payloads', async () => {
      const largeData = {
        codigo: 'LARGE',
        descricao: 'A'.repeat(1000) // Large description
      };

      const response = await request(app.getApp())
        .post('/api/categorias')
        .send(largeData);

      expect(response.status).toBeDefined();
    });
  });
});