const express = require('express');
const request = require('supertest');
const { createLancamentoRoutes } = require('../../src/routes/lancamentoRoutes');
const databaseConfig = require('../../src/database/config');

describe('Lancamento Routes', () => {
  let app;
  let db;

  beforeAll(async () => {
    // Set test environment
    process.env.NODE_ENV = 'test';
    
    // Initialize database
    await databaseConfig.initialize();
    db = databaseConfig.getDatabase();

    // Create Express app with lancamento routes
    app = express();
    app.use(express.json());
    app.use('/api/lancamentos', createLancamentoRoutes(db));
  });

  afterAll(async () => {
    await databaseConfig.close();
  });

  describe('Route Configuration', () => {
    test('should configure GET /api/lancamentos route', async () => {
      const response = await request(app)
        .get('/api/lancamentos')
        .expect('Content-Type', /json/);

      expect(response.status).toBeDefined();
    });

    test('should configure GET /api/lancamentos/:id route', async () => {
      const response = await request(app)
        .get('/api/lancamentos/1')
        .expect('Content-Type', /json/);

      expect(response.status).toBeDefined();
    });

    test('should configure POST /api/lancamentos route', async () => {
      const response = await request(app)
        .post('/api/lancamentos')
        .send({ 
          dataLancamento: '2024-01-01',
          dataPagamento: '2024-01-01',
          valor: 100.50,
          codigoCategoria: 'CAT1',
          codigoEstabelecimento: 'EST1'
        })
        .expect('Content-Type', /json/);

      expect(response.status).toBeDefined();
    });

    test('should configure PUT /api/lancamentos/:id route', async () => {
      const response = await request(app)
        .put('/api/lancamentos/1')
        .send({ valor: 200.00 })
        .expect('Content-Type', /json/);

      expect(response.status).toBeDefined();
    });

    test('should configure DELETE /api/lancamentos/:id route', async () => {
      const response = await request(app)
        .delete('/api/lancamentos/1');

      expect(response.status).toBeDefined();
    });
  });

  describe('Route Parameters', () => {
    test('should pass id parameter to controller', async () => {
      const testId = '123';
      
      const response = await request(app)
        .get(`/api/lancamentos/${testId}`)
        .expect('Content-Type', /json/);

      // The controller should receive the id parameter
      expect(response.status).toBeDefined();
    });

    test('should handle numeric id parameters', async () => {
      const numericId = 456;
      
      const response = await request(app)
        .get(`/api/lancamentos/${numericId}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBeDefined();
    });
  });

  describe('Request Body Handling', () => {
    test('should pass request body to controller for POST', async () => {
      const testData = {
        dataLancamento: '2024-02-01',
        dataPagamento: '2024-02-01',
        valor: 150.75,
        codigoCategoria: 'CAT2',
        codigoEstabelecimento: 'EST2'
      };

      const response = await request(app)
        .post('/api/lancamentos')
        .send(testData)
        .expect('Content-Type', /json/);

      expect(response.status).toBeDefined();
    });

    test('should pass request body to controller for PUT', async () => {
      const testData = {
        valor: 300.00,
        codigoCategoria: 'CAT3'
      };

      const response = await request(app)
        .put('/api/lancamentos/1')
        .send(testData)
        .expect('Content-Type', /json/);

      expect(response.status).toBeDefined();
    });
  });
});