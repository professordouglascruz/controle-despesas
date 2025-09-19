import { ValidationResult, DateField } from './types';

// Interface para a entidade Categoria
export interface Categoria {
  codigo: string;        // Chave primária
  descricao: string;     // Descrição da categoria
  createdAt: Date;
  updatedAt: Date;
}

// Interface para criação de categoria (sem campos de timestamp)
export interface CategoriaCreate {
  codigo: string;
  descricao: string;
}

// Interface para atualização de categoria
export interface CategoriaUpdate {
  descricao?: string;
}

// Interface para dados de entrada da categoria
export interface CategoriaInput {
  codigo: string;
  descricao: string;
}