import { createClient } from 'npm:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

type RecurringBill = {
  id: string;
  user_id: string;
  service_name: string;
  next_billing_date: string;
};

type StoredPushSubscription = {
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

Deno.serve(async (request) => {
  if (request.method !== 'POST') return Response.json({ error: 'Método não permitido.' }, { status: 405 });

  const cronSecret = Deno.env.get('PUSH_CRON_SECRET');
  if (!cronSecret || request.headers.get('Authorization') !== `Bearer ${cronSecret}`) {
    return Response.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
  const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
  const vapidSubject = Deno.env.get('VAPID_SUBJECT');
  if (!supabaseUrl || !serviceRoleKey || !vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
    console.error('Web push reminder function is missing required server configuration.');
    return Response.json({ error: 'Serviço de notificações indisponível.' }, { status: 500 });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

  const today = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
  const tomorrowDate = new Date(`${today}T00:00:00Z`);
  tomorrowDate.setUTCDate(tomorrowDate.getUTCDate() + 1);
  const tomorrow = tomorrowDate.toISOString().slice(0, 10);

  const { data: bills, error: billsError } = await admin
    .from('subscriptions')
    .select('id,user_id,service_name,next_billing_date')
    .eq('status', 'active')
    .eq('billing_frequency', 'mensal')
    .eq('is_paid_this_month', false)
    .eq('next_billing_date', tomorrow);

  if (billsError) {
    console.error('Could not load recurring bills for push reminders:', billsError.message);
    return Response.json({ error: 'Não foi possível processar os lembretes.' }, { status: 500 });
  }

  let sent = 0;
  let failed = 0;
  for (const bill of (bills ?? []) as RecurringBill[]) {
    const { data: previousDelivery, error: deliveryLookupError } = await admin
      .from('subscription_reminder_deliveries')
      .select('sent_at')
      .eq('user_id', bill.user_id)
      .eq('subscription_id', bill.id)
      .eq('billing_date', tomorrow)
      .maybeSingle();
    if (deliveryLookupError) {
      failed++;
      console.error('Could not check reminder delivery state:', deliveryLookupError.message);
      continue;
    }
    if (previousDelivery) continue;

    const { data: devices, error: devicesError } = await admin
      .from('push_subscriptions')
      .select('user_id,endpoint,p256dh,auth')
      .eq('user_id', bill.user_id);
    if (devicesError) {
      failed++;
      console.error('Could not load push destinations:', devicesError.message);
      continue;
    }

    let billSent = 0;
    for (const device of (devices ?? []) as StoredPushSubscription[]) {
      try {
        await webpush.sendNotification({
          endpoint: device.endpoint,
          keys: { p256dh: device.p256dh, auth: device.auth },
        }, JSON.stringify({
          title: 'Conta vence amanhã',
          body: `${bill.service_name} vence em ${tomorrow.split('-').reverse().join('/')}.`,
          tag: `bill-${bill.id}-${tomorrow}`,
          url: '/',
        }), { TTL: 86_400 });
        billSent++;
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await admin.from('push_subscriptions').delete().eq('endpoint', device.endpoint);
        }
        console.error('Push delivery failed:', statusCode ?? 'unknown status');
      }
    }

    if (billSent > 0) {
      const { error } = await admin.from('subscription_reminder_deliveries').insert({
        user_id: bill.user_id,
        subscription_id: bill.id,
        billing_date: tomorrow,
      });
      if (error) {
        failed++;
        console.error('Could not record push delivery:', error.message);
      } else {
        sent += billSent;
      }
    }
  }

  return Response.json({ sent, failed, billingDate: tomorrow });
});
