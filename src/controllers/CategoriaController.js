const { CategoriaService } = require('../services/CategoriaService');

/**
 * Controller para endpoints de Categoria
 */
class CategoriaController {
  
  constructor(db) {
    this.categoriaService = new CategoriaService(db);
  }

  /**
   * GET /api/categorias - Listar todas as categorias
   */
  async findAll(req, res) {
    try {
      const categorias = await this.categoriaService.findAll();
      res.json(categorias);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * GET /api/categorias/:codigo - Obter categoria específica
   */
  async findByCodigo(req, res) {
    try {
      const { codigo } = req.params;
      const categoria = await this.categoriaService.findByCodigo(codigo);
      
      if (!categoria) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND_ERROR',
            message: 'Categoria não encontrada'
          }
        });
      }

      res.json(categoria);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * POST /api/categorias - Criar nova categoria
   */
  async create(req, res) {
    try {
      const categoria = await this.categoriaService.create(req.body);
      res.status(201).json(categoria);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * PUT /api/categorias/:codigo - Atualizar categoria
   */
  async update(req, res) {
    try {
      const { codigo } = req.params;
      const categoria = await this.categoriaService.update(codigo, req.body);
      res.json(categoria);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * DELETE /api/categorias/:codigo - Excluir categoria
   */
  async delete(req, res) {
    try {
      const { codigo } = req.params;
      await this.categoriaService.delete(codigo);
      res.status(204).send();
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * Tratamento centralizado de erros
   */
  handleError(res, error) {
    console.error('CategoriaController Error:', error);

    const errorResponse = {
      error: {
        code: error.code || 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Erro interno do servidor'
      }
    };

    if (error.details) {
      errorResponse.error.details = error.details;
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
      default:
        statusCode = 500;
    }

    res.status(statusCode).json(errorResponse);
  }
}

module.exports = { CategoriaController };