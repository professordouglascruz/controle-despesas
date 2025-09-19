const { CategoriaService } = require('../../src/services/CategoriaService');
const { CategoriaRepository } = require('../../src/repositories/CategoriaRepository');

// Mock do repositório
jest.mock('../../src/repositories/CategoriaRepository');

describe('CategoriaService', () => {
  let categoriaService;
  let mockCategoriaRepository;
  let mockDb;

  beforeEach(() => {
    mockDb = {};
    mockCategoriaRepository = {
      validateCreate: jest.fn(),
      validateUpdate: jest.fn(),
      existsByCodigo: jest.fn(),
      exists: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByDescricao: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      hasAssociatedLancamentos: jest.fn(),
      countAssociatedLancamentos: jest.fn(),
      count: jest.fn()
    };

    CategoriaRepository.mockImplementation(() => mockCategoriaRepository);
    categoriaService = new CategoriaService(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const validData = {
      codigo: 'CAT001',
      descricao: 'Alimentação'
    };

    it('deve criar categoria com dados válidos', async () => {
      const expectedCategoria = { ...validData, id: 1 };
      
      mockCategoriaRepository.validateCreate.mockReturnValue({ isValid: true, errors: [] });
      mockCategoriaRepository.existsByCodigo.mockResolvedValue(false);
      mockCategoriaRepository.create.mockResolvedValue(expectedCategoria);

      const result = await categoriaService.create(validData);

      expect(mockCategoriaRepository.validateCreate).toHaveBeenCalledWith(validData);
      expect(mockCategoriaRepository.existsByCodigo).toHaveBeenCalledWith(validData.codigo);
      expect(mockCategoriaRepository.create).toHaveBeenCalledWith(validData);
      expect(result).toEqual(expectedCategoria);
    });

    it('deve lançar erro para dados inválidos', async () => {
      const invalidData = { codigo: '', descricao: '' };
      const validationErrors = [
        { field: 'codigo', message: 'Código é obrigatório' },
        { field: 'descricao', message: 'Descrição é obrigatória' }
      ];

      mockCategoriaRepository.validateCreate.mockReturnValue({ 
        isValid: false, 
        errors: validationErrors 
      });

      await expect(categoriaService.create(invalidData)).rejects.toThrow('Dados inválidos para criação de categoria');
      
      expect(mockCategoriaRepository.validateCreate).toHaveBeenCalledWith(invalidData);
      expect(mockCategoriaRepository.existsByCodigo).not.toHaveBeenCalled();
      expect(mockCategoriaRepository.create).not.toHaveBeenCalled();
    });

    it('deve lançar erro se categoria já existe', async () => {
      mockCategoriaRepository.validateCreate.mockReturnValue({ isValid: true, errors: [] });
      mockCategoriaRepository.existsByCodigo.mockResolvedValue(true);

      await expect(categoriaService.create(validData)).rejects.toThrow('Categoria com este código já existe');
      
      expect(mockCategoriaRepository.validateCreate).toHaveBeenCalledWith(validData);
      expect(mockCategoriaRepository.existsByCodigo).toHaveBeenCalledWith(validData.codigo);
      expect(mockCategoriaRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findByCodigo', () => {
    it('deve retornar categoria existente', async () => {
      const codigo = 'CAT001';
      const expectedCategoria = { codigo, descricao: 'Alimentação' };
      
      mockCategoriaRepository.findById.mockResolvedValue(expectedCategoria);

      const result = await categoriaService.findByCodigo(codigo);

      expect(mockCategoriaRepository.findById).toHaveBeenCalledWith(codigo);
      expect(result).toEqual(expectedCategoria);
    });

    it('deve retornar null para categoria inexistente', async () => {
      const codigo = 'CAT999';
      
      mockCategoriaRepository.findById.mockResolvedValue(null);

      const result = await categoriaService.findByCodigo(codigo);

      expect(mockCategoriaRepository.findById).toHaveBeenCalledWith(codigo);
      expect(result).toBeNull();
    });

    it('deve lançar erro para código vazio', async () => {
      await expect(categoriaService.findByCodigo('')).rejects.toThrow('Código da categoria é obrigatório');
      await expect(categoriaService.findByCodigo(null)).rejects.toThrow('Código da categoria é obrigatório');
      
      expect(mockCategoriaRepository.findById).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('deve retornar todas as categorias', async () => {
      const expectedCategorias = [
        { codigo: 'CAT001', descricao: 'Alimentação' },
        { codigo: 'CAT002', descricao: 'Transporte' }
      ];
      
      mockCategoriaRepository.findAll.mockResolvedValue(expectedCategorias);

      const result = await categoriaService.findAll();

      expect(mockCategoriaRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedCategorias);
    });
  });

  describe('update', () => {
    const codigo = 'CAT001';
    const updateData = { descricao: 'Nova Descrição' };

    it('deve atualizar categoria existente', async () => {
      const expectedCategoria = { codigo, ...updateData };
      
      mockCategoriaRepository.validateUpdate.mockReturnValue({ isValid: true, errors: [] });
      mockCategoriaRepository.exists.mockResolvedValue(true);
      mockCategoriaRepository.update.mockResolvedValue(expectedCategoria);

      const result = await categoriaService.update(codigo, updateData);

      expect(mockCategoriaRepository.validateUpdate).toHaveBeenCalledWith(updateData);
      expect(mockCategoriaRepository.exists).toHaveBeenCalledWith(codigo);
      expect(mockCategoriaRepository.update).toHaveBeenCalledWith(codigo, updateData);
      expect(result).toEqual(expectedCategoria);
    });

    it('deve lançar erro para código vazio', async () => {
      await expect(categoriaService.update('', updateData)).rejects.toThrow('Código da categoria é obrigatório');
      
      expect(mockCategoriaRepository.validateUpdate).not.toHaveBeenCalled();
    });

    it('deve lançar erro para dados inválidos', async () => {
      const invalidData = { descricao: '' };
      const validationErrors = [{ field: 'descricao', message: 'Descrição é obrigatória' }];

      mockCategoriaRepository.validateUpdate.mockReturnValue({ 
        isValid: false, 
        errors: validationErrors 
      });

      await expect(categoriaService.update(codigo, invalidData)).rejects.toThrow('Dados inválidos para atualização de categoria');
      
      expect(mockCategoriaRepository.validateUpdate).toHaveBeenCalledWith(invalidData);
      expect(mockCategoriaRepository.exists).not.toHaveBeenCalled();
    });

    it('deve lançar erro se categoria não existe', async () => {
      mockCategoriaRepository.validateUpdate.mockReturnValue({ isValid: true, errors: [] });
      mockCategoriaRepository.exists.mockResolvedValue(false);

      await expect(categoriaService.update(codigo, updateData)).rejects.toThrow('Categoria não encontrada');
      
      expect(mockCategoriaRepository.validateUpdate).toHaveBeenCalledWith(updateData);
      expect(mockCategoriaRepository.exists).toHaveBeenCalledWith(codigo);
      expect(mockCategoriaRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    const codigo = 'CAT001';

    it('deve excluir categoria sem lançamentos associados', async () => {
      mockCategoriaRepository.exists.mockResolvedValue(true);
      mockCategoriaRepository.hasAssociatedLancamentos.mockResolvedValue(false);
      mockCategoriaRepository.delete.mockResolvedValue(true);

      const result = await categoriaService.delete(codigo);

      expect(mockCategoriaRepository.exists).toHaveBeenCalledWith(codigo);
      expect(mockCategoriaRepository.hasAssociatedLancamentos).toHaveBeenCalledWith(codigo);
      expect(mockCategoriaRepository.delete).toHaveBeenCalledWith(codigo);
      expect(result).toBe(true);
    });

    it('deve lançar erro para código vazio', async () => {
      await expect(categoriaService.delete('')).rejects.toThrow('Código da categoria é obrigatório');
      
      expect(mockCategoriaRepository.exists).not.toHaveBeenCalled();
    });

    it('deve lançar erro se categoria não existe', async () => {
      mockCategoriaRepository.exists.mockResolvedValue(false);

      await expect(categoriaService.delete(codigo)).rejects.toThrow('Categoria não encontrada');
      
      expect(mockCategoriaRepository.exists).toHaveBeenCalledWith(codigo);
      expect(mockCategoriaRepository.hasAssociatedLancamentos).not.toHaveBeenCalled();
    });

    it('deve lançar erro se categoria possui lançamentos associados', async () => {
      mockCategoriaRepository.exists.mockResolvedValue(true);
      mockCategoriaRepository.hasAssociatedLancamentos.mockResolvedValue(true);
      mockCategoriaRepository.countAssociatedLancamentos.mockResolvedValue(3);

      await expect(categoriaService.delete(codigo)).rejects.toThrow('Não é possível excluir categoria que possui 3 lançamento(s) associado(s)');
      
      expect(mockCategoriaRepository.exists).toHaveBeenCalledWith(codigo);
      expect(mockCategoriaRepository.hasAssociatedLancamentos).toHaveBeenCalledWith(codigo);
      expect(mockCategoriaRepository.countAssociatedLancamentos).toHaveBeenCalledWith(codigo);
      expect(mockCategoriaRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('getStats', () => {
    const codigo = 'CAT001';
    const categoria = { codigo, descricao: 'Alimentação' };

    it('deve retornar estatísticas da categoria', async () => {
      mockCategoriaRepository.findById.mockResolvedValue(categoria);
      mockCategoriaRepository.countAssociatedLancamentos.mockResolvedValue(5);

      const result = await categoriaService.getStats(codigo);

      expect(mockCategoriaRepository.findById).toHaveBeenCalledWith(codigo);
      expect(mockCategoriaRepository.countAssociatedLancamentos).toHaveBeenCalledWith(codigo);
      expect(result).toEqual({
        categoria,
        lancamentosAssociados: 5,
        podeExcluir: false
      });
    });

    it('deve indicar que pode excluir quando não há lançamentos', async () => {
      mockCategoriaRepository.findById.mockResolvedValue(categoria);
      mockCategoriaRepository.countAssociatedLancamentos.mockResolvedValue(0);

      const result = await categoriaService.getStats(codigo);

      expect(result.podeExcluir).toBe(true);
    });

    it('deve lançar erro se categoria não existe', async () => {
      mockCategoriaRepository.findById.mockResolvedValue(null);

      await expect(categoriaService.getStats(codigo)).rejects.toThrow('Categoria não encontrada');
      
      expect(mockCategoriaRepository.findById).toHaveBeenCalledWith(codigo);
      expect(mockCategoriaRepository.countAssociatedLancamentos).not.toHaveBeenCalled();
    });
  });
});