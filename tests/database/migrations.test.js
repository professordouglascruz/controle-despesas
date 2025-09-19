const dbConfig = require('../../src/database/config');
const migrationManager = require('../../src/database/migrationManager');

describe('Database Migrations', () => {
  beforeEach(async () => {
    process.env.NODE_ENV = 'test';
    await dbConfig.connect();
  });

  afterEach(async () => {
    await dbConfig.close();
  });

  describe('Migration Manager', () => {
    test('should initialize migrations table', async () => {
      await migrationManager.initializeMigrationsTable();
      
      const tables = await dbConfig.all(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='schema_migrations'"
      );
      expect(tables).toHaveLength(1);
    });

    test('should track migration status', async () => {
      await migrationManager.initializeMigrationsTable();
      const status = await migrationManager.getStatus();
      
      expect(status).toHaveProperty('executed');
      expect(status).toHaveProperty('available');
      expect(status).toHaveProperty('pending');
      expect(status).toHaveProperty('executedMigrations');
      expect(status).toHaveProperty('pendingMigrations');
    });
  });

  describe('Table Structure Verification', () => {
    beforeEach(async () => {
      // Manually create tables for testing structure
      await dbConfig.run(`
        CREATE TABLE categorias (
          codigo VARCHAR(50) PRIMARY KEY,
          descricao VARCHAR(255) NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await dbConfig.run(`
        CREATE TABLE estabelecimentos (
          codigo VARCHAR(50) PRIMARY KEY,
          nome VARCHAR(255) NOT NULL,
          endereco TEXT NOT NULL,
          telefone VARCHAR(20) NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await dbConfig.run(`
        CREATE TABLE lancamentos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          data_lancamento DATE NOT NULL,
          data_pagamento DATE NOT NULL,
          valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
          codigo_categoria VARCHAR(50) NOT NULL,
          codigo_estabelecimento VARCHAR(50) NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (codigo_categoria) REFERENCES categorias(codigo) ON DELETE RESTRICT,
          FOREIGN KEY (codigo_estabelecimento) REFERENCES estabelecimentos(codigo) ON DELETE RESTRICT
        )
      `);
    });

    test('should have categorias table with correct structure', async () => {
      const tableInfo = await dbConfig.all("PRAGMA table_info(categorias)");
      
      const columns = tableInfo.map(col => col.name);
      expect(columns).toContain('codigo');
      expect(columns).toContain('descricao');
      expect(columns).toContain('created_at');
      expect(columns).toContain('updated_at');

      // Check primary key
      const pkColumn = tableInfo.find(col => col.pk === 1);
      expect(pkColumn.name).toBe('codigo');
    });

    test('should have estabelecimentos table with correct structure', async () => {
      const tableInfo = await dbConfig.all("PRAGMA table_info(estabelecimentos)");
      
      const columns = tableInfo.map(col => col.name);
      expect(columns).toContain('codigo');
      expect(columns).toContain('nome');
      expect(columns).toContain('endereco');
      expect(columns).toContain('telefone');
      expect(columns).toContain('created_at');
      expect(columns).toContain('updated_at');

      // Check primary key
      const pkColumn = tableInfo.find(col => col.pk === 1);
      expect(pkColumn.name).toBe('codigo');
    });

    test('should have lancamentos table with correct structure', async () => {
      const tableInfo = await dbConfig.all("PRAGMA table_info(lancamentos)");
      
      const columns = tableInfo.map(col => col.name);
      expect(columns).toContain('id');
      expect(columns).toContain('data_lancamento');
      expect(columns).toContain('data_pagamento');
      expect(columns).toContain('valor');
      expect(columns).toContain('codigo_categoria');
      expect(columns).toContain('codigo_estabelecimento');
      expect(columns).toContain('created_at');
      expect(columns).toContain('updated_at');

      // Check primary key
      const pkColumn = tableInfo.find(col => col.pk === 1);
      expect(pkColumn.name).toBe('id');
    });

    test('should have foreign key constraints', async () => {
      const foreignKeys = await dbConfig.all("PRAGMA foreign_key_list(lancamentos)");
      
      expect(foreignKeys).toHaveLength(2);
      
      const categoryFK = foreignKeys.find(fk => fk.from === 'codigo_categoria');
      expect(categoryFK.table).toBe('categorias');
      expect(categoryFK.to).toBe('codigo');
      expect(categoryFK.on_delete).toBe('RESTRICT');

      const establishmentFK = foreignKeys.find(fk => fk.from === 'codigo_estabelecimento');
      expect(establishmentFK.table).toBe('estabelecimentos');
      expect(establishmentFK.to).toBe('codigo');
      expect(establishmentFK.on_delete).toBe('RESTRICT');
    });

    test('should enforce referential integrity', async () => {
      // First create valid category and establishment
      await dbConfig.run(
        'INSERT INTO categorias (codigo, descricao) VALUES (?, ?)',
        ['CAT001', 'Alimentação']
      );
      
      await dbConfig.run(
        'INSERT INTO estabelecimentos (codigo, nome, endereco, telefone) VALUES (?, ?, ?, ?)',
        ['EST001', 'Restaurante ABC', 'Rua A, 123', '11999999999']
      );

      // Should allow valid lancamento
      await expect(dbConfig.run(
        'INSERT INTO lancamentos (data_lancamento, data_pagamento, valor, codigo_categoria, codigo_estabelecimento) VALUES (?, ?, ?, ?, ?)',
        ['2024-01-01', '2024-01-01', 50.00, 'CAT001', 'EST001']
      )).resolves.not.toThrow();

      // Should reject invalid category
      await expect(dbConfig.run(
        'INSERT INTO lancamentos (data_lancamento, data_pagamento, valor, codigo_categoria, codigo_estabelecimento) VALUES (?, ?, ?, ?, ?)',
        ['2024-01-01', '2024-01-01', 50.00, 'INVALID', 'EST001']
      )).rejects.toThrow();

      // Should reject invalid establishment
      await expect(dbConfig.run(
        'INSERT INTO lancamentos (data_lancamento, data_pagamento, valor, codigo_categoria, codigo_estabelecimento) VALUES (?, ?, ?, ?, ?)',
        ['2024-01-01', '2024-01-01', 50.00, 'CAT001', 'INVALID']
      )).rejects.toThrow();
    });

    test('should enforce value constraint', async () => {
      // Create valid category and establishment first
      await dbConfig.run(
        'INSERT INTO categorias (codigo, descricao) VALUES (?, ?)',
        ['CAT001', 'Alimentação']
      );
      
      await dbConfig.run(
        'INSERT INTO estabelecimentos (codigo, nome, endereco, telefone) VALUES (?, ?, ?, ?)',
        ['EST001', 'Restaurante ABC', 'Rua A, 123', '11999999999']
      );

      // Should reject negative values
      await expect(dbConfig.run(
        'INSERT INTO lancamentos (data_lancamento, data_pagamento, valor, codigo_categoria, codigo_estabelecimento) VALUES (?, ?, ?, ?, ?)',
        ['2024-01-01', '2024-01-01', -10.00, 'CAT001', 'EST001']
      )).rejects.toThrow();

      // Should reject zero values
      await expect(dbConfig.run(
        'INSERT INTO lancamentos (data_lancamento, data_pagamento, valor, codigo_categoria, codigo_estabelecimento) VALUES (?, ?, ?, ?, ?)',
        ['2024-01-01', '2024-01-01', 0, 'CAT001', 'EST001']
      )).rejects.toThrow();
    });
  });
});