import { useCallback, useEffect, useRef, useState } from 'react';
import type { PrayerTimings } from './usePrayerTimes';

const KEY = 'prayer_reminders_v1';

export interface PrayerReminderSettings {
  enabled: boolean;
  minutesBefore: number; // 0 = at time
  alsoAtTime: boolean;
  perPrayer: Partial<Record<keyof PrayerTimings, boolean>>;
}

const DEFAULT: PrayerReminderSettings = {
  enabled: false,
  minutesBefore: 10,
  alsoAtTime: true,
  perPrayer: { Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true },
};

const NAMES_AR: Record<keyof PrayerTimings, string> = {
  Fajr: 'الفجر',
  Sunrise: 'الشروق',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء',
};

function load(): PrayerReminderSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT;
}

export function usePrayerReminders(timings?: PrayerTimings | null) {
  const [settings, setSettingsRaw] = useState<PrayerReminderSettings>(load);
  const [permission, setPermission] = useState<NotificationPermission>(() =>
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const timers = useRef<number[]>([]);

  const setSettings = useCallback((s: PrayerReminderSettings) => {
    setSettingsRaw(s);
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return 'denied' as NotificationPermission;
    const p = await Notification.requestPermission();
    setPermission(p);
    return p;
  }, []);

  const notify = useCallback((title: string, body: string) => {
    try {
      if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification(title, { body, icon: '/icon-192.png', badge: '/icon-192.png', tag: 'prayer-reminder', vibrate: [200, 100, 200] } as any).catch(() => {
            new Notification(title, { body });
          });
        }).catch(() => new Notification(title, { body }));
      } else {
        new Notification(title, { body });
      }
    } catch {}
  }, []);

  useEffect(() => {
    // clear previous timers
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
    if (!settings.enabled || !timings) return;

    const order: (keyof PrayerTimings)[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const now = new Date();
    order.forEach((k) => {
      if (!settings.perPrayer[k]) return;
      const [hh, mm] = timings[k].split(':').map(Number);
      const at = new Date(now);
      at.setHours(hh, mm, 0, 0);
      // Reminder before
      if (settings.minutesBefore > 0) {
        const before = new Date(at.getTime() - settings.minutesBefore * 60_000);
        const delta = before.getTime() - now.getTime();
        if (delta > 0 && delta < 24 * 3600_000) {
          const id = window.setTimeout(() => {
            notify(`${NAMES_AR[k]} بعد ${settings.minutesBefore} دقيقة`, `استعد لصلاة ${NAMES_AR[k]} — ${timings[k]}`);
          }, delta);
          timers.current.push(id);
        }
      }
      // At time
      if (settings.alsoAtTime) {
        const delta = at.getTime() - now.getTime();
        if (delta > 0 && delta < 24 * 3600_000) {
          const id = window.setTimeout(() => {
            notify(`حان الآن وقت ${NAMES_AR[k]}`, `الله أكبر — ${timings[k]}`);
          }, delta);
          timers.current.push(id);
        }
      }
    });

    return () => {
      timers.current.forEach((t) => clearTimeout(t));
      timers.current = [];
    };
  }, [settings, timings, notify]);

  const testNotification = useCallback(() => {
    notify('تنبيه تجريبي', 'سيظهر لك تنبيه كهذا قبل كل صلاة.');
  }, [notify]);

  return { settings, setSettings, permission, requestPermission, testNotification, NAMES_AR };
}
