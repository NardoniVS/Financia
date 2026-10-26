create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  avatar_url text not null default '',
  account_level text not null default 'Pro' check (account_level in ('Pro', 'Premium', 'Gratuito')),
  privacy_mode boolean not null default false,
  demo_data_seeded boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id text not null,
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  title text not null,
  subtitle text,
  category text not null,
  amount numeric not null,
  date text not null,
  type text not null check (type in ('expense', 'income', 'investment', 'transfer')),
  account_id text,
  payment_method text,
  status text not null check (status in ('completed', 'pending')),
  primary key (user_id, id)
);

create table if not exists public.budgets (
  id text not null,
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  category text not null,
  budget_limit numeric not null check (budget_limit >= 0),
  spent numeric not null default 0 check (spent >= 0),
  icon_name text not null default '',
  color text not null default '',
  month text not null,
  primary key (user_id, id)
);

create table if not exists public.cards (
  id text not null,
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  bank_name text not null,
  card_number text not null,
  card_holder_name text not null,
  expiration_date text not null,
  card_brand text not null check (card_brand in ('Mastercard', 'Visa', 'Elo')),
  card_tier text,
  balance_or_limit numeric not null default 0,
  available_limit numeric not null default 0,
  is_default boolean not null default false,
  theme_color text not null check (theme_color in ('blue', 'black', 'purple', 'emerald', 'rose', 'amber')),
  primary key (user_id, id)
);

create table if not exists public.accounts (
  id text not null,
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  institution_name text not null,
  institution_code text not null,
  account_type text not null,
  balance numeric not null default 0,
  last_sync text not null default '',
  status text not null check (status in ('connected', 'syncing', 'action_required')),
  logo_color text not null default '',
  primary key (user_id, id)
);

create table if not exists public.assets (
  id text not null,
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  ticker text not null,
  name text not null,
  category text not null,
  current_price numeric not null default 0,
  change_percent numeric not null default 0,
  change_value numeric not null default 0,
  quantity numeric not null default 0,
  average_price numeric not null default 0,
  dividend_yield numeric,
  pe_ratio numeric,
  week_52_min numeric,
  week_52_max numeric,
  volume_24h text,
  history jsonb not null default '{}'::jsonb,
  primary key (user_id, id)
);

do $$
declare
  table_name text;
begin
  foreach table_name in array array['profiles', 'transactions', 'budgets', 'cards', 'accounts', 'assets']
  loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on table public.%I from anon', table_name);
    execute format('grant select, insert, update, delete on table public.%I to authenticated', table_name);

    execute format('drop policy if exists %I on public.%I', table_name || '_select_own', table_name);
    execute format('create policy %I on public.%I for select to authenticated using (user_id = (select auth.uid()))', table_name || '_select_own', table_name);

    execute format('drop policy if exists %I on public.%I', table_name || '_insert_own', table_name);
    execute format('create policy %I on public.%I for insert to authenticated with check (user_id = (select auth.uid()))', table_name || '_insert_own', table_name);

    execute format('drop policy if exists %I on public.%I', table_name || '_update_own', table_name);
    execute format('create policy %I on public.%I for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', table_name || '_update_own', table_name);

    execute format('drop policy if exists %I on public.%I', table_name || '_delete_own', table_name);
    execute format('create policy %I on public.%I for delete to authenticated using (user_id = (select auth.uid()))', table_name || '_delete_own', table_name);
  end loop;
end
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array['profiles', 'transactions', 'budgets', 'cards', 'accounts', 'assets']
  loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = table_name
    ) then
      execute format('alter publication supabase_realtime add table public.%I', table_name);
    end if;
  end loop;
end
$$;
