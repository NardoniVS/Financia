# TudoOk

Aplicativo de controle financeiro pessoal com Supabase para autenticação e persistência dos dados.

## Configuração do Supabase

1. Crie um projeto no Supabase.
2. No SQL Editor do projeto, execute [`supabase/migrations/20261026000000_initial_schema.sql`](supabase/migrations/20261026000000_initial_schema.sql). Se a versão antiga da demo já foi usada neste banco, execute também [`supabase/migrations/20261026010000_remove_demo_data.sql`](supabase/migrations/20261026010000_remove_demo_data.sql) para apagar somente os registros de exemplo criados por ela.
3. Copie `.env.example` para `.env.local` e preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` com os valores do projeto.
4. Em **Authentication → URL Configuration**, adicione `http://localhost:3000` à lista de URLs de redirecionamento.
5. Para login com Google, configure o provedor em **Authentication → Sign In / Providers** e cadastre no Google Cloud a URL de callback informada pelo Supabase.

O app usa Row Level Security: cada usuário só pode acessar os próprios dados.

## Perfil, foto e exclusão da conta

Para habilitar data de nascimento e fotos de perfil no Supabase, execute a migration `supabase/migrations/20261027000000_profile_settings.sql`.

Para habilitar a exclusão de contas, instale o Supabase CLI como dependência local, autentique, vincule o projeto e publique a Edge Function (requer Node.js 20 ou superior):

```powershell
npm.cmd install --save-dev supabase
npx.cmd supabase login
npx.cmd supabase link --project-ref <project-ref>
npx.cmd supabase functions deploy delete-account
```

No PowerShell do Windows, use os sufixos `.cmd` acima para evitar bloqueios de execução dos scripts `npm.ps1` e `npx.ps1`.

Encontre o `project-ref` no painel do projeto Supabase. A função valida a sessão autenticada e usa as variáveis padrão `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` do ambiente Edge; a chave administrativa não deve ser colocada no app web.

Veja o passo a passo para habilitar lembretes fora do app em [`docs/web-push-setup.md`](docs/web-push-setup.md).

## Rodar localmente

**Pré-requisito:** Node.js

```bash
npm install
npm run dev
```

O Vite inicia o app em `http://localhost:3000`.
