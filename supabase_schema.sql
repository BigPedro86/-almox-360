-- TABELA DE ITENS (ITEMS)
CREATE TABLE IF NOT EXISTS public.items (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT,
    location TEXT,
    min_stock INTEGER DEFAULT 0,
    current_stock INTEGER DEFAULT 0,
    unit TEXT,
    price NUMERIC(10,2) DEFAULT 0,
    last_purchase DATE,
    supplier TEXT,
    active BOOLEAN DEFAULT TRUE,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- TABELA DE USUÁRIOS (ROLES ADICIONAIS)
-- O Supabase gerencia o login na tabela auth.users privada.
-- Criamos esta tabela para vincular roles e dados extras.
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    name TEXT,
    role TEXT DEFAULT 'REQUISITANTE', -- 'ADMIN', 'ALMOXARIFE', 'REQUISITANTE'
    department TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Trigger para criar Profile automaticamente ao registrar novo usuário
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, role)
  values (new.id, new.raw_user_meta_data->>'name', coalesce(new.raw_user_meta_data->>'role', 'REQUISITANTE'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- TABELA DE REQUISIÇÕES (SAÍDAS)
CREATE TABLE IF NOT EXISTS public.requisitions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID REFERENCES auth.users(id),
    user_name TEXT, -- redundante para facilitar listagem, idealmente JOIN
    department TEXT,
    date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'PENDENTE', -- 'PENDENTE', 'APROVADO', 'RECUSADO', 'ENTREGUE'
    items JSONB, -- Armazena a lista de itens: [{ "itemId": "...", "qty": 10 }]
    observations TEXT,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- TABELA DE ENTRADAS (RECEIPTS/INBOUND)
CREATE TABLE IF NOT EXISTS public.receipts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    doc TEXT, -- Número da Nota Fiscal
    supplier TEXT,
    date DATE DEFAULT CURRENT_DATE,
    items INTEGER, -- Quantidade total de itens na nota (simplificado)
    item_sku TEXT, -- Descrição do item principal ou código
    original_sku TEXT, -- Código original
    lot TEXT,
    expiry DATE,
    unit TEXT,
    status TEXT DEFAULT 'CONCLUÍDO',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- TABELA DE INVENTÁRIO (CICLOS)
CREATE TABLE IF NOT EXISTS public.inventory_cycles (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT,
    status TEXT DEFAULT 'EM ANDAMENTO', -- 'CONCLUÍDO'
    start_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    end_date TIMESTAMP WITH TIME ZONE,
    counts JSONB, -- Resultado da contagem
    created_by UUID REFERENCES auth.users(id)
);

-- CONFIGURAÇÃO DE RLS (Row Level Security) - IMPORTANTE
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requisitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_cycles ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE ACESSO (SIMPLIFICADAS PARA TESTES)
-- Permitir leitura pública para usuários autenticados
CREATE POLICY "Enable read access for authenticated users" ON public.items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable all access for admins" ON public.items FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'ALMOXARIFE'))
);

CREATE POLICY "Users can create items" ON public.items FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'ALMOXARIFE'))
);
CREATE POLICY "Users can update items" ON public.items FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'ALMOXARIFE'))
);

-- Requisitions
CREATE POLICY "Users can see own requisitions" ON public.requisitions FOR SELECT TO authenticated USING (
    auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'ALMOXARIFE'))
);
CREATE POLICY "Users can create requisitions" ON public.requisitions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update requisitions" ON public.requisitions FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'ALMOXARIFE'))
);

-- Inbound (Receipts) - Apenas Almoxarifes/Admins
CREATE POLICY "Enable read access for authenticated users receipts" ON public.receipts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage receipts" ON public.receipts FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'ALMOXARIFE'))
);

-- Profiles - Leitura pública para autenticados (ver quem é quem)
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
