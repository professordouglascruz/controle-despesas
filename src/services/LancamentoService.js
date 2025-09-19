const { LancamentoRepository } = require('../repositories/LancamentoRepository');
const { CategoriaRepository } = require('../repositories/CategoriaRepository');
const { EstabelecimentoRepository } = require('../repositories/EstabelecimentoRepository');

/**
 * Serviço para lógica de negócio de Lançamento de Despesa
 */
class LancamentoService {
  
  constructor(db) {
    this.lancamentoRepository = new LancamentoRepository(db);
    this.categoriaRepository = new CategoriaRepository(db);
    this.estabelecimentoRepository = new EstabelecimentoRepository(db);
  }

  /**
   * Criar novo lançamento
   * @param {Object} data Dados do lançamento
   * @returns {Promise<Object>} Promise com lançamento criado
   * @throws {Error} se dados inválidos ou referências não existem
   */
  async create(data) {
    // Validar dados de entrada
    const validation = this.lancamentoRepository.validateCreate(data);
    if (!validation.isValid) {
      const error = new Error('Dados inválidos para criação de lançamento');
      error.code = 'VALIDATION_ERROR';
      error.details = validation.errors;
      throw error;
    }

    // Validações de negócio adicionais
    await this.validateBusinessRules(data);

    // Verificar se categoria existe
    const categoriaExists = await this.categoriaRepository.exists(data.codigoCategoria);
    if (!categoriaExists) {
      const error = new Error('Categoria não encontrada');
      error.code = 'NOT_FOUND_ERROR';
      error.details = { field: 'codigoCategoria', value: data.codigoCategoria };
      throw error;
    }

    // Verificar se estabelecimento existe
    const estabelecimentoExists = await this.estabelecimentoRepository.exists(data.codigoEstabelecimento);
    if (!estabelecimentoExists) {
      const error = new Error('Estabelecimento não encontrado');
      error.code = 'NOT_FOUND_ERROR';
      error.details = { field: 'codigoEstabelecimento', value: data.codigoEstabelecimento };
      throw error;
    }

    // Criar lançamento
    return await this.lancamentoRepository.create(data);
  }

  /**
   * Buscar lançamento por ID
   * @param {number} id ID do lançamento
   * @returns {Promise<Object|null>} Promise com lançamento ou null se não encontrado
   */
  async findById(id) {
    if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
      const error = new Error('ID do lançamento deve ser um número inteiro positivo');
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    return await this.lancamentoRepository.findById(Number(id));
  }

  /**
   * Buscar lançamento por ID com detalhes
   * @param {number} id ID do lançamento
   * @returns {Promise<Object|null>} Promise com lançamento detalhado ou null se não encontrado
   */
  async findByIdDetailed(id) {
    if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
      const error = new Error('ID do lançamento deve ser um número inteiro positivo');
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    return await this.lancamentoRepository.findByIdDetailed(Number(id));
  }

  /**
   * Listar todos os lançamentos
   * @returns {Promise<Array>} Promise com array de lançamentos
   */
  async findAll() {
    return await this.lancamentoRepository.findAll();
  }

  /**
   * Listar todos os lançamentos com detalhes
   * @returns {Promise<Array>} Promise com array de lançamentos detalhados
   */
  async findAllDetailed() {
    return await this.lancamentoRepository.findAllDetailed();
  }

  /**
   * Buscar lançamentos por categoria
   * @param {string} codigoCategoria Código da categoria
   * @returns {Promise<Array>} Promise com array de lançamentos
   */
  async findByCategoria(codigoCategoria) {
    if (!codigoCategoria || codigoCategoria.trim().length === 0) {
      const error = new Error('Código da categoria é obrigatório');
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    // Verificar se categoria existe
    const categoriaExists = await this.categoriaRepository.exists(codigoCategoria);
    if (!categoriaExists) {
      const error = new Error('Categoria não encontrada');
      error.code = 'NOT_FOUND_ERROR';
      throw error;
    }

    return await this.lancamentoRepository.findByCategoria(codigoCategoria);
  }

  /**
   * Buscar lançamentos por estabelecimento
   * @param {string} codigoEstabelecimento Código do estabelecimento
   * @returns {Promise<Array>} Promise com array de lançamentos
   */
  async findByEstabelecimento(codigoEstabelecimento) {
    if (!codigoEstabelecimento || codigoEstabelecimento.trim().length === 0) {
      const error = new Error('Código do estabelecimento é obrigatório');
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    // Verificar se estabelecimento existe
    const estabelecimentoExists = await this.estabelecimentoRepository.exists(codigoEstabelecimento);
    if (!estabelecimentoExists) {
      const error = new Error('Estabelecimento não encontrado');
      error.code = 'NOT_FOUND_ERROR';
      throw error;
    }

    return await this.lancamentoRepository.findByEstabelecimento(codigoEstabelecimento);
  }

  /**
   * Buscar lançamentos por período
   * @param {Date|string} dataInicio Data de início
   * @param {Date|string} dataFim Data de fim
   * @returns {Promise<Array>} Promise com array de lançamentos
   */
  async findByPeriodo(dataInicio, dataFim) {
    // Validar datas
    const validationResult = this.validateDateRange(dataInicio, dataFim);
    if (!validationResult.isValid) {
      const error = new Error('Período inválido');
      error.code = 'VALIDATION_ERROR';
      error.details = validationResult.errors;
      throw error;
    }

    return await this.lancamentoRepository.findByPeriodo(dataInicio, dataFim);
  }

  /**
   * Atualizar lançamento
   * @param {number} id ID do lançamento
   * @param {Object} data Dados para atualização
   * @returns {Promise<Object>} Promise com lançamento atualizado
   * @throws {Error} se lançamento não encontrado ou dados inválidos
   */
  async update(id, data) {
    // Validar ID
    if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
      const error = new Error('ID do lançamento deve ser um número inteiro positivo');
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    // Validar dados de entrada
    const validation = this.lancamentoRepository.validateUpdate(data);
    if (!validation.isValid) {
      const error = new Error('Dados inválidos para atualização de lançamento');
      error.code = 'VALIDATION_ERROR';
      error.details = validation.errors;
      throw error;
    }

    // Validações de negócio adicionais
    await this.validateBusinessRules(data, true);

    // Verificar se lançamento existe
    const exists = await this.lancamentoRepository.exists(Number(id));
    if (!exists) {
      const error = new Error('Lançamento não encontrado');
      error.code = 'NOT_FOUND_ERROR';
      throw error;
    }

    // Verificar se categoria existe (se fornecida)
    if (data.codigoCategoria !== undefined) {
      const categoriaExists = await this.categoriaRepository.exists(data.codigoCategoria);
      if (!categoriaExists) {
        const error = new Error('Categoria não encontrada');
        error.code = 'NOT_FOUND_ERROR';
        error.details = { field: 'codigoCategoria', value: data.codigoCategoria };
        throw error;
      }
    }

    // Verificar se estabelecimento existe (se fornecido)
    if (data.codigoEstabelecimento !== undefined) {
      const estabelecimentoExists = await this.estabelecimentoRepository.exists(data.codigoEstabelecimento);
      if (!estabelecimentoExists) {
        const error = new Error('Estabelecimento não encontrado');
        error.code = 'NOT_FOUND_ERROR';
        error.details = { field: 'codigoEstabelecimento', value: data.codigoEstabelecimento };
        throw error;
      }
    }

    // Atualizar lançamento
    return await this.lancamentoRepository.update(Number(id), data);
  }

  /**
   * Excluir lançamento
   * @param {number} id ID do lançamento
   * @returns {Promise<boolean>} Promise com boolean indicando sucesso
   * @throws {Error} se lançamento não encontrado
   */
  async delete(id) {
    // Validar ID
    if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
      const error = new Error('ID do lançamento deve ser um número inteiro positivo');
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    // Verificar se lançamento existe
    const exists = await this.lancamentoRepository.exists(Number(id));
    if (!exists) {
      const error = new Error('Lançamento não encontrado');
      error.code = 'NOT_FOUND_ERROR';
      throw error;
    }

    // Excluir lançamento
    return await this.lancamentoRepository.delete(Number(id));
  }

  /**
   * Obter estatísticas de lançamentos
   * @returns {Promise<Object>} Promise com estatísticas
   */
  async getStats() {
    const totalLancamentos = await this.lancamentoRepository.count();
    const totalGastos = await this.lancamentoRepository.getTotalByCategoria();
    
    return {
      totalLancamentos,
      totalGastos,
      mediaGastos: totalLancamentos > 0 ? totalGastos / totalLancamentos : 0
    };
  }

  /**
   * Obter total de gastos por categoria
   * @param {string} codigoCategoria Código da categoria (opcional)
   * @returns {Promise<number>} Promise com total de gastos
   */
  async getTotalByCategoria(codigoCategoria = null) {
    if (codigoCategoria) {
      // Verificar se categoria existe
      const categoriaExists = await this.categoriaRepository.exists(codigoCategoria);
      if (!categoriaExists) {
        const error = new Error('Categoria não encontrada');
        error.code = 'NOT_FOUND_ERROR';
        throw error;
      }
    }

    return await this.lancamentoRepository.getTotalByCategoria(codigoCategoria);
  }

  /**
   * Obter total de gastos por estabelecimento
   * @param {string} codigoEstabelecimento Código do estabelecimento (opcional)
   * @returns {Promise<number>} Promise com total de gastos
   */
  async getTotalByEstabelecimento(codigoEstabelecimento = null) {
    if (codigoEstabelecimento) {
      // Verificar se estabelecimento existe
      const estabelecimentoExists = await this.estabelecimentoRepository.exists(codigoEstabelecimento);
      if (!estabelecimentoExists) {
        const error = new Error('Estabelecimento não encontrado');
        error.code = 'NOT_FOUND_ERROR';
        throw error;
      }
    }

    return await this.lancamentoRepository.getTotalByEstabelecimento(codigoEstabelecimento);
  }

  /**
   * Validar regras de negócio específicas
   * @param {Object} data Dados do lançamento
   * @param {boolean} isUpdate Se é uma atualização
   * @throws {Error} se regras de negócio não são atendidas
   */
  async validateBusinessRules(data, isUpdate = false) {
    const errors = [];

    // Validar se data de pagamento não é anterior à data de lançamento
    if (data.dataLancamento && data.dataPagamento) {
      const dataLanc = new Date(data.dataLancamento);
      const dataPag = new Date(data.dataPagamento);
      
      if (dataPag < dataLanc) {
        errors.push({
          field: 'dataPagamento',
          message: 'Data de pagamento não pode ser anterior à data de lançamento'
        });
      }
    }

    // Validar se as datas não são futuras demais (mais de 1 ano no futuro)
    const umAnoNoFuturo = new Date();
    umAnoNoFuturo.setFullYear(umAnoNoFuturo.getFullYear() + 1);

    if (data.dataLancamento) {
      const dataLanc = new Date(data.dataLancamento);
      if (dataLanc > umAnoNoFuturo) {
        errors.push({
          field: 'dataLancamento',
          message: 'Data de lançamento não pode ser superior a 1 ano no futuro'
        });
      }
    }

    if (data.dataPagamento) {
      const dataPag = new Date(data.dataPagamento);
      if (dataPag > umAnoNoFuturo) {
        errors.push({
          field: 'dataPagamento',
          message: 'Data de pagamento não pode ser superior a 1 ano no futuro'
        });
      }
    }

    // Validar valor máximo (R$ 1.000.000,00)
    if (data.valor !== undefined && data.valor > 1000000) {
      errors.push({
        field: 'valor',
        message: 'Valor não pode ser superior a R$ 1.000.000,00'
      });
    }

    // Validar valor mínimo (R$ 0,01)
    if (data.valor !== undefined && data.valor < 0.01) {
      errors.push({
        field: 'valor',
        message: 'Valor deve ser no mínimo R$ 0,01'
      });
    }

    if (errors.length > 0) {
      const error = new Error('Regras de negócio não atendidas');
      error.code = 'BUSINESS_RULE_ERROR';
      error.details = errors;
      throw error;
    }
  }

  /**
   * Validar intervalo de datas
   * @param {Date|string} dataInicio Data de início
   * @param {Date|string} dataFim Data de fim
   * @returns {Object} Resultado da validação
   */
  validateDateRange(dataInicio, dataFim) {
    const errors = [];

    if (!dataInicio) {
      errors.push({
        field: 'dataInicio',
        message: 'Data de início é obrigatória'
      });
    }

    if (!dataFim) {
      errors.push({
        field: 'dataFim',
        message: 'Data de fim é obrigatória'
      });
    }

    if (dataInicio && dataFim) {
      const inicio = new Date(dataInicio);
      const fim = new Date(dataFim);

      if (isNaN(inicio.getTime())) {
        errors.push({
          field: 'dataInicio',
          message: 'Data de início inválida'
        });
      }

      if (isNaN(fim.getTime())) {
        errors.push({
          field: 'dataFim',
          message: 'Data de fim inválida'
        });
      }

      if (!isNaN(inicio.getTime()) && !isNaN(fim.getTime()) && fim < inicio) {
        errors.push({
          field: 'dataFim',
          message: 'Data de fim deve ser posterior à data de início'
        });
      }

      // Validar se o período não é muito longo (mais de 5 anos)
      if (!isNaN(inicio.getTime()) && !isNaN(fim.getTime())) {
        const diffYears = (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24 * 365);
        if (diffYears > 5) {
          errors.push({
            field: 'dataFim',
            message: 'Período não pode ser superior a 5 anos'
          });
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Formatar valor monetário para exibição
   * @param {number} valor Valor numérico
   * @returns {string} Valor formatado
   */
  formatCurrency(valor) {
    if (typeof valor !== 'number') {
      return 'R$ 0,00';
    }

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }

  /**
   * Formatar data para exibição
   * @param {Date|string} data Data para formatação
   * @returns {string} Data formatada
   */
  formatDate(data) {
    if (!data) return '';

    const date = new Date(data);
    if (isNaN(date.getTime())) return '';

    return date.toLocaleDateString('pt-BR');
  }
}

module.exports = { LancamentoService };