const dbConfig = require('../../src/database/config');

describe('Database Configuration', () => {
  beforeEach(async () => {
    // Ensure we're using in-memory database for tests
    process.env.NODE_ENV = 'test';
  });

  afterEach(async () => {
    if (dbConfig.db) {
      await dbConfig.close();
    }
  });

  describe('Connection Management', () => {
    test('should connect to database successfully', async () => {
      const db = await dbConfig.connect();
      expect(db).toBeDefined();
      expect(dbConfig.getDatabase()).toBe(db);
    });

    test('should close database connection', async () => {
      await dbConfig.connect();
      await expect(dbConfig.close()).resolves.not.toThrow();
    });

    test('should throw error when getting database without connection', () => {
      expect(() => dbConfig.getDatabase()).toThrow('Database not connected');
    });
  });

  describe('Query Operations', () => {
    beforeEach(async () => {
      await dbConfig.connect();
    });

    test('should execute run operation', async () => {
      const result = await dbConfig.run('CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)');
      expect(result).toHaveProperty('changes');
    });

    test('should execute get operation', async () => {
      await dbConfig.run('CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)');
      await dbConfig.run('INSERT INTO test (name) VALUES (?)', ['test']);
      
      const row = await dbConfig.get('SELECT * FROM test WHERE name = ?', ['test']);
      expect(row).toHaveProperty('name', 'test');
    });

    test('should execute all operation', async () => {
      await dbConfig.run('CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)');
      await dbConfig.run('INSERT INTO test (name) VALUES (?)', ['test1']);
      await dbConfig.run('INSERT INTO test (name) VALUES (?)', ['test2']);
      
      const rows = await dbConfig.all('SELECT * FROM test');
      expect(rows).toHaveLength(2);
    });
  });

  describe('Transaction Support', () => {
    beforeEach(async () => {
      await dbConfig.connect();
    });

    test('should execute transaction successfully', async () => {
      const statements = [
        'CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)',
        "INSERT INTO test (name) VALUES ('test1')",
        "INSERT INTO test (name) VALUES ('test2')"
      ];

      await expect(dbConfig.executeTransaction(statements)).resolves.not.toThrow();
      
      const rows = await dbConfig.all('SELECT * FROM test');
      expect(rows).toHaveLength(2);
    });
  });
});