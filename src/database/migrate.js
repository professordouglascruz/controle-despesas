#!/usr/bin/env node

/**
 * Migration script for running database migrations
 */

const databaseConfig = require('./config');
const migrationManager = require('./migrationManager');

/**
 * Run migrations
 */
async function runMigrations() {
  try {
    console.log('🔄 Iniciando migrations...');
    
    // Initialize database connection
    await databaseConfig.initialize();
    
    // Ensure migrations directory exists
    await migrationManager.ensureMigrationsDirectory();
    
    // Run all pending migrations
    await migrationManager.runMigrations();
    
    console.log('✅ Migrations concluídas com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante migrations:', error.message);
    throw error;
  } finally {
    // Close database connection
    await databaseConfig.close();
  }
}

// If executed directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('Migrations executadas com sucesso!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Falha nas migrations:', error);
      process.exit(1);
    });
}

module.exports = { runMigrations };