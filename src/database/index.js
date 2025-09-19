const dbConfig = require('./config');
const migrationManager = require('./migrationManager');

/**
 * Database module exports
 */
module.exports = {
  config: dbConfig,
  migrationManager,
  
  /**
   * Initialize database and run migrations
   * @returns {Promise<void>}
   */
  async initialize() {
    return await dbConfig.initialize();
  },

  /**
   * Get database connection
   * @returns {sqlite3.Database}
   */
  getConnection() {
    return dbConfig.getDatabase();
  },

  /**
   * Close database connection
   * @returns {Promise<void>}
   */
  async close() {
    return await dbConfig.close();
  }
};