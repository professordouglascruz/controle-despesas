const { EstabelecimentoRepository } = require('../../src/repositories/EstabelecimentoRepository');
const DatabaseConfig = require('../../src/database/config');

describe('EstabelecimentoRepository', () => {
  let db;
  let repository;

  beforeAll(async () => {
    // Usar banco em memória para testes
    process.env.NODE_ENV = 'test';
    db = DatabaseConfig;
    await db.connect();
    
    // Criar tabela de estabelecimentos para teste
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

    // Criar tabela de lançamentos para teste de integridade referencial
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
        FOREIGN KEY (codigo_estabelecimento) REFERENCES estabelecimentos(codigo)
      )
    `);

    repository = new EstabelecimentoRepository(db);
  });

  beforeEach(async () => {
    // Limpar dados antes de cada teste
    await db.run('DELETE FROM lancamentos');
    await db.run('DELETE FROM estabelecimentos');
  });

  afterAll(async () => {
    await db.close();
  });

  describe('create', () => {
    it('deve criar um estabelecimento válido', async () => {
      const estabelecimentoData = {
        codigo: 'EST001',
        nome: 'Supermercado ABC',
        endereco: 'Rua das Flores, 123 - São Paulo/SP',
        telefone: '(11) 1234-5678'
      };

      const estabelecimento = await repository.create(estabelecimentoData);

      expect(estabelecimento).toBeDefined();
      expect(estabelecimento.codigo).toBe('EST001');
      expect(estabelecimento.nome).toBe('Supermercado ABC');
      expect(estabelecimento.endereco).toBe('Rua das Flores, 123 - São Paulo/SP');
      expect(estabelecimento.telefone).toBe('(11) 1234-5678');
      expect(estabelecimento.createdAt).toBeInstanceOf(Date);
      expect(estabelecimento.updatedAt).toBeInstanceOf(Date);
    });

    it('deve falhar ao criar estabelecimento sem código', async () => {
      const estabelecimentoData = {
        codigo: '',
        nome: 'Supermercado ABC',
        endereco: 'Rua das Flores, 123',
        telefone: '(11) 1234-5678'
      };

      await expect(repository.create(estabelecimentoData))
        .rejects.toThrow('Validation failed: Código é obrigatório');
    });

    it('deve falhar ao criar estabelecimento sem nome', async () => {
      const estabelecimentoData = {
        codigo: 'EST001',
        nome: '',
        endereco: 'Rua das Flores, 123',
        telefone: '(11) 1234-5678'
      };

      await expect(repository.create(estabelecimentoData))
        .rejects.toThrow('Validation failed: Nome é obrigatório');
    });

    it('deve falhar ao criar estabelecimento sem endereço', async () => {
      const estabelecimentoData = {
        codigo: 'EST001',
        nome: 'Supermercado ABC',
        endereco: '',
        telefone: '(11) 1234-5678'
      };

      await expect(repository.create(estabelecimentoData))
        .rejects.toThrow('Validation failed: Endereço é obrigatório');
    });

    it('deve falhar ao criar estabelecimento sem telefone', async () => {
      const estabelecimentoData = {
        codigo: 'EST001',
        nome: 'Supermercado ABC',
        endereco: 'Rua das Flores, 123',
        telefone: ''
      };

      await expect(repository.create(estabelecimentoData))
        .rejects.toThrow('Validation failed: Telefone é obrigatório');
    });

    it('deve falhar ao criar estabelecimento com código muito longo', async () => {
      const estabelecimentoData = {
        codigo: 'A'.repeat(51), // 51 caracteres
        nome: 'Supermercado ABC',
        endereco: 'Rua das Flores, 123',
        telefone: '(11) 1234-5678'
      };

      await expect(repository.create(estabelecimentoData))
        .rejects.toThrow('Validation failed: Código deve ter no máximo 50 caracteres');
    });

    it('deve falhar ao criar estabelecimento com nome muito longo', async () => {
      const estabelecimentoData = {
        codigo: 'EST001',
        nome: 'A'.repeat(256), // 256 caracteres
        endereco: 'Rua das Flores, 123',
        telefone: '(11) 1234-5678'
      };

      await expect(repository.create(estabelecimentoData))
        .rejects.toThrow('Validation failed: Nome deve ter no máximo 255 caracteres');
    });

    it('deve falhar ao criar estabelecimento com telefone muito longo', async () => {
      const estabelecimentoData = {
        codigo: 'EST001',
        nome: 'Supermercado ABC',
        endereco: 'Rua das Flores, 123',
        telefone: '1'.repeat(21) // 21 caracteres
      };

      await expect(repository.create(estabelecimentoData))
        .rejects.toThrow('Validation failed: Telefone deve ter no máximo 20 caracteres');
    });
  });

  describe('findById', () => {
    it('deve encontrar estabelecimento por código', async () => {
      const estabelecimentoData = {
        codigo: 'EST001',
        nome: 'Supermercado ABC',
        endereco: 'Rua das Flores, 123',
        telefone: '(11) 1234-5678'
      };

      await repository.create(estabelecimentoData);
      const estabelecimento = await repository.findById('EST001');

      expect(estabelecimento).toBeDefined();
      expect(estabelecimento.codigo).toBe('EST001');
      expect(estabelecimento.nome).toBe('Supermercado ABC');
    });

    it('deve retornar null para estabelecimento inexistente', async () => {
      const estabelecimento = await repository.findById('INEXISTENTE');
      expect(estabelecimento).toBeNull();
    });
  });

  describe('findAll', () => {
    it('deve retornar todos os estabelecimentos', async () => {
      await repository.create({
        codigo: 'EST001',
        nome: 'Supermercado ABC',
        endereco: 'Rua das Flores, 123',
        telefone: '(11) 1234-5678'
      });
      
      await repository.create({
        codigo: 'EST002',
        nome: 'Farmácia XYZ',
        endereco: 'Av. Principal, 456',
        telefone: '(11) 8765-4321'
      });

      const estabelecimentos = await repository.findAll();

      expect(estabelecimentos).toHaveLength(2);
      expect(estabelecimentos[0].codigo).toBe('EST001');
      expect(estabelecimentos[1].codigo).toBe('EST002');
    });

    it('deve retornar array vazio quando não há estabelecimentos', async () => {
      const estabelecimentos = await repository.findAll();
      expect(estabelecimentos).toHaveLength(0);
    });
  });

  describe('update', () => {
    it('deve atualizar estabelecimento existente', async () => {
      await repository.create({
        codigo: 'EST001',
        nome: 'Supermercado ABC',
        endereco: 'Rua das Flores, 123',
        telefone: '(11) 1234-5678'
      });

      const estabelecimentoAtualizado = await repository.update('EST001', {
        nome: 'Supermercado ABC Ltda',
        telefone: '(11) 9999-8888'
      });

      expect(estabelecimentoAtualizado).toBeDefined();
      expect(estabelecimentoAtualizado.nome).toBe('Supermercado ABC Ltda');
      expect(estabelecimentoAtualizado.telefone).toBe('(11) 9999-8888');
      expect(estabelecimentoAtualizado.endereco).toBe('Rua das Flores, 123'); // Não alterado
    });

    it('deve retornar null para estabelecimento inexistente', async () => {
      const resultado = await repository.update('INEXISTENTE', {
        nome: 'Novo nome'
      });

      expect(resultado).toBeNull();
    });

    it('deve falhar ao atualizar com nome vazio', async () => {
      await repository.create({
        codigo: 'EST001',
        nome: 'Supermercado ABC',
        endereco: 'Rua das Flores, 123',
        telefone: '(11) 1234-5678'
      });

      await expect(repository.update('EST001', { nome: '' }))
        .rejects.toThrow('Validation failed: Nome é obrigatório');
    });
  });

  describe('delete', () => {
    it('deve excluir estabelecimento sem lançamentos associados', async () => {
      await repository.create({
        codigo: 'EST001',
        nome: 'Supermercado ABC',
        endereco: 'Rua das Flores, 123',
        telefone: '(11) 1234-5678'
      });

      const resultado = await repository.delete('EST001');

      expect(resultado).toBe(true);
      
      const estabelecimento = await repository.findById('EST001');
      expect(estabelecimento).toBeNull();
    });

    it('deve falhar ao excluir estabelecimento com lançamentos associados', async () => {
      await repository.create({
        codigo: 'EST001',
        nome: 'Supermercado ABC',
        endereco: 'Rua das Flores, 123',
        telefone: '(11) 1234-5678'
      });
      
      // Criar um lançamento associado
      await db.run(`
        INSERT INTO lancamentos (data_lancamento, data_pagamento, valor, codigo_categoria, codigo_estabelecimento)
        VALUES ('2024-01-01', '2024-01-01', 100.00, 'CAT001', 'EST001')
      `);

      await expect(repository.delete('EST001'))
        .rejects.toThrow('Não é possível excluir estabelecimento que possui lançamentos associados');
    });

    it('deve retornar false para estabelecimento inexistente', async () => {
      const resultado = await repository.delete('INEXISTENTE');
      expect(resultado).toBe(false);
    });
  });

  describe('exists', () => {
    it('deve retornar true para estabelecimento existente', async () => {
      await repository.create({
        codigo: 'EST001',
        nome: 'Supermercado ABC',
        endereco: 'Rua das Flores, 123',
        telefone: '(11) 1234-5678'
      });

      const existe = await repository.exists('EST001');
      expect(existe).toBe(true);
    });

    it('deve retornar false para estabelecimento inexistente', async () => {
      const existe = await repository.exists('INEXISTENTE');
      expect(existe).toBe(false);
    });
  });

  describe('count', () => {
    it('deve contar estabelecimentos corretamente', async () => {
      await repository.create({
        codigo: 'EST001',
        nome: 'Supermercado ABC',
        endereco: 'Rua das Flores, 123',
        telefone: '(11) 1234-5678'
      });
      
      await repository.create({
        codigo: 'EST002',
        nome: 'Farmácia XYZ',
        endereco: 'Av. Principal, 456',
        telefone: '(11) 8765-4321'
      });

      const total = await repository.count();
      expect(total).toBe(2);
    });

    it('deve retornar 0 quando não há estabelecimentos', async () => {
      const total = await repository.count();
      expect(total).toBe(0);
    });
  });

  describe('hasAssociatedLancamentos', () => {
    it('deve retornar true quando estabelecimento tem lançamentos associados', async () => {
      await repository.create({
        codigo: 'EST001',
        nome: 'Supermercado ABC',
        endereco: 'Rua das Flores, 123',
        telefone: '(11) 1234-5678'
      });
      
      await db.run(`
        INSERT INTO lancamentos (data_lancamento, data_pagamento, valor, codigo_categoria, codigo_estabelecimento)
        VALUES ('2024-01-01', '2024-01-01', 100.00, 'CAT001', 'EST001')
      `);

      const hasLancamentos = await repository.hasAssociatedLancamentos('EST001');
      expect(hasLancamentos).toBe(true);
    });

    it('deve retornar false quando estabelecimento não tem lançamentos associados', async () => {
      await repository.create({
        codigo: 'EST001',
        nome: 'Supermercado ABC',
        endereco: 'Rua das Flores, 123',
        telefone: '(11) 1234-5678'
      });

      const hasLancamentos = await repository.hasAssociatedLancamentos('EST001');
      expect(hasLancamentos).toBe(false);
    });
  });

  describe('countAssociatedLancamentos', () => {
    it('deve contar lançamentos associados corretamente', async () => {
      await repository.create({
        codigo: 'EST001',
        nome: 'Supermercado ABC',
        endereco: 'Rua das Flores, 123',
        telefone: '(11) 1234-5678'
      });
      
      await db.run(`
        INSERT INTO lancamentos (data_lancamento, data_pagamento, valor, codigo_categoria, codigo_estabelecimento)
        VALUES ('2024-01-01', '2024-01-01', 100.00, 'CAT001', 'EST001')
      `);
      
      await db.run(`
        INSERT INTO lancamentos (data_lancamento, data_pagamento, valor, codigo_categoria, codigo_estabelecimento)
        VALUES ('2024-01-02', '2024-01-02', 200.00, 'CAT001', 'EST001')
      `);

      const count = await repository.countAssociatedLancamentos('EST001');
      expect(count).toBe(2);
    });

    it('deve retornar 0 quando estabelecimento não tem lançamentos associados', async () => {
      await repository.create({
        codigo: 'EST001',
        nome: 'Supermercado ABC',
        endereco: 'Rua das Flores, 123',
        telefone: '(11) 1234-5678'
      });

      const count = await repository.countAssociatedLancamentos('EST001');
      expect(count).toBe(0);
    });
  });

  describe('findByNome', () => {
    it('deve encontrar estabelecimentos por nome parcial', async () => {
      await repository.create({
        codigo: 'EST001',
        nome: 'Supermercado ABC',
        endereco: 'Rua das Flores, 123',
        telefone: '(11) 1234-5678'
      });
      
      await repository.create({
        codigo: 'EST002',
        nome: 'Supermercado XYZ',
        endereco: 'Av. Principal, 456',
        telefone: '(11) 8765-4321'
      });
      
      await repository.create({
        codigo: 'EST003',
        nome: 'Farmácia Central',
        endereco: 'Rua Central, 789',
        telefone: '(11) 5555-5555'
      });

      const estabelecimentos = await repository.findByNome('Supermercado');

      expect(estabelecimentos).toHaveLength(2);
      expect(estabelecimentos[0].nome).toContain('Supermercado');
      expect(estabelecimentos[1].nome).toContain('Supermercado');
    });

    it('deve retornar array vazio quando não encontra estabelecimentos', async () => {
      await repository.create({
        codigo: 'EST001',
        nome: 'Supermercado ABC',
        endereco: 'Rua das Flores, 123',
        telefone: '(11) 1234-5678'
      });

      const estabelecimentos = await repository.findByNome('Inexistente');
      expect(estabelecimentos).toHaveLength(0);
    });
  });

  describe('findByCidade', () => {
    it('deve encontrar estabelecimentos por cidade no endereço', async () => {
      await repository.create({
        codigo: 'EST001',
        nome: 'Supermercado ABC',
        endereco: 'Rua das Flores, 123 - São Paulo/SP',
        telefone: '(11) 1234-5678'
      });
      
      await repository.create({
        codigo: 'EST002',
        nome: 'Farmácia XYZ',
        endereco: 'Av. Principal, 456 - São Paulo/SP',
        telefone: '(11) 8765-4321'
      });
      
      await repository.create({
        codigo: 'EST003',
        nome: 'Loja Central',
        endereco: 'Rua Central, 789 - Rio de Janeiro/RJ',
        telefone: '(21) 5555-5555'
      });

      const estabelecimentos = await repository.findByCidade('São Paulo');

      expect(estabelecimentos).toHaveLength(2);
      expect(estabelecimentos[0].endereco).toContain('São Paulo');
      expect(estabelecimentos[1].endereco).toContain('São Paulo');
    });

    it('deve retornar array vazio quando não encontra estabelecimentos na cidade', async () => {
      await repository.create({
        codigo: 'EST001',
        nome: 'Supermercado ABC',
        endereco: 'Rua das Flores, 123 - São Paulo/SP',
        telefone: '(11) 1234-5678'
      });

      const estabelecimentos = await repository.findByCidade('Inexistente');
      expect(estabelecimentos).toHaveLength(0);
    });
  });
});