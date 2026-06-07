-- ─── Sublytics: Row Level Security Setup ────────────────────────────────────
-- Run this entire file once in your Supabase project:
-- Dashboard → SQL Editor → New Query → paste → Run
-- ─────────────────────────────────────────────────────────────────────────────


-- ─── 1. profiles table ───────────────────────────────────────────────────────
-- Mirrors auth.users and stores the display name set during signup.

create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  name       text not null,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies: each user can only read and update their own row
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row whenever a new user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ─── 2. subscriptions table ──────────────────────────────────────────────────

create table if not exists public.subscriptions (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users (id) on delete cascade,
  name              text not null,
  category          text not null default 'other',
  cost              numeric(10, 2) not null,
  billing_cycle     text not null default 'monthly',
  next_billing_date date not null,
  status            text not null default 'active',
  color             text not null default '#6B7B8F',
  description       text,
  created_at        date default current_date,
  constraint subscriptions_status_check check (status in ('active', 'paused', 'cancelled')),
  constraint subscriptions_cycle_check  check (billing_cycle in ('weekly', 'monthly', 'quarterly', 'yearly'))
);

alter table public.subscriptions enable row level security;

create policy "Users can view own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can insert own subscriptions"
  on public.subscriptions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own subscriptions"
  on public.subscriptions for update
  using (auth.uid() = user_id);

create policy "Users can delete own subscriptions"
  on public.subscriptions for delete
  using (auth.uid() = user_id);


-- ─── 3. activities table ─────────────────────────────────────────────────────

create table if not exists public.activities (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users (id) on delete cascade,
  type                text not null,
  description         text not null,
  date                timestamptz default now(),
  amount              numeric(10, 2),
  subscription_name   text,
  constraint activities_type_check check (type in ('added', 'updated', 'paused', 'cancelled', 'alert', 'saved'))
);

alter table public.activities enable row level security;

create policy "Users can view own activities"
  on public.activities for select
  using (auth.uid() = user_id);

create policy "Users can insert own activities"
  on public.activities for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own activities"
  on public.activities for delete
  using (auth.uid() = user_id);


-- ─── 4. settings table ───────────────────────────────────────────────────────

create table if not exists public.settings (
  user_id        uuid primary key references auth.users (id) on delete cascade,
  currency       text    not null default '$',
  budget         numeric(10, 2) not null default 300,
  notifications  boolean not null default true,
  email_alerts   boolean not null default true,
  weekly_reports boolean not null default false
);

alter table public.settings enable row level security;

create policy "Users can view own settings"
  on public.settings for select
  using (auth.uid() = user_id);

create policy "Users can insert own settings"
  on public.settings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own settings"
  on public.settings for update
  using (auth.uid() = user_id);

-- Auto-create default settings row when a new user signs up
create or replace function public.handle_new_user_settings()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.settings (user_id) values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_settings on auth.users;
create trigger on_auth_user_created_settings
  after insert on auth.users
  for each row execute procedure public.handle_new_user_settings();


-- ─── 5. Lock down the auth schema ────────────────────────────────────────────
-- Revoke direct public access to auth tables (Supabase does this by default,
-- this is just an explicit safety net).

revoke all on schema auth from public;
revoke all on schema auth from anon;
revoke all on schema auth from authenticated;
