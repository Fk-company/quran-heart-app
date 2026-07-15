// Service worker: offline shell + API caching + background notifications (survives page close).
const CACHE_VERSION = 'quran-app-v4';
const SHELL = ['/', '/index.html', '/manifest.webmanifest', '/app-logo.png', '/404.html'];
const DEFAULT_ICON = '/app-logo.png';

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_VERSION).then((c) => c.addAll(SHELL).catch(() => null)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)));
    await self.clients.claim();
    // Re-schedule all persisted reminders on every SW wake-up.
    try { await rescheduleAll(); } catch {}
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then((c) => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then((r) => r || caches.match('/')))
    );
    return;
  }

  if (
    url.hostname.includes('alquran.cloud') ||
    url.hostname.includes('aladhan.com') ||
    url.hostname.includes('mp3quran.net') ||
    url.hostname.includes('cdn.islamic.network')
  ) {
    event.respondWith(caches.open(CACHE_VERSION).then(async (cache) => {
      const cached = await cache.match(req);
      const fetchPromise = fetch(req).then((res) => {
        if (res && res.ok) cache.put(req, res.clone());
        return res;
      }).catch(() => cached);
      return cached || fetchPromise;
    }));
    return;
  }

  if (/\.(?:js|css|woff2?|ttf|svg|png|jpg|jpeg|webp|ico)$/.test(url.pathname)) {
    event.respondWith(caches.match(req).then(
      (c) => c || fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
        return res;
      })
    ));
  }
});

// ---------- IndexedDB (tiny keyval) ----------
function idb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('quran-notif', 1);
    req.onupgradeneeded = () => req.result.createObjectStore('kv');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function idbGet(key) {
  try {
    const db = await idb();
    return await new Promise((res, rej) => {
      const tx = db.transaction('kv', 'readonly');
      const r = tx.objectStore('kv').get(key);
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
  } catch { return null; }
}
async function idbSet(key, val) {
  try {
    const db = await idb();
    await new Promise((res, rej) => {
      const tx = db.transaction('kv', 'readwrite');
      tx.objectStore('kv').put(val, key);
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
  } catch {}
}

// ---------- Notification helpers ----------
function showNotif(title, body, tag, data, extra) {
  return self.registration.showNotification(title, {
    body,
    icon: DEFAULT_ICON,
    badge: DEFAULT_ICON,
    dir: 'rtl',
    lang: 'ar',
    tag: tag || 'quran-app',
    renotify: true,
    requireInteraction: !!(extra && extra.requireInteraction),
    vibrate: [300, 150, 300, 150, 300],
    data: data || { url: '/' },
    ...(extra || {}),
  });
}

async function scheduleTriggered(title, body, timestamp, tag, data, extra) {
  try {
    if (typeof TimestampTrigger === 'undefined') return false;
    await self.registration.showNotification(title, {
      body, icon: DEFAULT_ICON, badge: DEFAULT_ICON, dir: 'rtl', lang: 'ar', tag,
      renotify: true, requireInteraction: !!(extra && extra.requireInteraction),
      vibrate: [300, 150, 300, 150, 300],
      // @ts-ignore experimental — fires with browser closed on supported Chromium
      showTrigger: new TimestampTrigger(timestamp),
      data: data || { url: '/' },
    });
    return true;
  } catch { return false; }
}

const scheduledTimers = new Map();
function scheduleFallback(title, body, timestamp, tag, data, extra) {
  const delay = Math.max(0, timestamp - Date.now());
  if (scheduledTimers.has(tag)) clearTimeout(scheduledTimers.get(tag));
  if (delay > 2147483647) return false;
  const id = setTimeout(() => {
    scheduledTimers.delete(tag);
    showNotif(title, body, tag, data, extra);
  }, delay);
  scheduledTimers.set(tag, id);
  return true;
}

// ---------- Persisted schedule (survives page close) ----------
// schedule = {
//   prayer: { times: {Fajr:"04:30",...}, tz, adhanUrl, earlyMinutes, enabled, perPrayer }
//   daily:  [{ tag, hhmm, title, body, tz }]
// }

function msUntilInTz(hhmm, tz) {
  const [h, m] = hhmm.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return -1;
  let nowH, nowM, nowS;
  try {
    if (tz) {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: tz, hour12: false,
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      }).formatToParts(new Date());
      const o = {}; parts.forEach(p => { o[p.type] = p.value; });
      nowH = (parseInt(o.hour, 10) || 0) % 24;
      nowM = parseInt(o.minute, 10) || 0;
      nowS = parseInt(o.second, 10) || 0;
    } else {
      const d = new Date(); nowH = d.getHours(); nowM = d.getMinutes(); nowS = d.getSeconds();
    }
  } catch {
    const d = new Date(); nowH = d.getHours(); nowM = d.getMinutes(); nowS = d.getSeconds();
  }
  const nowSec = nowH * 3600 + nowM * 60 + nowS;
  const target = h * 3600 + m * 60;
  let diff = (target - nowSec) * 1000;
  if (diff <= 0) diff += 86400000;
  return diff;
}

async function rescheduleAll() {
  const sched = await idbGet('schedule');
  if (!sched) return;
  const DAY = 86400000;

  // Prayer
  if (sched.prayer && sched.prayer.enabled && sched.prayer.times) {
    const { times, tz, adhanUrl, earlyMinutes = 0, perPrayer = {} } = sched.prayer;
    const namesAr = { Fajr: 'الفجر', Dhuhr: 'الظهر', Asr: 'العصر', Maghrib: 'المغرب', Isha: 'العشاء' };
    for (const key of Object.keys(namesAr)) {
      if (perPrayer[key] === false) continue;
      const time = times[key];
      if (!time) continue;
      const base = msUntilInTz(time, tz);
      if (base <= 0) continue;
      const name = namesAr[key];
      for (let d = 0; d < 14; d++) {
        const onTs = Date.now() + base + d * DAY;
        const dayTag = `prayer-${key}-d${d}`;
        const data = { url: '/?adhan=1', adhan: true, adhanUrl: adhanUrl || '', prayer: key };
        // early reminder
        if (earlyMinutes > 0) {
          const eTs = onTs - earlyMinutes * 60000;
          if (eTs > Date.now() + 5000) {
            const t = `${dayTag}-early`;
            const ok = await scheduleTriggered('تذكير بالصلاة', `صلاة ${name} بعد ${earlyMinutes} دقيقة`, eTs, t, { url: '/' });
            if (!ok && d === 0) scheduleFallback('تذكير بالصلاة', `صلاة ${name} بعد ${earlyMinutes} دقيقة`, eTs, t, { url: '/' });
          }
        }
        // on-time (with adhan)
        const t = `${dayTag}-on`;
        const ok = await scheduleTriggered('حان وقت الصلاة', `حان الآن وقت صلاة ${name} — افتح لتشغيل الأذان`, onTs, t, data, { requireInteraction: true });
        if (!ok && d === 0) scheduleFallback('حان وقت الصلاة', `حان الآن وقت صلاة ${name} — افتح لتشغيل الأذان`, onTs, t, data, { requireInteraction: true });
      }
    }
  }

  // Daily reminders (wird, khatirah, etc.)
  if (Array.isArray(sched.daily)) {
    for (const item of sched.daily) {
      const base = msUntilInTz(item.hhmm, item.tz);
      if (base <= 0) continue;
      for (let d = 0; d < 14; d++) {
        const ts = Date.now() + base + d * DAY;
        const tag = `${item.tag}-d${d}`;
        const ok = await scheduleTriggered(item.title, item.body, ts, tag, { url: '/' });
        if (!ok && d === 0) scheduleFallback(item.title, item.body, ts, tag, { url: '/' });
      }
    }
  }
}

// ---------- Messages from the page ----------
self.addEventListener('message', (event) => {
  const msg = event.data || {};
  if (msg.type === 'SHOW_NOTIFICATION') {
    event.waitUntil(showNotif(msg.title, msg.body, msg.tag, msg.data));
  } else if (msg.type === 'SCHEDULE_NOTIFICATION') {
    event.waitUntil((async () => {
      const ok = await scheduleTriggered(msg.title, msg.body, msg.timestamp, msg.tag, msg.data);
      if (!ok) scheduleFallback(msg.title, msg.body, msg.timestamp, msg.tag, msg.data);
    })());
  } else if (msg.type === 'SET_SCHEDULE') {
    event.waitUntil((async () => {
      await idbSet('schedule', msg.schedule || {});
      await rescheduleAll();
    })());
  } else if (msg.type === 'CLEAR_SCHEDULE') {
    event.waitUntil(idbSet('schedule', null));
  } else if (msg.type === 'RESCHEDULE') {
    event.waitUntil(rescheduleAll());
  } else if (msg.type === 'PRECACHE_URLS' && Array.isArray(msg.urls)) {
    event.waitUntil((async () => {
      const cache = await caches.open(CACHE_VERSION);
      let done = 0;
      const total = msg.urls.length;
      for (const url of msg.urls) {
        try {
          const res = await fetch(url, { cache: 'no-store' });
          if (res && res.ok) await cache.put(url, res.clone());
        } catch {}
        done++;
        if (event.source && done % 5 === 0) {
          try { event.source.postMessage({ type: 'PRECACHE_PROGRESS', done, total }); } catch {}
        }
      }
      if (event.source) {
        try { event.source.postMessage({ type: 'PRECACHE_DONE', done, total }); } catch {}
      }
    })());
  }
});

// Push notifications (if push server is configured)
self.addEventListener('push', (event) => {
  let payload = { title: 'قلب القرآن', body: 'تذكير', tag: 'push' };
  try { if (event.data) payload = { ...payload, ...event.data.json() }; } catch {}
  event.waitUntil(showNotif(payload.title, payload.body, payload.tag, payload.data));
});

// Periodic background sync — re-schedule daily to survive across days.
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-reminder' || event.tag === 'reschedule') {
    event.waitUntil(rescheduleAll());
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const url = data.url || '/';
  event.waitUntil((async () => {
    const clientsArr = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of clientsArr) {
      if ('focus' in c) {
        try { await c.navigate(url); } catch {}
        try { c.postMessage({ type: 'NOTIFICATION_CLICK', data }); } catch {}
        return c.focus();
      }
    }
    if (self.clients.openWindow) return self.clients.openWindow(url);
  })());
});
