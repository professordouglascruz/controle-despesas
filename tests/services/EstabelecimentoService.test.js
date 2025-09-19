const { EstabelecimentoService } = require('../../src/services/EstabelecimentoService');
const { EstabelecimentoRepository } = require('../../src/repositories/EstabelecimentoRepository');

// Mock do repositório
jest.mock('../../src/repositories/EstabelecimentoRepository');

describe('EstabelecimentoService', () => {
  let estabelecimentoService;
  let mockEstabelecimentoRepository;
  let mockDb;

  beforeEach(() => {
    mockDb = {};
    mockEstabelecimentoRepository = {
      validateCreate: jest.fn(),
      validateUpdate: jest.fn(),
      existsByCodigo: jest.fn(),
      exists: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByNome: jest.fn(),
      findByCidade: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      hasAssociatedLancamentos: jest.fn(),
      countAssociatedLancamentos: jest.fn(),
      count: jest.fn()
    };

    EstabelecimentoRepository.mockImplementation(() => mockEstabelecimentoRepository);
    estabelecimentoService = new EstabelecimentoService(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const validData = {
      codigo: 'EST001',
      nome: 'Supermercado ABC',
      endereco: 'Rua das Flores, 123 - Centro',
      telefone: '(11) 1234-5678'
    };

    it('deve criar estabelecimento com dados válidos', async () => {
      const expectedEstabelecimento = { ...validData, id: 1 };
      
      mockEstabelecimentoRepository.validateCreate.mockReturnValue({ isValid: true, errors: [] });
      mockEstabelecimentoRepository.existsByCodigo.mockResolvedValue(false);
      mockEstabelecimentoRepository.create.mockResolvedValue(expectedEstabelecimento);

      const result = await estabelecimentoService.create(validData);

      expect(mockEstabelecimentoRepository.validateCreate).toHaveBeenCalledWith(validData);
      expect(mockEstabelecimentoRepository.existsByCodigo).toHaveBeenCalledWith(validData.codigo);
      expect(mockEstabelecimentoRepository.create).toHaveBeenCalledWith(validData);
      expect(result).toEqual(expectedEstabelecimento);
    });

    it('deve lançar erro para dados inválidos', async () => {
      const invalidData = { codigo: '', nome: '', endereco: '', telefone: '' };
      const validationErrors = [
        { field: 'codigo', message: 'Código é obrigatório' },
        { field: 'nome', message: 'Nome é obrigatório' },
        { field: 'endereco', message: 'Endereço é obrigatório' },
        { field: 'telefone', message: 'Telefone é obrigatório' }
      ];

      mockEstabelecimentoRepository.validateCreate.mockReturnValue({ 
        isValid: false, 
        errors: validationErrors 
      });

      await expect(estabelecimentoService.create(invalidData)).rejects.toThrow('Dados inválidos para criação de estabelecimento');
      
      expect(mockEstabelecimentoRepository.validateCreate).toHaveBeenCalledWith(invalidData);
      expect(mockEstabelecimentoRepository.existsByCodigo).not.toHaveBeenCalled();
      expect(mockEstabelecimentoRepository.create).not.toHaveBeenCalled();
    });

    it('deve lançar erro se estabelecimento já existe', async () => {
      mockEstabelecimentoRepository.validateCreate.mockReturnValue({ isValid: true, errors: [] });
      mockEstabelecimentoRepository.existsByCodigo.mockResolvedValue(true);

      await expect(estabelecimentoService.create(validData)).rejects.toThrow('Estabelecimento com este código já existe');
      
      expect(mockEstabelecimentoRepository.validateCreate).toHaveBeenCalledWith(validData);
      expect(mockEstabelecimentoRepository.existsByCodigo).toHaveBeenCalledWith(validData.codigo);
      expect(mockEstabelecimentoRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findByCodigo', () => {
    it('deve retornar estabelecimento existente', async () => {
      const codigo = 'EST001';
      const expectedEstabelecimento = { codigo, nome: 'Supermercado ABC' };
      
      mockEstabelecimentoRepository.findById.mockResolvedValue(expectedEstabelecimento);

      const result = await estabelecimentoService.findByCodigo(codigo);

      expect(mockEstabelecimentoRepository.findById).toHaveBeenCalledWith(codigo);
      expect(result).toEqual(expectedEstabelecimento);
    });

    it('deve retornar null para estabelecimento inexistente', async () => {
      const codigo = 'EST999';
      
      mockEstabelecimentoRepository.findById.mockResolvedValue(null);

      const result = await estabelecimentoService.findByCodigo(codigo);

      expect(mockEstabelecimentoRepository.findById).toHaveBeenCalledWith(codigo);
      expect(result).toBeNull();
    });

    it('deve lançar erro para código vazio', async () => {
      await expect(estabelecimentoService.findByCodigo('')).rejects.toThrow('Código do estabelecimento é obrigatório');
      await expect(estabelecimentoService.findByCodigo(null)).rejects.toThrow('Código do estabelecimento é obrigatório');
      
      expect(mockEstabelecimentoRepository.findById).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('deve retornar todos os estabelecimentos', async () => {
      const expectedEstabelecimentos = [
        { codigo: 'EST001', nome: 'Supermercado ABC' },
        { codigo: 'EST002', nome: 'Farmácia XYZ' }
      ];
      
      mockEstabelecimentoRepository.findAll.mockResolvedValue(expectedEstabelecimentos);

      const result = await estabelecimentoService.findAll();

      expect(mockEstabelecimentoRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedEstabelecimentos);
    });
  });

  describe('findByNome', () => {
    it('deve buscar estabelecimentos por nome', async () => {
      const nome = 'Supermercado';
      const expectedEstabelecimentos = [
        { codigo: 'EST001', nome: 'Supermercado ABC' },
        { codigo: 'EST002', nome: 'Supermercado XYZ' }
      ];
      
      mockEstabelecimentoRepository.findByNome.mockResolvedValue(expectedEstabelecimentos);

      const result = await estabelecimentoService.findByNome(nome);

      expect(mockEstabelecimentoRepository.findByNome).toHaveBeenCalledWith(nome);
      expect(result).toEqual(expectedEstabelecimentos);
    });

    it('deve lançar erro para nome vazio', async () => {
      await expect(estabelecimentoService.findByNome('')).rejects.toThrow('Nome para busca é obrigatório');
      
      expect(mockEstabelecimentoRepository.findByNome).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const codigo = 'EST001';
    const updateData = { nome: 'Novo Nome', endereco: 'Novo Endereço' };

    it('deve atualizar estabelecimento existente', async () => {
      const expectedEstabelecimento = { codigo, ...updateData };
      
      mockEstabelecimentoRepository.validateUpdate.mockReturnValue({ isValid: true, errors: [] });
      mockEstabelecimentoRepository.exists.mockResolvedValue(true);
      mockEstabelecimentoRepository.update.mockResolvedValue(expectedEstabelecimento);

      const result = await estabelecimentoService.update(codigo, updateData);

      expect(mockEstabelecimentoRepository.validateUpdate).toHaveBeenCalledWith(updateData);
      expect(mockEstabelecimentoRepository.exists).toHaveBeenCalledWith(codigo);
      expect(mockEstabelecimentoRepository.update).toHaveBeenCalledWith(codigo, updateData);
      expect(result).toEqual(expectedEstabelecimento);
    });

    it('deve lançar erro para código vazio', async () => {
      await expect(estabelecimentoService.update('', updateData)).rejects.toThrow('Código do estabelecimento é obrigatório');
      
      expect(mockEstabelecimentoRepository.validateUpdate).not.toHaveBeenCalled();
    });

    it('deve lançar erro para dados inválidos', async () => {
      const invalidData = { nome: '' };
      const validationErrors = [{ field: 'nome', message: 'Nome é obrigatório' }];

      mockEstabelecimentoRepository.validateUpdate.mockReturnValue({ 
        isValid: false, 
        errors: validationErrors 
      });

      await expect(estabelecimentoService.update(codigo, invalidData)).rejects.toThrow('Dados inválidos para atualização de estabelecimento');
      
      expect(mockEstabelecimentoRepository.validateUpdate).toHaveBeenCalledWith(invalidData);
      expect(mockEstabelecimentoRepository.exists).not.toHaveBeenCalled();
    });

    it('deve lançar erro se estabelecimento não existe', async () => {
      mockEstabelecimentoRepository.validateUpdate.mockReturnValue({ isValid: true, errors: [] });
      mockEstabelecimentoRepository.exists.mockResolvedValue(false);

      await expect(estabelecimentoService.update(codigo, updateData)).rejects.toThrow('Estabelecimento não encontrado');
      
      expect(mockEstabelecimentoRepository.validateUpdate).toHaveBeenCalledWith(updateData);
      expect(mockEstabelecimentoRepository.exists).toHaveBeenCalledWith(codigo);
      expect(mockEstabelecimentoRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    const codigo = 'EST001';

    it('deve excluir estabelecimento sem lançamentos associados', async () => {
      mockEstabelecimentoRepository.exists.mockResolvedValue(true);
      mockEstabelecimentoRepository.hasAssociatedLancamentos.mockResolvedValue(false);
      mockEstabelecimentoRepository.delete.mockResolvedValue(true);

      const result = await estabelecimentoService.delete(codigo);

      expect(mockEstabelecimentoRepository.exists).toHaveBeenCalledWith(codigo);
      expect(mockEstabelecimentoRepository.hasAssociatedLancamentos).toHaveBeenCalledWith(codigo);
      expect(mockEstabelecimentoRepository.delete).toHaveBeenCalledWith(codigo);
      expect(result).toBe(true);
    });

    it('deve lançar erro para código vazio', async () => {
      await expect(estabelecimentoService.delete('')).rejects.toThrow('Código do estabelecimento é obrigatório');
      
      expect(mockEstabelecimentoRepository.exists).not.toHaveBeenCalled();
    });

    it('deve lançar erro se estabelecimento não existe', async () => {
      mockEstabelecimentoRepository.exists.mockResolvedValue(false);

      await expect(estabelecimentoService.delete(codigo)).rejects.toThrow('Estabelecimento não encontrado');
      
      expect(mockEstabelecimentoRepository.exists).toHaveBeenCalledWith(codigo);
      expect(mockEstabelecimentoRepository.hasAssociatedLancamentos).not.toHaveBeenCalled();
    });

    it('deve lançar erro se estabelecimento possui lançamentos associados', async () => {
      mockEstabelecimentoRepository.exists.mockResolvedValue(true);
      mockEstabelecimentoRepository.hasAssociatedLancamentos.mockResolvedValue(true);
      mockEstabelecimentoRepository.countAssociatedLancamentos.mockResolvedValue(2);

      await expect(estabelecimentoService.delete(codigo)).rejects.toThrow('Não é possível excluir estabelecimento que possui 2 lançamento(s) associado(s)');
      
      expect(mockEstabelecimentoRepository.exists).toHaveBeenCalledWith(codigo);
      expect(mockEstabelecimentoRepository.hasAssociatedLancamentos).toHaveBeenCalledWith(codigo);
      expect(mockEstabelecimentoRepository.countAssociatedLancamentos).toHaveBeenCalledWith(codigo);
      expect(mockEstabelecimentoRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('getStats', () => {
    const codigo = 'EST001';
    const estabelecimento = { codigo, nome: 'Supermercado ABC' };

    it('deve retornar estatísticas do estabelecimento', async () => {
      mockEstabelecimentoRepository.findById.mockResolvedValue(estabelecimento);
      mockEstabelecimentoRepository.countAssociatedLancamentos.mockResolvedValue(3);

      const result = await estabelecimentoService.getStats(codigo);

      expect(mockEstabelecimentoRepository.findById).toHaveBeenCalledWith(codigo);
      expect(mockEstabelecimentoRepository.countAssociatedLancamentos).toHaveBeenCalledWith(codigo);
      expect(result).toEqual({
        estabelecimento,
        lancamentosAssociados: 3,
        podeExcluir: false
      });
    });

    it('deve indicar que pode excluir quando não há lançamentos', async () => {
      mockEstabelecimentoRepository.findById.mockResolvedValue(estabelecimento);
      mockEstabelecimentoRepository.countAssociatedLancamentos.mockResolvedValue(0);

      const result = await estabelecimentoService.getStats(codigo);

      expect(result.podeExcluir).toBe(true);
    });

    it('deve lançar erro se estabelecimento não existe', async () => {
      mockEstabelecimentoRepository.findById.mockResolvedValue(null);

      await expect(estabelecimentoService.getStats(codigo)).rejects.toThrow('Estabelecimento não encontrado');
      
      expect(mockEstabelecimentoRepository.findById).toHaveBeenCalledWith(codigo);
      expect(mockEstabelecimentoRepository.countAssociatedLancamentos).not.toHaveBeenCalled();
    });
  });

  describe('validateTelefone', () => {
    it('deve validar telefones válidos', () => {
      expect(estabelecimentoService.validateTelefone('1123456789')).toBe(true); // 10 dígitos
      expect(estabelecimentoService.validateTelefone('11987654321')).toBe(true); // 11 dígitos
      expect(estabelecimentoService.validateTelefone('(11) 2345-6789')).toBe(true); // Com formatação
      expect(estabelecimentoService.validateTelefone('(11) 98765-4321')).toBe(true); // Celular com formatação
    });

    it('deve invalidar telefones inválidos', () => {
      expect(estabelecimentoService.validateTelefone('')).toBe(false); // Vazio
      expect(estabelecimentoService.validateTelefone('123456789')).toBe(false); // 9 dígitos
      expect(estabelecimentoService.validateTelefone('123456789012')).toBe(false); // 12 dígitos
      expect(estabelecimentoService.validateTelefone(null)).toBe(false); // Null
    });
  });

  describe('formatTelefone', () => {
    it('deve formatar telefone fixo corretamente', () => {
      expect(estabelecimentoService.formatTelefone('1123456789')).toBe('(11) 2345-6789');
      expect(estabelecimentoService.formatTelefone('(11) 2345-6789')).toBe('(11) 2345-6789');
    });

    it('deve formatar celular corretamente', () => {
      expect(estabelecimentoService.formatTelefone('11987654321')).toBe('(11) 98765-4321');
      expect(estabelecimentoService.formatTelefone('(11) 98765-4321')).toBe('(11) 98765-4321');
    });

    it('deve retornar original para formatos inválidos', () => {
      expect(estabelecimentoService.formatTelefone('123456789')).toBe('123456789'); // 9 dígitos
      expect(estabelecimentoService.formatTelefone('')).toBe(''); // Vazio
      expect(estabelecimentoService.formatTelefone(null)).toBe(''); // Null
    });
  });
});