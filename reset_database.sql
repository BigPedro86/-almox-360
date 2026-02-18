-- SCRIPT DE LIMPEZA DO BANCO DE DADOS (SUPABASE)
-- Copie e cole este código no SQL Editor do seu projeto Supabase para limpar os dados de teste.

-- ---------------------------------------------------------
-- 1. LIMPAR MOVIMENTAÇÕES (PRESERVA CADASTROS BÁSICOS)
-- Apaga todas as requisições, entradas e inventários.
-- ---------------------------------------------------------
TRUNCATE TABLE requisitions CASCADE;
TRUNCATE TABLE receipts CASCADE;
TRUNCATE TABLE inventory_cycles CASCADE;

-- ---------------------------------------------------------
-- 2. LIMPAR CATÁLOGO DE ITENS (OPCIONAL)
-- Se quiser apagar também os produtos cadastrados, descomente a linha abaixo:
-- ---------------------------------------------------------
-- TRUNCATE TABLE items CASCADE;

-- ---------------------------------------------------------
-- 3. LIMPAR USUÁRIOS (OPCIONAL)
-- Para limpar usuários, o ideal é fazer manualmente na aba Authentication do Supabase,
-- pois envolve tabelas de sistema (auth.users).
-- A tabela 'profiles' será limpa automaticamente se o usuário for deletado lá.
-- ---------------------------------------------------------
