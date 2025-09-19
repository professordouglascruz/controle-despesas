const { LancamentoService } = require('../services/LancamentoService');

/**
 * Controller para endpoints de Lançamento
 */
class LancamentoController {
  
  constructor(db) {
    this.lancamentoService = new LancamentoService(db);
  }

  /**
   * GET /api/lancamentos - Listar todos os lançamentos
   */
  async findAll(req, res) {
    try {
      const lancamentos = await this.lancamentoService.findAll();
      res.json(lancamentos);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * GET /api/lancamentos/:id - Obter lançamento específico
   */
  async findById(req, res) {
    try {
      const { id } = req.params;
      const lancamento = await this.lancamentoService.findById(parseInt(id));
      
      if (!lancamento) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND_ERROR',
            message: 'Lançamento não encontrado'
          }
        });
      }

      res.json(lancamento);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * POST /api/lancamentos - Criar novo lançamento
   */
  async create(req, res) {
    try {
      const lancamento = await this.lancamentoService.create(req.body);
      res.status(201).json(lancamento);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * PUT /api/lancamentos/:id - Atualizar lançamento
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const lancamento = await this.lancamentoService.update(parseInt(id), req.body);
      res.json(lancamento);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * DELETE /api/lancamentos/:id - Excluir lançamento
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      await this.lancamentoService.delete(parseInt(id));
      res.status(204).send();
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * Tratamento centralizado de erros
   */
  handleError(res, error) {
    console.error('LancamentoController Error:', error);

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

module.exports = { LancamentoController };