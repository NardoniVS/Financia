self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data?.text() ?? '' };
  }

  event.waitUntil(self.registration.showNotification(payload.title || 'TudoOk', {
    body: payload.body || 'Você tem um lembrete financeiro.',
    icon: '/assets/tudok-icon.svg',
    badge: '/assets/tudok-icon.svg',
    data: { url: payload.url || '/' },
    tag: payload.tag || 'finology-reminder',
    renotify: false,
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const destination = new URL(event.notification.data?.url || '/', self.location.origin).href;
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
    const existing = clients.find((client) => client.url.startsWith(self.location.origin));
    return existing ? existing.focus() : self.clients.openWindow(destination);
  }));
});
