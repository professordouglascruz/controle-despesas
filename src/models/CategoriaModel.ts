import { 
  Categoria, 
  CategoriaCreate, 
  CategoriaUpdate, 
  CategoriaInput,
  ValidationResult,
  ValidationError 
} from './index';

export class CategoriaModel {
  private data: Categoria;

  constructor(data: Categoria) {
    this.data = { ...data };
  }

  // Getters
  get codigo(): string {
    return this.data.codigo;
  }

  get descricao(): string {
    return this.data.descricao;
  }

  get createdAt(): Date {
    return this.data.createdAt;
  }

  get updatedAt(): Date {
    return this.data.updatedAt;
  }

  // Método para obter todos os dados
  getData(): Categoria {
    return { ...this.data };
  }

  // Validação para criação de categoria
  static validateCreate(input: CategoriaInput): ValidationResult {
    const errors: ValidationError[] = [];

    // Validar código
    if (!input.codigo || input.codigo.trim() === '') {
      errors.push({
        field: 'codigo',
        message: 'Código é obrigatório'
      });
    } else if (input.codigo.length > 50) {
      errors.push({
        field: 'codigo',
        message: 'Código deve ter no máximo 50 caracteres'
      });
    }

    // Validar descrição
    if (!input.descricao || input.descricao.trim() === '') {
      errors.push({
        field: 'descricao',
        message: 'Descrição é obrigatória'
      });
    } else if (input.descricao.length > 255) {
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

  // Validação para atualização de categoria
  static validateUpdate(input: CategoriaUpdate): ValidationResult {
    const errors: ValidationError[] = [];

    // Validar descrição se fornecida
    if (input.descricao !== undefined) {
      if (!input.descricao || input.descricao.trim() === '') {
        errors.push({
          field: 'descricao',
          message: 'Descrição não pode ser vazia'
        });
      } else if (input.descricao.length > 255) {
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

  // Método para criar uma nova instância com dados validados
  static create(input: CategoriaInput): CategoriaModel {
    const validation = this.validateCreate(input);
    if (!validation.isValid) {
      throw new Error(`Dados inválidos: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    const now = new Date();
    const categoria: Categoria = {
      codigo: input.codigo.trim(),
      descricao: input.descricao.trim(),
      createdAt: now,
      updatedAt: now
    };

    return new CategoriaModel(categoria);
  }

  // Método para atualizar a categoria
  update(input: CategoriaUpdate): void {
    const validation = CategoriaModel.validateUpdate(input);
    if (!validation.isValid) {
      throw new Error(`Dados inválidos: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    if (input.descricao !== undefined) {
      this.data.descricao = input.descricao.trim();
    }

    this.data.updatedAt = new Date();
  }
}