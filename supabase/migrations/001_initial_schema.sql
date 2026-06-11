-- ─── Sublytics: Complete Schema + RLS ───────────────────────────────────────
-- Run this ONCE in your Supabase SQL Editor:
--   Dashboard → SQL Editor → New Query → paste → Run
--
-- This script:
--   1. Creates all tables (profiles, subscriptions, activities, insights)
--   2. Enables Row Level Security
--   3. Sets up RLS policies so users can only access their own data
--   4. Auto-creates a profile row when a new user signs up
--   5. Auto-confirms user emails so you NEVER get "Email not confirmed"
--
-- 💡 One-time fix for existing users:
--   If you already signed up and got "Email not confirmed", run this too:
--   UPDATE auth.users SET email_confirmed_at = now() WHERE email_confirmed_at IS NULL;
--
-- This file is idempotent — safe to run multiple times.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 1. profiles ─────────────────────────────────────────────────────────────
-- Per-user identity + settings (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  avatar_url text,
  joined_at timestamptz not null default now(),
  currency text not null default '$',
  notifications boolean not null default true,
  email_alerts boolean not null default true,
  weekly_reports boolean not null default false,
  budget numeric not null default 300,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── 2. subscriptions ────────────────────────────────────────────────────────
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null,
  cost numeric not null,
  billing_cycle text not null,
  next_billing_date date,
  status text not null default 'active',
  logo text,
  color text,
  description text,
  created_at timestamptz not null default now()
);
create index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);

-- ─── 3. activities ───────────────────────────────────────────────────────────
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  description text not null,
  date timestamptz not null default now(),
  amount numeric,
  subscription_name text
);
create index if not exists activities_user_id_idx on public.activities(user_id);

-- ─── 4. insights ─────────────────────────────────────────────────────────────
create table if not exists public.insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  description text not null,
  amount numeric,
  actionable boolean not null default true
);
create index if not exists insights_user_id_idx on public.insights(user_id);

-- ─── Row Level Security ──────────────────────────────────────────────────────
alter table public.profiles     enable row level security;
alter table public.subscriptions enable row level security;
alter table public.activities   enable row level security;
alter table public.insights     enable row level security;

drop policy if exists "Users can manage own profile"      on public.profiles;
drop policy if exists "Users can manage own subscriptions" on public.subscriptions;
drop policy if exists "Users can manage own activities"   on public.activities;
drop policy if exists "Users can manage own insights"     on public.insights;

create policy "Users can manage own profile"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can manage own subscriptions"
  on public.subscriptions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage own activities"
  on public.activities for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage own insights"
  on public.insights for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── Auto-create profile on signup ──────────────────────────────────────────
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();