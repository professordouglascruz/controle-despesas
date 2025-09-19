const databaseConfig = require('./config');

/**
 * Script para inicializar o banco de dados com dados de exemplo
 */
class SeedData {
  constructor() {
    this.db = null;
  }

  /**
   * Conectar ao banco de dados
   */
  async connect() {
    await databaseConfig.initialize();
    this.db = databaseConfig.getDatabase();
  }

  /**
   * Verificar se já existem dados no banco
   */
  async hasData() {
    try {
      const categorias = await databaseConfig.all('SELECT COUNT(*) as count FROM categorias');
      const estabelecimentos = await databaseConfig.all('SELECT COUNT(*) as count FROM estabelecimentos');
      
      return categorias[0].count > 0 || estabelecimentos[0].count > 0;
    } catch (error) {
      // Se as tabelas não existem, não há dados
      return false;
    }
  }

  /**
   * Inserir categorias de exemplo
   */
  async insertSampleCategories() {
    const categorias = [
      { codigo: 'ALIMENTACAO', descricao: 'Alimentação e Bebidas' },
      { codigo: 'TRANSPORTE', descricao: 'Transporte e Combustível' },
      { codigo: 'SAUDE', descricao: 'Saúde e Medicamentos' },
      { codigo: 'EDUCACAO', descricao: 'Educação e Cursos' },
      { codigo: 'LAZER', descricao: 'Lazer e Entretenimento' },
      { codigo: 'CASA', descricao: 'Casa e Utilidades' },
      { codigo: 'ROUPAS', descricao: 'Roupas e Acessórios' },
      { codigo: 'TECNOLOGIA', descricao: 'Tecnologia e Eletrônicos' }
    ];

    console.log('Inserindo categorias de exemplo...');
    
    for (const categoria of categorias) {
      try {
        await databaseConfig.run(
          'INSERT INTO categorias (codigo, descricao) VALUES (?, ?)',
          [categoria.codigo, categoria.descricao]
        );
        console.log(`✓ Categoria inserida: ${categoria.descricao}`);
      } catch (error) {
        console.log(`⚠ Categoria já existe: ${categoria.descricao}`);
      }
    }
  }

  /**
   * Inserir estabelecimentos de exemplo
   */
  async insertSampleEstablishments() {
    const estabelecimentos = [
      {
        codigo: 'SUPERMERCADO_ABC',
        nome: 'Supermercado ABC',
        endereco: 'Rua das Flores, 123 - Centro',
        telefone: '(11) 1234-5678'
      },
      {
        codigo: 'POSTO_XYZ',
        nome: 'Posto de Combustível XYZ',
        endereco: 'Av. Principal, 456 - Bairro Norte',
        telefone: '(11) 2345-6789'
      },
      {
        codigo: 'FARMACIA_SAUDE',
        nome: 'Farmácia Saúde Total',
        endereco: 'Rua da Saúde, 789 - Vila Nova',
        telefone: '(11) 3456-7890'
      },
      {
        codigo: 'RESTAURANTE_BOM_SABOR',
        nome: 'Restaurante Bom Sabor',
        endereco: 'Praça Central, 321 - Centro',
        telefone: '(11) 4567-8901'
      },
      {
        codigo: 'LOJA_TECH',
        nome: 'Loja de Tecnologia TechWorld',
        endereco: 'Shopping Center, Loja 45',
        telefone: '(11) 5678-9012'
      },
      {
        codigo: 'ACADEMIA_FIT',
        nome: 'Academia Fitness Pro',
        endereco: 'Rua do Esporte, 654 - Zona Sul',
        telefone: '(11) 6789-0123'
      }
    ];

    console.log('Inserindo estabelecimentos de exemplo...');
    
    for (const estabelecimento of estabelecimentos) {
      try {
        await databaseConfig.run(
          'INSERT INTO estabelecimentos (codigo, nome, endereco, telefone) VALUES (?, ?, ?, ?)',
          [estabelecimento.codigo, estabelecimento.nome, estabelecimento.endereco, estabelecimento.telefone]
        );
        console.log(`✓ Estabelecimento inserido: ${estabelecimento.nome}`);
      } catch (error) {
        console.log(`⚠ Estabelecimento já existe: ${estabelecimento.nome}`);
      }
    }
  }

  /**
   * Inserir lançamentos de exemplo
   */
  async insertSampleTransactions() {
    const hoje = new Date();
    const umMesAtras = new Date(hoje.getFullYear(), hoje.getMonth() - 1, hoje.getDate());
    
    const lancamentos = [
      {
        dataLancamento: hoje.toISOString().split('T')[0],
        dataPagamento: hoje.toISOString().split('T')[0],
        valor: 85.50,
        descricao: 'Compras do mês - produtos básicos',
        codigoCategoria: 'ALIMENTACAO',
        codigoEstabelecimento: 'SUPERMERCADO_ABC'
      },
      {
        dataLancamento: umMesAtras.toISOString().split('T')[0],
        dataPagamento: umMesAtras.toISOString().split('T')[0],
        valor: 120.00,
        descricao: 'Abastecimento do veículo',
        codigoCategoria: 'TRANSPORTE',
        codigoEstabelecimento: 'POSTO_XYZ'
      },
      {
        dataLancamento: hoje.toISOString().split('T')[0],
        dataPagamento: hoje.toISOString().split('T')[0],
        valor: 45.80,
        descricao: 'Medicamentos prescritos',
        codigoCategoria: 'SAUDE',
        codigoEstabelecimento: 'FARMACIA_SAUDE'
      },
      {
        dataLancamento: umMesAtras.toISOString().split('T')[0],
        dataPagamento: umMesAtras.toISOString().split('T')[0],
        valor: 65.00,
        descricao: 'Almoço em família',
        codigoCategoria: 'ALIMENTACAO',
        codigoEstabelecimento: 'RESTAURANTE_BOM_SABOR'
      },
      {
        dataLancamento: hoje.toISOString().split('T')[0],
        dataPagamento: hoje.toISOString().split('T')[0],
        valor: 299.99,
        descricao: 'Fone de ouvido bluetooth',
        codigoCategoria: 'TECNOLOGIA',
        codigoEstabelecimento: 'LOJA_TECH'
      }
    ];

    console.log('Inserindo lançamentos de exemplo...');
    
    for (const lancamento of lancamentos) {
      try {
        await databaseConfig.run(
          'INSERT INTO lancamentos (data_lancamento, data_pagamento, valor, descricao, codigo_categoria, codigo_estabelecimento) VALUES (?, ?, ?, ?, ?, ?)',
          [
            lancamento.dataLancamento,
            lancamento.dataPagamento,
            lancamento.valor,
            lancamento.descricao,
            lancamento.codigoCategoria,
            lancamento.codigoEstabelecimento
          ]
        );
        console.log(`✓ Lançamento inserido: R$ ${lancamento.valor} - ${lancamento.codigoCategoria}`);
      } catch (error) {
        console.log(`⚠ Erro ao inserir lançamento: ${error.message}`);
      }
    }
  }

  /**
   * Executar seed completo
   */
  async run(force = false) {
    try {
      await this.connect();
      
      if (!force && await this.hasData()) {
        console.log('⚠ Banco de dados já contém dados. Use --force para sobrescrever.');
        return;
      }

      console.log('🌱 Iniciando seed do banco de dados...');
      
      await this.insertSampleCategories();
      await this.insertSampleEstablishments();
      await this.insertSampleTransactions();
      
      console.log('✅ Seed concluído com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro durante o seed:', error.message);
      throw error;
    } finally {
      await databaseConfig.close();
    }
  }
}

// Se executado diretamente
if (require.main === module) {
  const seedData = new SeedData();
  const force = process.argv.includes('--force');
  
  seedData.run(force)
    .then(() => {
      console.log('Seed executado com sucesso!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Falha no seed:', error);
      process.exit(1);
    });
}

module.exports = SeedData;