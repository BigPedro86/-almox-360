
import { createClient } from '@supabase/supabase-js';

// Load environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    // We throw only if actually trying to connect without keys.
    // The app should handle this gracefully if keys are missing (fallback to mock or prompt user).
    console.warn('Supabase keys are missing in .env file. Falling back to Mock or limited functionality.');
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
);
