-- Allows administrators to clear one user's financial records while preserving
-- their profile and Supabase Auth account.
create or replace function public.admin_delete_financial_data(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted_transactions integer := 0;
  deleted_budgets integer := 0;
  deleted_cards integer := 0;
  deleted_accounts integer := 0;
  deleted_assets integer := 0;
begin
  if not public.is_admin() then
    raise exception 'Acesso negado: somente administradores podem apagar dados financeiros.'
      using errcode = '42501';
  end if;

  delete from public.transactions where user_id = p_user_id;
  get diagnostics deleted_transactions = row_count;
  delete from public.budgets where user_id = p_user_id;
  get diagnostics deleted_budgets = row_count;
  delete from public.cards where user_id = p_user_id;
  get diagnostics deleted_cards = row_count;
  delete from public.accounts where user_id = p_user_id;
  get diagnostics deleted_accounts = row_count;
  delete from public.assets where user_id = p_user_id;
  get diagnostics deleted_assets = row_count;

  return jsonb_build_object(
    'transactions', deleted_transactions,
    'budgets', deleted_budgets,
    'cards', deleted_cards,
    'accounts', deleted_accounts,
    'assets', deleted_assets
  );
end;
$$;

revoke all on function public.admin_delete_financial_data(uuid) from public, anon;
grant execute on function public.admin_delete_financial_data(uuid) to authenticated;

notify pgrst, 'reload schema';
