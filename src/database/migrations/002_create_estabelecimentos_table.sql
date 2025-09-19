-- Migration: Create estabelecimentos table
-- Requirements: 1.1, 2.1, 3.1, 4.1, 4.2

CREATE TABLE estabelecimentos (
    codigo VARCHAR(50) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    endereco TEXT NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better performance on queries
CREATE INDEX idx_estabelecimentos_nome ON estabelecimentos(nome);