const { LancamentoDespesaModel } = require('../../src/models/index');

describe('LancamentoDespesaModel', () => {
  describe('validateCreate', () => {
    test('deve validar lançamento válido', () => {
      const input = {
        dataLancamento: '2023-12-01',
        dataPagamento: '2023-12-05',
        valor: 150.50,
        codigoCategoria: 'CAT001',
        codigoEstabelecimento: 'EST001'
      };

      const result = LancamentoDespesaModel.validateCreate(input);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('deve rejeitar data de lançamento futura', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      
      const input = {
        dataLancamento: futureDate,
        dataPagamento: '2023-12-05',
        valor: 150.50,
        codigoCategoria: 'CAT001',
        codigoEstabelecimento: 'EST001'
      };

      const result = LancamentoDespesaModel.validateCreate(input);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'dataLancamento',
        message: 'Data de lançamento não pode ser futura'
      });
    });

    test('deve rejeitar data inválida', () => {
      const input = {
        dataLancamento: 'data-invalida',
        dataPagamento: '2023-12-05',
        valor: 150.50,
        codigoCategoria: 'CAT001',
        codigoEstabelecimento: 'EST001'
      };

      const result = LancamentoDespesaModel.validateCreate(input);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'dataLancamento',
        message: 'Data de lançamento inválida'
      });
    });

    test('deve rejeitar valor zero ou negativo', () => {
      const input = {
        dataLancamento: '2023-12-01',
        dataPagamento: '2023-12-05',
        valor: 0,
        codigoCategoria: 'CAT001',
        codigoEstabelecimento: 'EST001'
      };

      const result = LancamentoDespesaModel.validateCreate(input);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'valor',
        message: 'Valor deve ser maior que zero'
      });
    });

    test('deve rejeitar valor muito alto', () => {
      const input = {
        dataLancamento: '2023-12-01',
        dataPagamento: '2023-12-05',
        valor: 1000000,
        codigoCategoria: 'CAT001',
        codigoEstabelecimento: 'EST001'
      };

      const result = LancamentoDespesaModel.validateCreate(input);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'valor',
        message: 'Valor deve ser menor que 999.999,99'
      });
    });

    test('deve rejeitar código de categoria vazio', () => {
      const input = {
        dataLancamento: '2023-12-01',
        dataPagamento: '2023-12-05',
        valor: 150.50,
        codigoCategoria: '',
        codigoEstabelecimento: 'EST001'
      };

      const result = LancamentoDespesaModel.validateCreate(input);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'codigoCategoria',
        message: 'Código da categoria é obrigatório'
      });
    });

    test('deve rejeitar código de estabelecimento vazio', () => {
      const input = {
        dataLancamento: '2023-12-01',
        dataPagamento: '2023-12-05',
        valor: 150.50,
        codigoCategoria: 'CAT001',
        codigoEstabelecimento: ''
      };

      const result = LancamentoDespesaModel.validateCreate(input);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'codigoEstabelecimento',
        message: 'Código do estabelecimento é obrigatório'
      });
    });
  });

  describe('validateUpdate', () => {
    test('deve validar atualização válida', () => {
      const input = {
        valor: 200.00,
        codigoCategoria: 'CAT002'
      };

      const result = LancamentoDespesaModel.validateUpdate(input);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('deve rejeitar valor inválido na atualização', () => {
      const input = {
        valor: -50
      };

      const result = LancamentoDespesaModel.validateUpdate(input);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'valor',
        message: 'Valor deve ser maior que zero'
      });
    });
  });

  describe('create', () => {
    test('deve criar lançamento válido', () => {
      const input = {
        dataLancamento: '2023-12-01',
        dataPagamento: '2023-12-05',
        valor: 150.50,
        codigoCategoria: 'CAT001',
        codigoEstabelecimento: 'EST001'
      };

      const lancamento = LancamentoDespesaModel.create(input, 1);
      
      expect(lancamento.id).toBe(1);
      expect(lancamento.dataLancamento).toBeInstanceOf(Date);
      expect(lancamento.dataPagamento).toBeInstanceOf(Date);
      expect(lancamento.valor).toBe(150.50);
      expect(lancamento.codigoCategoria).toBe('CAT001');
      expect(lancamento.codigoEstabelecimento).toBe('EST001');
      expect(lancamento.createdAt).toBeInstanceOf(Date);
      expect(lancamento.updatedAt).toBeInstanceOf(Date);
    });

    test('deve lançar erro para dados inválidos', () => {
      const input = {
        dataLancamento: '2023-12-01',
        dataPagamento: '2023-12-05',
        valor: -150.50,
        codigoCategoria: 'CAT001',
        codigoEstabelecimento: 'EST001'
      };

      expect(() => {
        LancamentoDespesaModel.create(input, 1);
      }).toThrow('Dados inválidos');
    });

    test('deve formatar valor com 2 casas decimais', () => {
      const input = {
        dataLancamento: '2023-12-01',
        dataPagamento: '2023-12-05',
        valor: 150.555,
        codigoCategoria: 'CAT001',
        codigoEstabelecimento: 'EST001'
      };

      const lancamento = LancamentoDespesaModel.create(input, 1);
      
      expect(lancamento.valor).toBe(150.56);
    });
  });

  describe('update', () => {
    test('deve atualizar lançamento válido', () => {
      const lancamento = LancamentoDespesaModel.create({
        dataLancamento: '2023-12-01',
        dataPagamento: '2023-12-05',
        valor: 150.50,
        codigoCategoria: 'CAT001',
        codigoEstabelecimento: 'EST001'
      }, 1);

      lancamento.update({
        valor: 200.00,
        codigoCategoria: 'CAT002'
      });

      expect(lancamento.valor).toBe(200.00);
      expect(lancamento.codigoCategoria).toBe('CAT002');
      expect(lancamento.codigoEstabelecimento).toBe('EST001'); // Não alterado
    });

    test('deve lançar erro para atualização inválida', () => {
      const lancamento = LancamentoDespesaModel.create({
        dataLancamento: '2023-12-01',
        dataPagamento: '2023-12-05',
        valor: 150.50,
        codigoCategoria: 'CAT001',
        codigoEstabelecimento: 'EST001'
      }, 1);

      expect(() => {
        lancamento.update({
          valor: -100
        });
      }).toThrow('Dados inválidos');
    });
  });
});