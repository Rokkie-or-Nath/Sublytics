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

/**
 * Permanently deletes the calling account by invoking the
 * `delete-account` Supabase Edge Function. Requires that the function has
 * been deployed (see supabase/functions/delete-account/index.ts).
 *
 * Returns `{ success: true }` on success, otherwise the error message from
 * the function. Note: a 404 here usually means the Edge Function hasn't
 * been deployed yet — see the SECURITY.md checklist.
 */
export async function deleteAccount(): Promise<{ success: true } | { success: false; error: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { success: false, error: 'You are not signed in.' };
  }

  try {
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-account`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
      },
    );
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: body?.error || `Edge Function returned ${res.status}` };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
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
