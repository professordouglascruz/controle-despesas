const { LancamentoRepository } = require('../../src/repositories/LancamentoRepository');
const DatabaseConfig = require('../../src/database/config');

describe('LancamentoRepository', () => {
  let db;
  let repository;

  beforeAll(async () => {
    // Usar banco em memória para testes
    process.env.NODE_ENV = 'test';
    db = DatabaseConfig;
    await db.connect();
    
    // Criar tabelas para teste
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
    // Limpar dados antes de cada teste
    await db.run('DELETE FROM lancamentos');
    await db.run('DELETE FROM categorias');
    await db.run('DELETE FROM estabelecimentos');

    // Inserir dados de teste
    await db.run(`
      INSERT INTO categorias (codigo, descricao) 
      VALUES ('CAT001', 'Alimentação'), ('CAT002', 'Transporte')
    `);

    await db.run(`
      INSERT INTO estabelecimentos (codigo, nome, endereco, telefone) 
      VALUES 
        ('EST001', 'Supermercado ABC', 'Rua das Flores, 123', '(11) 1234-5678'),
        ('EST002', 'Posto de Gasolina XYZ', 'Av. Principal, 456', '(11) 8765-4321')
    `);
  });

  afterAll(async () => {
    await db.close();
  });

  describe('create', () => {
    it('deve criar um lançamento válido', async () => {
      const lancamentoData = {
        dataLancamento: '2024-01-15',
        dataPagamento: '2024-01-15',
        valor: 150.75,
        codigoCategoria: 'CAT001',
        codigoEstabelecimento: 'EST001'
      };

      const lancamento = await repository.create(lancamentoData);

      expect(lancamento).toBeDefined();
      expect(lancamento.id).toBeDefined();
      expect(lancamento.dataLancamento).toBeInstanceOf(Date);
      expect(lancamento.dataPagamento).toBeInstanceOf(Date);
      expect(lancamento.valor).toBe(150.75);
      expect(lancamento.codigoCategoria).toBe('CAT001');
      expect(lancamento.codigoEstabelecimento).toBe('EST001');
      expect(lancamento.createdAt).toBeInstanceOf(Date);
      expect(lancamento.updatedAt).toBeInstanceOf(Date);
    });

    it('deve criar lançamento com data como objeto Date', async () => {
      const lancamentoData = {
        dataLancamento: new Date('2024-01-15'),
        dataPagamento: new Date('2024-01-15'),
        valor: 150.75,
        codigoCategoria: 'CAT001',
        codigoEstabelecimento: 'EST001'
      };

      const lancamento = await repository.create(lancamentoData);

      expect(lancamento).toBeDefined();
      expect(lancamento.dataLancamento).toBeInstanceOf(Date);
      expect(lancamento.dataPagamento).toBeInstanceOf(Date);
    });

    it('deve falhar ao criar lançamento sem data de lançamento', async () => {
      const lancamentoData = {
        dataPagamento: '2024-01-15',
        valor: 150.75,
        codigoCategoria: 'CAT001',
        codigoEstabelecimento: 'EST001'
      };

      await expect(repository.create(lancamentoData))
        .rejects.toThrow('Validation failed: Data de lançamento é obrigatória');
    });

    it('deve falhar ao criar lançamento sem data de pagamento', async () => {
      const lancamentoData = {
        dataLancamento: '2024-01-15',
        valor: 150.75,
        codigoCategoria: 'CAT001',
        codigoEstabelecimento: 'EST001'
      };

      await expect(repository.create(lancamentoData))
        .rejects.toThrow('Validation failed: Data de pagamento é obrigatória');
    });

    it('deve falhar ao criar lançamento sem valor', async () => {
      const lancamentoData = {
        dataLancamento: '2024-01-15',
        dataPagamento: '2024-01-15',
        codigoCategoria: 'CAT001',
        codigoEstabelecimento: 'EST001'
      };

      await expect(repository.create(lancamentoData))
        .rejects.toThrow('Validation failed: Valor é obrigatório');
    });

    it('deve falhar ao criar lançamento com valor negativo', async () => {
      const lancamentoData = {
        dataLancamento: '2024-01-15',
        dataPagamento: '2024-01-15',
        valor: -50.00,
        codigoCategoria: 'CAT001',
        codigoEstabelecimento: 'EST001'
      };

      await expect(repository.create(lancamentoData))
        .rejects.toThrow('Validation failed: Valor deve ser um número positivo');
    });

    it('deve falhar ao criar lançamento sem código da categoria', async () => {
      const lancamentoData = {
        dataLancamento: '2024-01-15',
        dataPagamento: '2024-01-15',
        valor: 150.75,
        codigoCategoria: '',
        codigoEstabelecimento: 'EST001'
      };

      await expect(repository.create(lancamentoData))
        .rejects.toThrow('Validation failed: Código da categoria é obrigatório');
    });

    it('deve falhar ao criar lançamento sem código do estabelecimento', async () => {
      const lancamentoData = {
        dataLancamento: '2024-01-15',
        dataPagamento: '2024-01-15',
        valor: 150.75,
        codigoCategoria: 'CAT001',
        codigoEstabelecimento: ''
      };

      await expect(repository.create(lancamentoData))
        .rejects.toThrow('Validation failed: Código do estabelecimento é obrigatório');
    });

    it('deve falhar ao criar lançamento com categoria inexistente', async () => {
      const lancamentoData = {
        dataLancamento: '2024-01-15',
        dataPagamento: '2024-01-15',
        valor: 150.75,
        codigoCategoria: 'INEXISTENTE',
        codigoEstabelecimento: 'EST001'
      };

      await expect(repository.create(lancamentoData))
        .rejects.toThrow('Categoria não encontrada');
    });

    it('deve falhar ao criar lançamento com estabelecimento inexistente', async () => {
      const lancamentoData = {
        dataLancamento: '2024-01-15',
        dataPagamento: '2024-01-15',
        valor: 150.75,
        codigoCategoria: 'CAT001',
        codigoEstabelecimento: 'INEXISTENTE'
      };

      await expect(repository.create(lancamentoData))
        .rejects.toThrow('Estabelecimento não encontrado');
    });
  });

  describe('findById', () => {
    it('deve encontrar lançamento por ID', async () => {
      const lancamentoData = {
        dataLancamento: '2024-01-15',
        dataPagamento: '2024-01-15',
        valor: 150.75,
        codigoCategoria: 'CAT001',
        codigoEstabelecimento: 'EST001'
      };

      const created = await repository.create(lancamentoData);
      const lancamento = await repository.findById(created.id);

      expect(lancamento).toBeDefined();
      expect(lancamento.id).toBe(created.id);
      expect(lancamento.valor).toBe(150.75);
    });

    it('deve retornar null para lançamento inexistente', async () => {
      const lancamento = await repository.findById(999);
      expect(lancamento).toBeNull();
    });
  });

  describe('findByIdDetailed', () => {
    it('deve encontrar lançamento com dados detalhados', async () => {
      const lancamentoData = {
        dataLancamento: '2024-01-15',
        dataPagamento: '2024-01-15',
        valor: 150.75,
        codigoCategoria: 'CAT001',
        codigoEstabelecimento: 'EST001'
      };

      const created = await repository.create(lancamentoData);
      const lancamento = await repository.findByIdDetailed(created.id);

      expect(lancamento).toBeDefined();
      expect(lancamento.id).toBe(created.id);
      expect(lancamento.categoria).toBeDefined();
      expect(lancamento.categoria.codigo).toBe('CAT001');
      expect(lancamento.categoria.descricao).toBe('Alimentação');
      expect(lancamento.estabelecimento).toBeDefined();
      expect(lancamento.estabelecimento.codigo).toBe('EST001');
      expect(lancamento.estabelecimento.nome).toBe('Supermercado ABC');
    });
  });

  describe('findAll', () => {
    it('deve retornar todos os lançamentos', async () => {
      await repository.create({
        dataLancamento: '2024-01-15',
        dataPagamento: '2024-01-15',
        valor: 150.75,
        codigoCategoria: 'CAT001',
        codigoEstabelecimento: 'EST001'
      });

      await repository.create({
        dataLancamento: '2024-01-16',
        dataPagamento: '2024-01-16',
        valor: 80.50,
        codigoCategoria: 'CAT002',
        codigoEstabelecimento: 'EST002'
      });

      const lancamentos = await repository.findAll();

      expect(lancamentos).toHaveLength(2);
      expect(lancamentos[0].valor).toBe(150.75);
      expect(lancamentos[1].valor).toBe(80.50);
    });

    it('deve retornar array vazio quando não há lançamentos', async () => {
      const lancamentos = await repository.findAll();
      expect(lancamentos).toHaveLength(0);
    });
  });

  describe('findAllDetailed', () => {
    it('deve retornar todos os lançamentos com dados detalhados', async () => {
      await repository.create({
        dataLancamento: '2024-01-15',
        dataPagamento: '2024-01-15',
        valor: 150.75,
        codigoCategoria: 'CAT001',
        codigoEstabelecimento: 'EST001'
      });

      await repository.create({
        dataLancamento: '2024-01-16',
        dataPagamento: '2024-01-16',
        valor: 80.50,
        codigoCategoria: 'CAT002',
        codigoEstabelecimento: 'EST002'
      });

      const lancamentos = await repository.findAllDetailed();

      expect(lancamentos).toHaveLength(2);
      expect(lancamentos[0].categoria).toBeDefined();
      expect(lancamentos[0].estabelecimento).toBeDefined();
      expect(lancamentos[1].categoria).toBeDefined();
      expect(lancamentos[1].estabelecimento).toBeDefined();
    });
  });

  describe('update', () => {
    it('deve atualizar lançamento existente', async () => {
      const created = await repository.create({
        dataLancamento: '2024-01-15',
        dataPagamento: '2024-01-15',
        valor: 150.75,
        codigoCategoria: 'CAT001',
        codigoEstabelecimento: 'EST001'
      });

      const updated = await repository.update(created.id, {
        valor: 200.00,
        codigoCategoria: 'CAT002'
      });

      expect(updated).toBeDefined();
      expect(updated.valor).toBe(200.00);
      expect(updated.codigoCategoria).toBe('CAT002');
      expect(updated.codigoEstabelecimento).toBe('EST001'); // Não alterado
    });

    it('deve retornar null para lançamento inexistente', async () => {
      const resultado = await repository.update(999, {
        valor: 200.00
      });

      expect(resultado).toBeNull();
    });

    it('deve falhar ao atualizar com categoria inexistente', async () => {
      const created = await repository.create({
        dataLancamento: '2024-01-15',
        dataPagamento: '2024-01-15',
        valor: 150.75,
        codigoCategoria: 'CAT001',
        codigoEstabelecimento: 'EST001'
      });

      await expect(repository.update(created.id, { codigoCategoria: 'INEXISTENTE' }))
        .rejects.toThrow('Categoria não encontrada');
    });

    it('deve falhar ao atualizar com estabelecimento inexistente', async () => {
      const created = await repository.create({
        dataLancamento: '2024-01-15',
        dataPagamento: '2024-01-15',
        valor: 150.75,
        codigoCategoria: 'CAT001',
        codigoEstabelecimento: 'EST001'
      });

      await expect(repository.update(created.id, { codigoEstabelecimento: 'INEXISTENTE' }))
        .rejects.toThrow('Estabelecimento não encontrado');
    });
  });

  describe('delete', () => {
    it('deve excluir lançamento existente', async () => {
      const created = await repository.create({
        dataLancamento: '2024-01-15',
        dataPagamento: '2024-01-15',
        valor: 150.75,
        codigoCategoria: 'CAT001',
        codigoEstabelecimento: 'EST001'
      });

      const resultado = await repository.delete(created.id);

      expect(resultado).toBe(true);
      
      const lancamento = await repository.findById(created.id);
      expect(lancamento).toBeNull();
    });

    it('deve retornar false para lançamento inexistente', async () => {
      const resultado = await repository.delete(999);
      expect(resultado).toBe(false);
    });
  });

  describe('findByCategoria', () => {
    it('deve encontrar lançamentos por categoria', async () => {
      await repository.create({
        dataLancamento: '2024-01-15',
        dataPagamento: '2024-01-15',
        valor: 150.75,
        codigoCategoria: 'CAT001',
        codigoEstabelecimento: 'EST001'
      });

      await repository.create({
        dataLancamento: '2024-01-16',
        dataPagamento: '2024-01-16',
        valor: 80.50,
        codigoCategoria: 'CAT002',
        codigoEstabelecimento: 'EST002'
      });

      const lancamentos = await repository.findByCategoria('CAT001');

      expect(lancamentos).toHaveLength(1);
      expect(lancamentos[0].codigoCategoria).toBe('CAT001');
      expect(lancamentos[0].categoria.descricao).toBe('Alimentação');
    });
  });

  describe('findByEstabelecimento', () => {
    it('deve encontrar lançamentos por estabelecimento', async () => {
      await repository.create({
        dataLancamento: '2024-01-15',
        dataPagamento: '2024-01-15',
        valor: 150.75,
        codigoCategoria: 'CAT001',
        codigoEstabelecimento: 'EST001'
      });

      await repository.create({
        dataLancamento: '2024-01-16',
        dataPagamento: '2024-01-16',
        valor: 80.50,
        codigoCategoria: 'CAT002',
        codigoEstabelecimento: 'EST002'
      });

      const lancamentos = await repository.findByEstabelecimento('EST001');

      expect(lancamentos).toHaveLength(1);
      expect(lancamentos[0].codigoEstabelecimento).toBe('EST001');
      expect(lancamentos[0].estabelecimento.nome).toBe('Supermercado ABC');
    });
  });

  describe('findByPeriodo', () => {
    it('deve encontrar lançamentos por período', async () => {
      await repository.create({
        dataLancamento: '2024-01-15',
        dataPagamento: '2024-01-15',
        valor: 150.75,
        codigoCategoria: 'CAT001',
        codigoEstabelecimento: 'EST001'
      });

      await repository.create({
        dataLancamento: '2024-01-20',
        dataPagamento: '2024-01-20',
        valor: 80.50,
        codigoCategoria: 'CAT002',
        codigoEstabelecimento: 'EST002'
      });

      await repository.create({
        dataLancamento: '2024-02-01',
        dataPagamento: '2024-02-01',
        valor: 200.00,
        codigoCategoria: 'CAT001',
        codigoEstabelecimento: 'EST001'
      });

      const lancamentos = await repository.findByPeriodo('2024-01-01', '2024-01-31');

      expect(lancamentos).toHaveLength(2);
      expect(lancamentos.every(l => l.dataLancamento.getMonth() === 0)).toBe(true); // Janeiro = 0
    });
  });

  describe('getTotalByCategoria', () => {
    it('deve calcular total por categoria específica', async () => {
      await repository.create({
        dataLancamento: '2024-01-15',
        dataPagamento: '2024-01-15',
        valor: 150.75,
        codigoCategoria: 'CAT001',
        codigoEstabelecimento: 'EST001'
      });

      await repository.create({
        dataLancamento: '2024-01-16',
        dataPagamento: '2024-01-16',
        valor: 49.25,
        codigoCategoria: 'CAT001',
        codigoEstabelecimento: 'EST001'
      });

      await repository.create({
        dataLancamento: '2024-01-17',
        dataPagamento: '2024-01-17',
        valor: 80.50,
        codigoCategoria: 'CAT002',
        codigoEstabelecimento: 'EST002'
      });

      const total = await repository.getTotalByCategoria('CAT001');

      expect(total).toBe(200.00);
    });

    it('deve calcular total geral quando categoria não especificada', async () => {
      await repository.create({
        dataLancamento: '2024-01-15',
        dataPagamento: '2024-01-15',
        valor: 150.75,
        codigoCategoria: 'CAT001',
        codigoEstabelecimento: 'EST001'
      });

      await repository.create({
        dataLancamento: '2024-01-16',
        dataPagamento: '2024-01-16',
        valor: 80.50,
        codigoCategoria: 'CAT002',
        codigoEstabelecimento: 'EST002'
      });

      const total = await repository.getTotalByCategoria();

      expect(total).toBe(231.25);
    });
  });

  describe('getTotalByEstabelecimento', () => {
    it('deve calcular total por estabelecimento específico', async () => {
      await repository.create({
        dataLancamento: '2024-01-15',
        dataPagamento: '2024-01-15',
        valor: 150.75,
        codigoCategoria: 'CAT001',
        codigoEstabelecimento: 'EST001'
      });

      await repository.create({
        dataLancamento: '2024-01-16',
        dataPagamento: '2024-01-16',
        valor: 49.25,
        codigoCategoria: 'CAT002',
        codigoEstabelecimento: 'EST001'
      });

      await repository.create({
        dataLancamento: '2024-01-17',
        dataPagamento: '2024-01-17',
        valor: 80.50,
        codigoCategoria: 'CAT002',
        codigoEstabelecimento: 'EST002'
      });

      const total = await repository.getTotalByEstabelecimento('EST001');

      expect(total).toBe(200.00);
    });
  });

  describe('categoriaExists', () => {
    it('deve retornar true para categoria existente', async () => {
      const existe = await repository.categoriaExists('CAT001');
      expect(existe).toBe(true);
    });

    it('deve retornar false para categoria inexistente', async () => {
      const existe = await repository.categoriaExists('INEXISTENTE');
      expect(existe).toBe(false);
    });
  });

  describe('estabelecimentoExists', () => {
    it('deve retornar true para estabelecimento existente', async () => {
      const existe = await repository.estabelecimentoExists('EST001');
      expect(existe).toBe(true);
    });

    it('deve retornar false para estabelecimento inexistente', async () => {
      const existe = await repository.estabelecimentoExists('INEXISTENTE');
      expect(existe).toBe(false);
    });
  });
});