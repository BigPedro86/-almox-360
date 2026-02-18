
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function listApprovers() {
    console.log("Consultando usuários com perfil de APROVADOR, ADMIN ou ALMOXARIFE...");

    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*');

    if (error) {
        console.error("Erro ao buscar perfis:", error.message);
        return;
    }

    if (!profiles || profiles.length === 0) {
        console.log("Nenhum usuário com perfil de aprovação encontrado.");
        return;
    }

    console.table(profiles.map(p => ({
        Nome: p.name,
        Email: p.email || 'N/A (check auth)', // Profiles table might not have email depending on schema
        Perfil: p.role,
        Departamento: p.department || '-'
    })));
}

listApprovers();
