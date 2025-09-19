import { 
  Estabelecimento, 
  EstabelecimentoCreate, 
  EstabelecimentoUpdate, 
  EstabelecimentoInput,
  ValidationResult,
  ValidationError 
} from './index';

export class EstabelecimentoModel {
  private data: Estabelecimento;

  constructor(data: Estabelecimento) {
    this.data = { ...data };
  }

  // Getters
  get codigo(): string {
    return this.data.codigo;
  }

  get nome(): string {
    return this.data.nome;
  }

  get endereco(): string {
    return this.data.endereco;
  }

  get telefone(): string {
    return this.data.telefone;
  }

  get createdAt(): Date {
    return this.data.createdAt;
  }

  get updatedAt(): Date {
    return this.data.updatedAt;
  }

  // Método para obter todos os dados
  getData(): Estabelecimento {
    return { ...this.data };
  }

  // Validação para criação de estabelecimento
  static validateCreate(input: EstabelecimentoInput): ValidationResult {
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

    // Validar nome
    if (!input.nome || input.nome.trim() === '') {
      errors.push({
        field: 'nome',
        message: 'Nome é obrigatório'
      });
    } else if (input.nome.length > 255) {
      errors.push({
        field: 'nome',
        message: 'Nome deve ter no máximo 255 caracteres'
      });
    }

    // Validar endereço
    if (!input.endereco || input.endereco.trim() === '') {
      errors.push({
        field: 'endereco',
        message: 'Endereço é obrigatório'
      });
    }

    // Validar telefone
    if (!input.telefone || input.telefone.trim() === '') {
      errors.push({
        field: 'telefone',
        message: 'Telefone é obrigatório'
      });
    } else if (input.telefone.length > 20) {
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

  // Validação para atualização de estabelecimento
  static validateUpdate(input: EstabelecimentoUpdate): ValidationResult {
    const errors: ValidationError[] = [];

    // Validar nome se fornecido
    if (input.nome !== undefined) {
      if (!input.nome || input.nome.trim() === '') {
        errors.push({
          field: 'nome',
          message: 'Nome não pode ser vazio'
        });
      } else if (input.nome.length > 255) {
        errors.push({
          field: 'nome',
          message: 'Nome deve ter no máximo 255 caracteres'
        });
      }
    }

    // Validar endereço se fornecido
    if (input.endereco !== undefined) {
      if (!input.endereco || input.endereco.trim() === '') {
        errors.push({
          field: 'endereco',
          message: 'Endereço não pode ser vazio'
        });
      }
    }

    // Validar telefone se fornecido
    if (input.telefone !== undefined) {
      if (!input.telefone || input.telefone.trim() === '') {
        errors.push({
          field: 'telefone',
          message: 'Telefone não pode ser vazio'
        });
      } else if (input.telefone.length > 20) {
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

  // Método para criar uma nova instância com dados validados
  static create(input: EstabelecimentoInput): EstabelecimentoModel {
    const validation = this.validateCreate(input);
    if (!validation.isValid) {
      throw new Error(`Dados inválidos: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    const now = new Date();
    const estabelecimento: Estabelecimento = {
      codigo: input.codigo.trim(),
      nome: input.nome.trim(),
      endereco: input.endereco.trim(),
      telefone: input.telefone.trim(),
      createdAt: now,
      updatedAt: now
    };

    return new EstabelecimentoModel(estabelecimento);
  }

  // Método para atualizar o estabelecimento
  update(input: EstabelecimentoUpdate): void {
    const validation = EstabelecimentoModel.validateUpdate(input);
    if (!validation.isValid) {
      throw new Error(`Dados inválidos: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    if (input.nome !== undefined) {
      this.data.nome = input.nome.trim();
    }

    if (input.endereco !== undefined) {
      this.data.endereco = input.endereco.trim();
    }

    if (input.telefone !== undefined) {
      this.data.telefone = input.telefone.trim();
    }

    this.data.updatedAt = new Date();
  }
}