-- Migration: Create lancamentos table with foreign keys
-- Requirements: 1.1, 2.1, 3.1, 4.1, 4.2

CREATE TABLE lancamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data_lancamento DATE NOT NULL,
    data_pagamento DATE NOT NULL,
    valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
    codigo_categoria VARCHAR(50) NOT NULL,
    codigo_estabelecimento VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (codigo_categoria) REFERENCES categorias(codigo) ON DELETE RESTRICT,
    FOREIGN KEY (codigo_estabelecimento) REFERENCES estabelecimentos(codigo) ON DELETE RESTRICT
);

-- Create indexes for better performance on queries and foreign keys
CREATE INDEX idx_lancamentos_data_lancamento ON lancamentos(data_lancamento);
CREATE INDEX idx_lancamentos_data_pagamento ON lancamentos(data_pagamento);
CREATE INDEX idx_lancamentos_categoria ON lancamentos(codigo_categoria);
CREATE INDEX idx_lancamentos_estabelecimento ON lancamentos(codigo_estabelecimento);
CREATE INDEX idx_lancamentos_valor ON lancamentos(valor);