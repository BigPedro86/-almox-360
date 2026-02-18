-- Adicionar colunas faltantes na tabela items
ALTER TABLE public.items 
ADD COLUMN IF NOT EXISTS max_stock INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reorder_point INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS control_lot BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS control_expiry BOOLEAN DEFAULT FALSE;

-- O campo 'location' já existe, vamos usá-lo para 'defaultAddress'.
-- O campo 'min_stock' já existe.
-- O campo 'current_stock' já existe.
