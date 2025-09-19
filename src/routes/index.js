const express = require('express');
const { createCategoriaRoutes } = require('./categoriaRoutes');
const { createEstabelecimentoRoutes } = require('./estabelecimentoRoutes');
const { createLancamentoRoutes } = require('./lancamentoRoutes');

/**
 * Configuração de todas as rotas da API
 * @param {sqlite3.Database} db - Instância do banco de dados
 * @returns {express.Router} Router principal configurado
 */
function createApiRoutes(db) {
  const router = express.Router();

  // Configurar rotas para cada entidade
  router.use('/categorias', createCategoriaRoutes(db));
  router.use('/estabelecimentos', createEstabelecimentoRoutes(db));
  router.use('/lancamentos', createLancamentoRoutes(db));

  // Rota de health check
  router.get('/health', (req, res) => {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'expense-tracker-api'
    });
  });

  return router;
}

module.exports = { createApiRoutes };