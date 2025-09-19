import { 
  LancamentoDespesa, 
  LancamentoDespesaCreate, 
  LancamentoDespesaUpdate, 
  LancamentoDespesaInput,
  ValidationResult,
  ValidationError,
  DateField 
} from './index';

export class LancamentoDespesaModel {
  private data: LancamentoDespesa;

  constructor(data: LancamentoDespesa) {
    this.data = { ...data };
  }

  // Getters
  get id(): number {
    return this.data.id;
  }

  get dataLancamento(): Date {
    return this.data.dataLancamento;
  }

  get dataPagamento(): Date {
    return this.data.dataPagamento;
  }

  get valor(): number {
    return this.data.valor;
  }

  get descricao(): string | undefined {
    return this.data.descricao;
  }

  get codigoCategoria(): string {
    return this.data.codigoCategoria;
  }

  get codigoEstabelecimento(): string {
    return this.data.codigoEstabelecimento;
  }

  get createdAt(): Date {
    return this.data.createdAt;
  }

  get updatedAt(): Date {
    return this.data.updatedAt;
  }

  // Método para obter todos os dados
  getData(): LancamentoDespesa {
    return { ...this.data };
  }

  // Método auxiliar para converter DateField para Date
  private static parseDate(dateField: DateField): Date {
    if (dateField instanceof Date) {
      return dateField;
    }
    const parsed = new Date(dateField);
    if (isNaN(parsed.getTime())) {
      throw new Error('Data inválida');
    }
    return parsed;
  }

  // Validação para criação de lançamento
  static validateCreate(input: LancamentoDespesaInput): ValidationResult {
    const errors: ValidationError[] = [];

    // Validar data de lançamento
    try {
      const dataLancamento = this.parseDate(input.dataLancamento);
      if (dataLancamento > new Date()) {
        errors.push({
          field: 'dataLancamento',
          message: 'Data de lançamento não pode ser futura'
        });
      }
    } catch {
      errors.push({
        field: 'dataLancamento',
        message: 'Data de lançamento inválida'
      });
    }

    // Validar data de pagamento
    try {
      this.parseDate(input.dataPagamento);
    } catch {
      errors.push({
        field: 'dataPagamento',
        message: 'Data de pagamento inválida'
      });
    }

    // Validar valor
    if (input.valor === undefined || input.valor === null) {
      errors.push({
        field: 'valor',
        message: 'Valor é obrigatório'
      });
    } else if (typeof input.valor !== 'number' || isNaN(input.valor)) {
      errors.push({
        field: 'valor',
        message: 'Valor deve ser um número válido'
      });
    } else if (input.valor <= 0) {
      errors.push({
        field: 'valor',
        message: 'Valor deve ser maior que zero'
      });
    } else if (input.valor > 999999.99) {
      errors.push({
        field: 'valor',
        message: 'Valor deve ser menor que 999.999,99'
      });
    }

    // Validar código da categoria
    if (!input.codigoCategoria || input.codigoCategoria.trim() === '') {
      errors.push({
        field: 'codigoCategoria',
        message: 'Código da categoria é obrigatório'
      });
    } else if (input.codigoCategoria.length > 50) {
      errors.push({
        field: 'codigoCategoria',
        message: 'Código da categoria deve ter no máximo 50 caracteres'
      });
    }

    // Validar código do estabelecimento
    if (!input.codigoEstabelecimento || input.codigoEstabelecimento.trim() === '') {
      errors.push({
        field: 'codigoEstabelecimento',
        message: 'Código do estabelecimento é obrigatório'
      });
    } else if (input.codigoEstabelecimento.length > 50) {
      errors.push({
        field: 'codigoEstabelecimento',
        message: 'Código do estabelecimento deve ter no máximo 50 caracteres'
      });
    }

    // Validar descrição se fornecida
    if (input.descricao !== undefined && input.descricao !== null && input.descricao.length > 500) {
      errors.push({
        field: 'descricao',
        message: 'Descrição deve ter no máximo 500 caracteres'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validação para atualização de lançamento
  static validateUpdate(input: LancamentoDespesaUpdate): ValidationResult {
    const errors: ValidationError[] = [];

    // Validar data de lançamento se fornecida
    if (input.dataLancamento !== undefined) {
      try {
        const dataLancamento = this.parseDate(input.dataLancamento);
        if (dataLancamento > new Date()) {
          errors.push({
            field: 'dataLancamento',
            message: 'Data de lançamento não pode ser futura'
          });
        }
      } catch {
        errors.push({
          field: 'dataLancamento',
          message: 'Data de lançamento inválida'
        });
      }
    }

    // Validar data de pagamento se fornecida
    if (input.dataPagamento !== undefined) {
      try {
        this.parseDate(input.dataPagamento);
      } catch {
        errors.push({
          field: 'dataPagamento',
          message: 'Data de pagamento inválida'
        });
      }
    }

    // Validar valor se fornecido
    if (input.valor !== undefined) {
      if (typeof input.valor !== 'number' || isNaN(input.valor)) {
        errors.push({
          field: 'valor',
          message: 'Valor deve ser um número válido'
        });
      } else if (input.valor <= 0) {
        errors.push({
          field: 'valor',
          message: 'Valor deve ser maior que zero'
        });
      } else if (input.valor > 999999.99) {
        errors.push({
          field: 'valor',
          message: 'Valor deve ser menor que 999.999,99'
        });
      }
    }

    // Validar código da categoria se fornecido
    if (input.codigoCategoria !== undefined) {
      if (!input.codigoCategoria || input.codigoCategoria.trim() === '') {
        errors.push({
          field: 'codigoCategoria',
          message: 'Código da categoria não pode ser vazio'
        });
      } else if (input.codigoCategoria.length > 50) {
        errors.push({
          field: 'codigoCategoria',
          message: 'Código da categoria deve ter no máximo 50 caracteres'
        });
      }
    }

    // Validar código do estabelecimento se fornecido
    if (input.codigoEstabelecimento !== undefined) {
      if (!input.codigoEstabelecimento || input.codigoEstabelecimento.trim() === '') {
        errors.push({
          field: 'codigoEstabelecimento',
          message: 'Código do estabelecimento não pode ser vazio'
        });
      } else if (input.codigoEstabelecimento.length > 50) {
        errors.push({
          field: 'codigoEstabelecimento',
          message: 'Código do estabelecimento deve ter no máximo 50 caracteres'
        });
      }
    }

    // Validar descrição se fornecida
    if (input.descricao !== undefined && input.descricao !== null && input.descricao.length > 500) {
      errors.push({
        field: 'descricao',
        message: 'Descrição deve ter no máximo 500 caracteres'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Método para criar uma nova instância com dados validados
  static create(input: LancamentoDespesaInput, id: number): LancamentoDespesaModel {
    const validation = this.validateCreate(input);
    if (!validation.isValid) {
      throw new Error(`Dados inválidos: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    const now = new Date();
    const lancamento: LancamentoDespesa = {
      id,
      dataLancamento: this.parseDate(input.dataLancamento),
      dataPagamento: this.parseDate(input.dataPagamento),
      valor: Number(input.valor.toFixed(2)), // Garantir 2 casas decimais
      descricao: input.descricao?.trim() || undefined,
      codigoCategoria: input.codigoCategoria.trim(),
      codigoEstabelecimento: input.codigoEstabelecimento.trim(),
      createdAt: now,
      updatedAt: now
    };

    return new LancamentoDespesaModel(lancamento);
  }

  // Método para atualizar o lançamento
  update(input: LancamentoDespesaUpdate): void {
    const validation = LancamentoDespesaModel.validateUpdate(input);
    if (!validation.isValid) {
      throw new Error(`Dados inválidos: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    if (input.dataLancamento !== undefined) {
      this.data.dataLancamento = LancamentoDespesaModel.parseDate(input.dataLancamento);
    }

    if (input.dataPagamento !== undefined) {
      this.data.dataPagamento = LancamentoDespesaModel.parseDate(input.dataPagamento);
    }

    if (input.valor !== undefined) {
      this.data.valor = Number(input.valor.toFixed(2));
    }

    if (input.codigoCategoria !== undefined) {
      this.data.codigoCategoria = input.codigoCategoria.trim();
    }

    if (input.codigoEstabelecimento !== undefined) {
      this.data.codigoEstabelecimento = input.codigoEstabelecimento.trim();
    }

    if (input.descricao !== undefined) {
      this.data.descricao = input.descricao?.trim() || undefined;
    }

    this.data.updatedAt = new Date();
  }
}