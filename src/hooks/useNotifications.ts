import { useEffect, useRef, useCallback } from 'react';

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
    return result === 'granted';
  }, []);

  const sendNotification = useCallback((title: string, body: string, icon?: string) => {
    if (permissionRef.current !== 'granted') return;
    try {
      new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        badge: '/favicon.ico',
        dir: 'rtl',
        lang: 'ar',
        tag: 'quran-app',
      });
    } catch {}
  }, []);

  const schedulePrayerNotification = useCallback((prayerName: string, timeStr: string) => {
    if (permissionRef.current !== 'granted') return;
    const [h, m] = timeStr.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return;
    const now = new Date();
    const prayerTime = new Date();
    prayerTime.setHours(h, m, 0, 0);
    const diff = prayerTime.getTime() - now.getTime();
    if (diff > 0 && diff < 86400000) {
      // 5 minutes before
      const earlyDiff = diff - 300000;
      if (earlyDiff > 0) {
        setTimeout(() => {
          sendNotification('تذكير بالصلاة', `صلاة ${prayerName} بعد 5 دقائق`);
        }, earlyDiff);
      }
      setTimeout(() => {
        sendNotification('حان وقت الصلاة', `حان الآن وقت صلاة ${prayerName}`);
      }, diff);
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
