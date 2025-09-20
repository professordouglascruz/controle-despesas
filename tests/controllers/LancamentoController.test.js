const request = require('supertest');
const express = require('express');
const dbConfig = require('../../src/database/config');
const migrationManager = require('../../src/database/migrationManager');
const { LancamentoController } = require('../../src/controllers/LancamentoController');

describe('LancamentoController Integration Tests', () => {
  let app;
  let controller;

  beforeAll(async () => {
    // Configurar banco de dados em memória para testes
    process.env.NODE_ENV = 'test';
    await dbConfig.connect();
    await migrationManager.runMigrations();

    // Configurar Express app para testes
    app = express();
    app.use(express.json());

    // Instanciar controller
    controller = new LancamentoController(dbConfig.getDatabase());

    // Configurar rotas
    app.get('/api/lancamentos', (req, res) => controller.findAll(req, res));
    app.get('/api/lancamentos/:id', (req, res) => controller.findById(req, res));
    app.post('/api/lancamentos', (req, res) => controller.create(req, res));
    app.put('/api/lancamentos/:id', (req, res) => controller.update(req, res));
    app.delete('/api/lancamentos/:id', (req, res) => controller.delete(req, res));
  });

  afterAll(async () => {
    await dbConfig.close();
  });

  beforeEach(async () => {
    // Limpar dados antes de cada teste
    try {
      await dbConfig.run('DELETE FROM lancamentos');
      await dbConfig.run('DELETE FROM categorias');
      await dbConfig.run('DELETE FROM estabelecimentos');
    } catch (error) {
      console.error('Error cleaning database:', error);
    }
  });

  // Helper para criar categoria e estabelecimento necessários
  async function createDependencies() {
    const categoria = {
      codigo: 'CAT001',
      descricao: 'Alimentação'
    };

    const estabelecimento = {
      codigo: 'EST001',
      nome: 'Restaurante Teste',
      endereco: 'Rua Teste, 123',
      telefone: '11999999999'
    };

    await dbConfig.run(
      'INSERT INTO categorias (codigo, descricao) VALUES (?, ?)',
      [categoria.codigo, categoria.descricao]
    );

    await dbConfig.run(
      'INSERT INTO estabelecimentos (codigo, nome, endereco, telefone) VALUES (?, ?, ?, ?)',
      [estabelecimento.codigo, estabelecimento.nome, estabelecimento.endereco, estabelecimento.telefone]
    );

    return { categoria, estabelecimento };
  }

  describe('POST /api/lancamentos', () => {
    it('deve criar um novo lançamento com dados válidos', async () => {
      await createDependencies();

      const novoLancamento = {
        dataLancamento: '2024-01-15',
        dataPagamento: '2024-01-15',
        valor: 150.50,
        descricao: 'Almoço no restaurante',
        codigoCategoria: 'CAT001',
        codigoEstabelecimento: 'EST001'
      };

      const response = await request(app)
        .post('/api/lancamentos')
        .send(novoLancamento)
        .expect(201);

      expect(response.body).toMatchObject({
        dataLancamento: '2024-01-15T00:00:00.000Z',
        dataPagamento: '2024-01-15T00:00:00.000Z',
        valor: 150.50,
        descricao: 'Almoço no restaurante',
        codigoCategoria: 'CAT001',
        codigoEstabelecimento: 'EST001'
      });
      expect(response.body.id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();
    });

    it('deve retornar erro 400 para dados inválidos', async () => {
      const lancamentoInvalido = {
        dataLancamento: '',
        dataPagamento: '',
        valor: -100,
        codigoCategoria: '',
        codigoEstabelecimento: ''
      };

      const response = await request(app)
        .post('/api/lancamentos')
        .send(lancamentoInvalido)
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details).toBeDefined();
    });

    it('deve retornar erro 400 para categoria inexistente', async () => {
      await createDependencies();

      const lancamento = {
        dataLancamento: '2024-01-15',
        dataPagamento: '2024-01-15',
        valor: 150.50,
        codigoCategoria: 'INEXISTENTE',
        codigoEstabelecimento: 'EST001'
      };

      const response = await request(app)
        .post('/api/lancamentos')
        .send(lancamento)
        .expect(404);

      expect(response.body.error.code).toBe('NOT_FOUND_ERROR');
      expect(response.body.error.message).toContain('Categoria não encontrada');
    });

    it('deve retornar erro 400 para estabelecimento inexistente', async () => {
      await createDependencies();

      const lancamento = {
        dataLancamento: '2024-01-15',
        dataPagamento: '2024-01-15',
        valor: 150.50,
        codigoCategoria: 'CAT001',
        codigoEstabelecimento: 'INEXISTENTE'
      };

      const response = await request(app)
        .post('/api/lancamentos')
        .send(lancamento)
        .expect(404);

      expect(response.body.error.code).toBe('NOT_FOUND_ERROR');
      expect(response.body.error.message).toContain('Estabelecimento não encontrado');
    });
  });

  describe('GET /api/lancamentos', () => {
    it('deve retornar lista vazia quando não há lançamentos', async () => {
      const response = await request(app)
        .get('/api/lancamentos')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('deve retornar todos os lançamentos cadastrados', async () => {
      await createDependencies();

      // Criar lançamentos de teste
      const lancamentos = [
        {
          dataLancamento: '2024-01-15',
          dataPagamento: '2024-01-15',
          valor: 100.00,
          descricao: 'Primeiro lançamento',
          codigoCategoria: 'CAT001',
          codigoEstabelecimento: 'EST001'
        },
        {
          dataLancamento: '2024-01-16',
          dataPagamento: '2024-01-16',
          valor: 200.00,
          descricao: 'Segundo lançamento',
          codigoCategoria: 'CAT001',
          codigoEstabelecimento: 'EST001'
        }
      ];

      for (const lancamento of lancamentos) {
        await request(app)
          .post('/api/lancamentos')
          .send(lancamento);
      }

      const response = await request(app)
        .get('/api/lancamentos')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toMatchObject({
        ...lancamentos[0],
        dataLancamento: '2024-01-15T00:00:00.000Z',
        dataPagamento: '2024-01-15T00:00:00.000Z'
      });
      expect(response.body[1]).toMatchObject({
        ...lancamentos[1],
        dataLancamento: '2024-01-16T00:00:00.000Z',
        dataPagamento: '2024-01-16T00:00:00.000Z'
      });
    });
  });

  describe('GET /api/lancamentos/:id', () => {
    it('deve retornar lançamento específico quando existe', async () => {
      await createDependencies();

      const lancamento = {
        dataLancamento: '2024-01-15',
        dataPagamento: '2024-01-15',
        valor: 150.50,
        codigoCategoria: 'CAT001',
        codigoEstabelecimento: 'EST001'
      };

      const createResponse = await request(app)
        .post('/api/lancamentos')
        .send(lancamento);

      const response = await request(app)
        .get(`/api/lancamentos/${createResponse.body.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        ...lancamento,
        dataLancamento: '2024-01-15T00:00:00.000Z',
        dataPagamento: '2024-01-15T00:00:00.000Z'
      });
    });

    it('deve retornar erro 404 quando lançamento não existe', async () => {
      const response = await request(app)
        .get('/api/lancamentos/999')
        .expect(404);

      expect(response.body.error.code).toBe('NOT_FOUND_ERROR');
    });

    it('deve retornar erro 400 para ID inválido', async () => {
      const response = await request(app)
        .get('/api/lancamentos/abc')
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PUT /api/lancamentos/:id', () => {
    it('deve atualizar lançamento existente', async () => {
      await createDependencies();

      const lancamento = {
        dataLancamento: '2024-01-15',
        dataPagamento: '2024-01-15',
        valor: 150.50,
        codigoCategoria: 'CAT001',
        codigoEstabelecimento: 'EST001'
      };

      const createResponse = await request(app)
        .post('/api/lancamentos')
        .send(lancamento);

      const dadosAtualizacao = {
        dataLancamento: '2024-01-20',
        dataPagamento: '2024-01-20',
        valor: 200.00
      };

      const response = await request(app)
        .put(`/api/lancamentos/${createResponse.body.id}`)
        .send(dadosAtualizacao)
        .expect(200);

      expect(response.body.dataLancamento).toBe('2024-01-20T00:00:00.000Z');
      expect(response.body.dataPagamento).toBe('2024-01-20T00:00:00.000Z');
      expect(response.body.valor).toBe(200.00);
      expect(response.body.id).toBe(createResponse.body.id);
    });

    it('deve retornar erro 404 para lançamento inexistente', async () => {
      const dadosAtualizacao = {
        valor: 200.00
      };

      const response = await request(app)
        .put('/api/lancamentos/999')
        .send(dadosAtualizacao)
        .expect(404);

      expect(response.body.error.code).toBe('NOT_FOUND_ERROR');
    });

    it('deve retornar erro 400 para dados inválidos', async () => {
      await createDependencies();

      const lancamento = {
        dataLancamento: '2024-01-15',
        dataPagamento: '2024-01-15',
        valor: 150.50,
        codigoCategoria: 'CAT001',
        codigoEstabelecimento: 'EST001'
      };

      const createResponse = await request(app)
        .post('/api/lancamentos')
        .send(lancamento);

      const dadosInvalidos = {
        valor: -100
      };

      const response = await request(app)
        .put(`/api/lancamentos/${createResponse.body.id}`)
        .send(dadosInvalidos)
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('DELETE /api/lancamentos/:id', () => {
    it('deve excluir lançamento existente', async () => {
      await createDependencies();

      const lancamento = {
        dataLancamento: '2024-01-15',
        dataPagamento: '2024-01-15',
        valor: 150.50,
        codigoCategoria: 'CAT001',
        codigoEstabelecimento: 'EST001'
      };

      const createResponse = await request(app)
        .post('/api/lancamentos')
        .send(lancamento);

      await request(app)
        .delete(`/api/lancamentos/${createResponse.body.id}`)
        .expect(204);

      // Verificar se lançamento foi excluído
      await request(app)
        .get(`/api/lancamentos/${createResponse.body.id}`)
        .expect(404);
    });

    it('deve retornar erro 404 para lançamento inexistente', async () => {
      const response = await request(app)
        .delete('/api/lancamentos/999')
        .expect(404);

      expect(response.body.error.code).toBe('NOT_FOUND_ERROR');
    });

    it('deve retornar erro 400 para ID inválido', async () => {
      const response = await request(app)
        .delete('/api/lancamentos/abc')
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});