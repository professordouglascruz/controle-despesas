const { CategoriaRepository } = require('../repositories/CategoriaRepository');

/**
 * Serviço para lógica de negócio de Categoria
 */
class CategoriaService {
  
  constructor(db) {
    this.categoriaRepository = new CategoriaRepository(db);
  }

  /**
   * Criar nova categoria
   * @param {Object} data Dados da categoria
   * @returns {Promise<Object>} Promise com categoria criada
   * @throws {Error} se dados inválidos ou categoria já existe
   */
  async create(data) {
    // Validar dados de entrada
    const validation = this.categoriaRepository.validateCreate(data);
    if (!validation.isValid) {
      const error = new Error('Dados inválidos para criação de categoria');
      error.code = 'VALIDATION_ERROR';
      error.details = validation.errors;
      throw error;
    }

    // Verificar se categoria já existe
    const exists = await this.categoriaRepository.existsByCodigo(data.codigo);
    if (exists) {
      const error = new Error('Categoria com este código já existe');
      error.code = 'CONFLICT_ERROR';
      throw error;
    }

    // Criar categoria
    return await this.categoriaRepository.create(data);
  }

  /**
   * Buscar categoria por código
   * @param {string} codigo Código da categoria
   * @returns {Promise<Object|null>} Promise com categoria ou null se não encontrada
   */
  async findByCodigo(codigo) {
    if (!codigo || codigo.trim().length === 0) {
      const error = new Error('Código da categoria é obrigatório');
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    return await this.categoriaRepository.findById(codigo);
  }

  /**
   * Listar todas as categorias
   * @returns {Promise<Array>} Promise com array de categorias
   */
  async findAll() {
    return await this.categoriaRepository.findAll();
  }

  /**
   * Buscar categorias por descrição
   * @param {string} descricao Descrição para busca
   * @returns {Promise<Array>} Promise com array de categorias encontradas
   */
  async findByDescricao(descricao) {
    if (!descricao || descricao.trim().length === 0) {
      const error = new Error('Descrição para busca é obrigatória');
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    return await this.categoriaRepository.findByDescricao(descricao);
  }

  /**
   * Atualizar categoria
   * @param {string} codigo Código da categoria
   * @param {Object} data Dados para atualização
   * @returns {Promise<Object>} Promise com categoria atualizada
   * @throws {Error} se categoria não encontrada ou dados inválidos
   */
  async update(codigo, data) {
    // Validar código
    if (!codigo || codigo.trim().length === 0) {
      const error = new Error('Código da categoria é obrigatório');
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    // Validar dados de entrada
    const validation = this.categoriaRepository.validateUpdate(data);
    if (!validation.isValid) {
      const error = new Error('Dados inválidos para atualização de categoria');
      error.code = 'VALIDATION_ERROR';
      error.details = validation.errors;
      throw error;
    }

    // Verificar se categoria existe
    const exists = await this.categoriaRepository.exists(codigo);
    if (!exists) {
      const error = new Error('Categoria não encontrada');
      error.code = 'NOT_FOUND_ERROR';
      throw error;
    }

    // Atualizar categoria
    return await this.categoriaRepository.update(codigo, data);
  }

  /**
   * Excluir categoria com validação de integridade referencial
   * @param {string} codigo Código da categoria
   * @returns {Promise<boolean>} Promise com boolean indicando sucesso
   * @throws {Error} se categoria não encontrada ou possui lançamentos associados
   */
  async delete(codigo) {
    // Validar código
    if (!codigo || codigo.trim().length === 0) {
      const error = new Error('Código da categoria é obrigatório');
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    // Verificar se categoria existe
    const exists = await this.categoriaRepository.exists(codigo);
    if (!exists) {
      const error = new Error('Categoria não encontrada');
      error.code = 'NOT_FOUND_ERROR';
      throw error;
    }

    // Verificar integridade referencial
    const hasLancamentos = await this.categoriaRepository.hasAssociatedLancamentos(codigo);
    if (hasLancamentos) {
      const count = await this.categoriaRepository.countAssociatedLancamentos(codigo);
      const error = new Error(`Não é possível excluir categoria que possui ${count} lançamento(s) associado(s)`);
      error.code = 'REFERENTIAL_INTEGRITY_ERROR';
      error.details = { associatedCount: count };
      throw error;
    }

    // Excluir categoria
    return await this.categoriaRepository.delete(codigo);
  }

  /**
   * Verificar se categoria existe
   * @param {string} codigo Código da categoria
   * @returns {Promise<boolean>} Promise com boolean indicando se existe
   */
  async exists(codigo) {
    if (!codigo || codigo.trim().length === 0) {
      return false;
    }

    return await this.categoriaRepository.exists(codigo);
  }

  /**
   * Contar total de categorias
   * @returns {Promise<number>} Promise com número total de categorias
   */
  async count() {
    return await this.categoriaRepository.count();
  }

  /**
   * Obter estatísticas da categoria
   * @param {string} codigo Código da categoria
   * @returns {Promise<Object>} Promise com estatísticas da categoria
   */
  async getStats(codigo) {
    // Validar código
    if (!codigo || codigo.trim().length === 0) {
      const error = new Error('Código da categoria é obrigatório');
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    // Verificar se categoria existe
    const categoria = await this.categoriaRepository.findById(codigo);
    if (!categoria) {
      const error = new Error('Categoria não encontrada');
      error.code = 'NOT_FOUND_ERROR';
      throw error;
    }

    // Obter estatísticas
    const lancamentosCount = await this.categoriaRepository.countAssociatedLancamentos(codigo);

    return {
      categoria,
      lancamentosAssociados: lancamentosCount,
      podeExcluir: lancamentosCount === 0
    };
  }
}

module.exports = { CategoriaService };