-- Migration: Add Credit Cards and Update Transactions
-- Run this in Supabase SQL Editor

-- 1. Create credit_cards table
create table public.credit_cards (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  "limit" numeric not null default 0,
  closing_day integer not null check (closing_day >= 1 and closing_day <= 31),
  due_day integer not null check (due_day >= 1 and due_day <= 31),
  color text default '#3b82f6',
  created_at timestamptz default now()
);

alter table public.credit_cards enable row level security;

create policy "Users can view their own credit cards" on public.credit_cards
  for select using (auth.uid() = user_id);

create policy "Users can insert their own credit cards" on public.credit_cards
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own credit cards" on public.credit_cards
  for update using (auth.uid() = user_id);

create policy "Users can delete their own credit cards" on public.credit_cards
  for delete using (auth.uid() = user_id);

-- 2. Update transactions table
alter table public.transactions 
add column payment_method text,
add column credit_card_id uuid references public.credit_cards(id) on delete set null;

-- 3. Add index for better performance
create index idx_transactions_credit_card_id on public.transactions(credit_card_id);
create index idx_transactions_user_id_date on public.transactions(user_id, date);
