-- PASSO 1: Adicionar a coluna de e-mail na tabela de perfis
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- PASSO 2: Atualizar os e-mails dos usuários já existentes
-- (Isso vincula o e-mail da tabela privada auth.users para a nossa tabela pública profiles)
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id;

-- PASSO 3: Atualizar a função (trigger) para que novos usuários já nasçam com e-mail no perfil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role, email)
  VALUES (
    new.id, 
    coalesce(new.raw_user_meta_data->>'name', 'Novo Usuário'), 
    coalesce(new.raw_user_meta_data->>'role', 'REQUISITANTE'),
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
