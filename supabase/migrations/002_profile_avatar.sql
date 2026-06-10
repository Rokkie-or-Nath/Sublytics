-- ─── 002: Add avatar_url to profiles ──────────────────────────────────────────
-- Adds a column for storing the user's profile picture URL.

alter table public.profiles
  add column if not exists avatar_url text;

-- Update the auto-signup trigger to include avatar_url as null
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;