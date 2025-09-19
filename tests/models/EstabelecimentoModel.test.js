const { EstabelecimentoModel } = require('../../src/models/index');

describe('EstabelecimentoModel', () => {
  describe('validateCreate', () => {
    test('deve validar estabelecimento válido', () => {
      const input = {
        codigo: 'EST001',
        nome: 'Restaurante do João',
        endereco: 'Rua das Flores, 123',
        telefone: '(11) 99999-9999'
      };

      const result = EstabelecimentoModel.validateCreate(input);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('deve rejeitar estabelecimento sem código', () => {
      const input = {
        codigo: '',
        nome: 'Restaurante do João',
        endereco: 'Rua das Flores, 123',
        telefone: '(11) 99999-9999'
      };

      const result = EstabelecimentoModel.validateCreate(input);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'codigo',
        message: 'Código é obrigatório'
      });
    });

    test('deve rejeitar estabelecimento sem nome', () => {
      const input = {
        codigo: 'EST001',
        nome: '',
        endereco: 'Rua das Flores, 123',
        telefone: '(11) 99999-9999'
      };

      const result = EstabelecimentoModel.validateCreate(input);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'nome',
        message: 'Nome é obrigatório'
      });
    });

    test('deve rejeitar estabelecimento sem endereço', () => {
      const input = {
        codigo: 'EST001',
        nome: 'Restaurante do João',
        endereco: '',
        telefone: '(11) 99999-9999'
      };

      const result = EstabelecimentoModel.validateCreate(input);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'endereco',
        message: 'Endereço é obrigatório'
      });
    });

    test('deve rejeitar estabelecimento sem telefone', () => {
      const input = {
        codigo: 'EST001',
        nome: 'Restaurante do João',
        endereco: 'Rua das Flores, 123',
        telefone: ''
      };

      const result = EstabelecimentoModel.validateCreate(input);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'telefone',
        message: 'Telefone é obrigatório'
      });
    });

    test('deve rejeitar telefone muito longo', () => {
      const input = {
        codigo: 'EST001',
        nome: 'Restaurante do João',
        endereco: 'Rua das Flores, 123',
        telefone: '1'.repeat(21)
      };

      const result = EstabelecimentoModel.validateCreate(input);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'telefone',
        message: 'Telefone deve ter no máximo 20 caracteres'
      });
    });
  });

  describe('validateUpdate', () => {
    test('deve validar atualização válida', () => {
      const input = {
        nome: 'Novo nome',
        endereco: 'Novo endereço',
        telefone: '(11) 88888-8888'
      };

      const result = EstabelecimentoModel.validateUpdate(input);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('deve rejeitar nome vazio na atualização', () => {
      const input = {
        nome: ''
      };

      const result = EstabelecimentoModel.validateUpdate(input);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'nome',
        message: 'Nome não pode ser vazio'
      });
    });
  });

  describe('create', () => {
    test('deve criar estabelecimento válido', () => {
      const input = {
        codigo: 'EST001',
        nome: 'Restaurante do João',
        endereco: 'Rua das Flores, 123',
        telefone: '(11) 99999-9999'
      };

      const estabelecimento = EstabelecimentoModel.create(input);
      
      expect(estabelecimento.codigo).toBe('EST001');
      expect(estabelecimento.nome).toBe('Restaurante do João');
      expect(estabelecimento.endereco).toBe('Rua das Flores, 123');
      expect(estabelecimento.telefone).toBe('(11) 99999-9999');
      expect(estabelecimento.createdAt).toBeInstanceOf(Date);
      expect(estabelecimento.updatedAt).toBeInstanceOf(Date);
    });

    test('deve lançar erro para dados inválidos', () => {
      const input = {
        codigo: '',
        nome: 'Restaurante do João',
        endereco: 'Rua das Flores, 123',
        telefone: '(11) 99999-9999'
      };

      expect(() => {
        EstabelecimentoModel.create(input);
      }).toThrow('Dados inválidos');
    });
  });

  describe('update', () => {
    test('deve atualizar estabelecimento válido', () => {
      const estabelecimento = EstabelecimentoModel.create({
        codigo: 'EST001',
        nome: 'Restaurante do João',
        endereco: 'Rua das Flores, 123',
        telefone: '(11) 99999-9999'
      });

      estabelecimento.update({
        nome: 'Novo nome',
        telefone: '(11) 88888-8888'
      });

      expect(estabelecimento.nome).toBe('Novo nome');
      expect(estabelecimento.telefone).toBe('(11) 88888-8888');
      expect(estabelecimento.endereco).toBe('Rua das Flores, 123'); // Não alterado
    });

    test('deve lançar erro para atualização inválida', () => {
      const estabelecimento = EstabelecimentoModel.create({
        codigo: 'EST001',
        nome: 'Restaurante do João',
        endereco: 'Rua das Flores, 123',
        telefone: '(11) 99999-9999'
      });

      expect(() => {
        estabelecimento.update({
          nome: ''
        });
      }).toThrow('Dados inválidos');
    });
  });
});