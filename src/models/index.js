// Temporary CommonJS exports for testing
// This file exports the compiled versions of our TypeScript models

// Since we don't have TypeScript compilation set up, 
// let's create simple JavaScript versions for testing

// Validation types
class ValidationResult {
  constructor(isValid, errors = []) {
    this.isValid = isValid;
    this.errors = errors;
  }
}

class ValidationError {
  constructor(field, message) {
    this.field = field;
    this.message = message;
  }
}

// CategoriaModel
class CategoriaModel {
  constructor(data) {
    this.data = { ...data };
  }

  get codigo() {
    return this.data.codigo;
  }

  get descricao() {
    return this.data.descricao;
  }

  get createdAt() {
    return this.data.createdAt;
  }

  get updatedAt() {
    return this.data.updatedAt;
  }

  getData() {
    return { ...this.data };
  }

  static validateCreate(input) {
    const errors = [];

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

  static validateUpdate(input) {
    const errors = [];

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

  static create(input) {
    const validation = this.validateCreate(input);
    if (!validation.isValid) {
      throw new Error(`Dados inválidos: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    const now = new Date();
    const categoria = {
      codigo: input.codigo.trim(),
      descricao: input.descricao.trim(),
      createdAt: now,
      updatedAt: now
    };

    return new CategoriaModel(categoria);
  }

  update(input) {
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

// EstabelecimentoModel
class EstabelecimentoModel {
  constructor(data) {
    this.data = { ...data };
  }

  get codigo() {
    return this.data.codigo;
  }

  get nome() {
    return this.data.nome;
  }

  get endereco() {
    return this.data.endereco;
  }

  get telefone() {
    return this.data.telefone;
  }

  get createdAt() {
    return this.data.createdAt;
  }

  get updatedAt() {
    return this.data.updatedAt;
  }

  getData() {
    return { ...this.data };
  }

  static validateCreate(input) {
    const errors = [];

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

    if (!input.endereco || input.endereco.trim() === '') {
      errors.push({
        field: 'endereco',
        message: 'Endereço é obrigatório'
      });
    }

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

  static validateUpdate(input) {
    const errors = [];

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

    if (input.endereco !== undefined) {
      if (!input.endereco || input.endereco.trim() === '') {
        errors.push({
          field: 'endereco',
          message: 'Endereço não pode ser vazio'
        });
      }
    }

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

  static create(input) {
    const validation = this.validateCreate(input);
    if (!validation.isValid) {
      throw new Error(`Dados inválidos: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    const now = new Date();
    const estabelecimento = {
      codigo: input.codigo.trim(),
      nome: input.nome.trim(),
      endereco: input.endereco.trim(),
      telefone: input.telefone.trim(),
      createdAt: now,
      updatedAt: now
    };

    return new EstabelecimentoModel(estabelecimento);
  }

  update(input) {
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

// LancamentoDespesaModel
class LancamentoDespesaModel {
  constructor(data) {
    this.data = { ...data };
  }

  get id() {
    return this.data.id;
  }

  get dataLancamento() {
    return this.data.dataLancamento;
  }

  get dataPagamento() {
    return this.data.dataPagamento;
  }

  get valor() {
    return this.data.valor;
  }

  get codigoCategoria() {
    return this.data.codigoCategoria;
  }

  get codigoEstabelecimento() {
    return this.data.codigoEstabelecimento;
  }

  get createdAt() {
    return this.data.createdAt;
  }

  get updatedAt() {
    return this.data.updatedAt;
  }

  getData() {
    return { ...this.data };
  }

  static parseDate(dateField) {
    if (dateField instanceof Date) {
      return dateField;
    }
    const parsed = new Date(dateField);
    if (isNaN(parsed.getTime())) {
      throw new Error('Data inválida');
    }
    return parsed;
  }

  static validateCreate(input) {
    const errors = [];

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

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateUpdate(input) {
    const errors = [];

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

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static create(input, id) {
    const validation = this.validateCreate(input);
    if (!validation.isValid) {
      throw new Error(`Dados inválidos: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    const now = new Date();
    const lancamento = {
      id,
      dataLancamento: this.parseDate(input.dataLancamento),
      dataPagamento: this.parseDate(input.dataPagamento),
      valor: Number(input.valor.toFixed(2)), // Garantir 2 casas decimais
      codigoCategoria: input.codigoCategoria.trim(),
      codigoEstabelecimento: input.codigoEstabelecimento.trim(),
      createdAt: now,
      updatedAt: now
    };

    return new LancamentoDespesaModel(lancamento);
  }

  update(input) {
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

    this.data.updatedAt = new Date();
  }
}

module.exports = {
  ValidationResult,
  ValidationError,
  CategoriaModel,
  EstabelecimentoModel,
  LancamentoDespesaModel
};