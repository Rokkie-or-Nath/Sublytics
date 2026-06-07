import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

// The .env ships with placeholder values like "YOUR_SUPABASE_PROJECT_URL".
// Detect those so we can show a clear message instead of getting cryptic
// network errors when the user hasn't set up Supabase yet.
const looksUnconfigured =
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl.includes('YOUR_') ||
  supabaseUrl.includes('your-project') ||
  supabaseUrl.startsWith('http://localhost') ||
  !supabaseUrl.startsWith('https://');

if (looksUnconfigured) {
  // eslint-disable-next-line no-console
  console.warn(
    '[Sublytics] Supabase is not configured. Open .env and set ' +
      'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your project values.\n' +
      'See .env.example for the format. The app will still load but auth ' +
      'and data features will not work until you do this.',
  );
}

// SECURITY: Only ever use the anon key here. The service_role key bypasses
// ALL Row Level Security — never put it in frontend code.
export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://invalid.supabase.co',
  supabaseAnonKey || 'invalid-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);

/** True when the .env still has placeholder Supabase values. */
export const isSupabaseConfigured = !looksUnconfigured;
