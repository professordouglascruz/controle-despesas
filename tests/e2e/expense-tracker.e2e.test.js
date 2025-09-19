const request = require('supertest');
const { ExpenseTrackerApp } = require('../../src/app');
const databaseConfig = require('../../src/database/config');
const migrationManager = require('../../src/database/migrationManager');

describe('Expense Tracker End-to-End Tests', () => {
  let app;
  let appInstance;

  beforeAll(async () => {
    // Set test environment
    process.env.NODE_ENV = 'test';

    appInstance = new ExpenseTrackerApp();
    await appInstance.initialize();

    // Run migrations after app initialization
    await migrationManager.runMigrations();

    app = appInstance.getApp();
  });

  afterAll(async () => {
    if (appInstance) {
      await appInstance.close();
    }
  });

  beforeEach(async () => {
    // Clean database before each test
    try {
      await databaseConfig.run('DELETE FROM lancamentos');
      await databaseConfig.run('DELETE FROM estabelecimentos');
      await databaseConfig.run('DELETE FROM categorias');
    } catch (error) {
      console.error('Error cleaning database:', error);
    }
  });

  describe('Complete User Flow - Category Management', () => {
    it('should handle complete category lifecycle', async () => {
      // 1. Create a new category
      const novaCategoria = {
        codigo: 'FOOD',
        descricao: 'Alimentação'
      };

      const createResponse = await request(app)
        .post('/api/categorias')
        .send(novaCategoria)
        .expect(201);

      expect(createResponse.body).toMatchObject(novaCategoria);
      expect(createResponse.body.createdAt).toBeDefined();

      // 2. List all categories and verify it's there
      const listResponse = await request(app)
        .get('/api/categorias')
        .expect(200);

      expect(listResponse.body).toHaveLength(1);
      expect(listResponse.body[0]).toMatchObject(novaCategoria);

      // 3. Get specific category
      const getResponse = await request(app)
        .get('/api/categorias/FOOD')
        .expect(200);

      expect(getResponse.body).toMatchObject(novaCategoria);

      // 4. Update category
      const updateData = { descricao: 'Alimentação e Bebidas' };
      const updateResponse = await request(app)
        .put('/api/categorias/FOOD')
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.descricao).toBe('Alimentação e Bebidas');
      expect(updateResponse.body.codigo).toBe('FOOD');

      // 5. Verify update persisted
      const verifyResponse = await request(app)
        .get('/api/categorias/FOOD')
        .expect(200);

      expect(verifyResponse.body.descricao).toBe('Alimentação e Bebidas');

      // 6. Delete category
      await request(app)
        .delete('/api/categorias/FOOD')
        .expect(204);

      // 7. Verify category was deleted
      await request(app)
        .get('/api/categorias/FOOD')
        .expect(404);

      // 8. Verify list is empty
      const finalListResponse = await request(app)
        .get('/api/categorias')
        .expect(200);

      expect(finalListResponse.body).toHaveLength(0);
    });
  });

  describe('Complete User Flow - Establishment Management', () => {
    it('should handle complete establishment lifecycle', async () => {
      // 1. Create a new establishment
      const novoEstabelecimento = {
        codigo: 'REST001',
        nome: 'Restaurante do João',
        endereco: 'Rua das Flores, 123, Centro',
        telefone: '11987654321'
      };

      const createResponse = await request(app)
        .post('/api/estabelecimentos')
        .send(novoEstabelecimento)
        .expect(201);

      expect(createResponse.body).toMatchObject(novoEstabelecimento);

      // 2. List all establishments
      const listResponse = await request(app)
        .get('/api/estabelecimentos')
        .expect(200);

      expect(listResponse.body).toHaveLength(1);
      expect(listResponse.body[0]).toMatchObject(novoEstabelecimento);

      // 3. Get specific establishment
      const getResponse = await request(app)
        .get('/api/estabelecimentos/REST001')
        .expect(200);

      expect(getResponse.body).toMatchObject(novoEstabelecimento);

      // 4. Update establishment
      const updateData = {
        nome: 'Restaurante do João Silva',
        endereco: 'Rua das Flores, 123, Centro - São Paulo',
        telefone: '11987654322'
      };

      const updateResponse = await request(app)
        .put('/api/estabelecimentos/REST001')
        .send(updateData)
        .expect(200);

      expect(updateResponse.body).toMatchObject({
        codigo: 'REST001',
        ...updateData
      });

      // 5. Delete establishment
      await request(app)
        .delete('/api/estabelecimentos/REST001')
        .expect(204);

      // 6. Verify establishment was deleted
      await request(app)
        .get('/api/estabelecimentos/REST001')
        .expect(404);
    });
  });

  describe('Complete User Flow - Expense Entry Management', () => {
    it('should handle complete expense entry lifecycle with dependencies', async () => {
      // 1. First create required category and establishment
      const categoria = {
        codigo: 'FOOD',
        descricao: 'Alimentação'
      };

      const estabelecimento = {
        codigo: 'REST001',
        nome: 'Restaurante do João',
        endereco: 'Rua das Flores, 123',
        telefone: '11987654321'
      };

      await request(app)
        .post('/api/categorias')
        .send(categoria)
        .expect(201);

      await request(app)
        .post('/api/estabelecimentos')
        .send(estabelecimento)
        .expect(201);

      // 2. Create expense entry
      const novoLancamento = {
        dataLancamento: '2024-01-15',
        dataPagamento: '2024-01-15',
        valor: 45.50,
        codigoCategoria: 'FOOD',
        codigoEstabelecimento: 'REST001'
      };

      const createResponse = await request(app)
        .post('/api/lancamentos')
        .send(novoLancamento)
        .expect(201);

      expect(createResponse.body).toMatchObject({
        ...novoLancamento,
        dataLancamento: expect.any(String),
        dataPagamento: expect.any(String)
      });
      expect(createResponse.body.id).toBeDefined();

      const lancamentoId = createResponse.body.id;

      // 3. List all expense entries
      const listResponse = await request(app)
        .get('/api/lancamentos')
        .expect(200);

      expect(listResponse.body).toHaveLength(1);
      expect(listResponse.body[0]).toMatchObject({
        ...novoLancamento,
        dataLancamento: expect.any(String),
        dataPagamento: expect.any(String)
      });

      // 4. Get specific expense entry
      const getResponse = await request(app)
        .get(`/api/lancamentos/${lancamentoId}`)
        .expect(200);

      expect(getResponse.body).toMatchObject({
        ...novoLancamento,
        dataLancamento: expect.any(String),
        dataPagamento: expect.any(String)
      });

      // 5. Update expense entry
      const updateData = {
        dataLancamento: '2024-01-16',
        dataPagamento: '2024-01-17',
        valor: 52.75
      };

      const updateResponse = await request(app)
        .put(`/api/lancamentos/${lancamentoId}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body).toMatchObject({
        id: lancamentoId,
        valor: updateData.valor,
        codigoCategoria: 'FOOD',
        codigoEstabelecimento: 'REST001',
        dataLancamento: expect.any(String),
        dataPagamento: expect.any(String)
      });

      // 6. Delete expense entry
      await request(app)
        .delete(`/api/lancamentos/${lancamentoId}`)
        .expect(204);

      // 7. Verify expense entry was deleted
      await request(app)
        .get(`/api/lancamentos/${lancamentoId}`)
        .expect(404);
    });
  });

  describe('Referential Integrity Scenarios', () => {
    it('should prevent deletion of category with associated expense entries', async () => {
      // 1. Create category, establishment, and expense entry
      const categoria = {
        codigo: 'FOOD',
        descricao: 'Alimentação'
      };

      const estabelecimento = {
        codigo: 'REST001',
        nome: 'Restaurante do João',
        endereco: 'Rua das Flores, 123',
        telefone: '11987654321'
      };

      const lancamento = {
        dataLancamento: '2024-01-15',
        dataPagamento: '2024-01-15',
        valor: 45.50,
        codigoCategoria: 'FOOD',
        codigoEstabelecimento: 'REST001'
      };

      await request(app)
        .post('/api/categorias')
        .send(categoria)
        .expect(201);

      await request(app)
        .post('/api/estabelecimentos')
        .send(estabelecimento)
        .expect(201);

      await request(app)
        .post('/api/lancamentos')
        .send(lancamento)
        .expect(201);

      // 2. Try to delete category with associated expense entry
      const deleteResponse = await request(app)
        .delete('/api/categorias/FOOD')
        .expect(409);

      expect(deleteResponse.body.error.code).toBe('REFERENTIAL_INTEGRITY_ERROR');
      expect(deleteResponse.body.error.message).toContain('lançamento(s) associado(s)');

      // 3. Verify category still exists
      await request(app)
        .get('/api/categorias/FOOD')
        .expect(200);
    });

    it('should prevent deletion of establishment with associated expense entries', async () => {
      // 1. Create category, establishment, and expense entry
      const categoria = {
        codigo: 'FOOD',
        descricao: 'Alimentação'
      };

      const estabelecimento = {
        codigo: 'REST001',
        nome: 'Restaurante do João',
        endereco: 'Rua das Flores, 123',
        telefone: '11987654321'
      };

      const lancamento = {
        dataLancamento: '2024-01-15',
        dataPagamento: '2024-01-15',
        valor: 45.50,
        codigoCategoria: 'FOOD',
        codigoEstabelecimento: 'REST001'
      };

      await request(app)
        .post('/api/categorias')
        .send(categoria)
        .expect(201);

      await request(app)
        .post('/api/estabelecimentos')
        .send(estabelecimento)
        .expect(201);

      await request(app)
        .post('/api/lancamentos')
        .send(lancamento)
        .expect(201);

      // 2. Try to delete establishment with associated expense entry
      const deleteResponse = await request(app)
        .delete('/api/estabelecimentos/REST001')
        .expect(409);

      expect(deleteResponse.body.error.code).toBe('REFERENTIAL_INTEGRITY_ERROR');
      expect(deleteResponse.body.error.message).toContain('lançamento(s) associado(s)');

      // 3. Verify establishment still exists
      await request(app)
        .get('/api/estabelecimentos/REST001')
        .expect(200);
    });

    it('should allow deletion after removing associated expense entries', async () => {
      // 1. Create category, establishment, and expense entry
      const categoria = {
        codigo: 'FOOD',
        descricao: 'Alimentação'
      };

      const estabelecimento = {
        codigo: 'REST001',
        nome: 'Restaurante do João',
        endereco: 'Rua das Flores, 123',
        telefone: '11987654321'
      };

      const lancamento = {
        dataLancamento: '2024-01-15',
        dataPagamento: '2024-01-15',
        valor: 45.50,
        codigoCategoria: 'FOOD',
        codigoEstabelecimento: 'REST001'
      };

      await request(app)
        .post('/api/categorias')
        .send(categoria)
        .expect(201);

      await request(app)
        .post('/api/estabelecimentos')
        .send(estabelecimento)
        .expect(201);

      const lancamentoResponse = await request(app)
        .post('/api/lancamentos')
        .send(lancamento)
        .expect(201);

      const lancamentoId = lancamentoResponse.body.id;

      // 2. First delete the expense entry
      await request(app)
        .delete(`/api/lancamentos/${lancamentoId}`)
        .expect(204);

      // 3. Now delete category should work
      await request(app)
        .delete('/api/categorias/FOOD')
        .expect(204);

      // 4. And delete establishment should work
      await request(app)
        .delete('/api/estabelecimentos/REST001')
        .expect(204);

      // 5. Verify all were deleted
      await request(app)
        .get('/api/categorias/FOOD')
        .expect(404);

      await request(app)
        .get('/api/estabelecimentos/REST001')
        .expect(404);
    });

    it('should prevent creating expense entry with non-existent category', async () => {
      // 1. Create only establishment
      const estabelecimento = {
        codigo: 'REST001',
        nome: 'Restaurante do João',
        endereco: 'Rua das Flores, 123',
        telefone: '11987654321'
      };

      await request(app)
        .post('/api/estabelecimentos')
        .send(estabelecimento)
        .expect(201);

      // 2. Try to create expense entry with non-existent category
      const lancamento = {
        dataLancamento: '2024-01-15',
        dataPagamento: '2024-01-15',
        valor: 45.50,
        codigoCategoria: 'NONEXISTENT',
        codigoEstabelecimento: 'REST001'
      };

      const response = await request(app)
        .post('/api/lancamentos')
        .send(lancamento)
        .expect(404);

      expect(response.body.error.code).toBe('NOT_FOUND_ERROR');
      expect(response.body.error.message).toContain('Categoria não encontrada');
    });

    it('should prevent creating expense entry with non-existent establishment', async () => {
      // 1. Create only category
      const categoria = {
        codigo: 'FOOD',
        descricao: 'Alimentação'
      };

      await request(app)
        .post('/api/categorias')
        .send(categoria)
        .expect(201);

      // 2. Try to create expense entry with non-existent establishment
      const lancamento = {
        dataLancamento: '2024-01-15',
        dataPagamento: '2024-01-15',
        valor: 45.50,
        codigoCategoria: 'FOOD',
        codigoEstabelecimento: 'NONEXISTENT'
      };

      const response = await request(app)
        .post('/api/lancamentos')
        .send(lancamento)
        .expect(404);

      expect(response.body.error.code).toBe('NOT_FOUND_ERROR');
      expect(response.body.error.message).toContain('Estabelecimento não encontrado');
    });
  });

  describe('Error Handling Scenarios', () => {
    it('should handle validation errors consistently across all entities', async () => {
      // Test category validation errors
      const invalidCategory = {
        codigo: '',
        descricao: ''
      };

      const categoryResponse = await request(app)
        .post('/api/categorias')
        .send(invalidCategory)
        .expect(400);

      expect(categoryResponse.body.error.code).toBe('VALIDATION_ERROR');
      expect(categoryResponse.body.error.details).toBeDefined();

      // Test establishment validation errors
      const invalidEstablishment = {
        codigo: '',
        nome: '',
        endereco: '',
        telefone: ''
      };

      const establishmentResponse = await request(app)
        .post('/api/estabelecimentos')
        .send(invalidEstablishment)
        .expect(400);

      expect(establishmentResponse.body.error.code).toBe('VALIDATION_ERROR');
      expect(establishmentResponse.body.error.details).toBeDefined();

      // Test expense entry validation errors
      const invalidLancamento = {
        dataLancamento: '',
        dataPagamento: '',
        valor: -10,
        codigoCategoria: '',
        codigoEstabelecimento: ''
      };

      const lancamentoResponse = await request(app)
        .post('/api/lancamentos')
        .send(invalidLancamento)
        .expect(400);

      expect(lancamentoResponse.body.error.code).toBe('VALIDATION_ERROR');
      expect(lancamentoResponse.body.error.details).toBeDefined();
    });

    it('should handle not found errors consistently', async () => {
      // Test category not found
      const categoryResponse = await request(app)
        .get('/api/categorias/NONEXISTENT')
        .expect(404);

      expect(categoryResponse.body.error.code).toBe('NOT_FOUND_ERROR');

      // Test establishment not found
      const establishmentResponse = await request(app)
        .get('/api/estabelecimentos/NONEXISTENT')
        .expect(404);

      expect(establishmentResponse.body.error.code).toBe('NOT_FOUND_ERROR');

      // Test expense entry not found
      const lancamentoResponse = await request(app)
        .get('/api/lancamentos/99999')
        .expect(404);

      expect(lancamentoResponse.body.error.code).toBe('NOT_FOUND_ERROR');
    });

    it('should handle duplicate key errors consistently', async () => {
      // Create category
      const categoria = {
        codigo: 'FOOD',
        descricao: 'Alimentação'
      };

      await request(app)
        .post('/api/categorias')
        .send(categoria)
        .expect(201);

      // Try to create duplicate category
      const duplicateCategoryResponse = await request(app)
        .post('/api/categorias')
        .send(categoria)
        .expect(409);

      expect(duplicateCategoryResponse.body.error.code).toBe('CONFLICT_ERROR');

      // Create establishment
      const estabelecimento = {
        codigo: 'REST001',
        nome: 'Restaurante do João',
        endereco: 'Rua das Flores, 123',
        telefone: '11987654321'
      };

      await request(app)
        .post('/api/estabelecimentos')
        .send(estabelecimento)
        .expect(201);

      // Try to create duplicate establishment
      const duplicateEstablishmentResponse = await request(app)
        .post('/api/estabelecimentos')
        .send(estabelecimento)
        .expect(409);

      expect(duplicateEstablishmentResponse.body.error.code).toBe('CONFLICT_ERROR');
    });
  });

  describe('Complex Business Scenarios', () => {
    it('should handle multiple expense entries for same category and establishment', async () => {
      // 1. Create category and establishment
      const categoria = {
        codigo: 'FOOD',
        descricao: 'Alimentação'
      };

      const estabelecimento = {
        codigo: 'REST001',
        nome: 'Restaurante do João',
        endereco: 'Rua das Flores, 123',
        telefone: '11987654321'
      };

      await request(app)
        .post('/api/categorias')
        .send(categoria)
        .expect(201);

      await request(app)
        .post('/api/estabelecimentos')
        .send(estabelecimento)
        .expect(201);

      // 2. Create multiple expense entries
      const lancamentos = [
        {
          dataLancamento: '2024-01-15',
          dataPagamento: '2024-01-15',
          valor: 45.50,
          codigoCategoria: 'FOOD',
          codigoEstabelecimento: 'REST001'
        },
        {
          dataLancamento: '2024-01-16',
          dataPagamento: '2024-01-16',
          valor: 32.75,
          codigoCategoria: 'FOOD',
          codigoEstabelecimento: 'REST001'
        },
        {
          dataLancamento: '2024-01-17',
          dataPagamento: '2024-01-18',
          valor: 67.25,
          codigoCategoria: 'FOOD',
          codigoEstabelecimento: 'REST001'
        }
      ];

      const createdLancamentos = [];
      for (const lancamento of lancamentos) {
        const response = await request(app)
          .post('/api/lancamentos')
          .send(lancamento)
          .expect(201);
        createdLancamentos.push(response.body);
      }

      // 3. Verify all expense entries were created
      const listResponse = await request(app)
        .get('/api/lancamentos')
        .expect(200);

      expect(listResponse.body).toHaveLength(3);

      // 4. Try to delete category - should fail due to multiple associations
      const deleteResponse = await request(app)
        .delete('/api/categorias/FOOD')
        .expect(409);

      expect(deleteResponse.body.error.code).toBe('REFERENTIAL_INTEGRITY_ERROR');
      expect(deleteResponse.body.error.message).toContain('3 lançamento(s) associado(s)');

      // 5. Delete all expense entries one by one
      for (const lancamento of createdLancamentos) {
        await request(app)
          .delete(`/api/lancamentos/${lancamento.id}`)
          .expect(204);
      }

      // 6. Now category deletion should work
      await request(app)
        .delete('/api/categorias/FOOD')
        .expect(204);
    });

    it('should handle cross-entity updates correctly', async () => {
      // 1. Create initial data
      const categoria1 = { codigo: 'FOOD', descricao: 'Alimentação' };
      const categoria2 = { codigo: 'TRANS', descricao: 'Transporte' };
      const estabelecimento1 = { codigo: 'REST001', nome: 'Restaurante A', endereco: 'Rua A, 123', telefone: '11111111111' };
      const estabelecimento2 = { codigo: 'REST002', nome: 'Restaurante B', endereco: 'Rua B, 456', telefone: '22222222222' };

      await request(app).post('/api/categorias').send(categoria1).expect(201);
      await request(app).post('/api/categorias').send(categoria2).expect(201);
      await request(app).post('/api/estabelecimentos').send(estabelecimento1).expect(201);
      await request(app).post('/api/estabelecimentos').send(estabelecimento2).expect(201);

      // 2. Create expense entry
      const lancamento = {
        dataLancamento: '2024-01-15',
        dataPagamento: '2024-01-15',
        valor: 45.50,
        codigoCategoria: 'FOOD',
        codigoEstabelecimento: 'REST001'
      };

      const createResponse = await request(app)
        .post('/api/lancamentos')
        .send(lancamento)
        .expect(201);

      const lancamentoId = createResponse.body.id;

      // 3. Update expense entry to use different category and establishment
      const updateData = {
        codigoCategoria: 'TRANS',
        codigoEstabelecimento: 'REST002',
        valor: 25.00
      };

      const updateResponse = await request(app)
        .put(`/api/lancamentos/${lancamentoId}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body).toMatchObject({
        id: lancamentoId,
        codigoCategoria: 'TRANS',
        codigoEstabelecimento: 'REST002',
        valor: 25.00
      });

      // 4. Now FOOD category should be deletable (no associations)
      await request(app)
        .delete('/api/categorias/FOOD')
        .expect(204);

      // 5. And REST001 establishment should be deletable (no associations)
      await request(app)
        .delete('/api/estabelecimentos/REST001')
        .expect(204);

      // 6. But TRANS category and REST002 establishment should not be deletable
      await request(app)
        .delete('/api/categorias/TRANS')
        .expect(409);

      await request(app)
        .delete('/api/estabelecimentos/REST002')
        .expect(409);
    });

    it('should handle edge cases with date and value validations', async () => {
      // 1. Create dependencies
      const categoria = { codigo: 'FOOD', descricao: 'Alimentação' };
      const estabelecimento = { codigo: 'REST001', nome: 'Restaurante', endereco: 'Rua A, 123', telefone: '11111111111' };

      await request(app).post('/api/categorias').send(categoria).expect(201);
      await request(app).post('/api/estabelecimentos').send(estabelecimento).expect(201);

      // 2. Test invalid date formats
      const invalidDateLancamento = {
        dataLancamento: 'invalid-date',
        dataPagamento: '2024-01-15',
        valor: 45.50,
        codigoCategoria: 'FOOD',
        codigoEstabelecimento: 'REST001'
      };

      await request(app)
        .post('/api/lancamentos')
        .send(invalidDateLancamento)
        .expect(400);

      // 3. Test negative values
      const negativeValueLancamento = {
        dataLancamento: '2024-01-15',
        dataPagamento: '2024-01-15',
        valor: -10.50,
        codigoCategoria: 'FOOD',
        codigoEstabelecimento: 'REST001'
      };

      await request(app)
        .post('/api/lancamentos')
        .send(negativeValueLancamento)
        .expect(400);

      // 4. Test zero values (should be rejected)
      const zeroValueLancamento = {
        dataLancamento: '2024-01-15',
        dataPagamento: '2024-01-15',
        valor: 0,
        codigoCategoria: 'FOOD',
        codigoEstabelecimento: 'REST001'
      };

      await request(app)
        .post('/api/lancamentos')
        .send(zeroValueLancamento)
        .expect(400);

      // 5. Test very large values
      const largeValueLancamento = {
        dataLancamento: '2024-01-15',
        dataPagamento: '2024-01-15',
        valor: 999999.99,
        codigoCategoria: 'FOOD',
        codigoEstabelecimento: 'REST001'
      };

      await request(app)
        .post('/api/lancamentos')
        .send(largeValueLancamento)
        .expect(201);
    });
  });

  describe('API Health and Status', () => {
    it('should provide consistent API information', async () => {
      const response = await request(app)
        .get('/api')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Expense Tracker API');
      expect(response.body).toHaveProperty('version', '1.0.0');
      expect(response.body).toHaveProperty('endpoints');
      expect(response.body.endpoints).toHaveProperty('categorias');
      expect(response.body.endpoints).toHaveProperty('estabelecimentos');
      expect(response.body.endpoints).toHaveProperty('lancamentos');
      expect(response.body.endpoints).toHaveProperty('health');
    });

    it('should provide health check endpoint', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('service', 'expense-tracker-api');
    });
  });
});