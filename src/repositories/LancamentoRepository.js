const { BaseRepository } = require('./BaseRepository');

/**
 * Repositório para operações CRUD de Lançamento de Despesa
 */
class LancamentoRepository extends BaseRepository {
  
  constructor(db) {
    super(db, 'lancamentos', 'id');
  }

  /**
   * Converter dados do banco para o modelo LancamentoDespesa
   */
  mapRowToModel(row) {
    return {
      id: row.id,
      dataLancamento: new Date(row.data_lancamento),
      dataPagamento: new Date(row.data_pagamento),
      valor: parseFloat(row.valor),
      descricao: row.descricao || undefined,
      codigoCategoria: row.codigo_categoria,
      codigoEstabelecimento: row.codigo_estabelecimento,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  /**
   * Converter dados do banco para o modelo LancamentoDespesaDetalhado (com joins)
   */
  mapRowToDetailedModel(row) {
    const lancamento = this.mapRowToModel(row);
    
    // Adicionar dados da categoria se disponíveis
    if (row.categoria_descricao) {
      lancamento.categoria = {
        codigo: row.codigo_categoria,
        descricao: row.categoria_descricao
      };
    }
    
    // Adicionar dados do estabelecimento se disponíveis
    if (row.estabelecimento_nome) {
      lancamento.estabelecimento = {
        codigo: row.codigo_estabelecimento,
        nome: row.estabelecimento_nome
      };
    }
    
    return lancamento;
  }

  /**
   * Converter dados de criação para inserção no banco
   */
  mapCreateToRow(data) {
    return {
      data_lancamento: this.formatDate(data.dataLancamento),
      data_pagamento: this.formatDate(data.dataPagamento),
      valor: data.valor,
      descricao: data.descricao || null,
      codigo_categoria: data.codigoCategoria,
      codigo_estabelecimento: data.codigoEstabelecimento,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  /**
   * Converter dados de atualização para update no banco
   */
  mapUpdateToRow(data) {
    const row = {};
    
    if (data.dataLancamento !== undefined) {
      row.data_lancamento = this.formatDate(data.dataLancamento);
    }
    
    if (data.dataPagamento !== undefined) {
      row.data_pagamento = this.formatDate(data.dataPagamento);
    }
    
    if (data.valor !== undefined) {
      row.valor = data.valor;
    }
    
    if (data.descricao !== undefined) {
      row.descricao = data.descricao || null;
    }
    
    if (data.codigoCategoria !== undefined) {
      row.codigo_categoria = data.codigoCategoria;
    }
    
    if (data.codigoEstabelecimento !== undefined) {
      row.codigo_estabelecimento = data.codigoEstabelecimento;
    }
    
    return row;
  }

  /**
   * Formatar data para inserção no banco
   */
  formatDate(date) {
    if (date instanceof Date) {
      return date.toISOString().split('T')[0]; // YYYY-MM-DD
    }
    
    if (typeof date === 'string') {
      // Assumir que já está no formato correto ou converter
      const parsedDate = new Date(date);
      return parsedDate.toISOString().split('T')[0];
    }
    
    throw new Error('Invalid date format');
  }

  /**
   * Validar dados antes da criação
   */
  validateCreate(data) {
    const errors = [];

    // Validar data de lançamento
    if (!data.dataLancamento) {
      errors.push({
        field: 'dataLancamento',
        message: 'Data de lançamento é obrigatória'
      });
    } else {
      try {
        this.formatDate(data.dataLancamento);
      } catch (e) {
        errors.push({
          field: 'dataLancamento',
          message: 'Data de lançamento inválida'
        });
      }
    }

    // Validar data de pagamento
    if (!data.dataPagamento) {
      errors.push({
        field: 'dataPagamento',
        message: 'Data de pagamento é obrigatória'
      });
    } else {
      try {
        this.formatDate(data.dataPagamento);
      } catch (e) {
        errors.push({
          field: 'dataPagamento',
          message: 'Data de pagamento inválida'
        });
      }
    }

    // Validar valor
    if (data.valor === undefined || data.valor === null) {
      errors.push({
        field: 'valor',
        message: 'Valor é obrigatório'
      });
    } else if (typeof data.valor !== 'number' || data.valor <= 0) {
      errors.push({
        field: 'valor',
        message: 'Valor deve ser um número positivo'
      });
    }

    // Validar código da categoria
    if (!data.codigoCategoria || data.codigoCategoria.trim().length === 0) {
      errors.push({
        field: 'codigoCategoria',
        message: 'Código da categoria é obrigatório'
      });
    }

    // Validar código do estabelecimento
    if (!data.codigoEstabelecimento || data.codigoEstabelecimento.trim().length === 0) {
      errors.push({
        field: 'codigoEstabelecimento',
        message: 'Código do estabelecimento é obrigatório'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validar dados antes da atualização
   */
  validateUpdate(data) {
    const errors = [];

    // Validar data de lançamento se fornecida
    if (data.dataLancamento !== undefined) {
      if (!data.dataLancamento) {
        errors.push({
          field: 'dataLancamento',
          message: 'Data de lançamento é obrigatória'
        });
      } else {
        try {
          this.formatDate(data.dataLancamento);
        } catch (e) {
          errors.push({
            field: 'dataLancamento',
            message: 'Data de lançamento inválida'
          });
        }
      }
    }

    // Validar data de pagamento se fornecida
    if (data.dataPagamento !== undefined) {
      if (!data.dataPagamento) {
        errors.push({
          field: 'dataPagamento',
          message: 'Data de pagamento é obrigatória'
        });
      } else {
        try {
          this.formatDate(data.dataPagamento);
        } catch (e) {
          errors.push({
            field: 'dataPagamento',
            message: 'Data de pagamento inválida'
          });
        }
      }
    }

    // Validar valor se fornecido
    if (data.valor !== undefined) {
      if (data.valor === null) {
        errors.push({
          field: 'valor',
          message: 'Valor é obrigatório'
        });
      } else if (typeof data.valor !== 'number' || data.valor <= 0) {
        errors.push({
          field: 'valor',
          message: 'Valor deve ser um número positivo'
        });
      }
    }

    // Validar código da categoria se fornecido
    if (data.codigoCategoria !== undefined) {
      if (!data.codigoCategoria || data.codigoCategoria.trim().length === 0) {
        errors.push({
          field: 'codigoCategoria',
          message: 'Código da categoria é obrigatório'
        });
      }
    }

    // Validar código do estabelecimento se fornecido
    if (data.codigoEstabelecimento !== undefined) {
      if (!data.codigoEstabelecimento || data.codigoEstabelecimento.trim().length === 0) {
        errors.push({
          field: 'codigoEstabelecimento',
          message: 'Código do estabelecimento é obrigatório'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Verificar se categoria existe
   * @param {string} codigoCategoria Código da categoria
   * @returns {Promise<boolean>} Promise com boolean indicando se existe
   */
  async categoriaExists(codigoCategoria) {
    const sql = 'SELECT 1 FROM categorias WHERE codigo = ? LIMIT 1';
    const row = await this.get(sql, [codigoCategoria]);
    return !!row;
  }

  /**
   * Verificar se estabelecimento existe
   * @param {string} codigoEstabelecimento Código do estabelecimento
   * @returns {Promise<boolean>} Promise com boolean indicando se existe
   */
  async estabelecimentoExists(codigoEstabelecimento) {
    const sql = 'SELECT 1 FROM estabelecimentos WHERE codigo = ? LIMIT 1';
    const row = await this.get(sql, [codigoEstabelecimento]);
    return !!row;
  }

  /**
   * Criar lançamento com validação de integridade referencial
   * @param {Object} data Dados do lançamento
   * @returns {Promise<Object>} Promise com o lançamento criado
   */
  async create(data) {
    // Primeiro fazer validação básica
    const validation = this.validateCreate(data);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // Depois validar existência da categoria
    const categoriaExiste = await this.categoriaExists(data.codigoCategoria);
    if (!categoriaExiste) {
      throw new Error('Categoria não encontrada');
    }

    // Validar existência do estabelecimento
    const estabelecimentoExiste = await this.estabelecimentoExists(data.codigoEstabelecimento);
    if (!estabelecimentoExiste) {
      throw new Error('Estabelecimento não encontrado');
    }

    // Criar usando o método base, mas sem validação duplicada
    const rowData = this.mapCreateToRow(data);
    const columns = Object.keys(rowData);
    const placeholders = columns.map(() => '?').join(', ');
    const values = Object.values(rowData);

    const sql = `INSERT INTO ${this.tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
    const result = await this.run(sql, values);

    const created = await this.findById(result.id);
    
    if (!created) {
      throw new Error('Failed to retrieve created record');
    }

    return created;
  }

  /**
   * Atualizar lançamento com validação de integridade referencial
   * @param {number} id ID do lançamento
   * @param {Object} data Dados para atualização
   * @returns {Promise<Object|null>} Promise com o lançamento atualizado ou null
   */
  async update(id, data) {
    // Validar existência da categoria se fornecida
    if (data.codigoCategoria !== undefined) {
      const categoriaExiste = await this.categoriaExists(data.codigoCategoria);
      if (!categoriaExiste) {
        throw new Error('Categoria não encontrada');
      }
    }

    // Validar existência do estabelecimento se fornecido
    if (data.codigoEstabelecimento !== undefined) {
      const estabelecimentoExiste = await this.estabelecimentoExists(data.codigoEstabelecimento);
      if (!estabelecimentoExiste) {
        throw new Error('Estabelecimento não encontrado');
      }
    }

    return super.update(id, data);
  }

  /**
   * Buscar lançamentos com dados detalhados (joins com categoria e estabelecimento)
   * @returns {Promise<Array>} Promise com array de lançamentos detalhados
   */
  async findAllDetailed() {
    const sql = `
      SELECT 
        l.*,
        c.descricao as categoria_descricao,
        e.nome as estabelecimento_nome
      FROM lancamentos l
      LEFT JOIN categorias c ON l.codigo_categoria = c.codigo
      LEFT JOIN estabelecimentos e ON l.codigo_estabelecimento = e.codigo
      ORDER BY l.data_lancamento DESC, l.id DESC
    `;
    
    const rows = await this.all(sql);
    return rows.map(row => this.mapRowToDetailedModel(row));
  }

  /**
   * Buscar lançamento por ID com dados detalhados
   * @param {number} id ID do lançamento
   * @returns {Promise<Object|null>} Promise com lançamento detalhado ou null
   */
  async findByIdDetailed(id) {
    const sql = `
      SELECT 
        l.*,
        c.descricao as categoria_descricao,
        e.nome as estabelecimento_nome
      FROM lancamentos l
      LEFT JOIN categorias c ON l.codigo_categoria = c.codigo
      LEFT JOIN estabelecimentos e ON l.codigo_estabelecimento = e.codigo
      WHERE l.id = ?
    `;
    
    const row = await this.get(sql, [id]);
    return row ? this.mapRowToDetailedModel(row) : null;
  }

  /**
   * Buscar lançamentos por categoria
   * @param {string} codigoCategoria Código da categoria
   * @returns {Promise<Array>} Promise com array de lançamentos
   */
  async findByCategoria(codigoCategoria) {
    const sql = `
      SELECT 
        l.*,
        c.descricao as categoria_descricao,
        e.nome as estabelecimento_nome
      FROM lancamentos l
      LEFT JOIN categorias c ON l.codigo_categoria = c.codigo
      LEFT JOIN estabelecimentos e ON l.codigo_estabelecimento = e.codigo
      WHERE l.codigo_categoria = ?
      ORDER BY l.data_lancamento DESC
    `;
    
    const rows = await this.all(sql, [codigoCategoria]);
    return rows.map(row => this.mapRowToDetailedModel(row));
  }

  /**
   * Buscar lançamentos por estabelecimento
   * @param {string} codigoEstabelecimento Código do estabelecimento
   * @returns {Promise<Array>} Promise com array de lançamentos
   */
  async findByEstabelecimento(codigoEstabelecimento) {
    const sql = `
      SELECT 
        l.*,
        c.descricao as categoria_descricao,
        e.nome as estabelecimento_nome
      FROM lancamentos l
      LEFT JOIN categorias c ON l.codigo_categoria = c.codigo
      LEFT JOIN estabelecimentos e ON l.codigo_estabelecimento = e.codigo
      WHERE l.codigo_estabelecimento = ?
      ORDER BY l.data_lancamento DESC
    `;
    
    const rows = await this.all(sql, [codigoEstabelecimento]);
    return rows.map(row => this.mapRowToDetailedModel(row));
  }

  /**
   * Buscar lançamentos por período
   * @param {Date|string} dataInicio Data de início
   * @param {Date|string} dataFim Data de fim
   * @returns {Promise<Array>} Promise com array de lançamentos
   */
  async findByPeriodo(dataInicio, dataFim) {
    const sql = `
      SELECT 
        l.*,
        c.descricao as categoria_descricao,
        e.nome as estabelecimento_nome
      FROM lancamentos l
      LEFT JOIN categorias c ON l.codigo_categoria = c.codigo
      LEFT JOIN estabelecimentos e ON l.codigo_estabelecimento = e.codigo
      WHERE l.data_lancamento BETWEEN ? AND ?
      ORDER BY l.data_lancamento DESC
    `;
    
    const inicio = this.formatDate(dataInicio);
    const fim = this.formatDate(dataFim);
    
    const rows = await this.all(sql, [inicio, fim]);
    return rows.map(row => this.mapRowToDetailedModel(row));
  }

  /**
   * Calcular total de gastos por categoria
   * @param {string} codigoCategoria Código da categoria (opcional)
   * @returns {Promise<number>} Promise com total de gastos
   */
  async getTotalByCategoria(codigoCategoria = null) {
    let sql = 'SELECT SUM(valor) as total FROM lancamentos';
    const params = [];
    
    if (codigoCategoria) {
      sql += ' WHERE codigo_categoria = ?';
      params.push(codigoCategoria);
    }
    
    const row = await this.get(sql, params);
    return parseFloat(row?.total || 0);
  }

  /**
   * Calcular total de gastos por estabelecimento
   * @param {string} codigoEstabelecimento Código do estabelecimento (opcional)
   * @returns {Promise<number>} Promise com total de gastos
   */
  async getTotalByEstabelecimento(codigoEstabelecimento = null) {
    let sql = 'SELECT SUM(valor) as total FROM lancamentos';
    const params = [];
    
    if (codigoEstabelecimento) {
      sql += ' WHERE codigo_estabelecimento = ?';
      params.push(codigoEstabelecimento);
    }
    
    const row = await this.get(sql, params);
    return parseFloat(row?.total || 0);
  }
}

module.exports = { LancamentoRepository };