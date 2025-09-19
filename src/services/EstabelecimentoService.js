const { EstabelecimentoRepository } = require('../repositories/EstabelecimentoRepository');

/**
 * Serviço para lógica de negócio de Estabelecimento
 */
class EstabelecimentoService {
  
  constructor(db) {
    this.estabelecimentoRepository = new EstabelecimentoRepository(db);
  }

  /**
   * Criar novo estabelecimento
   * @param {Object} data Dados do estabelecimento
   * @returns {Promise<Object>} Promise com estabelecimento criado
   * @throws {Error} se dados inválidos ou estabelecimento já existe
   */
  async create(data) {
    // Validar dados de entrada
    const validation = this.estabelecimentoRepository.validateCreate(data);
    if (!validation.isValid) {
      const error = new Error('Dados inválidos para criação de estabelecimento');
      error.code = 'VALIDATION_ERROR';
      error.details = validation.errors;
      throw error;
    }

    // Verificar se estabelecimento já existe
    const exists = await this.estabelecimentoRepository.existsByCodigo(data.codigo);
    if (exists) {
      const error = new Error('Estabelecimento com este código já existe');
      error.code = 'CONFLICT_ERROR';
      throw error;
    }

    // Criar estabelecimento
    return await this.estabelecimentoRepository.create(data);
  }

  /**
   * Buscar estabelecimento por código
   * @param {string} codigo Código do estabelecimento
   * @returns {Promise<Object|null>} Promise com estabelecimento ou null se não encontrado
   */
  async findByCodigo(codigo) {
    if (!codigo || codigo.trim().length === 0) {
      const error = new Error('Código do estabelecimento é obrigatório');
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    return await this.estabelecimentoRepository.findById(codigo);
  }

  /**
   * Listar todos os estabelecimentos
   * @returns {Promise<Array>} Promise com array de estabelecimentos
   */
  async findAll() {
    return await this.estabelecimentoRepository.findAll();
  }

  /**
   * Buscar estabelecimentos por nome
   * @param {string} nome Nome para busca
   * @returns {Promise<Array>} Promise com array de estabelecimentos encontrados
   */
  async findByNome(nome) {
    if (!nome || nome.trim().length === 0) {
      const error = new Error('Nome para busca é obrigatório');
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    return await this.estabelecimentoRepository.findByNome(nome);
  }

  /**
   * Buscar estabelecimentos por cidade
   * @param {string} cidade Cidade para busca
   * @returns {Promise<Array>} Promise com array de estabelecimentos encontrados
   */
  async findByCidade(cidade) {
    if (!cidade || cidade.trim().length === 0) {
      const error = new Error('Cidade para busca é obrigatória');
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    return await this.estabelecimentoRepository.findByCidade(cidade);
  }

  /**
   * Atualizar estabelecimento
   * @param {string} codigo Código do estabelecimento
   * @param {Object} data Dados para atualização
   * @returns {Promise<Object>} Promise com estabelecimento atualizado
   * @throws {Error} se estabelecimento não encontrado ou dados inválidos
   */
  async update(codigo, data) {
    // Validar código
    if (!codigo || codigo.trim().length === 0) {
      const error = new Error('Código do estabelecimento é obrigatório');
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    // Validar dados de entrada
    const validation = this.estabelecimentoRepository.validateUpdate(data);
    if (!validation.isValid) {
      const error = new Error('Dados inválidos para atualização de estabelecimento');
      error.code = 'VALIDATION_ERROR';
      error.details = validation.errors;
      throw error;
    }

    // Verificar se estabelecimento existe
    const exists = await this.estabelecimentoRepository.exists(codigo);
    if (!exists) {
      const error = new Error('Estabelecimento não encontrado');
      error.code = 'NOT_FOUND_ERROR';
      throw error;
    }

    // Atualizar estabelecimento
    return await this.estabelecimentoRepository.update(codigo, data);
  }

  /**
   * Excluir estabelecimento com validação de integridade referencial
   * @param {string} codigo Código do estabelecimento
   * @returns {Promise<boolean>} Promise com boolean indicando sucesso
   * @throws {Error} se estabelecimento não encontrado ou possui lançamentos associados
   */
  async delete(codigo) {
    // Validar código
    if (!codigo || codigo.trim().length === 0) {
      const error = new Error('Código do estabelecimento é obrigatório');
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    // Verificar se estabelecimento existe
    const exists = await this.estabelecimentoRepository.exists(codigo);
    if (!exists) {
      const error = new Error('Estabelecimento não encontrado');
      error.code = 'NOT_FOUND_ERROR';
      throw error;
    }

    // Verificar integridade referencial
    const hasLancamentos = await this.estabelecimentoRepository.hasAssociatedLancamentos(codigo);
    if (hasLancamentos) {
      const count = await this.estabelecimentoRepository.countAssociatedLancamentos(codigo);
      const error = new Error(`Não é possível excluir estabelecimento que possui ${count} lançamento(s) associado(s)`);
      error.code = 'REFERENTIAL_INTEGRITY_ERROR';
      error.details = { associatedCount: count };
      throw error;
    }

    // Excluir estabelecimento
    return await this.estabelecimentoRepository.delete(codigo);
  }

  /**
   * Verificar se estabelecimento existe
   * @param {string} codigo Código do estabelecimento
   * @returns {Promise<boolean>} Promise com boolean indicando se existe
   */
  async exists(codigo) {
    if (!codigo || codigo.trim().length === 0) {
      return false;
    }

    return await this.estabelecimentoRepository.exists(codigo);
  }

  /**
   * Contar total de estabelecimentos
   * @returns {Promise<number>} Promise com número total de estabelecimentos
   */
  async count() {
    return await this.estabelecimentoRepository.count();
  }

  /**
   * Obter estatísticas do estabelecimento
   * @param {string} codigo Código do estabelecimento
   * @returns {Promise<Object>} Promise com estatísticas do estabelecimento
   */
  async getStats(codigo) {
    // Validar código
    if (!codigo || codigo.trim().length === 0) {
      const error = new Error('Código do estabelecimento é obrigatório');
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    // Verificar se estabelecimento existe
    const estabelecimento = await this.estabelecimentoRepository.findById(codigo);
    if (!estabelecimento) {
      const error = new Error('Estabelecimento não encontrado');
      error.code = 'NOT_FOUND_ERROR';
      throw error;
    }

    // Obter estatísticas
    const lancamentosCount = await this.estabelecimentoRepository.countAssociatedLancamentos(codigo);

    return {
      estabelecimento,
      lancamentosAssociados: lancamentosCount,
      podeExcluir: lancamentosCount === 0
    };
  }

  /**
   * Validar dados de telefone
   * @param {string} telefone Telefone para validação
   * @returns {boolean} true se telefone é válido
   */
  validateTelefone(telefone) {
    if (!telefone || telefone.trim().length === 0) {
      return false;
    }

    // Remover caracteres não numéricos para validação
    const numericPhone = telefone.replace(/\D/g, '');
    
    // Validar se tem pelo menos 10 dígitos (telefone fixo) ou 11 (celular)
    return numericPhone.length >= 10 && numericPhone.length <= 11;
  }

  /**
   * Formatar telefone para exibição
   * @param {string} telefone Telefone para formatação
   * @returns {string} Telefone formatado
   */
  formatTelefone(telefone) {
    if (!telefone) return '';

    const numericPhone = telefone.replace(/\D/g, '');
    
    if (numericPhone.length === 10) {
      // Telefone fixo: (XX) XXXX-XXXX
      return `(${numericPhone.slice(0, 2)}) ${numericPhone.slice(2, 6)}-${numericPhone.slice(6)}`;
    } else if (numericPhone.length === 11) {
      // Celular: (XX) XXXXX-XXXX
      return `(${numericPhone.slice(0, 2)}) ${numericPhone.slice(2, 7)}-${numericPhone.slice(7)}`;
    }
    
    return telefone; // Retorna original se não conseguir formatar
  }
}

module.exports = { EstabelecimentoService };