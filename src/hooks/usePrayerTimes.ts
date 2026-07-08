import { useCallback, useEffect, useRef, useState } from 'react';

export interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export interface PrayerData {
  timings: PrayerTimings;
  date: { readable: string; hijri: { date: string; month: { ar: string }; year: string } };
  meta: { timezone: string; method: { name: string }; latitude: number; longitude: number };
}

export interface PrayerSettings {
  method: number;
  city?: string;
  country?: string;
  countryCode?: string;
  lat?: number;
  lng?: number;
  adjustments: Partial<Record<keyof PrayerTimings, number>>;
  changeAlerts?: boolean;
}

const SETTINGS_KEY = 'prayer_settings_v1';
const CACHE_KEY = 'prayer_cache_v1';
const PREV_TIMINGS_KEY = 'prayer_prev_timings_v1';

const DEFAULT_SETTINGS: PrayerSettings = {
  method: 4,
  adjustments: {},
  changeAlerts: true,
};

export const CALC_METHODS = [
  { id: 4, name: 'أم القرى (السعودية)' },
  { id: 3, name: 'الرابطة (مكة)' },
  { id: 5, name: 'الهيئة المصرية' },
  { id: 2, name: 'الجمعية الإسلامية لأمريكا الشمالية' },
  { id: 1, name: 'جامعة العلوم الإسلامية كراتشي' },
  { id: 8, name: 'هيئة قطر' },
  { id: 9, name: 'الكويت' },
  { id: 10, name: 'مجلس الإمارات' },
  { id: 12, name: 'اتحاد علماء أوروبا' },
  { id: 13, name: 'الديانة التركية' },
  { id: 15, name: 'مجلس الشؤون الإسلامية بلندن' },
  { id: 17, name: 'وزارة الشؤون الإسلامية بماليزيا' },
  { id: 20, name: 'وزارة الشؤون الدينية بإندونيسيا' },
  { id: 7, name: 'المعهد الجيوفيزيائي بطهران' },
];

const PRAYER_NAMES_AR: Record<keyof PrayerTimings, string> = {
  Fajr: 'الفجر',
  Sunrise: 'الشروق',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء',
};

export { PRAYER_NAMES_AR };

function loadSettings(): PrayerSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_SETTINGS;
}

function applyAdjustments(timings: PrayerTimings, adj: PrayerSettings['adjustments']): PrayerTimings {
  const out: PrayerTimings = { ...timings };
  (Object.keys(out) as (keyof PrayerTimings)[]).forEach((k) => {
    const minutes = adj[k] || 0;
    if (!minutes) return;
    const [h, m] = out[k].split(':').map(Number);
    const total = h * 60 + m + minutes;
    const nh = ((Math.floor(total / 60) % 24) + 24) % 24;
    const nm = ((total % 60) + 60) % 60;
    out[k] = `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
  });
  return out;
}

async function reverseGeocode(lat: number, lng: number): Promise<{ city?: string; country?: string; countryCode?: string }> {
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ar`);
    const j = await r.json();
    return {
      city: j.address?.city || j.address?.town || j.address?.village || j.address?.county,
      country: j.address?.country,
      countryCode: j.address?.country_code?.toUpperCase(),
    };
  } catch {
    return {};
  }
}

function fmtDate(d: Date) {
  return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
}

function normalizeTimings(t: any): PrayerTimings {
  const clean = (s: string) => (s || '').split(' ')[0]; // strip " (EET)"
  return {
    Fajr: clean(t.Fajr),
    Sunrise: clean(t.Sunrise),
    Dhuhr: clean(t.Dhuhr),
    Asr: clean(t.Asr),
    Maghrib: clean(t.Maghrib),
    Isha: clean(t.Isha),
  };
}

export interface PrayerChange {
  key: keyof PrayerTimings;
  name: string;
  before: string;
  after: string;
  diffMin: number;
}

export function usePrayerTimes() {
  const [settings, setSettings] = useState<PrayerSettings>(loadSettings);
  const [data, setData] = useState<PrayerData | null>(null);
  const [tomorrow, setTomorrow] = useState<PrayerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [changes, setChanges] = useState<PrayerChange[]>([]);
  const changeNotifiedRef = useRef(false);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const fetchDay = useCallback(async (date: Date): Promise<PrayerData> => {
    const dateStr = fmtDate(date);
    const method = settings.method;
    let url: string;
    if (settings.city && settings.country) {
      const c = encodeURIComponent(settings.city);
      const co = encodeURIComponent(settings.country);
      url = `https://api.aladhan.com/v1/timingsByCity/${dateStr}?city=${c}&country=${co}&method=${method}`;
    } else if (settings.lat != null && settings.lng != null) {
      url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${settings.lat}&longitude=${settings.lng}&method=${method}`;
    } else {
      throw new Error('حدد الدولة والمدينة أو فعّل الموقع');
    }
    const r = await fetch(url);
    if (!r.ok) throw new Error('فشل الاتصال بخدمة المواقيت');
    const j = await r.json();
    if (!j?.data?.timings) throw new Error('لم يتم العثور على مواقيت لهذه المدينة');
    const d = j.data as PrayerData;
    d.timings = normalizeTimings(d.timings);
    return d;
  }, [settings.method, settings.city, settings.country, settings.lat, settings.lng]);

  const refresh = useCallback(async (opts?: { useGeo?: boolean }) => {
    setLoading(true);
    setError(null);
    try {
      if (opts?.useGeo) {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          if (!('geolocation' in navigator)) return reject(new Error('الجهاز لا يدعم تحديد الموقع'));
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000, maximumAge: 60000 });
        });
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const geo = await reverseGeocode(lat, lng);
        setSettings((s) => ({ ...s, lat, lng, city: geo.city, country: geo.country, countryCode: geo.countryCode }));
        setLoading(false);
        return; // effect will re-run refresh with new settings
      }

      if (!settings.city && settings.lat == null) {
        setLoading(false);
        return;
      }

      const now = new Date();
      const tmrw = new Date(now.getTime() + 24 * 3600_000);
      const [todayRes, tmrwRes] = await Promise.all([fetchDay(now), fetchDay(tmrw)]);
      const adjustedToday = { ...todayRes, timings: applyAdjustments(todayRes.timings, settings.adjustments) };
      const adjustedTmrw = { ...tmrwRes, timings: applyAdjustments(tmrwRes.timings, settings.adjustments) };
      setData(adjustedToday);
      setTomorrow(adjustedTmrw);

      // Change detection vs last stored timings for same location
      try {
        const prevRaw = localStorage.getItem(PREV_TIMINGS_KEY);
        const locKey = `${settings.city || ''}|${settings.country || ''}|${settings.method}`;
        const detected: PrayerChange[] = [];
        if (prevRaw) {
          const prev = JSON.parse(prevRaw);
          if (prev?.locKey === locKey && prev?.timings) {
            (Object.keys(adjustedToday.timings) as (keyof PrayerTimings)[]).forEach((k) => {
              const a: string = prev.timings[k];
              const b: string = adjustedToday.timings[k];
              if (a && b && a !== b) {
                const [ah, am] = a.split(':').map(Number);
                const [bh, bm] = b.split(':').map(Number);
                const diff = (bh * 60 + bm) - (ah * 60 + am);
                detected.push({ key: k, name: PRAYER_NAMES_AR[k], before: a, after: b, diffMin: diff });
              }
            });
          }
        }
        setChanges(detected);
        localStorage.setItem(PREV_TIMINGS_KEY, JSON.stringify({ locKey, timings: adjustedToday.timings, at: Date.now() }));
      } catch {}

      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data: adjustedToday, tomorrow: adjustedTmrw, city: settings.city, country: settings.country }));
      } catch {}
    } catch (e: any) {
      setError(e?.message || 'حدث خطأ');
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) {
          const c = JSON.parse(raw);
          if (c?.data) setData(c.data);
          if (c?.tomorrow) setTomorrow(c.tomorrow);
        }
      } catch {}
    } finally {
      setLoading(false);
    }
  }, [fetchDay, settings.adjustments, settings.city, settings.country, settings.method, settings.lat, settings.lng]);

  useEffect(() => {
    refresh();
    changeNotifiedRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.method, settings.city, settings.country, settings.lat, settings.lng]);

  // Notify on change once per refresh cycle
  useEffect(() => {
    if (!changes.length || changeNotifiedRef.current) return;
    if (!settings.changeAlerts) return;
    changeNotifiedRef.current = true;
    try {
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        const body = changes.slice(0, 3).map(c => `${c.name}: ${c.before} ← ${c.after}`).join(' • ');
        new Notification('تغيّرت مواقيت الصلاة اليوم', { body });
      }
    } catch {}
  }, [changes, settings.changeAlerts]);

  const nextPrayer = (() => {
    if (!data) return null;
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    const order: (keyof PrayerTimings)[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    for (const k of order) {
      const [h, m] = data.timings[k].split(':').map(Number);
      const t = h * 60 + m;
      if (t > minutes) {
        return { name: PRAYER_NAMES_AR[k], key: k, time: data.timings[k], minutesUntil: t - minutes };
      }
    }
    if (tomorrow) {
      const [h, m] = tomorrow.timings.Fajr.split(':').map(Number);
      const diff = 24 * 60 - minutes + (h * 60 + m);
      return { name: PRAYER_NAMES_AR.Fajr, key: 'Fajr' as const, time: tomorrow.timings.Fajr, minutesUntil: diff };
    }
    const [h, m] = data.timings.Fajr.split(':').map(Number);
    const diff = 24 * 60 - minutes + (h * 60 + m);
    return { name: PRAYER_NAMES_AR.Fajr, key: 'Fajr' as const, time: data.timings.Fajr, minutesUntil: diff };
  })();

  const dismissChanges = useCallback(() => setChanges([]), []);

  return {
    settings,
    setSettings,
    data,
    tomorrow,
    loading,
    error,
    refresh,
    nextPrayer,
    changes,
    dismissChanges,
  };
}
