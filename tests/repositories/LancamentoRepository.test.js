const { LancamentoRepository } = require('../../src/repositories/LancamentoRepository');
const DatabaseConfig = require('../../src/database/config');

describe('LancamentoRepository', () => {
  let db;
  let repository;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    db = DatabaseConfig;
    await db.connect();
    
    // Criar tabelas necessárias
    await db.run(`
      CREATE TABLE IF NOT EXISTS categorias (
        codigo VARCHAR(50) PRIMARY KEY,
        descricao VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS estabelecimentos (
        codigo VARCHAR(50) PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        endereco TEXT NOT NULL,
        telefone VARCHAR(20) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS lancamentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        data_lancamento DATE NOT NULL,
        data_pagamento DATE NOT NULL,
        valor DECIMAL(10,2) NOT NULL,
        descricao TEXT,
        codigo_categoria VARCHAR(50) NOT NULL,
        codigo_estabelecimento VARCHAR(50) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (codigo_categoria) REFERENCES categorias(codigo),
        FOREIGN KEY (codigo_estabelecimento) REFERENCES estabelecimentos(codigo)
      )
    `);

    repository = new LancamentoRepository(db);
  });

  beforeEach(async () => {
    // Limpar dados
    await db.run('DELETE FROM lancamentos');
    await db.run('DELETE FROM categorias');
    await db.run('DELETE FROM estabelecimentos');

    // Inserir dados de teste
    await db.run(`INSERT INTO categorias (codigo, descricao) VALUES ('CAT001', 'Alimentação')`);
    await db.run(`INSERT INTO estabelecimentos (codigo, nome, endereco, telefone) VALUES ('EST001', 'Supermercado', 'Rua A', '123456789')`);
  });

  afterAll(async () => {
    if (db && db.close) {
      await db.close();
    }
  });

  describe('create', () => {
    it('deve criar um lançamento com descrição', async () => {
      const lancamentoData = {
        dataLancamento: '2024-01-15',
        dataPagamento: '2024-01-15',
        valor: 150.75,
        descricao: 'Compras do mês',
        codigoCategoria: 'CAT001',
        codigoEstabelecimento: 'EST001'
      };

      const lancamento = await repository.create(lancamentoData);

      expect(lancamento).toBeDefined();
      expect(lancamento.id).toBeDefined();
      expect(lancamento.descricao).toBe('Compras do mês');
      expect(lancamento.valor).toBe(150.75);
    });

    it('deve criar um lançamento sem descrição', async () => {
      const lancamentoData = {
        dataLancamento: '2024-01-15',
        dataPagamento: '2024-01-15',
        valor: 50.00,
        codigoCategoria: 'CAT001',
        codigoEstabelecimento: 'EST001'
      };

      const lancamento = await repository.create(lancamentoData);

      expect(lancamento).toBeDefined();
      expect(lancamento.id).toBeDefined();
      expect(lancamento.descricao).toBeNull();
      expect(lancamento.valor).toBe(50.00);
    });
  });

  describe('findAll', () => {
    it('deve retornar lista vazia quando não há lançamentos', async () => {
      const lancamentos = await repository.findAll();
      expect(lancamentos).toEqual([]);
    });

    it('deve retornar todos os lançamentos', async () => {
      await repository.create({
        dataLancamento: '2024-01-15',
        dataPagamento: '2024-01-15',
        valor: 100.00,
        descricao: 'Teste 1',
        codigoCategoria: 'CAT001',
        codigoEstabelecimento: 'EST001'
      });

      const lancamentos = await repository.findAll();
      expect(lancamentos).toHaveLength(1);
      expect(lancamentos[0].descricao).toBe('Teste 1');
    });
  });

  describe('findById', () => {
    it('deve encontrar lançamento por ID', async () => {
      const created = await repository.create({
        dataLancamento: '2024-01-15',
        dataPagamento: '2024-01-15',
        valor: 75.50,
        descricao: 'Lanche',
        codigoCategoria: 'CAT001',
        codigoEstabelecimento: 'EST001'
      });

      const found = await repository.findById(created.id);
      expect(found).toBeDefined();
      expect(found.descricao).toBe('Lanche');
    });

    it('deve retornar null para ID inexistente', async () => {
      const found = await repository.findById(999);
      expect(found).toBeNull();
    });
  });

  describe('update', () => {
    it('deve atualizar lançamento incluindo descrição', async () => {
      const created = await repository.create({
        dataLancamento: '2024-01-15',
        dataPagamento: '2024-01-15',
        valor: 100.00,
        codigoCategoria: 'CAT001',
        codigoEstabelecimento: 'EST001'
      });

      const updateData = {
        dataLancamento: '2024-01-16',
        dataPagamento: '2024-01-16',
        valor: 200.00,
        descricao: 'Descrição atualizada',
        codigoCategoria: 'CAT001',
        codigoEstabelecimento: 'EST001'
      };

      const updated = await repository.update(created.id, updateData);
      expect(updated.descricao).toBe('Descrição atualizada');
      expect(updated.valor).toBe(200.00);
    });
  });

  describe('delete', () => {
    it('deve excluir lançamento', async () => {
      const created = await repository.create({
        dataLancamento: '2024-01-15',
        dataPagamento: '2024-01-15',
        valor: 100.00,
        codigoCategoria: 'CAT001',
        codigoEstabelecimento: 'EST001'
      });

      const deleted = await repository.delete(created.id);
      expect(deleted).toBe(true);

      const found = await repository.findById(created.id);
      expect(found).toBeNull();
    });
  });
});