# Configurar notificações push

O recurso permite avisos de vencimento mesmo com o app fechado, desde que o usuário autorize as notificações no navegador. Em iPhone e iPad, é necessário adicionar o site à Tela de Início. Em computador e Android, é preciso usar um navegador compatível com Web Push.

## Configuração do Supabase

1. Execute a migration `supabase/migrations/20261027010000_web_push_notifications.sql` no SQL Editor.
2. Gere um par VAPID localmente com `npx.cmd web-push generate-vapid-keys --json` (o comando pode solicitar a instalação temporária do pacote). Mantenha a chave privada fora do repositório.
3. Em **Project Settings → Edge Functions → Secrets**, configure `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (por exemplo, `mailto:suporte@dozecloud.com.br`) e `PUSH_CRON_SECRET`. O segredo de cron deve ser aleatório e forte.
4. Publique a função com `npx.cmd supabase functions deploy send-recurring-bill-reminders`.
5. No Supabase Cron, crie uma chamada HTTP horária para `https://<project-ref>.supabase.co/functions/v1/send-recurring-bill-reminders`, usando `POST`, corpo `{}` e os cabeçalhos `Authorization: Bearer <PUSH_CRON_SECRET>` e `apikey: <publishable-key>`. Use no cabeçalho o mesmo segredo configurado na Edge Function.

## Configuração do frontend

Adicione `VITE_WEB_PUSH_PUBLIC_KEY` com a chave pública VAPID nas variáveis de build local e do site hospedado. Essa chave pode ficar no frontend. Nunca exponha a chave privada.

Depois de publicar o frontend, o usuário toca em **Ativar notificações** na seção Contas Recorrentes para autorizar aquele dispositivo. O agendador verifica, no fuso de São Paulo, as contas mensais que vencem no dia seguinte e registra a entrega para não repetir o mesmo aviso para aquela conta e data.

A entrega final depende do navegador e do sistema operacional aceitarem a notificação. Se o usuário negar a permissão, deverá habilitá-la nas configurações do navegador ou do dispositivo.
