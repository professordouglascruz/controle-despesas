const { BaseRepository } = require('./BaseRepository');

/**
 * Repositório para operações CRUD de Estabelecimento
 */
class EstabelecimentoRepository extends BaseRepository {
  
  constructor(db) {
    super(db, 'estabelecimentos', 'codigo');
  }

  /**
   * Converter dados do banco para o modelo Estabelecimento
   */
  mapRowToModel(row) {
    return {
      codigo: row.codigo,
      nome: row.nome,
      endereco: row.endereco,
      telefone: row.telefone,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  /**
   * Converter dados de criação para inserção no banco
   */
  mapCreateToRow(data) {
    return {
      codigo: data.codigo,
      nome: data.nome,
      endereco: data.endereco,
      telefone: data.telefone,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  /**
   * Converter dados de atualização para update no banco
   */
  mapUpdateToRow(data) {
    const row = {};
    
    if (data.nome !== undefined) {
      row.nome = data.nome;
    }
    
    if (data.endereco !== undefined) {
      row.endereco = data.endereco;
    }
    
    if (data.telefone !== undefined) {
      row.telefone = data.telefone;
    }
    
    return row;
  }

  /**
   * Validar dados antes da criação
   */
  validateCreate(data) {
    const errors = [];

    // Validar código
    if (!data.codigo || data.codigo.trim().length === 0) {
      errors.push({
        field: 'codigo',
        message: 'Código é obrigatório'
      });
    } else if (data.codigo.length > 50) {
      errors.push({
        field: 'codigo',
        message: 'Código deve ter no máximo 50 caracteres'
      });
    }

    // Validar nome
    if (!data.nome || data.nome.trim().length === 0) {
      errors.push({
        field: 'nome',
        message: 'Nome é obrigatório'
      });
    } else if (data.nome.length > 255) {
      errors.push({
        field: 'nome',
        message: 'Nome deve ter no máximo 255 caracteres'
      });
    }

    // Validar endereço
    if (!data.endereco || data.endereco.trim().length === 0) {
      errors.push({
        field: 'endereco',
        message: 'Endereço é obrigatório'
      });
    }

    // Validar telefone
    if (!data.telefone || data.telefone.trim().length === 0) {
      errors.push({
        field: 'telefone',
        message: 'Telefone é obrigatório'
      });
    } else if (data.telefone.length > 20) {
      errors.push({
        field: 'telefone',
        message: 'Telefone deve ter no máximo 20 caracteres'
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

    // Validar nome se fornecido
    if (data.nome !== undefined) {
      if (!data.nome || data.nome.trim().length === 0) {
        errors.push({
          field: 'nome',
          message: 'Nome é obrigatório'
        });
      } else if (data.nome.length > 255) {
        errors.push({
          field: 'nome',
          message: 'Nome deve ter no máximo 255 caracteres'
        });
      }
    }

    // Validar endereço se fornecido
    if (data.endereco !== undefined) {
      if (!data.endereco || data.endereco.trim().length === 0) {
        errors.push({
          field: 'endereco',
          message: 'Endereço é obrigatório'
        });
      }
    }

    // Validar telefone se fornecido
    if (data.telefone !== undefined) {
      if (!data.telefone || data.telefone.trim().length === 0) {
        errors.push({
          field: 'telefone',
          message: 'Telefone é obrigatório'
        });
      } else if (data.telefone.length > 20) {
        errors.push({
          field: 'telefone',
          message: 'Telefone deve ter no máximo 20 caracteres'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Verificar se o estabelecimento possui lançamentos associados
   * @param {string} codigo Código do estabelecimento
   * @returns {Promise<boolean>} Promise com boolean indicando se possui lançamentos
   */
  async hasAssociatedLancamentos(codigo) {
    const sql = 'SELECT 1 FROM lancamentos WHERE codigo_estabelecimento = ? LIMIT 1';
    const row = await this.get(sql, [codigo]);
    return !!row;
  }

  /**
   * Contar lançamentos associados ao estabelecimento
   * @param {string} codigo Código do estabelecimento
   * @returns {Promise<number>} Promise com número de lançamentos associados
   */
  async countAssociatedLancamentos(codigo) {
    const sql = 'SELECT COUNT(*) as total FROM lancamentos WHERE codigo_estabelecimento = ?';
    const row = await this.get(sql, [codigo]);
    return row?.total || 0;
  }

  /**
   * Excluir estabelecimento com verificação de integridade referencial
   * @param {string} codigo Código do estabelecimento
   * @returns {Promise<boolean>} Promise com boolean indicando sucesso
   * @throws {Error} se o estabelecimento possui lançamentos associados
   */
  async delete(codigo) {
    // Verificar se possui lançamentos associados
    const hasLancamentos = await this.hasAssociatedLancamentos(codigo);
    
    if (hasLancamentos) {
      throw new Error('Não é possível excluir estabelecimento que possui lançamentos associados');
    }

    return super.delete(codigo);
  }

  /**
   * Buscar estabelecimentos por nome (busca parcial)
   * @param {string} nome Nome para busca
   * @returns {Promise<Array>} Promise com array de estabelecimentos encontrados
   */
  async findByNome(nome) {
    const sql = 'SELECT * FROM estabelecimentos WHERE nome LIKE ? ORDER BY nome';
    const rows = await this.all(sql, [`%${nome}%`]);
    
    return rows.map(row => this.mapRowToModel(row));
  }

  /**
   * Buscar estabelecimentos por cidade (busca no endereço)
   * @param {string} cidade Cidade para busca
   * @returns {Promise<Array>} Promise com array de estabelecimentos encontrados
   */
  async findByCidade(cidade) {
    const sql = 'SELECT * FROM estabelecimentos WHERE endereco LIKE ? ORDER BY nome';
    const rows = await this.all(sql, [`%${cidade}%`]);
    
    return rows.map(row => this.mapRowToModel(row));
  }

  /**
   * Verificar se já existe um estabelecimento com o código informado
   * @param {string} codigo Código para verificação
   * @returns {Promise<boolean>} Promise com boolean indicando se existe
   */
  async existsByCodigo(codigo) {
    return this.exists(codigo);
  }
}

module.exports = { EstabelecimentoRepository };