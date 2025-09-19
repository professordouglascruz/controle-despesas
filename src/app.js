const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const databaseConfig = require('./database/config');
const { createApiRoutes } = require('./routes');

/**
 * Configuração principal da aplicação Express
 */
class ExpenseTrackerApp {
  constructor() {
    this.app = express();
    this.db = null;
  }

  /**
   * Configurar middlewares básicos
   */
  setupMiddleware() {
    // Security middleware with relaxed CSP for inline event handlers
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));
    
    // CORS middleware
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Logging middleware (apenas em desenvolvimento)
    if (process.env.NODE_ENV !== 'test') {
      this.app.use(morgan('combined'));
    }

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Static files middleware
    this.app.use(express.static(path.join(__dirname, '../public')));
  }

  /**
   * Configurar rotas da API
   */
  setupRoutes() {
    // API routes
    this.app.use('/api', createApiRoutes(this.db));

    // Root endpoint - serve the main HTML page
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '../public/index.html'));
    });

    // API info endpoint
    this.app.get('/api', (req, res) => {
      res.json({
        message: 'Expense Tracker API',
        version: '1.0.0',
        endpoints: {
          categorias: '/api/categorias',
          estabelecimentos: '/api/estabelecimentos',
          lancamentos: '/api/lancamentos',
          health: '/api/health'
        }
      });
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND_ERROR',
          message: `Endpoint ${req.method} ${req.originalUrl} não encontrado`
        }
      });
    });
  }

  /**
   * Configurar middleware de tratamento de erros global
   */
  setupErrorHandling() {
    // Global error handler
    this.app.use((error, req, res, next) => {
      console.error('Global Error Handler:', error);

      // Se a resposta já foi enviada, delegar para o handler padrão do Express
      if (res.headersSent) {
        return next(error);
      }

      const errorResponse = {
        error: {
          code: error.code || 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Erro interno do servidor'
        }
      };

      if (error.details) {
        errorResponse.error.details = error.details;
      }

      // Adicionar stack trace apenas em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        errorResponse.error.stack = error.stack;
      }

      let statusCode = 500;
      
      switch (error.code) {
        case 'VALIDATION_ERROR':
          statusCode = 400;
          break;
        case 'NOT_FOUND_ERROR':
          statusCode = 404;
          break;
        case 'CONFLICT_ERROR':
        case 'REFERENTIAL_INTEGRITY_ERROR':
          statusCode = 409;
          break;
        case 'UNAUTHORIZED_ERROR':
          statusCode = 401;
          break;
        case 'FORBIDDEN_ERROR':
          statusCode = 403;
          break;
        default:
          statusCode = 500;
      }

      res.status(statusCode).json(errorResponse);
    });
  }

  /**
   * Inicializar a aplicação
   */
  async initialize() {
    try {
      // Inicializar banco de dados
      await databaseConfig.initialize();
      this.db = databaseConfig.getDatabase();

      // Configurar middlewares
      this.setupMiddleware();

      // Configurar rotas
      this.setupRoutes();

      // Configurar tratamento de erros
      this.setupErrorHandling();

      console.log('Expense Tracker App initialized successfully');
    } catch (error) {
      console.error('Failed to initialize app:', error);
      throw error;
    }
  }

  /**
   * Iniciar o servidor
   */
  async start(port = process.env.PORT || 3000) {
    await this.initialize();
    
    return new Promise((resolve) => {
      const server = this.app.listen(port, () => {
        console.log(`Server running on port ${port}`);
        resolve(server);
      });
    });
  }

  /**
   * Obter instância do Express app
   */
  getApp() {
    return this.app;
  }

  /**
   * Fechar conexões e limpar recursos
   */
  async close() {
    if (this.db) {
      await databaseConfig.close();
    }
  }
}

// Se executado diretamente, iniciar o servidor
if (require.main === module) {
  const app = new ExpenseTrackerApp();
  app.start().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    await app.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('Shutting down gracefully...');
    await app.close();
    process.exit(0);
  });
}

module.exports = { ExpenseTrackerApp };