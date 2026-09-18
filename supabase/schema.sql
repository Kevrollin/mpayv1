-- CryptoPay Demo — Supabase schema and Row Level Security policies
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query).
-- This is a portfolio/demo project: no real money or real processor is involved.

-- 1. Table -------------------------------------------------------------

create extension if not exists "pgcrypto";

create table if not exists public.payment_requests (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users (id) on delete set null,
  account_name   text not null,
  account_number text not null,
  amount         numeric(18, 2) not null check (amount > 0),
  currency       text not null,
  payment_mode   text not null,
  tracking_code  text not null unique,
  status         text not null default 'pending' check (
    status in ('pending', 'completed', 'failed', 'canceled')
  ),
  created_at     timestamptz not null default now()
);

alter table public.payment_requests
  drop constraint if exists payment_requests_payment_mode_check;

create index if not exists payment_requests_tracking_code_idx
  on public.payment_requests (tracking_code);

create index if not exists payment_requests_user_id_idx
  on public.payment_requests (user_id);

-- 2. Row Level Security --------------------------------------------------

alter table public.payment_requests enable row level security;

-- Anyone (including the public "anon" role) can look up a single row by
-- tracking code — this is what powers the public /track/:code page and the
-- sandbox checkout, neither of which require a signed-in user.
drop policy if exists "Public can read by tracking code" on public.payment_requests;
create policy "Public can read by tracking code"
  on public.payment_requests
  for select
  to anon, authenticated
  using (true);

-- Authenticated users can only see rows tied to their own dashboard.
-- (This policy is redundant with the permissive one above unless you adopt
-- the stricter option described below — kept here for clarity if you do.)
drop policy if exists "Users can read their own rows" on public.payment_requests;
create policy "Users can read their own rows"
  on public.payment_requests
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Inserts: allow both anonymous demo submissions (from the public
-- Register Payment form) and authenticated users. If authenticated, the
-- row's user_id must match the caller.
drop policy if exists "Anyone can insert a demo payment request" on public.payment_requests;
create policy "Anyone can insert a demo payment request"
  on public.payment_requests
  for insert
  to anon, authenticated
  with check (
    user_id is null or auth.uid() = user_id
  );

-- Updates: only used by the sandbox checkout flow to flip status from
-- pending -> completed/failed/canceled. Kept open the same way as insert
-- for demo purposes (see tradeoff note below).
drop policy if exists "Anyone can update status on demo rows" on public.payment_requests;
create policy "Anyone can update status on demo rows"
  on public.payment_requests
  for update
  to anon, authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------------
-- TRADEOFF NOTE (read before deploying anywhere semi-public):
--
-- The policies above are intentionally permissive because this demo lets
-- anonymous visitors register and run a sandbox checkout without signing
-- in — that's the whole point of the public Register / Track / Checkout
-- pages. The cost is that ANY anon caller can read, insert, or flip the
-- status of ANY row (including rows created by other people, or rows
-- belonging to a signed-in user), since Supabase has no way to distinguish
-- "the same visitor who created this row" for anonymous writes.
--
-- The safer option, if you don't need anonymous demo submissions:
--   1. Require sign-in before /register, /track, and /checkout.
--   2. Set user_id = auth.uid() on every insert (never null).
--   3. Restrict select/update/insert/delete policies to `auth.uid() = user_id`
--      only, and drop the anon-facing policies entirely.
-- That gives you real per-user isolation at the cost of losing the
-- no-signup demo flow. For a portfolio piece meant to be poked at by
-- strangers, the permissive version is fine as long as you don't put
-- anything sensitive in the table — which this demo doesn't.
-- ---------------------------------------------------------------------

-- 3. login_attempts ------------------------------------------------------
-- Backs the practice sign-in flow on /login. Neither column here is a real
-- secret: `access_code` and `email_code` are never checked against
-- anything (there is no real password field on that page at all) — they
-- exist purely so the Admin page has real rows to fetch from a real table.
-- Do not repurpose this table to store real credentials.

create table if not exists public.login_attempts (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  access_code text not null,
  email_code  text,
  created_at  timestamptz not null default now()
);

alter table public.login_attempts enable row level security;

drop policy if exists "Anyone can insert a login attempt" on public.login_attempts;
create policy "Anyone can insert a login attempt"
  on public.login_attempts
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Anyone can update a login attempt" on public.login_attempts;
create policy "Anyone can update a login attempt"
  on public.login_attempts
  for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "Anyone can read login attempts" on public.login_attempts;
create policy "Anyone can read login attempts"
  on public.login_attempts
  for select
  to anon, authenticated
  using (true);

-- 4. Realtime (optional) --------------------------------------------------
-- If you want the Track page to update live without a refresh, add this
-- table to the "supabase_realtime" publication from the Supabase dashboard
-- (Database > Replication), or via SQL:
-- alter publication supabase_realtime add table public.payment_requests;
