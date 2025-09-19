#!/usr/bin/env node

/**
 * Servidor principal do Sistema de Lançamento de Despesas
 * 
 * Este arquivo é o ponto de entrada principal da aplicação.
 * Ele inicializa o servidor Express e configura o banco de dados.
 */

const { ExpenseTrackerApp } = require('./src/app');
const SeedData = require('./src/database/seedData');

/**
 * Configuração do servidor
 */
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Função principal para inicializar a aplicação
 */
async function startServer() {
  console.log('🚀 Iniciando Expense Tracker...');
  console.log(`📊 Ambiente: ${NODE_ENV}`);
  console.log(`🔌 Porta: ${PORT}`);
  
  try {
    // Criar instância da aplicação
    const app = new ExpenseTrackerApp();
    
    // Inicializar dados de exemplo em desenvolvimento
    if (NODE_ENV === 'development') {
      console.log('🌱 Verificando dados de exemplo...');
      const seedData = new SeedData();
      
      try {
        await seedData.run(false); // false = não forçar se já existem dados
      } catch (error) {
        console.log('⚠ Aviso: Não foi possível executar seed de dados:', error.message);
      }
    }
    
    // Iniciar servidor
    const server = await app.start(PORT);
    
    console.log('✅ Servidor iniciado com sucesso!');
    console.log(`🌐 Acesse: http://localhost:${PORT}`);
    console.log(`📡 API: http://localhost:${PORT}/api`);
    console.log('');
    console.log('📋 Endpoints disponíveis:');
    console.log('  • GET  /                     - Página principal');
    console.log('  • GET  /api                  - Informações da API');
    console.log('  • GET  /api/categorias       - Listar categorias');
    console.log('  • GET  /api/estabelecimentos - Listar estabelecimentos');
    console.log('  • GET  /api/lancamentos      - Listar lançamentos');
    console.log('');
    console.log('⏹ Para parar o servidor: Ctrl+C');
    
    // Configurar graceful shutdown
    const gracefulShutdown = async (signal) => {
      console.log(`\n🛑 Recebido sinal ${signal}. Encerrando servidor...`);
      
      try {
        // Fechar servidor HTTP
        server.close(() => {
          console.log('🔌 Servidor HTTP fechado');
        });
        
        // Fechar conexões do banco de dados
        await app.close();
        console.log('💾 Conexões do banco fechadas');
        
        console.log('✅ Servidor encerrado graciosamente');
        process.exit(0);
      } catch (error) {
        console.error('❌ Erro durante encerramento:', error);
        process.exit(1);
      }
    };
    
    // Registrar handlers para graceful shutdown
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    
    // Handler para erros não capturados
    process.on('uncaughtException', (error) => {
      console.error('❌ Erro não capturado:', error);
      process.exit(1);
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Promise rejeitada não tratada:', reason);
      console.error('Promise:', promise);
      process.exit(1);
    });
    
  } catch (error) {
    console.error('❌ Falha ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Iniciar servidor se este arquivo for executado diretamente
if (require.main === module) {
  startServer();
}

module.exports = { startServer };