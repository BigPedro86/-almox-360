-- Adicionar coluna settings na tabela profiles para armazenar preferências do usuário
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{
  "theme": "light",
  "expiringLotsAlertDays": 30,
  "allowPartialFulfillment": false,
  "requireReceiptConfirmation": true
}'::jsonb;

-- Ajustar políticas de RLS para a tabela profiles
-- 1. Permitir que o usuário atualize seu próprio perfil (configurações, etc)
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles 
FOR UPDATE TO authenticated 
USING (auth.uid() = id);

-- 2. Permitir que MASTER e ADMIN gerenciem perfis
DROP POLICY IF EXISTS "Admins can manage profiles" ON public.profiles;
CREATE POLICY "Admins can manage profiles" ON public.profiles 
FOR ALL TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('MASTER', 'ADMIN')
    )
);
