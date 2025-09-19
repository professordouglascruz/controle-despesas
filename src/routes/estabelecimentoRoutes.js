const express = require('express');
const { EstabelecimentoController } = require('../controllers/EstabelecimentoController');

/**
 * Configuração das rotas para Estabelecimento
 * @param {sqlite3.Database} db - Instância do banco de dados
 * @returns {express.Router} Router configurado
 */
function createEstabelecimentoRoutes(db) {
  const router = express.Router();
  const estabelecimentoController = new EstabelecimentoController(db);

  // GET /api/estabelecimentos - Listar todos os estabelecimentos
  router.get('/', (req, res) => estabelecimentoController.findAll(req, res));

  // GET /api/estabelecimentos/:codigo - Obter estabelecimento específico
  router.get('/:codigo', (req, res) => estabelecimentoController.findByCodigo(req, res));

  // POST /api/estabelecimentos - Criar novo estabelecimento
  router.post('/', (req, res) => estabelecimentoController.create(req, res));

  // PUT /api/estabelecimentos/:codigo - Atualizar estabelecimento
  router.put('/:codigo', (req, res) => estabelecimentoController.update(req, res));

  // DELETE /api/estabelecimentos/:codigo - Excluir estabelecimento
  router.delete('/:codigo', (req, res) => estabelecimentoController.delete(req, res));

  return router;
}

module.exports = { createEstabelecimentoRoutes };