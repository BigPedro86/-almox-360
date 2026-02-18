-- PASSO 1: Encontrar o ID do usuário manutencao@orsi.com.br
-- Execute primeiro esta query para pegar o UUID
SELECT id FROM auth.users WHERE email = 'manutencao@orsi.com.br';

-- PASSO 2: Atualizar o perfil para ADMIN (Almoxarife)
-- Substitua 'SEU_UUID_AQUI' pelo código que apareceu no passo 1
UPDATE public.profiles
SET role = 'ALMOXARIFE', department = 'MANUTENÇÃO'
WHERE id = 'SEU_UUID_AQUI';

-- OU, SE VOCÊ PREFERIR RODAR TUDO DE UMA VEZ (SÓ FUNCIONA SE O EMAIL JÁ EXISTIR):
UPDATE public.profiles
SET role = 'ALMOXARIFE', department = 'MANUTENÇÃO'
WHERE id = (SELECT id FROM auth.users WHERE email = 'manutencao@orsi.com.br');
