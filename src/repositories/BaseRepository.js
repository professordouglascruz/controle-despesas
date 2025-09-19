/**
 * Classe base abstrata para repositórios
 */
class BaseRepository {
  
  constructor(db, tableName, primaryKey = 'id') {
    this.db = db;
    this.tableName = tableName;
    this.primaryKey = primaryKey;
  }

  /**
   * Executar query SQL
   * @param {string} sql Query SQL
   * @param {Array} params Parâmetros da query
   * @returns {Promise<{id: any, changes: number}>} Promise com resultado
   */
  async run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  /**
   * Buscar um registro
   * @param {string} sql Query SQL
   * @param {Array} params Parâmetros da query
   * @returns {Promise<any>} Promise com registro ou null
   */
  async get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  /**
   * Buscar múltiplos registros
   * @param {string} sql Query SQL
   * @param {Array} params Parâmetros da query
   * @returns {Promise<Array>} Promise com array de registros
   */
  async all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * Converter dados do banco para o modelo
   * @param {any} row Dados do banco
   * @returns {any} Modelo convertido
   */
  mapRowToModel(row) {
    throw new Error('mapRowToModel must be implemented by subclass');
  }

  /**
   * Converter dados de criação para inserção no banco
   * @param {any} data Dados de criação
   * @returns {any} Dados para inserção
   */
  mapCreateToRow(data) {
    throw new Error('mapCreateToRow must be implemented by subclass');
  }

  /**
   * Converter dados de atualização para update no banco
   * @param {any} data Dados de atualização
   * @returns {any} Dados para update
   */
  mapUpdateToRow(data) {
    throw new Error('mapUpdateToRow must be implemented by subclass');
  }

  /**
   * Validar dados antes da criação
   * @param {any} data Dados para validação
   * @returns {{isValid: boolean, errors: Array}} Resultado da validação
   */
  validateCreate(data) {
    throw new Error('validateCreate must be implemented by subclass');
  }

  /**
   * Validar dados antes da atualização
   * @param {any} data Dados para validação
   * @returns {{isValid: boolean, errors: Array}} Resultado da validação
   */
  validateUpdate(data) {
    throw new Error('validateUpdate must be implemented by subclass');
  }

  async create(data) {
    const validation = this.validateCreate(data);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    const rowData = this.mapCreateToRow(data);
    const columns = Object.keys(rowData);
    const placeholders = columns.map(() => '?').join(', ');
    const values = Object.values(rowData);

    const sql = `INSERT INTO ${this.tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
    const result = await this.run(sql, values);

    // Para chaves primárias auto-incremento, usar o lastID
    const key = this.primaryKey === 'id' ? result.id : data[this.primaryKey];
    const created = await this.findById(key);
    
    if (!created) {
      throw new Error('Failed to retrieve created record');
    }

    return created;
  }

  async findById(key) {
    const sql = `SELECT * FROM ${this.tableName} WHERE ${this.primaryKey} = ?`;
    const row = await this.get(sql, [key]);
    
    return row ? this.mapRowToModel(row) : null;
  }

  async findAll() {
    const sql = `SELECT * FROM ${this.tableName} ORDER BY ${this.primaryKey}`;
    const rows = await this.all(sql);
    
    return rows.map(row => this.mapRowToModel(row));
  }

  async update(key, data) {
    const validation = this.validateUpdate(data);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    const existing = await this.findById(key);
    if (!existing) {
      return null;
    }

    const rowData = this.mapUpdateToRow(data);
    const columns = Object.keys(rowData);
    
    if (columns.length === 0) {
      return existing; // Nenhum campo para atualizar
    }

    const setClause = columns.map(col => `${col} = ?`).join(', ');
    const values = [...Object.values(rowData), key];

    const sql = `UPDATE ${this.tableName} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE ${this.primaryKey} = ?`;
    await this.run(sql, values);

    return this.findById(key);
  }

  async delete(key) {
    const sql = `DELETE FROM ${this.tableName} WHERE ${this.primaryKey} = ?`;
    const result = await this.run(sql, [key]);
    
    return result.changes > 0;
  }

  async exists(key) {
    const sql = `SELECT 1 FROM ${this.tableName} WHERE ${this.primaryKey} = ? LIMIT 1`;
    const row = await this.get(sql, [key]);
    
    return !!row;
  }

  async count() {
    const sql = `SELECT COUNT(*) as total FROM ${this.tableName}`;
    const row = await this.get(sql);
    
    return row?.total || 0;
  }
}

module.exports = { BaseRepository };