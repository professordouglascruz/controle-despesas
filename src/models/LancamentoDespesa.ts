import { ValidationResult, DateField } from './types';

// Interface para a entidade Lançamento de Despesa
export interface LancamentoDespesa {
  id: number;                    // Chave primária auto-incremento
  dataLancamento: Date;          // Data do lançamento
  dataPagamento: Date;           // Data do pagamento
  valor: number;                 // Valor da despesa
  descricao?: string;            // Descrição do lançamento
  codigoCategoria: string;       // FK para Categoria
  codigoEstabelecimento: string; // FK para Estabelecimento
  createdAt: Date;
  updatedAt: Date;
}

// Interface para criação de lançamento (sem id e timestamps)
export interface LancamentoDespesaCreate {
  dataLancamento: DateField;
  dataPagamento: DateField;
  valor: number;
  descricao?: string;
  codigoCategoria: string;
  codigoEstabelecimento: string;
}

// Interface para atualização de lançamento
export interface LancamentoDespesaUpdate {
  dataLancamento?: DateField;
  dataPagamento?: DateField;
  valor?: number;
  descricao?: string;
  codigoCategoria?: string;
  codigoEstabelecimento?: string;
}

// Interface para dados de entrada do lançamento
export interface LancamentoDespesaInput {
  dataLancamento: DateField;
  dataPagamento: DateField;
  valor: number;
  descricao?: string;
  codigoCategoria: string;
  codigoEstabelecimento: string;
}

// Interface para lançamento com dados relacionados (para exibição)
export interface LancamentoDespesaDetalhado extends LancamentoDespesa {
  categoria?: {
    codigo: string;
    descricao: string;
  };
  estabelecimento?: {
    codigo: string;
    nome: string;
  };
}