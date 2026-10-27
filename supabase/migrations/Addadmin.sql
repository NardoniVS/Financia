-- Execute apenas para conceder acesso e substitua o e-mail de exemplo.
update auth.users
set raw_app_meta_data =
  coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where email = 'email-da-conta@exemplo.com'
returning id, email, raw_app_meta_data;

-- Para revogar acesso, execute esta consulta separadamente:
-- update auth.users
-- set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) - 'role'
-- where email = 'email-da-conta@exemplo.com'
-- returning id, email, raw_app_meta_data;
