import { useCallback, useEffect, useState } from 'react';

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
  method: number; // calculation method
  city?: string;
  country?: string;
  lat?: number;
  lng?: number;
  adjustments: Partial<Record<keyof PrayerTimings, number>>; // minutes
}

const SETTINGS_KEY = 'prayer_settings_v1';
const CACHE_KEY = 'prayer_cache_v1';

const DEFAULT_SETTINGS: PrayerSettings = {
  method: 4, // Umm Al-Qura
  adjustments: {},
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

async function reverseGeocode(lat: number, lng: number): Promise<{ city?: string; country?: string }> {
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ar`);
    const j = await r.json();
    return {
      city: j.address?.city || j.address?.town || j.address?.village || j.address?.county,
      country: j.address?.country,
    };
  } catch {
    return {};
  }
}

export function usePrayerTimes() {
  const [settings, setSettings] = useState<PrayerSettings>(loadSettings);
  const [data, setData] = useState<PrayerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const fetchByCoords = useCallback(async (lat: number, lng: number, method: number) => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const url = `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${lat}&longitude=${lng}&method=${method}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error('فشل جلب المواقيت');
    const j = await r.json();
    return j.data as PrayerData;
  }, []);

  const refresh = useCallback(async (opts?: { useGeo?: boolean }) => {
    setLoading(true);
    setError(null);
    try {
      let lat = settings.lat;
      let lng = settings.lng;
      let city = settings.city;
      let country = settings.country;

      if (opts?.useGeo || (!lat && !lng)) {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          if (!('geolocation' in navigator)) return reject(new Error('الجهاز لا يدعم تحديد الموقع'));
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000, maximumAge: 60000 });
        });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
        const geo = await reverseGeocode(lat, lng);
        city = geo.city;
        country = geo.country;
        setSettings((s) => ({ ...s, lat, lng, city, country }));
      }

      const res = await fetchByCoords(lat!, lng!, settings.method);
      res.timings = applyAdjustments(res.timings, settings.adjustments);
      setData(res);
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data: res, city, country }));
      } catch {}
    } catch (e: any) {
      setError(e?.message || 'حدث خطأ');
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) {
          const c = JSON.parse(raw);
          if (c?.data) setData(c.data);
        }
      } catch {}
    } finally {
      setLoading(false);
    }
  }, [fetchByCoords, settings.method, settings.adjustments, settings.lat, settings.lng]);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.method]);

  const nextPrayer = (() => {
    if (!data) return null;
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    const order: (keyof PrayerTimings)[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    for (const k of order) {
      const [h, m] = data.timings[k].split(':').map(Number);
      const t = h * 60 + m;
      if (t > minutes) {
        const diff = t - minutes;
        return { name: PRAYER_NAMES_AR[k], key: k, time: data.timings[k], minutesUntil: diff };
      }
    }
    const [h, m] = data.timings.Fajr.split(':').map(Number);
    const diff = 24 * 60 - minutes + (h * 60 + m);
    return { name: PRAYER_NAMES_AR.Fajr, key: 'Fajr' as const, time: data.timings.Fajr, minutesUntil: diff };
  })();

  return {
    settings,
    setSettings,
    data,
    loading,
    error,
    refresh,
    nextPrayer,
  };
}
