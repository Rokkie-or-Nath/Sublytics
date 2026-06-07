import { supabase } from './supabase';

export async function registerAccount(
  email: string,
  password: string,
  name: string
): Promise<{ success: true } | { success: false; error: string }> {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function loginAccount(
  email: string,
  password: string
): Promise<{ success: true; name: string } | { success: false; error: string }> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { success: false, error: error.message };
  const name = data.user?.user_metadata?.name || email.split('@')[0];
  return { success: true, name };
}

export async function logoutAccount(): Promise<void> {
  await supabase.auth.signOut();
}

// Subscribes to auth state changes — call this once in App.tsx
// so logout/session-expiry automatically clears the store.
export function onAuthStateChange(callback: (user: { email: string; name: string; joinedAt: string } | null) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    if (!session?.user) {
      callback(null);
      return;
    }
    const user = session.user;
    callback({
      email: user.email!,
      name: user.user_metadata?.name || user.email!.split('@')[0],
      joinedAt: user.created_at,
    });
  });
}
