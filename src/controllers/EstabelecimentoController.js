const { EstabelecimentoService } = require('../services/EstabelecimentoService');

/**
 * Controller para endpoints de Estabelecimento
 */
class EstabelecimentoController {
  
  constructor(db) {
    this.estabelecimentoService = new EstabelecimentoService(db);
  }

  /**
   * GET /api/estabelecimentos - Listar todos os estabelecimentos
   */
  async findAll(req, res) {
    try {
      const estabelecimentos = await this.estabelecimentoService.findAll();
      res.json(estabelecimentos);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * GET /api/estabelecimentos/:codigo - Obter estabelecimento específico
   */
  async findByCodigo(req, res) {
    try {
      const { codigo } = req.params;
      const estabelecimento = await this.estabelecimentoService.findByCodigo(codigo);
      
      if (!estabelecimento) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND_ERROR',
            message: 'Estabelecimento não encontrado'
          }
        });
      }

      res.json(estabelecimento);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * POST /api/estabelecimentos - Criar novo estabelecimento
   */
  async create(req, res) {
    try {
      const estabelecimento = await this.estabelecimentoService.create(req.body);
      res.status(201).json(estabelecimento);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * PUT /api/estabelecimentos/:codigo - Atualizar estabelecimento
   */
  async update(req, res) {
    try {
      const { codigo } = req.params;
      const estabelecimento = await this.estabelecimentoService.update(codigo, req.body);
      res.json(estabelecimento);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * DELETE /api/estabelecimentos/:codigo - Excluir estabelecimento
   */
  async delete(req, res) {
    try {
      const { codigo } = req.params;
      await this.estabelecimentoService.delete(codigo);
      res.status(204).send();
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * Tratamento centralizado de erros
   */
  handleError(res, error) {
    console.error('EstabelecimentoController Error:', error);

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

module.exports = { EstabelecimentoController };