
-- Adiciona colunas de valor à tabela de recebimentos (receipts)
ALTER TABLE public.receipts 
ADD COLUMN IF NOT EXISTS total_value NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS unit_cost NUMERIC(10,2) DEFAULT 0;
