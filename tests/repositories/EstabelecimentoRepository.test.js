const { EstabelecimentoRepository } = require('../../src/repositories/EstabelecimentoRepository');
const DatabaseConfig = require('../../src/database/config');

describe('EstabelecimentoRepository', () => {
  let db;
  let repository;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    db = DatabaseConfig;
    await db.connect();
    
    // Criar tabelas necessárias
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
        FOREIGN KEY (codigo_estabelecimento) REFERENCES estabelecimentos(codigo)
      )
    `);

    repository = new EstabelecimentoRepository(db);
  });

  beforeEach(async () => {
    // Limpar dados
    await db.run('DELETE FROM lancamentos');
    await db.run('DELETE FROM estabelecimentos');
  });

  afterAll(async () => {
    if (db && db.close) {
      await db.close();
    }
  });

  describe('create', () => {
    it('deve criar um estabelecimento válido', async () => {
      const estabelecimentoData = {
        codigo: 'EST001',
        nome: 'Supermercado ABC',
        endereco: 'Rua das Flores, 123',
        telefone: '(11) 1234-5678'
      };

      const estabelecimento = await repository.create(estabelecimentoData);

      expect(estabelecimento).toBeDefined();
      expect(estabelecimento.codigo).toBe('EST001');
      expect(estabelecimento.nome).toBe('Supermercado ABC');
    });
  });

  describe('findAll', () => {
    it('deve retornar lista vazia quando não há estabelecimentos', async () => {
      const estabelecimentos = await repository.findAll();
      expect(estabelecimentos).toEqual([]);
    });

    it('deve retornar todos os estabelecimentos', async () => {
      await repository.create({
        codigo: 'EST001',
        nome: 'Estabelecimento 1',
        endereco: 'Endereço 1',
        telefone: '123456789'
      });

      const estabelecimentos = await repository.findAll();
      expect(estabelecimentos).toHaveLength(1);
      expect(estabelecimentos[0].nome).toBe('Estabelecimento 1');
    });
  });

  describe('findByCodigo', () => {
    it('deve encontrar estabelecimento por código', async () => {
      await repository.create({
        codigo: 'EST001',
        nome: 'Estabelecimento Teste',
        endereco: 'Endereço Teste',
        telefone: '987654321'
      });

      const found = await repository.findByCodigo('EST001');
      expect(found).toBeDefined();
      expect(found.nome).toBe('Estabelecimento Teste');
    });

    it('deve retornar null para código inexistente', async () => {
      const found = await repository.findByCodigo('INEXISTENTE');
      expect(found).toBeNull();
    });
  });

  describe('update', () => {
    it('deve atualizar estabelecimento', async () => {
      await repository.create({
        codigo: 'EST001',
        nome: 'Nome Original',
        endereco: 'Endereço Original',
        telefone: '111111111'
      });

      const updateData = {
        nome: 'Nome Atualizado',
        endereco: 'Endereço Atualizado',
        telefone: '222222222'
      };

      const updated = await repository.update('EST001', updateData);
      expect(updated.nome).toBe('Nome Atualizado');
      expect(updated.endereco).toBe('Endereço Atualizado');
    });
  });

  describe('delete', () => {
    it('deve excluir estabelecimento', async () => {
      await repository.create({
        codigo: 'EST001',
        nome: 'Para Excluir',
        endereco: 'Endereço',
        telefone: '333333333'
      });

      const deleted = await repository.delete('EST001');
      expect(deleted).toBe(true);

      const found = await repository.findByCodigo('EST001');
      expect(found).toBeNull();
    });
  });
});