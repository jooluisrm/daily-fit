self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const title = event.data.payload.title || 'Daily Fit';
    const options = {
      body: event.data.payload.body,
      icon: '/favicon.ico',
      vibrate: [200, 100, 200, 100, 200], // Ding-Ding-Ding!
      tag: 'timer-notification', // Evita spam de notificações duplicadas
      requireInteraction: true // A notificação fica na tela até o usuário clicar nela (útil para cronômetro)
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  // Quando clica, tenta focar o aplicativo
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow('/');
    })
  );
});
