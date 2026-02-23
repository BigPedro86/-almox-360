-- ATUALIZAÇÃO CONSOLIDADA DE POLÍTICAS DE SEGURANÇA (RLS)
-- Garante que MASTER, ADMIN e ALMOXARIFE tenham acesso total

-- 1. TABELA DE ITENS (MATERIAL MANAGEMENT)
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

-- 2. TABELA DE PERFIS (PROFILES)
DROP POLICY IF EXISTS "Admins can manage profiles" ON public.profiles;
CREATE POLICY "Admins can manage profiles" ON public.profiles FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'ALMOXARIFE', 'MASTER'))
);

-- 3. TABELA DE REQUISIÇÕES
DROP POLICY IF EXISTS "Admins can update requisitions" ON public.requisitions;
CREATE POLICY "Admins can update requisitions" ON public.requisitions FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'ALMOXARIFE', 'MASTER', 'APROVADOR'))
);

-- 4. TABELA DE RECEBIMENTOS (ENTRADAS)
DROP POLICY IF EXISTS "Admins can manage receipts" ON public.receipts;
CREATE POLICY "Admins can manage receipts" ON public.receipts FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'ALMOXARIFE', 'MASTER'))
);
