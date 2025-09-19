import { BaseRepository } from './BaseRepository';
import { Categoria, CategoriaCreate, CategoriaUpdate } from '../models/Categoria';
import { ValidationResult, ValidationError } from '../models/types';

/**
 * Repositório para operações CRUD de Categoria
 */
export class CategoriaRepository extends BaseRepository<Categoria, CategoriaCreate, CategoriaUpdate, string> {
  
  constructor(db: any) {
    super(db, 'categorias', 'codigo');
  }

  /**
   * Converter dados do banco para o modelo Categoria
   */
  protected mapRowToModel(row: any): Categoria {
    return {
      codigo: row.codigo,
      descricao: row.descricao,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  /**
   * Converter dados de criação para inserção no banco
   */
  protected mapCreateToRow(data: CategoriaCreate): any {
    return {
      codigo: data.codigo,
      descricao: data.descricao,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  /**
   * Converter dados de atualização para update no banco
   */
  protected mapUpdateToRow(data: CategoriaUpdate): any {
    const row: any = {};
    
    if (data.descricao !== undefined) {
      row.descricao = data.descricao;
    }
    
    return row;
  }

  /**
   * Validar dados antes da criação
   */
  protected validateCreate(data: CategoriaCreate): ValidationResult {
    const errors: ValidationError[] = [];

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

    // Validar descrição
    if (!data.descricao || data.descricao.trim().length === 0) {
      errors.push({
        field: 'descricao',
        message: 'Descrição é obrigatória'
      });
    } else if (data.descricao.length > 255) {
      errors.push({
        field: 'descricao',
        message: 'Descrição deve ter no máximo 255 caracteres'
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
  protected validateUpdate(data: CategoriaUpdate): ValidationResult {
    const errors: ValidationError[] = [];

    // Validar descrição se fornecida
    if (data.descricao !== undefined) {
      if (!data.descricao || data.descricao.trim().length === 0) {
        errors.push({
          field: 'descricao',
          message: 'Descrição é obrigatória'
        });
      } else if (data.descricao.length > 255) {
        errors.push({
          field: 'descricao',
          message: 'Descrição deve ter no máximo 255 caracteres'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Verificar se a categoria possui lançamentos associados
   * @param codigo Código da categoria
   * @returns Promise com boolean indicando se possui lançamentos
   */
  async hasAssociatedLancamentos(codigo: string): Promise<boolean> {
    const sql = 'SELECT 1 FROM lancamentos WHERE codigo_categoria = ? LIMIT 1';
    const row = await this.get(sql, [codigo]);
    return !!row;
  }

  /**
   * Contar lançamentos associados à categoria
   * @param codigo Código da categoria
   * @returns Promise com número de lançamentos associados
   */
  async countAssociatedLancamentos(codigo: string): Promise<number> {
    const sql = 'SELECT COUNT(*) as total FROM lancamentos WHERE codigo_categoria = ?';
    const row = await this.get(sql, [codigo]);
    return row?.total || 0;
  }

  /**
   * Excluir categoria com verificação de integridade referencial
   * @param codigo Código da categoria
   * @returns Promise com boolean indicando sucesso
   * @throws Error se a categoria possui lançamentos associados
   */
  async delete(codigo: string): Promise<boolean> {
    // Verificar se possui lançamentos associados
    const hasLancamentos = await this.hasAssociatedLancamentos(codigo);
    
    if (hasLancamentos) {
      throw new Error('Não é possível excluir categoria que possui lançamentos associados');
    }

    return super.delete(codigo);
  }

  /**
   * Buscar categorias por descrição (busca parcial)
   * @param descricao Descrição para busca
   * @returns Promise com array de categorias encontradas
   */
  async findByDescricao(descricao: string): Promise<Categoria[]> {
    const sql = 'SELECT * FROM categorias WHERE descricao LIKE ? ORDER BY descricao';
    const rows = await this.all(sql, [`%${descricao}%`]);
    
    return rows.map(row => this.mapRowToModel(row));
  }

  /**
   * Verificar se já existe uma categoria com o código informado
   * @param codigo Código para verificação
   * @returns Promise com boolean indicando se existe
   */
  async existsByCodigo(codigo: string): Promise<boolean> {
    return this.exists(codigo);
  }
}