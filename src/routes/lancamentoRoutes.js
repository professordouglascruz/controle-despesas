const express = require('express');
const { LancamentoController } = require('../controllers/LancamentoController');

/**
 * Configuração das rotas para Lançamento
 * @param {sqlite3.Database} db - Instância do banco de dados
 * @returns {express.Router} Router configurado
 */
function createLancamentoRoutes(db) {
  const router = express.Router();
  const lancamentoController = new LancamentoController(db);

  // GET /api/lancamentos - Listar todos os lançamentos
  router.get('/', (req, res) => lancamentoController.findAll(req, res));

  // GET /api/lancamentos/:id - Obter lançamento específico
  router.get('/:id', (req, res) => lancamentoController.findById(req, res));

  // POST /api/lancamentos - Criar novo lançamento
  router.post('/', (req, res) => lancamentoController.create(req, res));

  // PUT /api/lancamentos/:id - Atualizar lançamento
  router.put('/:id', (req, res) => lancamentoController.update(req, res));

  // DELETE /api/lancamentos/:id - Excluir lançamento
  router.delete('/:id', (req, res) => lancamentoController.delete(req, res));

  return router;
}

module.exports = { createLancamentoRoutes };