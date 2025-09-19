const fs = require('fs').promises;
const path = require('path');
const dbConfig = require('./config');

/**
 * Migration Manager for handling database schema changes
 */
class MigrationManager {
  constructor() {
    this.migrationsPath = path.join(__dirname, 'migrations');
    this.migrationsTable = 'schema_migrations';
  }

  /**
   * Initialize migrations table
   * @returns {Promise<void>}
   */
  async initializeMigrationsTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS ${this.migrationsTable} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await dbConfig.run(sql);
  }

  /**
   * Get list of executed migrations
   * @returns {Promise<Array<string>>}
   */
  async getExecutedMigrations() {
    try {
      const rows = await dbConfig.all(`SELECT filename FROM ${this.migrationsTable} ORDER BY id`);
      return rows.map(row => row.filename);
    } catch (error) {
      // If table doesn't exist, return empty array
      if (error.message.includes('no such table')) {
        return [];
      }
      throw error;
    }
  }

  /**
   * Get list of available migration files
   * @returns {Promise<Array<string>>}
   */
  async getAvailableMigrations() {
    try {
      const files = await fs.readdir(this.migrationsPath);
      return files
        .filter(file => file.endsWith('.sql'))
        .sort();
    } catch (error) {
      if (error.code === 'ENOENT') {
        // Migrations directory doesn't exist
        return [];
      }
      throw error;
    }
  }

  /**
   * Get pending migrations (not yet executed)
   * @returns {Promise<Array<string>>}
   */
  async getPendingMigrations() {
    const executed = await this.getExecutedMigrations();
    const available = await this.getAvailableMigrations();
    
    return available.filter(migration => !executed.includes(migration));
  }

  /**
   * Execute a single migration file
   * @param {string} filename - Migration filename
   * @returns {Promise<void>}
   */
  async executeMigration(filename) {
    const migrationPath = path.join(this.migrationsPath, filename);
    
    try {
      const sql = await fs.readFile(migrationPath, 'utf8');
      
      // Split SQL by semicolons and execute each statement
      const statements = sql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);

      for (const statement of statements) {
        await dbConfig.run(statement);
      }

      // Record migration as executed
      await dbConfig.run(
        `INSERT INTO ${this.migrationsTable} (filename) VALUES (?)`,
        [filename]
      );

      console.log(`Migration executed: ${filename}`);
    } catch (error) {
      console.error(`Error executing migration ${filename}:`, error.message);
      throw error;
    }
  }

  /**
   * Run all pending migrations
   * @returns {Promise<void>}
   */
  async runMigrations() {
    await this.initializeMigrationsTable();
    
    const pendingMigrations = await this.getPendingMigrations();
    
    if (pendingMigrations.length === 0) {
      console.log('No pending migrations to run');
      return;
    }

    console.log(`Running ${pendingMigrations.length} pending migration(s)...`);
    
    for (const migration of pendingMigrations) {
      await this.executeMigration(migration);
    }
    
    console.log('All migrations completed successfully');
  }

  /**
   * Create migrations directory if it doesn't exist
   * @returns {Promise<void>}
   */
  async ensureMigrationsDirectory() {
    try {
      await fs.access(this.migrationsPath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        await fs.mkdir(this.migrationsPath, { recursive: true });
        console.log(`Created migrations directory: ${this.migrationsPath}`);
      } else {
        throw error;
      }
    }
  }

  /**
   * Get migration status
   * @returns {Promise<Object>}
   */
  async getStatus() {
    const executed = await this.getExecutedMigrations();
    const available = await this.getAvailableMigrations();
    const pending = await this.getPendingMigrations();

    return {
      executed: executed.length,
      available: available.length,
      pending: pending.length,
      executedMigrations: executed,
      pendingMigrations: pending
    };
  }
}

module.exports = new MigrationManager();