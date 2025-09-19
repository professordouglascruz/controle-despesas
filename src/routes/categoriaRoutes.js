const express = require('express');
const { CategoriaController } = require('../controllers/CategoriaController');

/**
 * Configuração das rotas para Categoria
 * @param {sqlite3.Database} db - Instância do banco de dados
 * @returns {express.Router} Router configurado
 */
function createCategoriaRoutes(db) {
  const router = express.Router();
  const categoriaController = new CategoriaController(db);

  // GET /api/categorias - Listar todas as categorias
  router.get('/', (req, res) => categoriaController.findAll(req, res));

  // GET /api/categorias/:codigo - Obter categoria específica
  router.get('/:codigo', (req, res) => categoriaController.findByCodigo(req, res));

  // POST /api/categorias - Criar nova categoria
  router.post('/', (req, res) => categoriaController.create(req, res));

  // PUT /api/categorias/:codigo - Atualizar categoria
  router.put('/:codigo', (req, res) => categoriaController.update(req, res));

  // DELETE /api/categorias/:codigo - Excluir categoria
  router.delete('/:codigo', (req, res) => categoriaController.delete(req, res));

  return router;
}

module.exports = { createCategoriaRoutes };