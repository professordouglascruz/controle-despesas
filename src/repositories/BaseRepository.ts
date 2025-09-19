import { ValidationResult } from '../models/types';

/**
 * Interface base para repositórios com operações CRUD
 */
export interface IBaseRepository<T, TCreate, TUpdate, TKey = string | number> {
  /**
   * Criar um novo registro
   * @param data Dados para criação
   * @returns Promise com o registro criado
   */
  create(data: TCreate): Promise<T>;

  /**
   * Buscar um registro por chave primária
   * @param key Chave primária
   * @returns Promise com o registro encontrado ou null
   */
  findById(key: TKey): Promise<T | null>;

  /**
   * Buscar todos os registros
   * @returns Promise com array de registros
   */
  findAll(): Promise<T[]>;

  /**
   * Atualizar um registro
   * @param key Chave primária
   * @param data Dados para atualização
   * @returns Promise com o registro atualizado ou null
   */
  update(key: TKey, data: TUpdate): Promise<T | null>;

  /**
   * Excluir um registro
   * @param key Chave primária
   * @returns Promise com boolean indicando sucesso
   */
  delete(key: TKey): Promise<boolean>;

  /**
   * Verificar se um registro existe
   * @param key Chave primária
   * @returns Promise com boolean indicando existência
   */
  exists(key: TKey): Promise<boolean>;

  /**
   * Contar total de registros
   * @returns Promise com número total de registros
   */
  count(): Promise<number>;
}

/**
 * Classe base abstrata para repositórios
 */
export abstract class BaseRepository<T, TCreate, TUpdate, TKey = string | number> 
  implements IBaseRepository<T, TCreate, TUpdate, TKey> {
  
  protected db: any;
  protected tableName: string;
  protected primaryKey: string;

  constructor(db: any, tableName: string, primaryKey: string = 'id') {
    this.db = db;
    this.tableName = tableName;
    this.primaryKey = primaryKey;
  }

  /**
   * Executar query SQL
   * @param sql Query SQL
   * @param params Parâmetros da query
   * @returns Promise com resultado
   */
  protected async run(sql: string, params: any[] = []): Promise<{ id: any; changes: number }> {
    return this.db.run(sql, params);
  }

  /**
   * Buscar um registro
   * @param sql Query SQL
   * @param params Parâmetros da query
   * @returns Promise com registro ou null
   */
  protected async get(sql: string, params: any[] = []): Promise<any> {
    return this.db.get(sql, params);
  }

  /**
   * Buscar múltiplos registros
   * @param sql Query SQL
   * @param params Parâmetros da query
   * @returns Promise com array de registros
   */
  protected async all(sql: string, params: any[] = []): Promise<any[]> {
    return this.db.all(sql, params);
  }

  /**
   * Converter dados do banco para o modelo
   * @param row Dados do banco
   * @returns Modelo convertido
   */
  protected abstract mapRowToModel(row: any): T;

  /**
   * Converter dados de criação para inserção no banco
   * @param data Dados de criação
   * @returns Dados para inserção
   */
  protected abstract mapCreateToRow(data: TCreate): any;

  /**
   * Converter dados de atualização para update no banco
   * @param data Dados de atualização
   * @returns Dados para update
   */
  protected abstract mapUpdateToRow(data: TUpdate): any;

  /**
   * Validar dados antes da criação
   * @param data Dados para validação
   * @returns Resultado da validação
   */
  protected abstract validateCreate(data: TCreate): ValidationResult;

  /**
   * Validar dados antes da atualização
   * @param data Dados para validação
   * @returns Resultado da validação
   */
  protected abstract validateUpdate(data: TUpdate): ValidationResult;

  async create(data: TCreate): Promise<T> {
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
    const key = this.primaryKey === 'id' ? result.id : (data as any)[this.primaryKey];
    const created = await this.findById(key as TKey);
    
    if (!created) {
      throw new Error('Failed to retrieve created record');
    }

    return created;
  }

  async findById(key: TKey): Promise<T | null> {
    const sql = `SELECT * FROM ${this.tableName} WHERE ${this.primaryKey} = ?`;
    const row = await this.get(sql, [key]);
    
    return row ? this.mapRowToModel(row) : null;
  }

  async findAll(): Promise<T[]> {
    const sql = `SELECT * FROM ${this.tableName} ORDER BY ${this.primaryKey}`;
    const rows = await this.all(sql);
    
    return rows.map(row => this.mapRowToModel(row));
  }

  async update(key: TKey, data: TUpdate): Promise<T | null> {
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

  async delete(key: TKey): Promise<boolean> {
    const sql = `DELETE FROM ${this.tableName} WHERE ${this.primaryKey} = ?`;
    const result = await this.run(sql, [key]);
    
    return result.changes > 0;
  }

  async exists(key: TKey): Promise<boolean> {
    const sql = `SELECT 1 FROM ${this.tableName} WHERE ${this.primaryKey} = ? LIMIT 1`;
    const row = await this.get(sql, [key]);
    
    return !!row;
  }

  async count(): Promise<number> {
    const sql = `SELECT COUNT(*) as total FROM ${this.tableName}`;
    const row = await this.get(sql);
    
    return row?.total || 0;
  }
}