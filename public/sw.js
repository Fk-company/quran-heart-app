// Lightweight service worker for offline shell + API caching + background notifications.
const CACHE_VERSION = 'quran-app-v2';
const SHELL = ['/', '/index.html', '/manifest.webmanifest', '/app-logo.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((c) => c.addAll(SHELL).catch(() => null))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('/')))
    );
    return;
  }

  if (
    url.hostname.includes('alquran.cloud') ||
    url.hostname.includes('aladhan.com') ||
    url.hostname.includes('mp3quran.net') ||
    url.hostname.includes('cdn.islamic.network')
  ) {
    event.respondWith(
      caches.open(CACHE_VERSION).then(async (cache) => {
        const cached = await cache.match(req);
        const fetchPromise = fetch(req)
          .then((res) => {
            if (res && res.ok) cache.put(req, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  if (/\.(?:js|css|woff2?|ttf|svg|png|jpg|jpeg|webp|ico)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(req).then(
        (c) =>
          c ||
          fetch(req).then((res) => {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
            return res;
          })
      )
    );
  }
});

// ---------- Background notifications ----------

const DEFAULT_ICON = '/app-logo.png';

function showNotif(title, body, tag, data) {
  return self.registration.showNotification(title, {
    body,
    icon: DEFAULT_ICON,
    badge: DEFAULT_ICON,
    dir: 'rtl',
    lang: 'ar',
    tag: tag || 'quran-app',
    renotify: true,
    requireInteraction: false,
    data: data || { url: '/' },
  });
}

// Schedule via Notification Triggers (Chrome experimental) when supported.
async function scheduleTriggered(title, body, timestamp, tag) {
  try {
    await self.registration.showNotification(title, {
      body,
      icon: DEFAULT_ICON,
      badge: DEFAULT_ICON,
      dir: 'rtl',
      lang: 'ar',
      tag,
      // @ts-ignore experimental
      showTrigger: new TimestampTrigger(timestamp),
      data: { url: '/' },
    });
    return true;
  } catch {
    return false;
  }
}

self.addEventListener('message', (event) => {
  const msg = event.data || {};
  if (msg.type === 'SHOW_NOTIFICATION') {
    event.waitUntil(showNotif(msg.title, msg.body, msg.tag, msg.data));
  } else if (msg.type === 'SCHEDULE_NOTIFICATION') {
    event.waitUntil(scheduleTriggered(msg.title, msg.body, msg.timestamp, msg.tag));
  }
});

// Push notifications (works when site is closed if a push server is configured)
self.addEventListener('push', (event) => {
  let payload = { title: 'قلب القرآن', body: 'تذكير', tag: 'push' };
  try { if (event.data) payload = { ...payload, ...event.data.json() }; } catch {}
  event.waitUntil(showNotif(payload.title, payload.body, payload.tag, payload.data));
});

// Periodic background sync — daily reminders (Chrome installed PWA)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-reminder') {
    const hour = new Date().getHours();
    const body = hour < 12
      ? 'ابدأ يومك بآية من كتاب الله 🌅'
      : hour < 18
        ? 'لا تنسَ وردك القرآني اليومي'
        : 'أذكار المساء بانتظارك';
    event.waitUntil(showNotif('قلب القرآن', body, 'daily-reminder'));
  } else if (event.tag === 'prayer-check') {
    // Could fetch prayer times and notify; placeholder
    event.waitUntil(showNotif('مواقيت الصلاة', 'تحقق من مواقيت الصلاة اليوم', 'prayer-check'));
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsArr) => {
      for (const c of clientsArr) {
        if ('focus' in c) { c.navigate(url).catch(() => null); return c.focus(); }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
