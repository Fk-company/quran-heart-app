import { useState, useEffect, useCallback } from 'react';

export interface NotificationSettings {
  enabled: boolean;
  prayerEnabled: boolean;
  prayerEarlyMinutes: number; // minutes before prayer
  adhanAudio: boolean;
  adhanMuezzin: string; // url id
  adhkarEnabled: boolean;
  adhkarHours: number; // every X hours
  wirdReminder: boolean;
  wirdTime: string; // HH:MM
  challengeReminder: boolean;
  quietHoursEnabled: boolean;
  quietStart: string; // HH:MM
  quietEnd: string; // HH:MM
}

const DEFAULTS: NotificationSettings = {
  enabled: true,
  prayerEnabled: true,
  prayerEarlyMinutes: 5,
  adhanAudio: true,
  adhanMuezzin: 'mishary',
  adhkarEnabled: true,
  adhkarHours: 6,
  wirdReminder: true,
  wirdTime: '20:00',
  challengeReminder: true,
  quietHoursEnabled: false,
  quietStart: '23:00',
  quietEnd: '06:00',
};

const KEY = 'notification_settings';

export const MUEZZINS = [
  { id: 'mishary', name: 'مشاري العفاسي', url: 'https://www.islamcan.com/audio/adhan/azan2.mp3' },
  { id: 'madinah', name: 'الحرم المدني', url: 'https://www.islamcan.com/audio/adhan/azan8.mp3' },
  { id: 'makkah', name: 'الحرم المكي', url: 'https://www.islamcan.com/audio/adhan/azan10.mp3' },
  { id: 'naqshbandi', name: 'النقشبندي', url: 'https://www.islamcan.com/audio/adhan/azan9.mp3' },
  { id: 'egyptian', name: 'الأذان المصري', url: 'https://www.islamcan.com/audio/adhan/azan3.mp3' },
  { id: 'turkish', name: 'الأذان التركي', url: 'https://www.islamcan.com/audio/adhan/azan4.mp3' },
  { id: 'short', name: 'أذان قصير', url: 'https://www.islamcan.com/audio/adhan/azan1.mp3' },
];

export function getNotificationSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem(KEY);
    return { ...DEFAULTS, ...(raw ? JSON.parse(raw) : {}) };
  } catch { return DEFAULTS; }
}

export function useNotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>(getNotificationSettings);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(settings));
      localStorage.setItem('notifications_enabled', settings.enabled ? 'true' : 'false');
    } catch {}
  }, [settings]);

  const update = useCallback(<K extends keyof NotificationSettings>(key: K, value: NotificationSettings[K]) => {
    setSettings(s => ({ ...s, [key]: value }));
  }, []);

  const reset = useCallback(() => setSettings(DEFAULTS), []);

  return { settings, update, reset };
}

// Helper used by useNotifications to play adhan when a prayer time fires.
let _adhanAudio: HTMLAudioElement | null = null;
export function playAdhan() {
  try {
    const s = getNotificationSettings();
    if (!s.adhanAudio) return;
    // Quiet hours check
    if (s.quietHoursEnabled && isInQuietHours(s.quietStart, s.quietEnd)) return;
    const m = MUEZZINS.find(x => x.id === s.adhanMuezzin) || MUEZZINS[0];
    if (_adhanAudio) { try { _adhanAudio.pause(); } catch {} }
    _adhanAudio = new Audio(m.url);
    _adhanAudio.volume = 0.85;
    _adhanAudio.play().catch(() => {});
  } catch {}
}

export function stopAdhan() {
  if (_adhanAudio) { try { _adhanAudio.pause(); _adhanAudio.currentTime = 0; } catch {} }
}

function isInQuietHours(start: string, end: string): boolean {
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const s = sh * 60 + sm, e = eh * 60 + em;
  if (s === e) return false;
  return s < e ? (cur >= s && cur < e) : (cur >= s || cur < e);
}
