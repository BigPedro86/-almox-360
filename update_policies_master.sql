-- ATUALIZAÇÃO DE PERMISSÕES (RLS)
-- Inclui o perfil 'MASTER' e 'APROVADOR' nas políticas de segurança

-- 1. Permissões para Tabela de ITENS (Produtos)
DROP POLICY IF EXISTS "Enable all access for admins" ON public.items;
CREATE POLICY "Enable all access for admins" ON public.items FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'ALMOXARIFE', 'MASTER'))
);

DROP POLICY IF EXISTS "Users can create items" ON public.items;
CREATE POLICY "Users can create items" ON public.items FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'ALMOXARIFE', 'MASTER'))
);

DROP POLICY IF EXISTS "Users can update items" ON public.items;
CREATE POLICY "Users can update items" ON public.items FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'ALMOXARIFE', 'MASTER'))
);

-- 2. Permissões para Tabela de REQUISIÇÕES
-- Importante: APROVADOR precisa ter permissão de UPDATE para aprovar/rejeitar
DROP POLICY IF EXISTS "Admins can update requisitions" ON public.requisitions;
CREATE POLICY "Admins can update requisitions" ON public.requisitions FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'ALMOXARIFE', 'MASTER', 'APROVADOR'))
);

-- Permite que MASTER/ADMIN/ALMOXARIFE vejam todas as requisições (não só as suas)
DROP POLICY IF EXISTS "Users can see own requisitions" ON public.requisitions;
CREATE POLICY "Users can see own requisitions" ON public.requisitions FOR SELECT TO authenticated USING (
    auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'ALMOXARIFE', 'MASTER', 'APROVADOR', 'AUDITOR'))
);

-- 3. Permissões para Tabela de RECEBIMENTOS (Entradas)
DROP POLICY IF EXISTS "Admins can manage receipts" ON public.receipts;
CREATE POLICY "Admins can manage receipts" ON public.receipts FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'ALMOXARIFE', 'MASTER'))
);
