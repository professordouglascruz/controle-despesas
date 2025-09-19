import { ValidationResult, DateField } from './types';

// Interface para a entidade Estabelecimento
export interface Estabelecimento {
  codigo: string;        // Chave primária
  nome: string;          // Nome do estabelecimento
  endereco: string;      // Endereço completo
  telefone: string;      // Número de telefone
  createdAt: Date;
  updatedAt: Date;
}

// Interface para criação de estabelecimento (sem campos de timestamp)
export interface EstabelecimentoCreate {
  codigo: string;
  nome: string;
  endereco: string;
  telefone: string;
}

// Interface para atualização de estabelecimento
export interface EstabelecimentoUpdate {
  nome?: string;
  endereco?: string;
  telefone?: string;
}

// Interface para dados de entrada do estabelecimento
export interface EstabelecimentoInput {
  codigo: string;
  nome: string;
  endereco: string;
  telefone: string;
}