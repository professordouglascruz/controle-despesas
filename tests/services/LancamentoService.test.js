const { LancamentoService } = require('../../src/services/LancamentoService');
const { LancamentoRepository } = require('../../src/repositories/LancamentoRepository');
const { CategoriaRepository } = require('../../src/repositories/CategoriaRepository');
const { EstabelecimentoRepository } = require('../../src/repositories/EstabelecimentoRepository');

// Mock dos repositórios
jest.mock('../../src/repositories/LancamentoRepository');
jest.mock('../../src/repositories/CategoriaRepository');
jest.mock('../../src/repositories/EstabelecimentoRepository');

describe('LancamentoService', () => {
  let lancamentoService;
  let mockLancamentoRepository;
  let mockCategoriaRepository;
  let mockEstabelecimentoRepository;
  let mockDb;

  beforeEach(() => {
    mockDb = {};
    
    mockLancamentoRepository = {
      validateCreate: jest.fn(),
      validateUpdate: jest.fn(),
      exists: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      findByIdDetailed: jest.fn(),
      findAll: jest.fn(),
      findAllDetailed: jest.fn(),
      findByCategoria: jest.fn(),
      findByEstabelecimento: jest.fn(),
      findByPeriodo: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      getTotalByCategoria: jest.fn(),
      getTotalByEstabelecimento: jest.fn()
    };

    mockCategoriaRepository = {
      exists: jest.fn()
    };

    mockEstabelecimentoRepository = {
      exists: jest.fn()
    };

    LancamentoRepository.mockImplementation(() => mockLancamentoRepository);
    CategoriaRepository.mockImplementation(() => mockCategoriaRepository);
    EstabelecimentoRepository.mockImplementation(() => mockEstabelecimentoRepository);
    
    lancamentoService = new LancamentoService(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const validData = {
      dataLancamento: '2024-01-15',
      dataPagamento: '2024-01-15',
      valor: 100.50,
      codigoCategoria: 'CAT001',
      codigoEstabelecimento: 'EST001'
    };

    it('deve criar lançamento com dados válidos', async () => {
      const expectedLancamento = { ...validData, id: 1 };
      
      mockLancamentoRepository.validateCreate.mockReturnValue({ isValid: true, errors: [] });
      mockCategoriaRepository.exists.mockResolvedValue(true);
      mockEstabelecimentoRepository.exists.mockResolvedValue(true);
      mockLancamentoRepository.create.mockResolvedValue(expectedLancamento);

      const result = await lancamentoService.create(validData);

      expect(mockLancamentoRepository.validateCreate).toHaveBeenCalledWith(validData);
      expect(mockCategoriaRepository.exists).toHaveBeenCalledWith(validData.codigoCategoria);
      expect(mockEstabelecimentoRepository.exists).toHaveBeenCalledWith(validData.codigoEstabelecimento);
      expect(mockLancamentoRepository.create).toHaveBeenCalledWith(validData);
      expect(result).toEqual(expectedLancamento);
    });

    it('deve lançar erro para dados inválidos', async () => {
      const invalidData = { valor: -10 };
      const validationErrors = [{ field: 'valor', message: 'Valor deve ser positivo' }];

      mockLancamentoRepository.validateCreate.mockReturnValue({ 
        isValid: false, 
        errors: validationErrors 
      });

      await expect(lancamentoService.create(invalidData)).rejects.toThrow('Dados inválidos para criação de lançamento');
      
      expect(mockLancamentoRepository.validateCreate).toHaveBeenCalledWith(invalidData);
      expect(mockCategoriaRepository.exists).not.toHaveBeenCalled();
    });

    it('deve lançar erro se categoria não existe', async () => {
      mockLancamentoRepository.validateCreate.mockReturnValue({ isValid: true, errors: [] });
      mockCategoriaRepository.exists.mockResolvedValue(false);

      await expect(lancamentoService.create(validData)).rejects.toThrow('Categoria não encontrada');
      
      expect(mockCategoriaRepository.exists).toHaveBeenCalledWith(validData.codigoCategoria);
      expect(mockEstabelecimentoRepository.exists).not.toHaveBeenCalled();
    });

    it('deve lançar erro se estabelecimento não existe', async () => {
      mockLancamentoRepository.validateCreate.mockReturnValue({ isValid: true, errors: [] });
      mockCategoriaRepository.exists.mockResolvedValue(true);
      mockEstabelecimentoRepository.exists.mockResolvedValue(false);

      await expect(lancamentoService.create(validData)).rejects.toThrow('Estabelecimento não encontrado');
      
      expect(mockCategoriaRepository.exists).toHaveBeenCalledWith(validData.codigoCategoria);
      expect(mockEstabelecimentoRepository.exists).toHaveBeenCalledWith(validData.codigoEstabelecimento);
    });

    it('deve lançar erro se data de pagamento for anterior à data de lançamento', async () => {
      const invalidDateData = {
        ...validData,
        dataLancamento: '2024-01-15',
        dataPagamento: '2024-01-10' // Anterior
      };

      mockLancamentoRepository.validateCreate.mockReturnValue({ isValid: true, errors: [] });

      await expect(lancamentoService.create(invalidDateData)).rejects.toThrow('Regras de negócio não atendidas');
    });

    it('deve lançar erro se valor for superior ao limite', async () => {
      const highValueData = {
        ...validData,
        valor: 1000001 // Superior ao limite
      };

      mockLancamentoRepository.validateCreate.mockReturnValue({ isValid: true, errors: [] });

      await expect(lancamentoService.create(highValueData)).rejects.toThrow('Regras de negócio não atendidas');
    });
  });

  describe('findById', () => {
    it('deve retornar lançamento existente', async () => {
      const id = 1;
      const expectedLancamento = { id, valor: 100.50 };
      
      mockLancamentoRepository.findById.mockResolvedValue(expectedLancamento);

      const result = await lancamentoService.findById(id);

      expect(mockLancamentoRepository.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedLancamento);
    });

    it('deve lançar erro para ID inválido', async () => {
      await expect(lancamentoService.findById('abc')).rejects.toThrow('ID do lançamento deve ser um número inteiro positivo');
      await expect(lancamentoService.findById(-1)).rejects.toThrow('ID do lançamento deve ser um número inteiro positivo');
      await expect(lancamentoService.findById(0)).rejects.toThrow('ID do lançamento deve ser um número inteiro positivo');
      
      expect(mockLancamentoRepository.findById).not.toHaveBeenCalled();
    });
  });

  describe('findByCategoria', () => {
    it('deve retornar lançamentos da categoria', async () => {
      const codigoCategoria = 'CAT001';
      const expectedLancamentos = [{ id: 1, codigoCategoria }];
      
      mockCategoriaRepository.exists.mockResolvedValue(true);
      mockLancamentoRepository.findByCategoria.mockResolvedValue(expectedLancamentos);

      const result = await lancamentoService.findByCategoria(codigoCategoria);

      expect(mockCategoriaRepository.exists).toHaveBeenCalledWith(codigoCategoria);
      expect(mockLancamentoRepository.findByCategoria).toHaveBeenCalledWith(codigoCategoria);
      expect(result).toEqual(expectedLancamentos);
    });

    it('deve lançar erro se categoria não existe', async () => {
      const codigoCategoria = 'CAT999';
      
      mockCategoriaRepository.exists.mockResolvedValue(false);

      await expect(lancamentoService.findByCategoria(codigoCategoria)).rejects.toThrow('Categoria não encontrada');
      
      expect(mockCategoriaRepository.exists).toHaveBeenCalledWith(codigoCategoria);
      expect(mockLancamentoRepository.findByCategoria).not.toHaveBeenCalled();
    });

    it('deve lançar erro para código vazio', async () => {
      await expect(lancamentoService.findByCategoria('')).rejects.toThrow('Código da categoria é obrigatório');
      
      expect(mockCategoriaRepository.exists).not.toHaveBeenCalled();
    });
  });

  describe('findByPeriodo', () => {
    it('deve retornar lançamentos do período', async () => {
      const dataInicio = '2024-01-01';
      const dataFim = '2024-01-31';
      const expectedLancamentos = [{ id: 1, dataLancamento: '2024-01-15' }];
      
      mockLancamentoRepository.findByPeriodo.mockResolvedValue(expectedLancamentos);

      const result = await lancamentoService.findByPeriodo(dataInicio, dataFim);

      expect(mockLancamentoRepository.findByPeriodo).toHaveBeenCalledWith(dataInicio, dataFim);
      expect(result).toEqual(expectedLancamentos);
    });

    it('deve lançar erro se data de fim for anterior à data de início', async () => {
      const dataInicio = '2024-01-31';
      const dataFim = '2024-01-01';

      await expect(lancamentoService.findByPeriodo(dataInicio, dataFim)).rejects.toThrow('Período inválido');
      
      expect(mockLancamentoRepository.findByPeriodo).not.toHaveBeenCalled();
    });

    it('deve lançar erro para datas inválidas', async () => {
      await expect(lancamentoService.findByPeriodo('data-inválida', '2024-01-31')).rejects.toThrow('Período inválido');
      await expect(lancamentoService.findByPeriodo('2024-01-01', 'data-inválida')).rejects.toThrow('Período inválido');
    });

    it('deve lançar erro para período muito longo', async () => {
      const dataInicio = '2020-01-01';
      const dataFim = '2026-01-01'; // Mais de 5 anos

      await expect(lancamentoService.findByPeriodo(dataInicio, dataFim)).rejects.toThrow('Período inválido');
    });
  });

  describe('update', () => {
    const id = 1;
    const updateData = { valor: 200.00 };

    it('deve atualizar lançamento existente', async () => {
      const expectedLancamento = { id, ...updateData };
      
      mockLancamentoRepository.validateUpdate.mockReturnValue({ isValid: true, errors: [] });
      mockLancamentoRepository.exists.mockResolvedValue(true);
      mockLancamentoRepository.update.mockResolvedValue(expectedLancamento);

      const result = await lancamentoService.update(id, updateData);

      expect(mockLancamentoRepository.validateUpdate).toHaveBeenCalledWith(updateData);
      expect(mockLancamentoRepository.exists).toHaveBeenCalledWith(id);
      expect(mockLancamentoRepository.update).toHaveBeenCalledWith(id, updateData);
      expect(result).toEqual(expectedLancamento);
    });

    it('deve lançar erro para ID inválido', async () => {
      await expect(lancamentoService.update('abc', updateData)).rejects.toThrow('ID do lançamento deve ser um número inteiro positivo');
      
      expect(mockLancamentoRepository.validateUpdate).not.toHaveBeenCalled();
    });

    it('deve lançar erro se lançamento não existe', async () => {
      mockLancamentoRepository.validateUpdate.mockReturnValue({ isValid: true, errors: [] });
      mockLancamentoRepository.exists.mockResolvedValue(false);

      await expect(lancamentoService.update(id, updateData)).rejects.toThrow('Lançamento não encontrado');
      
      expect(mockLancamentoRepository.exists).toHaveBeenCalledWith(id);
      expect(mockLancamentoRepository.update).not.toHaveBeenCalled();
    });

    it('deve validar categoria se fornecida na atualização', async () => {
      const updateWithCategory = { ...updateData, codigoCategoria: 'CAT002' };
      
      mockLancamentoRepository.validateUpdate.mockReturnValue({ isValid: true, errors: [] });
      mockLancamentoRepository.exists.mockResolvedValue(true);
      mockCategoriaRepository.exists.mockResolvedValue(false);

      await expect(lancamentoService.update(id, updateWithCategory)).rejects.toThrow('Categoria não encontrada');
      
      expect(mockCategoriaRepository.exists).toHaveBeenCalledWith('CAT002');
    });
  });

  describe('delete', () => {
    const id = 1;

    it('deve excluir lançamento existente', async () => {
      mockLancamentoRepository.exists.mockResolvedValue(true);
      mockLancamentoRepository.delete.mockResolvedValue(true);

      const result = await lancamentoService.delete(id);

      expect(mockLancamentoRepository.exists).toHaveBeenCalledWith(id);
      expect(mockLancamentoRepository.delete).toHaveBeenCalledWith(id);
      expect(result).toBe(true);
    });

    it('deve lançar erro para ID inválido', async () => {
      await expect(lancamentoService.delete('abc')).rejects.toThrow('ID do lançamento deve ser um número inteiro positivo');
      
      expect(mockLancamentoRepository.exists).not.toHaveBeenCalled();
    });

    it('deve lançar erro se lançamento não existe', async () => {
      mockLancamentoRepository.exists.mockResolvedValue(false);

      await expect(lancamentoService.delete(id)).rejects.toThrow('Lançamento não encontrado');
      
      expect(mockLancamentoRepository.exists).toHaveBeenCalledWith(id);
      expect(mockLancamentoRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('getStats', () => {
    it('deve retornar estatísticas dos lançamentos', async () => {
      mockLancamentoRepository.count.mockResolvedValue(10);
      mockLancamentoRepository.getTotalByCategoria.mockResolvedValue(1000.00);

      const result = await lancamentoService.getStats();

      expect(mockLancamentoRepository.count).toHaveBeenCalled();
      expect(mockLancamentoRepository.getTotalByCategoria).toHaveBeenCalled();
      expect(result).toEqual({
        totalLancamentos: 10,
        totalGastos: 1000.00,
        mediaGastos: 100.00
      });
    });

    it('deve retornar média zero quando não há lançamentos', async () => {
      mockLancamentoRepository.count.mockResolvedValue(0);
      mockLancamentoRepository.getTotalByCategoria.mockResolvedValue(0);

      const result = await lancamentoService.getStats();

      expect(result.mediaGastos).toBe(0);
    });
  });

  describe('validateDateRange', () => {
    it('deve validar período válido', () => {
      const result = lancamentoService.validateDateRange('2024-01-01', '2024-01-31');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('deve invalidar período com data de fim anterior', () => {
      const result = lancamentoService.validateDateRange('2024-01-31', '2024-01-01');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'dataFim',
        message: 'Data de fim deve ser posterior à data de início'
      });
    });

    it('deve invalidar datas ausentes', () => {
      const result = lancamentoService.validateDateRange(null, null);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'dataInicio',
        message: 'Data de início é obrigatória'
      });
      expect(result.errors).toContainEqual({
        field: 'dataFim',
        message: 'Data de fim é obrigatória'
      });
    });
  });

  describe('formatCurrency', () => {
    it('deve formatar valores monetários corretamente', () => {
      expect(lancamentoService.formatCurrency(100.50)).toMatch(/R\$\s*100,50/);
      expect(lancamentoService.formatCurrency(1000)).toMatch(/R\$\s*1\.000,00/);
      expect(lancamentoService.formatCurrency(0)).toMatch(/R\$\s*0,00/);
    });

    it('deve retornar valor padrão para entrada inválida', () => {
      expect(lancamentoService.formatCurrency('abc')).toMatch(/R\$\s*0,00/);
      expect(lancamentoService.formatCurrency(null)).toMatch(/R\$\s*0,00/);
    });
  });

  describe('formatDate', () => {
    it('deve formatar datas corretamente', () => {
      // Use regex to be more flexible with date formatting
      expect(lancamentoService.formatDate('2024-01-15')).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
      expect(lancamentoService.formatDate(new Date('2024-01-15T00:00:00.000Z'))).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });

    it('deve retornar string vazia para entrada inválida', () => {
      expect(lancamentoService.formatDate('data-inválida')).toBe('');
      expect(lancamentoService.formatDate(null)).toBe('');
      expect(lancamentoService.formatDate('')).toBe('');
    });
  });
});