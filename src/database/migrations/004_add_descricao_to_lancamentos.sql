-- Migration: Add descricao field to lancamentos table
-- Requirements: User feedback - add description field for better expense tracking

ALTER TABLE lancamentos ADD COLUMN descricao TEXT;

-- Create index for description searches
CREATE INDEX idx_lancamentos_descricao ON lancamentos(descricao);