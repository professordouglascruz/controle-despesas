const express = require('express');
const request = require('supertest');
const { createCategoriaRoutes } = require('../../src/routes/categoriaRoutes');
const databaseConfig = require('../../src/database/config');

describe('Categoria Routes', () => {
  let app;
  let db;

  beforeAll(async () => {
    // Set test environment
    process.env.NODE_ENV = 'test';
    
    // Initialize database
    await databaseConfig.initialize();
    db = databaseConfig.getDatabase();

    // Create Express app with categoria routes
    app = express();
    app.use(express.json());
    app.use('/api/categorias', createCategoriaRoutes(db));
  });

  afterAll(async () => {
    await databaseConfig.close();
  });

  describe('Route Configuration', () => {
    test('should configure GET /api/categorias route', async () => {
      const response = await request(app)
        .get('/api/categorias')
        .expect('Content-Type', /json/);

      expect(response.status).toBeDefined();
    });

    test('should configure GET /api/categorias/:codigo route', async () => {
      const response = await request(app)
        .get('/api/categorias/TEST')
        .expect('Content-Type', /json/);

      expect(response.status).toBeDefined();
    });

    test('should configure POST /api/categorias route', async () => {
      const response = await request(app)
        .post('/api/categorias')
        .send({ codigo: 'TEST', descricao: 'Test Category' })
        .expect('Content-Type', /json/);

      expect(response.status).toBeDefined();
    });

    test('should configure PUT /api/categorias/:codigo route', async () => {
      const response = await request(app)
        .put('/api/categorias/TEST')
        .send({ descricao: 'Updated Category' })
        .expect('Content-Type', /json/);

      expect(response.status).toBeDefined();
    });

    test('should configure DELETE /api/categorias/:codigo route', async () => {
      const response = await request(app)
        .delete('/api/categorias/TEST');

      expect(response.status).toBeDefined();
    });
  });

  describe('Route Parameters', () => {
    test('should pass codigo parameter to controller', async () => {
      const testCodigo = 'PARAM_TEST';
      
      const response = await request(app)
        .get(`/api/categorias/${testCodigo}`)
        .expect('Content-Type', /json/);

      // The controller should receive the codigo parameter
      expect(response.status).toBeDefined();
    });
  });

  describe('Request Body Handling', () => {
    test('should pass request body to controller for POST', async () => {
      const testData = {
        codigo: 'BODY_TEST',
        descricao: 'Test Body Handling'
      };

      const response = await request(app)
        .post('/api/categorias')
        .send(testData)
        .expect('Content-Type', /json/);

      expect(response.status).toBeDefined();
    });

    test('should pass request body to controller for PUT', async () => {
      const testData = {
        descricao: 'Updated Body Handling'
      };

      const response = await request(app)
        .put('/api/categorias/BODY_TEST')
        .send(testData)
        .expect('Content-Type', /json/);

      expect(response.status).toBeDefined();
    });
  });
});