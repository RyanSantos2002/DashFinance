-- Enable Row Level Security
-- auth.users usually has RLS enabled by default in Supabase projects.
-- We will skip altering it to avoid permission errors.

-- Create profiles table
create table public.profiles (
  id uuid not null references auth.users(id) on delete cascade primary key,
  full_name text,
  avatar_url text,
  dashboard_layouts jsonb default '{"principal": ["income_default", "expense_default", "balance_default", "reservation_default"], "analytics": ["forecast_default", "history_default", "category_pie_default"]}'::jsonb,
  reservation_balance numeric default 0,
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- Create transactions table
create table public.transactions (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  description text not null,
  amount numeric not null,
  type text not null check (type in ('income', 'expense')),
  category text not null,
  date timestamptz not null default now(),
  is_fixed boolean default false,
  installment jsonb, -- Stores {current: 1, total: 10}
  created_at timestamptz default now()
);

alter table public.transactions enable row level security;

create policy "Users can view their own transactions" on public.transactions
  for select using (auth.uid() = user_id);

create policy "Users can insert their own transactions" on public.transactions
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own transactions" on public.transactions
  for update using (auth.uid() = user_id);

create policy "Users can delete their own transactions" on public.transactions
  for delete using (auth.uid() = user_id);

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to automatically create profile on sign up
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
