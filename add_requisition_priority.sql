-- Adicionar coluna priority na tabela requisitions
ALTER TABLE public.requisitions 
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'MEDIA';

-- Adicionar coluna timeline na tabela requisitions (opcional/future-proofing)
-- Para armazenar o histórico de status como JSON
ALTER TABLE public.requisitions
ADD COLUMN IF NOT EXISTS timeline JSONB DEFAULT '[]'::jsonb;
