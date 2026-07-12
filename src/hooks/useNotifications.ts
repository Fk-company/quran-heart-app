import { useEffect, useRef, useCallback } from 'react';
import { getNotificationSettings, playAdhan, MUEZZINS } from './useNotificationSettings';

const ICON = '/app-logo.png';

async function getSWReg(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    return (await navigator.serviceWorker.ready) || null;
  } catch {
    return null;
  }
}

async function ensureServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    return reg || await navigator.serviceWorker.register('/sw.js');
  } catch { return getSWReg(); }
}

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

// Deduplicate: prevent re-scheduling the same tag more than once per day.
function alreadyScheduled(tag: string): boolean {
  try {
    const key = `notif_scheduled:${tag}:${todayKey()}`;
    if (localStorage.getItem(key)) return true;
    localStorage.setItem(key, '1');
    // Cleanup old keys
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && k.startsWith('notif_scheduled:') && !k.endsWith(`:${todayKey()}`)) {
        localStorage.removeItem(k);
      }
    }
    return false;
  } catch {
    return false;
  }
}

// Compute ms from now until a HH:MM wall-clock time in a given IANA timezone.
function msUntilTimeInTz(hhmm: string, tz?: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return -1;
  let nowH: number, nowM: number, nowS: number;
  try {
    if (tz) {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: tz, hour12: false,
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      }).formatToParts(new Date());
      const o: Record<string, string> = {};
      parts.forEach(p => { o[p.type] = p.value; });
      nowH = (parseInt(o.hour, 10) || 0) % 24;
      nowM = parseInt(o.minute, 10) || 0;
      nowS = parseInt(o.second, 10) || 0;
    } else {
      const d = new Date();
      nowH = d.getHours(); nowM = d.getMinutes(); nowS = d.getSeconds();
    }
  } catch {
    const d = new Date();
    nowH = d.getHours(); nowM = d.getMinutes(); nowS = d.getSeconds();
  }
  const nowSec = nowH * 3600 + nowM * 60 + nowS;
  const target = h * 3600 + m * 60;
  let diff = (target - nowSec) * 1000;
  if (diff <= 0) diff += 86400000;
  return diff;
}

// Process-level timer registry: clear previous timers for the same tag.
const timerRegistry: Map<string, number> = (window as any).__lovableNotifTimers || new Map();
(window as any).__lovableNotifTimers = timerRegistry;

function setTaggedTimeout(tag: string, ms: number, fn: () => void) {
  const prev = timerRegistry.get(tag);
  if (prev) clearTimeout(prev);
  const id = window.setTimeout(() => {
    timerRegistry.delete(tag);
    fn();
  }, ms);
  timerRegistry.set(tag, id);
}

async function scheduleInServiceWorker(title: string, body: string, timestamp: number, tag: string, data?: any) {
  const reg = await ensureServiceWorker();
  if (!reg) return false;
  const sw = reg.active || reg.waiting || reg.installing;
  if (!sw) return false;
  sw.postMessage({ type: 'SCHEDULE_NOTIFICATION', title, body, timestamp, tag, data });
  return true;
}

async function showViaServiceWorker(title: string, body: string, tag: string, data?: any) {
  const reg = await ensureServiceWorker();
  if (!reg) return false;
  try {
    const options: any = { body, icon: ICON, badge: ICON, dir: 'rtl', lang: 'ar', tag, renotify: true, data: data || { url: '/' } };
    await reg.showNotification(title, options);
    return true;
  } catch { return false; }
}

export const useNotifications = () => {
  const permissionRef = useRef<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      permissionRef.current = Notification.permission;
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return false;
    const result = await Notification.requestPermission();
    permissionRef.current = result;

    if (result === 'granted') {
      try {
        const reg: any = await ensureServiceWorker();
        if (reg && 'periodicSync' in reg) {
          const status = await (navigator as any).permissions?.query({
            name: 'periodic-background-sync' as any,
          });
          if (!status || status.state === 'granted') {
            await reg.periodicSync.register('daily-reminder', {
              minInterval: 12 * 60 * 60 * 1000,
            });
          }
        }
      } catch {/* unsupported */}
    }
    return result === 'granted';
  }, []);

  const sendNotification = useCallback(async (title: string, body: string, icon?: string) => {
    if (permissionRef.current !== 'granted') return;
    const reg = await ensureServiceWorker();
    const options: NotificationOptions = {
      body,
      icon: icon || ICON,
      badge: ICON,
      dir: 'rtl',
      lang: 'ar',
      tag: 'quran-app',
    };
    try {
      if (reg) {
        await reg.showNotification(title, options);
      } else {
        new Notification(title, options);
      }
    } catch {}
  }, []);

  const schedulePrayerNotification = useCallback(async (prayerName: string, timeStr: string, tz?: string) => {
    if (permissionRef.current !== 'granted') return;
    const ns = getNotificationSettings();
    if (!ns.enabled || !ns.prayerEnabled) return;

    const baseDiff = msUntilTimeInTz(timeStr, tz);
    if (baseDiff <= 0) return;

    const tagBase = `prayer-${prayerName}`;
    alreadyScheduled(tagBase);

    const reg: any = await ensureServiceWorker();
    const earlyMin = ns.prayerEarlyMinutes;

    const trySchedule = async (ts: number, title: string, body: string, tag: string) => {
      try {
        // @ts-ignore experimental — fires even with browser closed (Chrome/Edge)
        if (typeof TimestampTrigger !== 'undefined' && reg) {
          await reg.showNotification(title, {
            body, icon: ICON, badge: ICON, dir: 'rtl', lang: 'ar', tag,
            // @ts-ignore
            showTrigger: new TimestampTrigger(ts),
          });
          return true;
        }
      } catch {}
      return false;
    };

    // Pre-schedule for the next 7 days so reminders keep firing even when the tab is closed.
    const DAY = 86400000;
    for (let d = 0; d < 7; d++) {
      const dayOffset = d * DAY;
      const diff = baseDiff + dayOffset;
      const onTs = Date.now() + diff;
      const dayTag = d === 0 ? tagBase : `${tagBase}-d${d}`;

      if (earlyMin > 0) {
        const earlyTs = onTs - earlyMin * 60 * 1000;
        if (earlyTs > Date.now()) {
          const ok = await trySchedule(earlyTs, 'تذكير بالصلاة', `صلاة ${prayerName} بعد ${earlyMin} دقيقة`, `${dayTag}-early`);
          if (!ok && d === 0) {
            await scheduleInServiceWorker('تذكير بالصلاة', `صلاة ${prayerName} بعد ${earlyMin} دقيقة`, earlyTs, `${dayTag}-early`, { url: '/' });
            setTaggedTimeout(`${dayTag}-early`, earlyTs - Date.now(),
              () => sendNotification('تذكير بالصلاة', `صلاة ${prayerName} بعد ${earlyMin} دقيقة`));
          }
        }
      }

      const backed = await trySchedule(onTs, 'حان وقت الصلاة', `حان الآن وقت صلاة ${prayerName}`, `${dayTag}-os`);
      if (!backed && d === 0) {
        // First-day fallback: in-tab timer (plays adhan) + SW timer backup.
        setTaggedTimeout(tagBase, diff, () => {
          sendNotification('حان وقت الصلاة', `حان الآن وقت صلاة ${prayerName}`);
          playAdhan();
        });
        await scheduleInServiceWorker('حان وقت الصلاة', `حان الآن وقت صلاة ${prayerName} — افتح التطبيق لتشغيل الأذان`, onTs, `${tagBase}-os`, { url: '/' });
      } else if (d === 0) {
        // Even when OS trigger is used, also play adhan in-tab if user is here.
        setTaggedTimeout(`${tagBase}-adhan`, diff, () => playAdhan());
      }
    }
  }, [sendNotification]);

  // Push the full prayer schedule + adhan URL to the SW so it can re-schedule
  // reminders across days even while the page is closed.
  const syncPrayerSchedule = useCallback(async (
    times: Record<string, string> | null | undefined,
    tz?: string,
  ) => {
    if (!('serviceWorker' in navigator)) return;
    const reg = await ensureServiceWorker();
    const sw = reg && (reg.active || reg.waiting || reg.installing);
    if (!sw) return;
    const ns = getNotificationSettings();
    const adhanUrl = (MUEZZINS.find(m => m.id === ns.adhanMuezzin) || MUEZZINS[0]).url;
    const cleanTimes: Record<string, string> = {};
    if (times) for (const k of Object.keys(times)) cleanTimes[k] = (times[k] || '').split(' ')[0];
    sw.postMessage({
      type: 'SET_SCHEDULE',
      schedule: {
        prayer: {
          enabled: !!(ns.enabled && ns.prayerEnabled && times),
          times: cleanTimes,
          tz,
          adhanUrl: ns.adhanAudio ? adhanUrl : '',
          earlyMinutes: ns.prayerEarlyMinutes || 0,
          perPrayer: { Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true },
        },
        daily: [
          ns.wirdReminder && ns.wirdTime ? { tag: 'wird', hhmm: ns.wirdTime, title: 'وردك اليومي', body: 'حان وقت وردك القرآني', tz } : null,
        ].filter(Boolean),
      },
    });
    // Also register periodic sync so the SW wakes up daily to re-schedule.
    try {
      const anyReg: any = reg;
      if (anyReg && 'periodicSync' in anyReg) {
        const status = await (navigator as any).permissions?.query({ name: 'periodic-background-sync' as any });
        if (!status || status.state === 'granted') {
          await anyReg.periodicSync.register('reschedule', { minInterval: 12 * 60 * 60 * 1000 });
        }
      }
    } catch {}
  }, []);

  const scheduleDailyReminder = useCallback(async (
    hhmm: string, title: string, body: string, tag: string, tz?: string,
  ) => {
    if (permissionRef.current !== 'granted') return;
    alreadyScheduled(tag); // cleanup marker only; tagged timers replace older schedules.
    const diff = msUntilTimeInTz(hhmm, tz);
    if (diff <= 0) return;
    const ts = Date.now() + diff;
    const reg: any = await ensureServiceWorker();
    try {
      // @ts-ignore experimental
      if (typeof TimestampTrigger !== 'undefined' && reg) {
        await reg.showNotification(title, {
          body, icon: ICON, badge: ICON, dir: 'rtl', lang: 'ar', tag,
          // @ts-ignore
          showTrigger: new TimestampTrigger(ts),
        });
        return;
      }
    } catch {}
    await scheduleInServiceWorker(title, body, ts, tag, { url: '/' });
    setTaggedTimeout(tag, diff, () => sendNotification(title, body));
  }, [sendNotification]);

  const sendAdhkarReminder = useCallback(() => {
    const ns = getNotificationSettings();
    if (!ns.enabled || !ns.adhkarEnabled) return;
    try {
      const last = parseInt(localStorage.getItem('notif_adhkar_last') || '0', 10);
      if (Date.now() - last < ns.adhkarHours * 60 * 60 * 1000) return;
      localStorage.setItem('notif_adhkar_last', String(Date.now()));
    } catch {}
    const adhkarMessages = [
      'لا تنسَ أذكار الصباح',
      'لا تنسَ أذكار المساء',
      'سبحان الله وبحمده سبحان الله العظيم',
      'لا حول ولا قوة إلا بالله',
    ];
    const hour = new Date().getHours();
    const msg = hour < 12 ? adhkarMessages[0] : hour < 18 ? adhkarMessages[1] : adhkarMessages[2];
    sendNotification('تذكير بالأذكار', msg);
  }, [sendNotification]);

  return {
    requestPermission,
    sendNotification,
    schedulePrayerNotification,
    scheduleDailyReminder,
    sendAdhkarReminder,
    syncPrayerSchedule,
    isSupported: 'Notification' in window,
    permission: permissionRef.current,
  };
};
