-- Migration: Create categorias table
-- Requirements: 1.1, 2.1, 3.1, 4.1, 4.2

CREATE TABLE categorias (
    codigo VARCHAR(50) PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better performance on queries
CREATE INDEX idx_categorias_descricao ON categorias(descricao);