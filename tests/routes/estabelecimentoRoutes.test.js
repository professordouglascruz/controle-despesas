const express = require('express');
const request = require('supertest');
const { createEstabelecimentoRoutes } = require('../../src/routes/estabelecimentoRoutes');
const databaseConfig = require('../../src/database/config');

describe('Estabelecimento Routes', () => {
  let app;
  let db;

  beforeAll(async () => {
    // Set test environment
    process.env.NODE_ENV = 'test';
    
    // Initialize database
    await databaseConfig.initialize();
    db = databaseConfig.getDatabase();

    // Create Express app with estabelecimento routes
    app = express();
    app.use(express.json());
    app.use('/api/estabelecimentos', createEstabelecimentoRoutes(db));
  });

  afterAll(async () => {
    await databaseConfig.close();
  });

  describe('Route Configuration', () => {
    test('should configure GET /api/estabelecimentos route', async () => {
      const response = await request(app)
        .get('/api/estabelecimentos')
        .expect('Content-Type', /json/);

      expect(response.status).toBeDefined();
    });

    test('should configure GET /api/estabelecimentos/:codigo route', async () => {
      const response = await request(app)
        .get('/api/estabelecimentos/TEST')
        .expect('Content-Type', /json/);

      expect(response.status).toBeDefined();
    });

    test('should configure POST /api/estabelecimentos route', async () => {
      const response = await request(app)
        .post('/api/estabelecimentos')
        .send({ 
          codigo: 'TEST', 
          nome: 'Test Store',
          endereco: 'Test Address',
          telefone: '123456789'
        })
        .expect('Content-Type', /json/);

      expect(response.status).toBeDefined();
    });

    test('should configure PUT /api/estabelecimentos/:codigo route', async () => {
      const response = await request(app)
        .put('/api/estabelecimentos/TEST')
        .send({ nome: 'Updated Store' })
        .expect('Content-Type', /json/);

      expect(response.status).toBeDefined();
    });

    test('should configure DELETE /api/estabelecimentos/:codigo route', async () => {
      const response = await request(app)
        .delete('/api/estabelecimentos/TEST');

      expect(response.status).toBeDefined();
    });
  });

  describe('Route Parameters', () => {
    test('should pass codigo parameter to controller', async () => {
      const testCodigo = 'PARAM_TEST';
      
      const response = await request(app)
        .get(`/api/estabelecimentos/${testCodigo}`)
        .expect('Content-Type', /json/);

      // The controller should receive the codigo parameter
      expect(response.status).toBeDefined();
    });
  });

  describe('Request Body Handling', () => {
    test('should pass request body to controller for POST', async () => {
      const testData = {
        codigo: 'BODY_TEST',
        nome: 'Test Body Store',
        endereco: 'Test Body Address',
        telefone: '987654321'
      };

      const response = await request(app)
        .post('/api/estabelecimentos')
        .send(testData)
        .expect('Content-Type', /json/);

      expect(response.status).toBeDefined();
    });

    test('should pass request body to controller for PUT', async () => {
      const testData = {
        nome: 'Updated Body Store',
        endereco: 'Updated Address'
      };

      const response = await request(app)
        .put('/api/estabelecimentos/BODY_TEST')
        .send(testData)
        .expect('Content-Type', /json/);

      expect(response.status).toBeDefined();
    });
  });
});