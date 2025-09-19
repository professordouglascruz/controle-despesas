const request = require('supertest');
const express = require('express');
const dbConfig = require('../../src/database/config');
const migrationManager = require('../../src/database/migrationManager');
const { EstabelecimentoController } = require('../../src/controllers/EstabelecimentoController');

describe('EstabelecimentoController Integration Tests', () => {
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
    controller = new EstabelecimentoController(dbConfig.getDatabase());

    // Configurar rotas
    app.get('/api/estabelecimentos', (req, res) => controller.findAll(req, res));
    app.get('/api/estabelecimentos/:codigo', (req, res) => controller.findByCodigo(req, res));
    app.post('/api/estabelecimentos', (req, res) => controller.create(req, res));
    app.put('/api/estabelecimentos/:codigo', (req, res) => controller.update(req, res));
    app.delete('/api/estabelecimentos/:codigo', (req, res) => controller.delete(req, res));
  });

  afterAll(async () => {
    await dbConfig.close();
  });

  beforeEach(async () => {
    // Limpar dados antes de cada teste
    try {
      await dbConfig.run('DELETE FROM lancamentos');
      await dbConfig.run('DELETE FROM estabelecimentos');
    } catch (error) {
      console.error('Error cleaning database:', error);
    }
  });

  describe('POST /api/estabelecimentos', () => {
    it('deve criar um novo estabelecimento com dados válidos', async () => {
      const novoEstabelecimento = {
        codigo: 'EST001',
        nome: 'Restaurante Teste',
        endereco: 'Rua Teste, 123',
        telefone: '11999999999'
      };

      const response = await request(app)
        .post('/api/estabelecimentos')
        .send(novoEstabelecimento)
        .expect(201);

      expect(response.body).toMatchObject({
        codigo: 'EST001',
        nome: 'Restaurante Teste',
        endereco: 'Rua Teste, 123',
        telefone: '11999999999'
      });
      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();
    });

    it('deve retornar erro 400 para dados inválidos', async () => {
      const estabelecimentoInvalido = {
        codigo: '',
        nome: '',
        endereco: '',
        telefone: ''
      };

      const response = await request(app)
        .post('/api/estabelecimentos')
        .send(estabelecimentoInvalido)
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details).toBeDefined();
    });

    it('deve retornar erro 409 para código duplicado', async () => {
      const estabelecimento = {
        codigo: 'EST001',
        nome: 'Restaurante Teste',
        endereco: 'Rua Teste, 123',
        telefone: '11999999999'
      };

      // Criar primeiro estabelecimento
      await request(app)
        .post('/api/estabelecimentos')
        .send(estabelecimento)
        .expect(201);

      // Tentar criar estabelecimento com mesmo código
      const response = await request(app)
        .post('/api/estabelecimentos')
        .send(estabelecimento)
        .expect(409);

      expect(response.body.error.code).toBe('CONFLICT_ERROR');
    });
  });

  describe('GET /api/estabelecimentos', () => {
    it('deve retornar lista vazia quando não há estabelecimentos', async () => {
      const response = await request(app)
        .get('/api/estabelecimentos')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('deve retornar todos os estabelecimentos cadastrados', async () => {
      // Criar estabelecimentos de teste
      const estabelecimentos = [
        { codigo: 'EST001', nome: 'Restaurante A', endereco: 'Rua A, 123', telefone: '11111111111' },
        { codigo: 'EST002', nome: 'Loja B', endereco: 'Rua B, 456', telefone: '22222222222' }
      ];

      for (const estabelecimento of estabelecimentos) {
        await request(app)
          .post('/api/estabelecimentos')
          .send(estabelecimento);
      }

      const response = await request(app)
        .get('/api/estabelecimentos')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toMatchObject(estabelecimentos[0]);
      expect(response.body[1]).toMatchObject(estabelecimentos[1]);
    });
  });

  describe('GET /api/estabelecimentos/:codigo', () => {
    it('deve retornar estabelecimento específico quando existe', async () => {
      const estabelecimento = {
        codigo: 'EST001',
        nome: 'Restaurante Teste',
        endereco: 'Rua Teste, 123',
        telefone: '11999999999'
      };

      await request(app)
        .post('/api/estabelecimentos')
        .send(estabelecimento);

      const response = await request(app)
        .get('/api/estabelecimentos/EST001')
        .expect(200);

      expect(response.body).toMatchObject(estabelecimento);
    });

    it('deve retornar erro 404 quando estabelecimento não existe', async () => {
      const response = await request(app)
        .get('/api/estabelecimentos/INEXISTENTE')
        .expect(404);

      expect(response.body.error.code).toBe('NOT_FOUND_ERROR');
    });

    it('deve retornar erro 400 para código vazio', async () => {
      const response = await request(app)
        .get('/api/estabelecimentos/%20')  // URL encoded space
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PUT /api/estabelecimentos/:codigo', () => {
    it('deve atualizar estabelecimento existente', async () => {
      const estabelecimento = {
        codigo: 'EST001',
        nome: 'Restaurante Teste',
        endereco: 'Rua Teste, 123',
        telefone: '11999999999'
      };

      await request(app)
        .post('/api/estabelecimentos')
        .send(estabelecimento);

      const dadosAtualizacao = {
        nome: 'Restaurante Atualizado',
        endereco: 'Rua Nova, 456',
        telefone: '11888888888'
      };

      const response = await request(app)
        .put('/api/estabelecimentos/EST001')
        .send(dadosAtualizacao)
        .expect(200);

      expect(response.body.nome).toBe('Restaurante Atualizado');
      expect(response.body.endereco).toBe('Rua Nova, 456');
      expect(response.body.telefone).toBe('11888888888');
      expect(response.body.codigo).toBe('EST001');
    });

    it('deve retornar erro 404 para estabelecimento inexistente', async () => {
      const dadosAtualizacao = {
        nome: 'Novo Nome'
      };

      const response = await request(app)
        .put('/api/estabelecimentos/INEXISTENTE')
        .send(dadosAtualizacao)
        .expect(404);

      expect(response.body.error.code).toBe('NOT_FOUND_ERROR');
    });

    it('deve retornar erro 400 para dados inválidos', async () => {
      const estabelecimento = {
        codigo: 'EST001',
        nome: 'Restaurante Teste',
        endereco: 'Rua Teste, 123',
        telefone: '11999999999'
      };

      await request(app)
        .post('/api/estabelecimentos')
        .send(estabelecimento);

      const dadosInvalidos = {
        nome: '',
        endereco: '',
        telefone: ''
      };

      const response = await request(app)
        .put('/api/estabelecimentos/EST001')
        .send(dadosInvalidos)
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('DELETE /api/estabelecimentos/:codigo', () => {
    it('deve excluir estabelecimento sem lançamentos associados', async () => {
      const estabelecimento = {
        codigo: 'EST001',
        nome: 'Restaurante Teste',
        endereco: 'Rua Teste, 123',
        telefone: '11999999999'
      };

      await request(app)
        .post('/api/estabelecimentos')
        .send(estabelecimento);

      await request(app)
        .delete('/api/estabelecimentos/EST001')
        .expect(204);

      // Verificar se estabelecimento foi excluído
      await request(app)
        .get('/api/estabelecimentos/EST001')
        .expect(404);
    });

    it('deve retornar erro 404 para estabelecimento inexistente', async () => {
      const response = await request(app)
        .delete('/api/estabelecimentos/INEXISTENTE')
        .expect(404);

      expect(response.body.error.code).toBe('NOT_FOUND_ERROR');
    });

    it('deve retornar erro 409 para estabelecimento com lançamentos associados', async () => {
      // Primeiro criar categoria e estabelecimento
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

      await request(app)
        .post('/api/estabelecimentos')
        .send(estabelecimento);

      // Criar categoria diretamente no banco para o teste
      await dbConfig.run(
        'INSERT INTO categorias (codigo, descricao) VALUES (?, ?)',
        [categoria.codigo, categoria.descricao]
      );

      // Criar lançamento associado
      await dbConfig.run(
        'INSERT INTO lancamentos (data_lancamento, data_pagamento, valor, codigo_categoria, codigo_estabelecimento) VALUES (?, ?, ?, ?, ?)',
        ['2024-01-01', '2024-01-01', 100.00, 'CAT001', 'EST001']
      );

      const response = await request(app)
        .delete('/api/estabelecimentos/EST001')
        .expect(409);

      expect(response.body.error.code).toBe('REFERENTIAL_INTEGRITY_ERROR');
    });
  });
});