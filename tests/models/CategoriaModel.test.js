const { CategoriaModel } = require('../../src/models/index');

describe('CategoriaModel', () => {
  describe('validateCreate', () => {
    test('deve validar categoria válida', () => {
      const input = {
        codigo: 'CAT001',
        descricao: 'Alimentação'
      };

      const result = CategoriaModel.validateCreate(input);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('deve rejeitar categoria sem código', () => {
      const input = {
        codigo: '',
        descricao: 'Alimentação'
      };

      const result = CategoriaModel.validateCreate(input);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'codigo',
        message: 'Código é obrigatório'
      });
    });

    test('deve rejeitar categoria sem descrição', () => {
      const input = {
        codigo: 'CAT001',
        descricao: ''
      };

      const result = CategoriaModel.validateCreate(input);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'descricao',
        message: 'Descrição é obrigatória'
      });
    });

    test('deve rejeitar código muito longo', () => {
      const input = {
        codigo: 'A'.repeat(51),
        descricao: 'Alimentação'
      };

      const result = CategoriaModel.validateCreate(input);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'codigo',
        message: 'Código deve ter no máximo 50 caracteres'
      });
    });

    test('deve rejeitar descrição muito longa', () => {
      const input = {
        codigo: 'CAT001',
        descricao: 'A'.repeat(256)
      };

      const result = CategoriaModel.validateCreate(input);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'descricao',
        message: 'Descrição deve ter no máximo 255 caracteres'
      });
    });
  });

  describe('validateUpdate', () => {
    test('deve validar atualização válida', () => {
      const input = {
        descricao: 'Nova descrição'
      };

      const result = CategoriaModel.validateUpdate(input);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('deve rejeitar descrição vazia na atualização', () => {
      const input = {
        descricao: ''
      };

      const result = CategoriaModel.validateUpdate(input);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'descricao',
        message: 'Descrição não pode ser vazia'
      });
    });
  });

  describe('create', () => {
    test('deve criar categoria válida', () => {
      const input = {
        codigo: 'CAT001',
        descricao: 'Alimentação'
      };

      const categoria = CategoriaModel.create(input);
      
      expect(categoria.codigo).toBe('CAT001');
      expect(categoria.descricao).toBe('Alimentação');
      expect(categoria.createdAt).toBeInstanceOf(Date);
      expect(categoria.updatedAt).toBeInstanceOf(Date);
    });

    test('deve lançar erro para dados inválidos', () => {
      const input = {
        codigo: '',
        descricao: 'Alimentação'
      };

      expect(() => {
        CategoriaModel.create(input);
      }).toThrow('Dados inválidos');
    });
  });

  describe('update', () => {
    test('deve atualizar categoria válida', () => {
      const categoria = CategoriaModel.create({
        codigo: 'CAT001',
        descricao: 'Alimentação'
      });

      const originalUpdatedAt = categoria.updatedAt;
      
      // Aguardar um pouco para garantir diferença no timestamp
      setTimeout(() => {
        categoria.update({
          descricao: 'Nova descrição'
        });

        expect(categoria.descricao).toBe('Nova descrição');
        expect(categoria.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
      }, 10);
    });

    test('deve lançar erro para atualização inválida', () => {
      const categoria = CategoriaModel.create({
        codigo: 'CAT001',
        descricao: 'Alimentação'
      });

      expect(() => {
        categoria.update({
          descricao: ''
        });
      }).toThrow('Dados inválidos');
    });
  });
});