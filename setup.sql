-- Annai Foods database setup
-- Run this entire script once in Supabase Dashboard > SQL Editor > New query.

create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  customer_name text not null,
  phone text not null,
  order_type text not null check (order_type in ('Collection', 'Delivery')),
  requested_date date not null,
  requested_time text not null,
  delivery_address text,
  notes text,
  items jsonb not null,
  total numeric(10,2) not null check (total >= 0),
  status text not null default 'New'
    check (status in ('New','Accepted','Preparing','Ready','Completed','Cancelled'))
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;
alter table public.admin_users enable row level security;

-- SECURITY DEFINER lets the policy check the allow-list without exposing that table.
create or replace function public.is_annai_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_annai_admin() from public;
grant execute on function public.is_annai_admin() to authenticated;

drop policy if exists "Anyone can submit an order" on public.orders;
create policy "Anyone can submit an order"
on public.orders for insert
to anon, authenticated
with check (
  customer_name <> '' and phone <> '' and jsonb_typeof(items) = 'array'
);

drop policy if exists "Admins can view orders" on public.orders;
create policy "Admins can view orders"
on public.orders for select
to authenticated
using ((select public.is_annai_admin()));

drop policy if exists "Admins can update orders" on public.orders;
create policy "Admins can update orders"
on public.orders for update
to authenticated
using ((select public.is_annai_admin()))
with check ((select public.is_annai_admin()));

-- Intentionally no public policies on admin_users.
