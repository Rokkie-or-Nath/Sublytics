# Security hardening checklist for Sublytics

The app uses **Supabase** for auth + database. Most of the heavy lifting (password hashing, JWT signing, RLS, parameterized queries) is handled server-side, but there are a handful of one-time config steps in the Supabase dashboard and a few things to know before going to production.

## ✅ Already in place

- **SQL injection is impossible** — the Supabase JS client uses parameterized queries via PostgREST. No user input is ever concatenated into SQL.
- **Row Level Security (RLS) is on** for `profiles`, `subscriptions`, `activities`, `insights`. Every policy is `auth.uid() = user_id` so a user can only see/modify their own rows, even if they manually craft a request in the browser console.
- **Passwords are bcrypt-hashed** by Supabase Auth — we never see or store them.
- **Cascading deletes** — `ON DELETE CASCADE` on the `auth.users` FKs means deleting a user automatically wipes their data.
- **"Delete Account" feature** — Settings → Delete Account calls a server-side Edge Function that uses the `service_role` key (the one key that bypasses RLS) to call `auth.admin.deleteUser()`. The anon key in the browser can never do this directly.

## 🔧 Recommended one-time setup in the Supabase dashboard

### 1. Enable email confirmation on sign-up
Default is OFF, which means anyone can sign up with a fake email and start using the app.

**Supabase Dashboard → Authentication → Providers → Email → toggle "Confirm email" ON.**

When this is on, `registerAccount()` will return successfully but the user won't be able to sign in until they click the link in their inbox. The login form should also handle the `Email not confirmed` error gracefully (currently it surfaces the raw Supabase error, which is fine but you may want to show a friendlier message).

### 2. Strengthen password requirements
Default minimum is 6 characters, which is weak.

**Supabase Dashboard → Authentication → Passwords** — set min length to 8 and enable the "strong password" requirements. Then update the client-side check in `LoginPage.tsx` and `SignupPage.tsx` to match.

### 3. Deploy the `delete-account` Edge Function
The "Delete Account" button in Settings calls `${SUPABASE_URL}/functions/v1/delete-account`. Until this function is deployed, that call will 404 and the user will see an error.

```bash
# One-time: install the Supabase CLI and link your project
npm install -g supabase
supabase login
supabase link --project-ref <your-ref>

# Deploy the function
supabase functions deploy delete-account --no-verify-jwt
```

The `--no-verify-jwt` flag is intentional: the function reads the user's JWT from the `Authorization` header itself, so it can identify which user to delete.

### 4. (Optional) Block disposable email sign-ups
Add this Postgres trigger to reject sign-ups from common throwaway email providers:

```sql
create or replace function public.check_email_domain()
returns trigger
language plpgsql
as $$
declare
  blocked_domains text[] := array[
    'mailinator.com', 'guerrillamail.com', 'tempmail.com',
    '10minutemail.com', 'yopmail.com', 'trashmail.com',
    'dispostable.com', 'fakeinbox.com', 'getnada.com'
  ];
begin
  if split_part(new.email, '@', 2) = any(blocked_domains) then
    raise exception 'Sign-ups from % are not allowed', split_part(new.email, '@', 2);
  end if;
  return new;
end;
$$;

create trigger block_disposable_emails
  before insert on auth.users
  for each row execute function public.check_email_domain();
```

### 5. (Optional) Set up rate limiting
Supabase has built-in rate limits on auth endpoints, but you can add an extra layer with **Cloudflare Turnstile** (free) or **hCaptcha** on the signup/login forms to keep bots out.

### 6. Set up your custom SMTP
By default Supabase uses its own SMTP for auth emails (signup confirmation, password reset), which has a low daily limit.

**Supabase Dashboard → Project Settings → Auth → SMTP Settings** — plug in SendGrid, Resend, Postmark, etc. for production.

## 🧪 Quick security self-test

After deploying, you can verify the setup is solid by:

1. Sign up as `userA@test.com`, add a subscription
2. Open an incognito window, sign up as `userB@test.com`
3. In userB's browser console:
   ```js
   const { data } = await window.__supabase.from('subscriptions').select('*');
   console.log(data);  // → []   (RLS hides userA's data)
   ```
4. Try inserting a row with userA's user_id:
   ```js
   await window.__supabase.from('subscriptions').insert({
     user_id: '<userA-uuid>', name: 'hax', cost: 999, ...
   });
   // → 403 / "new row violates row-level security policy"
   ```
5. Try to call `auth.admin.deleteUser` directly (should fail — only the service_role key can do this, and we never expose it):
   ```js
   await window.__supabase.auth.admin.deleteUser('<some-uuid>');
   // → "Admin API disabled" or "permission denied"
   ```

If all 5 checks pass, your setup is solid for production.

## 📋 Summary of files

| Path | What it does |
|---|---|
| `supabase/migrations/001_initial_schema.sql` | Schema + RLS policies + auto-profile trigger |
| `supabase/functions/delete-account/index.ts` | Edge Function that actually deletes the user |
| `src/lib/accounts.ts` | Client-side wrappers + `onAuthStateChange` |
| `src/lib/db.ts` | Typed CRUD over Supabase tables |
| `src/lib/service.ts` | High-level data orchestration + seeding |
| `src/store/useStore.ts` | Zustand store with async actions |
| `.env` | `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (anon key is safe in browser — see below) |

### About the anon key
The `VITE_SUPABASE_ANON_KEY` is **safe to expose** in the browser. It's governed by RLS, so even if someone copies it, they can only do what a logged-in user can do (which is "touch only their own rows"). The one key that MUST stay server-side is `service_role` — it's only used inside the Edge Function and is never sent to the browser.
