export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export function sendPushNotification(title: string, body: string) {
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      // Usa o service worker para exibir a notificação (funciona melhor em PWA/Mobile)
      if (registration.active) {
        registration.active.postMessage({
          type: 'SHOW_NOTIFICATION',
          payload: { title, body }
        });
      } else {
        // Fallback para Web Notification API normal se o SW não estiver ativo
        new Notification(title, { body, icon: '/favicon.ico' });
      }
    }).catch(() => {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/favicon.ico' });
      }
    });
  } else if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.ico' });
  }
}
