const request = require('supertest');
const express = require('express');
const dbConfig = require('../../src/database/config');
const migrationManager = require('../../src/database/migrationManager');
const { CategoriaController } = require('../../src/controllers/CategoriaController');

describe('CategoriaController Integration Tests', () => {
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
    controller = new CategoriaController(dbConfig.getDatabase());

    // Configurar rotas
    app.get('/api/categorias', (req, res) => controller.findAll(req, res));
    app.get('/api/categorias/:codigo', (req, res) => controller.findByCodigo(req, res));
    app.post('/api/categorias', (req, res) => controller.create(req, res));
    app.put('/api/categorias/:codigo', (req, res) => controller.update(req, res));
    app.delete('/api/categorias/:codigo', (req, res) => controller.delete(req, res));
  });

  afterAll(async () => {
    await dbConfig.close();
  });

  beforeEach(async () => {
    // Limpar dados antes de cada teste
    try {
      await dbConfig.run('DELETE FROM lancamentos');
      await dbConfig.run('DELETE FROM categorias');
    } catch (error) {
      console.error('Error cleaning database:', error);
    }
  });

  describe('POST /api/categorias', () => {
    it('deve criar uma nova categoria com dados válidos', async () => {
      const novaCategoria = {
        codigo: 'CAT001',
        descricao: 'Alimentação'
      };

      const response = await request(app)
        .post('/api/categorias')
        .send(novaCategoria)
        .expect(201);

      expect(response.body).toMatchObject({
        codigo: 'CAT001',
        descricao: 'Alimentação'
      });
      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();
    });

    it('deve retornar erro 400 para dados inválidos', async () => {
      const categoriaInvalida = {
        codigo: '',
        descricao: ''
      };

      const response = await request(app)
        .post('/api/categorias')
        .send(categoriaInvalida)
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details).toBeDefined();
    });

    it('deve retornar erro 409 para código duplicado', async () => {
      const categoria = {
        codigo: 'CAT001',
        descricao: 'Alimentação'
      };

      // Criar primeira categoria
      await request(app)
        .post('/api/categorias')
        .send(categoria)
        .expect(201);

      // Tentar criar categoria com mesmo código
      const response = await request(app)
        .post('/api/categorias')
        .send(categoria)
        .expect(409);

      expect(response.body.error.code).toBe('CONFLICT_ERROR');
    });
  });

  describe('GET /api/categorias', () => {
    it('deve retornar lista vazia quando não há categorias', async () => {
      const response = await request(app)
        .get('/api/categorias')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('deve retornar todas as categorias cadastradas', async () => {
      // Criar categorias de teste
      const categorias = [
        { codigo: 'CAT001', descricao: 'Alimentação' },
        { codigo: 'CAT002', descricao: 'Transporte' }
      ];

      for (const categoria of categorias) {
        await request(app)
          .post('/api/categorias')
          .send(categoria);
      }

      const response = await request(app)
        .get('/api/categorias')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toMatchObject(categorias[0]);
      expect(response.body[1]).toMatchObject(categorias[1]);
    });
  });

  describe('GET /api/categorias/:codigo', () => {
    it('deve retornar categoria específica quando existe', async () => {
      const categoria = {
        codigo: 'CAT001',
        descricao: 'Alimentação'
      };

      await request(app)
        .post('/api/categorias')
        .send(categoria);

      const response = await request(app)
        .get('/api/categorias/CAT001')
        .expect(200);

      expect(response.body).toMatchObject(categoria);
    });

    it('deve retornar erro 404 quando categoria não existe', async () => {
      const response = await request(app)
        .get('/api/categorias/INEXISTENTE')
        .expect(404);

      expect(response.body.error.code).toBe('NOT_FOUND_ERROR');
    });

    it('deve retornar erro 400 para código vazio', async () => {
      const response = await request(app)
        .get('/api/categorias/%20')  // URL encoded space
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PUT /api/categorias/:codigo', () => {
    it('deve atualizar categoria existente', async () => {
      const categoria = {
        codigo: 'CAT001',
        descricao: 'Alimentação'
      };

      await request(app)
        .post('/api/categorias')
        .send(categoria);

      const dadosAtualizacao = {
        descricao: 'Alimentação e Bebidas'
      };

      const response = await request(app)
        .put('/api/categorias/CAT001')
        .send(dadosAtualizacao)
        .expect(200);

      expect(response.body.descricao).toBe('Alimentação e Bebidas');
      expect(response.body.codigo).toBe('CAT001');
    });

    it('deve retornar erro 404 para categoria inexistente', async () => {
      const dadosAtualizacao = {
        descricao: 'Nova Descrição'
      };

      const response = await request(app)
        .put('/api/categorias/INEXISTENTE')
        .send(dadosAtualizacao)
        .expect(404);

      expect(response.body.error.code).toBe('NOT_FOUND_ERROR');
    });

    it('deve retornar erro 400 para dados inválidos', async () => {
      const categoria = {
        codigo: 'CAT001',
        descricao: 'Alimentação'
      };

      await request(app)
        .post('/api/categorias')
        .send(categoria);

      const dadosInvalidos = {
        descricao: ''
      };

      const response = await request(app)
        .put('/api/categorias/CAT001')
        .send(dadosInvalidos)
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('DELETE /api/categorias/:codigo', () => {
    it('deve excluir categoria sem lançamentos associados', async () => {
      const categoria = {
        codigo: 'CAT001',
        descricao: 'Alimentação'
      };

      await request(app)
        .post('/api/categorias')
        .send(categoria);

      await request(app)
        .delete('/api/categorias/CAT001')
        .expect(204);

      // Verificar se categoria foi excluída
      await request(app)
        .get('/api/categorias/CAT001')
        .expect(404);
    });

    it('deve retornar erro 404 para categoria inexistente', async () => {
      const response = await request(app)
        .delete('/api/categorias/INEXISTENTE')
        .expect(404);

      expect(response.body.error.code).toBe('NOT_FOUND_ERROR');
    });

    it('deve retornar erro 409 para categoria com lançamentos associados', async () => {
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
        .post('/api/categorias')
        .send(categoria);

      // Criar estabelecimento diretamente no banco para o teste
      await dbConfig.run(
        'INSERT INTO estabelecimentos (codigo, nome, endereco, telefone) VALUES (?, ?, ?, ?)',
        [estabelecimento.codigo, estabelecimento.nome, estabelecimento.endereco, estabelecimento.telefone]
      );

      // Criar lançamento associado
      await dbConfig.run(
        'INSERT INTO lancamentos (data_lancamento, data_pagamento, valor, codigo_categoria, codigo_estabelecimento) VALUES (?, ?, ?, ?, ?)',
        ['2024-01-01', '2024-01-01', 100.00, 'CAT001', 'EST001']
      );

      const response = await request(app)
        .delete('/api/categorias/CAT001')
        .expect(409);

      expect(response.body.error.code).toBe('REFERENTIAL_INTEGRITY_ERROR');
    });
  });
});