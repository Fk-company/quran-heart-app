import { useEffect, useRef, useCallback } from 'react';

const ICON = '/app-logo.png';

async function getSWReg(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    return (await navigator.serviceWorker.ready) || null;
  } catch {
    return null;
  }
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

    // Try to enable periodic background sync so reminders run even when site is closed.
    if (result === 'granted') {
      try {
        const reg: any = await getSWReg();
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
    const reg = await getSWReg();
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

  const schedulePrayerNotification = useCallback(async (prayerName: string, timeStr: string) => {
    if (permissionRef.current !== 'granted') return;
    const [h, m] = timeStr.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return;
    const now = new Date();
    const prayerTime = new Date();
    prayerTime.setHours(h, m, 0, 0);
    const diff = prayerTime.getTime() - now.getTime();
    if (diff <= 0 || diff > 86400000) return;

    const reg: any = await getSWReg();

    // Try Notification Triggers via SW (fires even when tab is closed, Chrome)
    const trySchedule = async (ts: number, title: string, body: string, tag: string) => {
      if (reg && 'showTrigger' in Notification.prototype === false) {
        // Some browsers expose TimestampTrigger globally
      }
      try {
        // @ts-ignore experimental
        if (typeof TimestampTrigger !== 'undefined' && reg) {
          await reg.showNotification(title, {
            body,
            icon: ICON,
            badge: ICON,
            dir: 'rtl',
            lang: 'ar',
            tag,
            // @ts-ignore
            showTrigger: new TimestampTrigger(ts),
          });
          return true;
        }
      } catch {}
      return false;
    };

    const earlyTs = Date.now() + (diff - 5 * 60 * 1000);
    const onTs = Date.now() + diff;

    const earlyScheduled = earlyTs > Date.now()
      ? await trySchedule(earlyTs, 'تذكير بالصلاة', `صلاة ${prayerName} بعد 5 دقائق`, `prayer-${prayerName}-early`)
      : true;
    const onScheduled = await trySchedule(onTs, 'حان وقت الصلاة', `حان الآن وقت صلاة ${prayerName}`, `prayer-${prayerName}`);

    // Fallback: setTimeout (works only while tab is open)
    if (!earlyScheduled && earlyTs > Date.now()) {
      setTimeout(() => sendNotification('تذكير بالصلاة', `صلاة ${prayerName} بعد 5 دقائق`), earlyTs - Date.now());
    }
    if (!onScheduled) {
      setTimeout(() => sendNotification('حان وقت الصلاة', `حان الآن وقت صلاة ${prayerName}`), diff);
    }
  }, [sendNotification]);

  const sendAdhkarReminder = useCallback(() => {
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
    sendAdhkarReminder,
    isSupported: 'Notification' in window,
    permission: permissionRef.current,
  };
};
