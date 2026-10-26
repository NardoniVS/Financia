-- Remove the fixed IDs used by the former demo seed. Safe to run repeatedly.
delete from public.transactions where id in ('tx-1', 'tx-2', 'tx-3', 'tx-4', 'tx-5', 'tx-6', 'tx-7');
delete from public.budgets where id in ('b-1', 'b-2', 'b-3', 'b-4');
delete from public.cards where id in ('card-1', 'card-2', 'card-3');
delete from public.accounts where id in ('acc-1', 'acc-2', 'acc-3', 'acc-4');
delete from public.assets where id in ('ast-1', 'ast-2', 'ast-3', 'ast-4', 'ast-5', 'ast-6');

alter table public.profiles drop column if exists demo_data_seeded;
