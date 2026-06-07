import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Safety check — catches missing .env early in development
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
}

// SECURITY: Only ever use the anon key here.
// The service_role key bypasses ALL Row Level Security — never put it in frontend code.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,       // keeps session in localStorage across reloads
    autoRefreshToken: true,     // silently refreshes JWT before expiry
    detectSessionInUrl: true,   // handles OAuth/magic-link redirects
  },
});
