-- Administrators are assigned through Supabase Auth app_metadata, never user_metadata.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin';
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

drop policy if exists profiles_admin_select on public.profiles;
create policy profiles_admin_select
  on public.profiles
  for select
  to authenticated
  using ((select public.is_admin()));
