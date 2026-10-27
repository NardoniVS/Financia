create table if not exists public.subscriptions (
  id text not null,
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  service_name text not null,
  category text not null,
  amount numeric not null check (amount > 0),
  next_billing_date text not null,
  billing_frequency text not null check (billing_frequency in ('mensal', 'anual')),
  status text not null default 'active' check (status in ('active', 'paused')),
  brand_color text not null default '#2563eb',
  is_paid_this_month boolean not null default false,
  primary key (user_id, id)
);

alter table public.subscriptions enable row level security;
revoke all on table public.subscriptions from anon;
grant select, insert, update, delete on table public.subscriptions to authenticated;

drop policy if exists subscriptions_select_own on public.subscriptions;
create policy subscriptions_select_own
  on public.subscriptions for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists subscriptions_insert_own on public.subscriptions;
create policy subscriptions_insert_own
  on public.subscriptions for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists subscriptions_update_own on public.subscriptions;
create policy subscriptions_update_own
  on public.subscriptions for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists subscriptions_delete_own on public.subscriptions;
create policy subscriptions_delete_own
  on public.subscriptions for delete to authenticated
  using (user_id = (select auth.uid()));

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'subscriptions'
  ) then
    alter publication supabase_realtime add table public.subscriptions;
  end if;
end
$$;

notify pgrst, 'reload schema';
