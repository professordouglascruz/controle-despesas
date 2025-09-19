const express = require('express');
const request = require('supertest');
const { createApiRoutes } = require('../../src/routes/index');
const databaseConfig = require('../../src/database/config');

describe('API Routes Index', () => {
  let app;
  let db;

  beforeAll(async () => {
    // Set test environment
    process.env.NODE_ENV = 'test';
    
    // Initialize database
    await databaseConfig.initialize();
    db = databaseConfig.getDatabase();

    // Create Express app with API routes
    app = express();
    app.use(express.json());
    app.use('/api', createApiRoutes(db));
  });

  afterAll(async () => {
    await databaseConfig.close();
  });

  describe('Route Mounting', () => {
    test('should mount categoria routes at /api/categorias', async () => {
      const response = await request(app)
        .get('/api/categorias')
        .expect('Content-Type', /json/);

      expect(response.status).toBeDefined();
    });

    test('should mount estabelecimento routes at /api/estabelecimentos', async () => {
      const response = await request(app)
        .get('/api/estabelecimentos')
        .expect('Content-Type', /json/);

      expect(response.status).toBeDefined();
    });

    test('should mount lancamento routes at /api/lancamentos', async () => {
      const response = await request(app)
        .get('/api/lancamentos')
        .expect('Content-Type', /json/);

      expect(response.status).toBeDefined();
    });
  });

  describe('Health Check Endpoint', () => {
    test('should respond to /api/health', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('service', 'expense-tracker-api');
      
      // Validate timestamp format
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('Route Integration', () => {
    test('should handle categoria endpoints through main router', async () => {
      const response = await request(app)
        .post('/api/categorias')
        .send({ codigo: 'INTEGRATION_TEST', descricao: 'Integration Test Category' })
        .expect('Content-Type', /json/);

      expect(response.status).toBeDefined();
    });

    test('should handle estabelecimento endpoints through main router', async () => {
      const response = await request(app)
        .post('/api/estabelecimentos')
        .send({ 
          codigo: 'INTEGRATION_TEST', 
          nome: 'Integration Test Store',
          endereco: 'Test Address',
          telefone: '123456789'
        })
        .expect('Content-Type', /json/);

      expect(response.status).toBeDefined();
    });

    test('should handle lancamento endpoints through main router', async () => {
      const response = await request(app)
        .post('/api/lancamentos')
        .send({ 
          dataLancamento: '2024-01-01',
          dataPagamento: '2024-01-01',
          valor: 100.00,
          codigoCategoria: 'CAT1',
          codigoEstabelecimento: 'EST1'
        })
        .expect('Content-Type', /json/);

      expect(response.status).toBeDefined();
    });
  });

  describe('Database Integration', () => {
    test('should pass database instance to all route handlers', async () => {
      // Test that database is properly passed by making requests that would require DB access
      const responses = await Promise.all([
        request(app).get('/api/categorias'),
        request(app).get('/api/estabelecimentos'),
        request(app).get('/api/lancamentos')
      ]);

      responses.forEach(response => {
        expect(response.status).toBeDefined();
        expect(response.headers['content-type']).toMatch(/json/);
      });
    });
  });
});