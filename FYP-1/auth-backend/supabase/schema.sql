-- =====================================================================
-- CyberShield -- Registration & Profile module
-- Run this whole file once in: Supabase Dashboard -> SQL Editor -> New query -> Run.
-- It is safe to run again (it drops and re-creates the policies/triggers it owns).
-- Passwords are NOT stored here: Supabase Auth keeps them (hashed) in auth.users.
-- =====================================================================

-- 1) profiles table: one row per Supabase Auth user -------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null check (char_length(btrim(full_name)) between 1 and 100),
  email       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.profiles is 'Public profile data for each CyberShield user (1:1 with auth.users).';

-- 2) Keep updated_at fresh ----------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- 3) Create the profile automatically when a user registers --------------
-- The backend sends full_name as signup metadata; this trigger copies it into profiles.
-- SECURITY DEFINER lets the trigger insert even though clients have no INSERT permission.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    left(coalesce(nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''), 'User'), 100),
    new.email
  );
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4) Row Level Security (never disabled) -----------------------------------
alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- No INSERT or DELETE policies on purpose: clients can't create or delete profiles.
-- Profiles are created by the trigger above and removed automatically if the auth user is deleted.

-- 5) Least-privilege grants ---------------------------------------------
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name) on public.profiles to authenticated;   -- users can change ONLY their name

-- Optional: if you already created test users BEFORE running this file, backfill their profiles:
-- insert into public.profiles (id, full_name, email)
-- select id, coalesce(nullif(btrim(raw_user_meta_data ->> 'full_name'), ''), 'User'), email
-- from auth.users
-- on conflict (id) do nothing;
