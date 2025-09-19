const { CategoriaRepository } = require('../../src/repositories/CategoriaRepository');
const DatabaseConfig = require('../../src/database/config');

describe('CategoriaRepository', () => {
  let db;
  let repository;

  beforeAll(async () => {
    // Usar banco em memória para testes
    process.env.NODE_ENV = 'test';
    db = DatabaseConfig;
    await db.connect();
    
    // Criar tabela de categorias para teste
    await db.run(`
      CREATE TABLE IF NOT EXISTS categorias (
        codigo VARCHAR(50) PRIMARY KEY,
        descricao VARCHAR(255) NOT NULL,
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
        FOREIGN KEY (codigo_categoria) REFERENCES categorias(codigo)
      )
    `);

    repository = new CategoriaRepository(db);
  });

  beforeEach(async () => {
    // Limpar dados antes de cada teste
    await db.run('DELETE FROM lancamentos');
    await db.run('DELETE FROM categorias');
  });

  afterAll(async () => {
    await db.close();
  });

  describe('create', () => {
    it('deve criar uma categoria válida', async () => {
      const categoriaData = {
        codigo: 'CAT001',
        descricao: 'Alimentação'
      };

      const categoria = await repository.create(categoriaData);

      expect(categoria).toBeDefined();
      expect(categoria.codigo).toBe('CAT001');
      expect(categoria.descricao).toBe('Alimentação');
      expect(categoria.createdAt).toBeInstanceOf(Date);
      expect(categoria.updatedAt).toBeInstanceOf(Date);
    });

    it('deve falhar ao criar categoria sem código', async () => {
      const categoriaData = {
        codigo: '',
        descricao: 'Alimentação'
      };

      await expect(repository.create(categoriaData))
        .rejects.toThrow('Validation failed: Código é obrigatório');
    });

    it('deve falhar ao criar categoria sem descrição', async () => {
      const categoriaData = {
        codigo: 'CAT001',
        descricao: ''
      };

      await expect(repository.create(categoriaData))
        .rejects.toThrow('Validation failed: Descrição é obrigatória');
    });

    it('deve falhar ao criar categoria com código muito longo', async () => {
      const categoriaData = {
        codigo: 'A'.repeat(51), // 51 caracteres
        descricao: 'Alimentação'
      };

      await expect(repository.create(categoriaData))
        .rejects.toThrow('Validation failed: Código deve ter no máximo 50 caracteres');
    });

    it('deve falhar ao criar categoria com descrição muito longa', async () => {
      const categoriaData = {
        codigo: 'CAT001',
        descricao: 'A'.repeat(256) // 256 caracteres
      };

      await expect(repository.create(categoriaData))
        .rejects.toThrow('Validation failed: Descrição deve ter no máximo 255 caracteres');
    });
  });

  describe('findById', () => {
    it('deve encontrar categoria por código', async () => {
      const categoriaData = {
        codigo: 'CAT001',
        descricao: 'Alimentação'
      };

      await repository.create(categoriaData);
      const categoria = await repository.findById('CAT001');

      expect(categoria).toBeDefined();
      expect(categoria.codigo).toBe('CAT001');
      expect(categoria.descricao).toBe('Alimentação');
    });

    it('deve retornar null para categoria inexistente', async () => {
      const categoria = await repository.findById('INEXISTENTE');
      expect(categoria).toBeNull();
    });
  });

  describe('findAll', () => {
    it('deve retornar todas as categorias', async () => {
      await repository.create({ codigo: 'CAT001', descricao: 'Alimentação' });
      await repository.create({ codigo: 'CAT002', descricao: 'Transporte' });

      const categorias = await repository.findAll();

      expect(categorias).toHaveLength(2);
      expect(categorias[0].codigo).toBe('CAT001');
      expect(categorias[1].codigo).toBe('CAT002');
    });

    it('deve retornar array vazio quando não há categorias', async () => {
      const categorias = await repository.findAll();
      expect(categorias).toHaveLength(0);
    });
  });

  describe('update', () => {
    it('deve atualizar categoria existente', async () => {
      await repository.create({ codigo: 'CAT001', descricao: 'Alimentação' });

      const categoriaAtualizada = await repository.update('CAT001', {
        descricao: 'Alimentação e Bebidas'
      });

      expect(categoriaAtualizada).toBeDefined();
      expect(categoriaAtualizada.descricao).toBe('Alimentação e Bebidas');
    });

    it('deve retornar null para categoria inexistente', async () => {
      const resultado = await repository.update('INEXISTENTE', {
        descricao: 'Nova descrição'
      });

      expect(resultado).toBeNull();
    });

    it('deve falhar ao atualizar com descrição vazia', async () => {
      await repository.create({ codigo: 'CAT001', descricao: 'Alimentação' });

      await expect(repository.update('CAT001', { descricao: '' }))
        .rejects.toThrow('Validation failed: Descrição é obrigatória');
    });
  });

  describe('delete', () => {
    it('deve excluir categoria sem lançamentos associados', async () => {
      await repository.create({ codigo: 'CAT001', descricao: 'Alimentação' });

      const resultado = await repository.delete('CAT001');

      expect(resultado).toBe(true);
      
      const categoria = await repository.findById('CAT001');
      expect(categoria).toBeNull();
    });

    it('deve falhar ao excluir categoria com lançamentos associados', async () => {
      await repository.create({ codigo: 'CAT001', descricao: 'Alimentação' });
      
      // Criar um lançamento associado
      await db.run(`
        INSERT INTO lancamentos (data_lancamento, data_pagamento, valor, codigo_categoria, codigo_estabelecimento)
        VALUES ('2024-01-01', '2024-01-01', 100.00, 'CAT001', 'EST001')
      `);

      await expect(repository.delete('CAT001'))
        .rejects.toThrow('Não é possível excluir categoria que possui lançamentos associados');
    });

    it('deve retornar false para categoria inexistente', async () => {
      const resultado = await repository.delete('INEXISTENTE');
      expect(resultado).toBe(false);
    });
  });

  describe('exists', () => {
    it('deve retornar true para categoria existente', async () => {
      await repository.create({ codigo: 'CAT001', descricao: 'Alimentação' });

      const existe = await repository.exists('CAT001');
      expect(existe).toBe(true);
    });

    it('deve retornar false para categoria inexistente', async () => {
      const existe = await repository.exists('INEXISTENTE');
      expect(existe).toBe(false);
    });
  });

  describe('count', () => {
    it('deve contar categorias corretamente', async () => {
      await repository.create({ codigo: 'CAT001', descricao: 'Alimentação' });
      await repository.create({ codigo: 'CAT002', descricao: 'Transporte' });

      const total = await repository.count();
      expect(total).toBe(2);
    });

    it('deve retornar 0 quando não há categorias', async () => {
      const total = await repository.count();
      expect(total).toBe(0);
    });
  });

  describe('hasAssociatedLancamentos', () => {
    it('deve retornar true quando categoria tem lançamentos associados', async () => {
      await repository.create({ codigo: 'CAT001', descricao: 'Alimentação' });
      
      await db.run(`
        INSERT INTO lancamentos (data_lancamento, data_pagamento, valor, codigo_categoria, codigo_estabelecimento)
        VALUES ('2024-01-01', '2024-01-01', 100.00, 'CAT001', 'EST001')
      `);

      const hasLancamentos = await repository.hasAssociatedLancamentos('CAT001');
      expect(hasLancamentos).toBe(true);
    });

    it('deve retornar false quando categoria não tem lançamentos associados', async () => {
      await repository.create({ codigo: 'CAT001', descricao: 'Alimentação' });

      const hasLancamentos = await repository.hasAssociatedLancamentos('CAT001');
      expect(hasLancamentos).toBe(false);
    });
  });

  describe('countAssociatedLancamentos', () => {
    it('deve contar lançamentos associados corretamente', async () => {
      await repository.create({ codigo: 'CAT001', descricao: 'Alimentação' });
      
      await db.run(`
        INSERT INTO lancamentos (data_lancamento, data_pagamento, valor, codigo_categoria, codigo_estabelecimento)
        VALUES ('2024-01-01', '2024-01-01', 100.00, 'CAT001', 'EST001')
      `);
      
      await db.run(`
        INSERT INTO lancamentos (data_lancamento, data_pagamento, valor, codigo_categoria, codigo_estabelecimento)
        VALUES ('2024-01-02', '2024-01-02', 200.00, 'CAT001', 'EST001')
      `);

      const count = await repository.countAssociatedLancamentos('CAT001');
      expect(count).toBe(2);
    });

    it('deve retornar 0 quando categoria não tem lançamentos associados', async () => {
      await repository.create({ codigo: 'CAT001', descricao: 'Alimentação' });

      const count = await repository.countAssociatedLancamentos('CAT001');
      expect(count).toBe(0);
    });
  });

  describe('findByDescricao', () => {
    it('deve encontrar categorias por descrição parcial', async () => {
      await repository.create({ codigo: 'CAT001', descricao: 'Alimentação' });
      await repository.create({ codigo: 'CAT002', descricao: 'Alimentação Saudável' });
      await repository.create({ codigo: 'CAT003', descricao: 'Transporte' });

      const categorias = await repository.findByDescricao('Alimentação');

      expect(categorias).toHaveLength(2);
      expect(categorias[0].descricao).toContain('Alimentação');
      expect(categorias[1].descricao).toContain('Alimentação');
    });

    it('deve retornar array vazio quando não encontra categorias', async () => {
      await repository.create({ codigo: 'CAT001', descricao: 'Alimentação' });

      const categorias = await repository.findByDescricao('Inexistente');
      expect(categorias).toHaveLength(0);
    });
  });
});