// Tipos auxiliares para validação
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

// Tipos para campos de data
export type DateField = Date | string;

// Tipos para operações CRUD
export interface CreateRequest<T> {
  data: Omit<T, 'createdAt' | 'updatedAt'>;
}

export interface UpdateRequest<T> {
  data: Partial<Omit<T, 'createdAt' | 'updatedAt'>>;
}

// Tipos para respostas da API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: ValidationError[];
  };
}