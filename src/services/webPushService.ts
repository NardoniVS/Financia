import { getSupabase } from '../lib/supabase';

const vapidPublicKey = import.meta.env.VITE_WEB_PUSH_PUBLIC_KEY as string | undefined;

export const webPushSupported = () =>
  typeof window !== 'undefined' &&
  window.isSecureContext &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window;

const decodeVapidKey = (key: string) => {
  const padding = '='.repeat((4 - key.length % 4) % 4);
  const base64 = (key + padding).replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(window.atob(base64), (character) => character.charCodeAt(0));
};

const saveSubscription = async (subscription: PushSubscription) => {
  const client = getSupabase();
  const { data: { user }, error: userError } = await client.auth.getUser();
  if (userError || !user) throw new Error('Entre na sua conta para ativar os lembretes.');

  const json = subscription.toJSON();
  if (!json.keys?.p256dh || !json.keys.auth) throw new Error('Não foi possível registrar este dispositivo.');

  const { error } = await client.from('push_subscriptions').upsert({
    user_id: user.id,
    endpoint: subscription.endpoint,
    p256dh: json.keys.p256dh,
    auth: json.keys.auth,
  }, { onConflict: 'endpoint' });
  if (error) throw new Error('Não foi possível salvar a autorização de notificações.');
};

export async function hasActiveWebPushSubscription() {
  if (!webPushSupported() || Notification.permission !== 'granted') return false;
  const registration = await navigator.serviceWorker.getRegistration('/');
  return Boolean(await registration?.pushManager.getSubscription());
}

export async function enableWebPushNotifications() {
  if (!webPushSupported()) throw new Error('Este navegador não oferece notificações web neste dispositivo.');
  if (!vapidPublicKey) throw new Error('As notificações ainda não foram configuradas no servidor.');

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Permita notificações do site nas configurações do navegador.');

  const registration = await navigator.serviceWorker.register('/service-worker.js', { scope: '/' });
  const subscription = await registration.pushManager.getSubscription() ?? await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: decodeVapidKey(vapidPublicKey),
  });
  await saveSubscription(subscription);
}

export async function disableWebPushNotifications() {
  if (!webPushSupported()) return;
  const registration = await navigator.serviceWorker.getRegistration('/');
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) return;

  const client = getSupabase();
  const { data: { user } } = await client.auth.getUser();
  if (user) {
    const { error } = await client.from('push_subscriptions').delete().eq('user_id', user.id).eq('endpoint', subscription.endpoint);
    if (error) throw new Error('Não foi possível remover o dispositivo da lista de lembretes.');
  }
  await subscription.unsubscribe();
}
