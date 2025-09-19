const sqlite3 = require('sqlite3').verbose();
const path = require('path');

/**
 * Database configuration for the expense tracker application
 */
class DatabaseConfig {
  constructor() {
    this.dbPath = process.env.NODE_ENV === 'test' 
      ? ':memory:' 
      : path.join(__dirname, '../../data/expense_tracker.db');
    
    this.db = null;
  }

  /**
   * Initialize database connection
   * @returns {Promise<sqlite3.Database>}
   */
  async connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('Error opening database:', err.message);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          // Enable foreign key constraints
          this.db.run('PRAGMA foreign_keys = ON');
          resolve(this.db);
        }
      });
    });
  }

  /**
   * Close database connection
   * @returns {Promise<void>}
   */
  async close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error('Error closing database:', err.message);
            reject(err);
          } else {
            console.log('Database connection closed');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Get current database instance
   * @returns {sqlite3.Database}
   */
  getDatabase() {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  /**
   * Execute a query with parameters
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<any>}
   */
  async run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  /**
   * Get a single row from query
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<any>}
   */
  async get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  /**
   * Get all rows from query
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<Array>}
   */
  async all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * Initialize database with migrations
   * @returns {Promise<void>}
   */
  async initialize() {
    await this.connect();
    
    // Always run migrations to ensure database schema exists
    const migrationManager = require('./migrationManager');
    await migrationManager.ensureMigrationsDirectory();
    await migrationManager.runMigrations();
  }

  /**
   * Execute multiple SQL statements in a transaction
   * @param {Array<string>} statements - Array of SQL statements
   * @returns {Promise<void>}
   */
  async executeTransaction(statements) {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run('BEGIN TRANSACTION');
        
        let hasError = false;
        let completed = 0;
        
        const handleComplete = () => {
          completed++;
          if (completed === statements.length) {
            if (hasError) {
              this.db.run('ROLLBACK', (err) => {
                if (err) reject(err);
                else reject(new Error('Transaction rolled back due to error'));
              });
            } else {
              this.db.run('COMMIT', (err) => {
                if (err) reject(err);
                else resolve();
              });
            }
          }
        };
        
        statements.forEach(sql => {
          this.db.run(sql, (err) => {
            if (err) {
              hasError = true;
              console.error('Transaction error:', err.message);
            }
            handleComplete();
          });
        });
      });
    });
  }
}

// Export singleton instance
module.exports = new DatabaseConfig();