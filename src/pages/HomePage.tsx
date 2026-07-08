import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import SEO from '@/components/SEO';
import { useNavigate } from 'react-router-dom';
import {
  Book, Mic, Radio, Clock, Moon, Sun, Sunrise, Sunset,
  CloudSun, Heart, Search, MapPin, ChevronLeft, Star, BookOpen,
  Users, Quote, Calendar, Bell, BellOff, Feather, BarChart3,
  TrendingUp, Sparkles, Baby, Brain, Smile, Lightbulb, Bot, Settings,
  Flame, Trophy, RefreshCw, Database
} from 'lucide-react';
import { fetchPrayerTimes, fetchPrayerTimesByCity, fetchSurahs, type PrayerTimes, type Surah } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';
import { useLastRead } from '@/hooks/useLastRead';
import { useNotifications } from '@/hooks/useNotifications';
import { useReadingTracker } from '@/hooks/useReadingTracker';
import { useFavorites } from '@/hooks/useFavorites';
import { getCached, setCached } from '@/lib/dataCache';
import WisdomCarousel from '@/components/WisdomCarousel';

const prayerIcons: Record<string, React.ElementType> = {
  Fajr: Sunrise, Sunrise: Sun, Dhuhr: CloudSun, Asr: Sun, Maghrib: Sunset, Isha: Moon,
};
const prayerNames: Record<string, string> = {
  Fajr: 'الفجر', Sunrise: 'الشروق', Dhuhr: 'الظهر', Asr: 'العصر', Maghrib: 'المغرب', Isha: 'العشاء',
};
const prayerOrder = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

const allTickerItems = [
  'سُبْحَانَ اللهِ وَبِحَمْدِهِ سُبْحَانَ اللهِ الْعَظِيمِ',
  'لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ',
  'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّد',
  'أَسْتَغْفِرُ اللهَ الْعَظِيمَ وَأَتُوبُ إِلَيْهِ',
  'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ',
  'حَسْبُنَا اللهُ وَنِعْمَ الْوَكِيلُ',
  'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
  'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ',
  'فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ',
  'وَقُل رَّبِّ زِدْنِي عِلْمًا',
  'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
  'وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ لِّلْمُؤْمِنِينَ',
  'سُبْحَانَ رَبِّكَ رَبِّ الْعِزَّةِ عَمَّا يَصِفُونَ',
  'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ',
  'وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَى',
  'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ',
];

const dailyVerses = [
  { text: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا', surah: 'الشرح', surahNum: 94, ayah: 6 },
  { text: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ', surah: 'الطلاق', surahNum: 65, ayah: 3 },
  { text: 'فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ', surah: 'البقرة', surahNum: 2, ayah: 152 },
  { text: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', surah: 'البقرة', surahNum: 2, ayah: 201 },
  { text: 'وَقُل رَّبِّ زِدْنِي عِلْمًا', surah: 'طه', surahNum: 20, ayah: 114 },
  { text: 'وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ لِّلْمُؤْمِنِينَ', surah: 'الإسراء', surahNum: 17, ayah: 82 },
  { text: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ', surah: 'الرعد', surahNum: 13, ayah: 28 },
];

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, themeMode, toggleTheme, setAutoMode } = useTheme();
  const { lastRead } = useLastRead();
  const { requestPermission, schedulePrayerNotification, sendAdhkarReminder, isSupported } = useNotifications();
  const { tracker } = useReadingTracker();
  const { favorites } = useFavorites();
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [nextPrayerKey, setNextPrayerKey] = useState('');
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; remaining: string } | null>(null);
  const [hijriDate, setHijriDate] = useState('');
  const [gregorianDate, setGregorianDate] = useState('');
  const [locationName, setLocationName] = useState('');
  const cachedHomeSurahs = getCached<Surah[]>('surahs');
  const [surahs, setSurahs] = useState<Surah[]>(cachedHomeSurahs ?? []);
  const [loading, setLoading] = useState(!cachedHomeSurahs);
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => localStorage.getItem('notifications_enabled') === 'true');
  const [manualLocation, setManualLocation] = useState<{ city: string; country: string } | null>(() => {
    try { const raw = localStorage.getItem('manual_location'); return raw ? JSON.parse(raw) : null; } catch { return null; }
  });
  const [timezone, setTimezone] = useState<string>('');
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [pickerCountry, setPickerCountry] = useState('');
  const [pickerCity, setPickerCity] = useState('');
  const [citySuggestions, setCitySuggestions] = useState<Array<{ name: string; display: string }>>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const dayOfYear = useMemo(() => Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000), []);
  const dailyVerse = useMemo(() => dailyVerses[dayOfYear % dailyVerses.length], [dayOfYear]);
  const tickerItems = useMemo(() => seededShuffle(allTickerItems, dayOfYear), [dayOfYear]);

  const handleToggleNotifications = useCallback(async () => {
    if (notificationsEnabled) {
      setNotificationsEnabled(false);
      localStorage.setItem('notifications_enabled', 'false');
      return;
    }
    const granted = await requestPermission();
    if (granted) {
      setNotificationsEnabled(true);
      localStorage.setItem('notifications_enabled', 'true');
      sendAdhkarReminder();
      if (prayerTimes) {
        prayerOrder.forEach(key => {
          if (key === 'Sunrise') return;
          const time = prayerTimes[key]?.split(' ')[0];
          if (time) schedulePrayerNotification(prayerNames[key], time, timezone || undefined);
        });
      }
    }
  }, [notificationsEnabled, requestPermission, prayerTimes, timezone, schedulePrayerNotification, sendAdhkarReminder]);

  useEffect(() => {
    if (prayerTimes && notificationsEnabled) {
      prayerOrder.forEach(key => {
        if (key === 'Sunrise') return;
        const time = prayerTimes[key]?.split(' ')[0];
        if (time) schedulePrayerNotification(prayerNames[key], time, timezone || undefined);
      });
    }
  }, [prayerTimes, timezone, notificationsEnabled]);

  useEffect(() => {
    const todayKey = (() => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`; })();
    const cacheKey = (country: string, city: string) => `prayer_cache:${country.toLowerCase()}:${city.toLowerCase()}:${todayKey}`;
    const readCache = (k: string) => {
      try { const raw = localStorage.getItem(k); return raw ? JSON.parse(raw) : null; } catch { return null; }
    };
    const writeCache = (k: string, data: any) => {
      try { localStorage.setItem(k, JSON.stringify({ data, ts: Date.now() })); } catch {}
      try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && key.startsWith('prayer_cache:') && !key.endsWith(`:${todayKey}`)) localStorage.removeItem(key);
        }
      } catch {}
    };

    const load = async () => {
      if (!getCached<Surah[]>('surahs')) setLoading(true);
      try {
        const handlePrayerData = (data: any, locName: string, opts: { cached?: boolean; ts?: number } = {}) => {
          setPrayerTimes(data.timings);
          setLocationName(locName);
          if (data.meta?.timezone) setTimezone(data.meta.timezone);
          if (data.date?.hijri) {
            const h = data.date.hijri;
            setHijriDate(`${h.day} ${h.month?.ar || ''} ${h.year}`);
          }
          const g = data.date?.gregorian;
          if (g) setGregorianDate(`${g.weekday?.en || ''}, ${g.day} ${g.month?.en || ''} ${g.year}`);
          calculateNextPrayer(data.timings, data.meta?.timezone);
          setFromCache(!!opts.cached);
          setLastUpdated(opts.ts ?? Date.now());
        };

        if (manualLocation) {
          const ck = cacheKey(manualLocation.country, manualLocation.city);
          const cachedRaw = readCache(ck);
          const cached = cachedRaw?.data ? cachedRaw : (cachedRaw ? { data: cachedRaw, ts: Date.now() } : null);
          if (cached) {
            handlePrayerData(cached.data, `${manualLocation.city}، ${manualLocation.country}`, { cached: true, ts: cached.ts });
            setLoading(false);
          }
          try {
            const data = await fetchPrayerTimesByCity(manualLocation.city, manualLocation.country);
            writeCache(ck, data);
            handlePrayerData(data, `${manualLocation.city}، ${manualLocation.country}`, { cached: false, ts: Date.now() });
          } catch {
            if (!cached) {
              const data = await fetchPrayerTimes(21.4225, 39.8262);
              handlePrayerData(data, 'مكة المكرمة');
            }
          }
        } else if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              try {
                const data = await fetchPrayerTimes(pos.coords.latitude, pos.coords.longitude);
                let locName = 'موقعك';
                try {
                  const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&localityLanguage=ar`);
                  const geoData = await geoRes.json();
                  locName = geoData.city || geoData.locality || locName;
                } catch {}
                handlePrayerData(data, locName);
              } catch {
                const data = await fetchPrayerTimes(21.4225, 39.8262);
                handlePrayerData(data, 'مكة المكرمة');
              }
            },
            async () => {
              const data = await fetchPrayerTimes(21.4225, 39.8262);
              handlePrayerData(data, 'مكة المكرمة');
            }
          );
        } else {
          const data = await fetchPrayerTimes(21.4225, 39.8262);
          handlePrayerData(data, 'مكة المكرمة');
        }
        const surahData = await fetchSurahs();
        setCached('surahs', surahData);
        setSurahs(surahData);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [manualLocation, refreshKey]);

  // Debounced city autocomplete via Nominatim (OSM)
  useEffect(() => {
    if (!showLocationPicker) return;
    const q = pickerCity.trim();
    if (q.length < 2) { setCitySuggestions([]); return; }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        setLoadingSuggestions(true);
        const params = new URLSearchParams({
          city: q, format: 'json', limit: '6', 'accept-language': 'ar,en',
          addressdetails: '1', featuretype: 'city',
        });
        if (pickerCountry) params.set('country', pickerCountry);
        const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
          signal: ctrl.signal,
          headers: { 'Accept': 'application/json' },
        });
        const data = await res.json();
        const seen = new Set<string>();
        const list: Array<{ name: string; display: string }> = [];
        for (const r of data || []) {
          const a = r.address || {};
          const name = a.city || a.town || a.village || a.municipality || a.county || r.name || (r.display_name?.split(',')[0] ?? '').trim();
          if (!name) continue;
          const key = name.toLowerCase();
          if (seen.has(key)) continue;
          seen.add(key);
          list.push({ name, display: r.display_name });
          if (list.length >= 6) break;
        }
        setCitySuggestions(list);
      } catch {} finally { setLoadingSuggestions(false); }
    }, 300);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [pickerCity, pickerCountry, showLocationPicker]);

  useEffect(() => {
    if (!prayerTimes) return;
    calculateNextPrayer(prayerTimes, timezone);
    const interval = setInterval(() => calculateNextPrayer(prayerTimes, timezone), 15000);
    return () => clearInterval(interval);
  }, [prayerTimes, timezone]);

  const getNowInTz = (tz: string) => {
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: tz, hour12: false,
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      }).formatToParts(new Date());
      const obj: Record<string, string> = {};
      for (const p of parts) obj[p.type] = p.value;
      return {
        h: (parseInt(obj.hour, 10) || 0) % 24,
        m: parseInt(obj.minute, 10) || 0,
        s: parseInt(obj.second, 10) || 0,
      };
    } catch {
      const d = new Date();
      return { h: d.getHours(), m: d.getMinutes(), s: d.getSeconds() };
    }
  };

  const calculateNextPrayer = (timings: PrayerTimes, tz?: string) => {
    const { h: nowH, m: nowM, s: nowS } = tz ? getNowInTz(tz) : (() => { const d = new Date(); return { h: d.getHours(), m: d.getMinutes(), s: d.getSeconds() }; })();
    const nowSec = nowH * 3600 + nowM * 60 + nowS;
    for (const prayer of prayerOrder) {
      const timeStr = timings[prayer];
      if (!timeStr) continue;
      const cleanTime = timeStr.split(' ')[0];
      const [h, m] = cleanTime.split(':').map(Number);
      if (isNaN(h) || isNaN(m)) continue;
      const prayerSec = h * 3600 + m * 60;
      if (prayerSec > nowSec) {
        const diff = prayerSec - nowSec;
        const hours = Math.floor(diff / 3600);
        const mins = Math.floor((diff % 3600) / 60);
        const secs = diff % 60;
        const remaining = hours > 0
          ? `${hours} ساعة و ${mins} دقيقة`
          : mins > 0 ? `${mins} دقيقة و ${secs} ثانية` : `${secs} ثانية`;
        setNextPrayer({ name: prayerNames[prayer], time: cleanTime, remaining });
        setNextPrayerKey(prayer);
        return;
      }
    }
    const fajrClean = timings.Fajr?.split(' ')[0] || timings.Fajr;
    setNextPrayer({ name: prayerNames.Fajr, time: fajrClean, remaining: 'غداً إن شاء الله' });
    setNextPrayerKey('Fajr');
  };

  const primaryActions = [
    { label: 'المصحف', desc: 'قراءة وتلاوة', icon: Book, path: '/quran', gradient: 'gradient-primary' },
    { label: 'القراء', desc: 'استمع', icon: Mic, path: '/reciters', gradient: 'gradient-gold' },
    { label: 'الأذكار', desc: 'صباح ومساء', icon: Heart, path: '/adhkar', gradient: 'gradient-primary' },
    { label: 'الراديو', desc: 'بث مباشر', icon: Radio, path: '/radio', gradient: 'gradient-gold' },
  ];

  const spiritualLinks = [
    { label: 'كيف قلبك؟', icon: Smile, path: '/emotion-quran' },
    { label: 'قلب القرآن', icon: Heart, path: '/heart-quran' },
    { label: 'تأملات', icon: Lightbulb, path: '/daily-reflection' },
    { label: 'اختبار الحفظ', icon: Brain, path: '/memorization-test' },
    { label: 'المساعد', icon: Bot, path: '/ai-tafsir' },
    { label: 'السكينة', icon: Star, path: '/sakinah' },
    { label: 'الأنبياء', icon: Users, path: '/prophets' },
    { label: 'الأدعية', icon: Feather, path: '/dua' },
  ];

  const featuredSurahs = [
    { num: 1, label: 'الفاتحة' }, { num: 36, label: 'يس' }, { num: 55, label: 'الرحمن' },
    { num: 67, label: 'الملك' }, { num: 18, label: 'الكهف' }, { num: 112, label: 'الإخلاص' },
  ];

  const totalAyahsRead = tracker?.totalAyahsRead || 0;
  const streak = tracker?.streak || 0;
  const favCount = (favorites?.surahs?.length || 0) + (favorites?.items?.length || 0);

  return (
    <>
      <SEO title="قلب القرآن — مواقيت الصلاة والقرآن والأذكار" description="الصفحة الرئيسية: مواقيت الصلاة، آخر قراءة، أذكار، وصول سريع لسور القرآن والقراء والراديو." />
      <div className="page-container page-with-topbar" dir="rtl">
      <div className="page-inner pb-4">

        {/* Premium Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center shadow-emerald relative overflow-hidden">
              <span className="font-amiri text-primary-foreground text-2xl font-bold leading-none">ﷺ</span>
              <span className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-kufi text-gradient-primary leading-tight">قلب القرآن</h1>
              {hijriDate && <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">{hijriDate}</p>}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {isSupported && (
              <button onClick={handleToggleNotifications} className="w-9 h-9 rounded-xl bg-secondary/70 border border-border/50 flex items-center justify-center transition-all hover:bg-muted" aria-label="إشعارات">
                {notificationsEnabled ? <Bell className="w-4 h-4 text-primary" /> : <BellOff className="w-4 h-4 text-muted-foreground" />}
              </button>
            )}
            <button onClick={toggleTheme} className="w-9 h-9 rounded-xl bg-secondary/70 border border-border/50 flex items-center justify-center transition-all hover:bg-muted" aria-label="مظهر">
              {theme === 'dark' ? <Sun className="w-4 h-4 text-accent" /> : <Moon className="w-4 h-4 text-foreground" />}
            </button>
            <button onClick={() => navigate('/settings')} className="w-9 h-9 rounded-xl bg-secondary/70 border border-border/50 flex items-center justify-center transition-all hover:bg-muted" aria-label="إعدادات">
              <Settings className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Location pill */}
        {locationName && (
          <div className="flex items-center gap-2 mb-4 text-xs flex-wrap">
            <button
              onClick={() => { setPickerCountry(manualLocation?.country || ''); setPickerCity(manualLocation?.city || ''); setShowLocationPicker(true); }}
              className="flex items-center gap-1.5 text-muted-foreground bg-secondary/60 hover:bg-secondary rounded-full px-3 py-1.5 border border-border/40 transition-colors"
              aria-label="تغيير الموقع"
            >
              <MapPin className="w-3 h-3" />
              <span className="font-medium">{locationName}</span>
              <ChevronLeft className="w-3 h-3 rotate-90 opacity-60" />
            </button>
            {timezone && (
              <span className="text-[10px] text-muted-foreground bg-secondary/40 rounded-full px-2 py-1 border border-border/40">{timezone}</span>
            )}
            {manualLocation && (
              <button
                onClick={() => { localStorage.removeItem('manual_location'); setManualLocation(null); }}
                className="text-[10px] text-accent bg-accent/10 rounded-full px-2.5 py-1.5 font-semibold border border-accent/20"
              >
                استخدم موقعي
              </button>
            )}
            {prayerTimes && themeMode !== 'auto' && (
              <button onClick={() => setAutoMode({ Fajr: prayerTimes.Fajr, Maghrib: prayerTimes.Maghrib })} className="text-[10px] text-primary bg-primary/10 rounded-full px-2.5 py-1.5 font-semibold border border-primary/15">
                وضع تلقائي
              </button>
            )}
          </div>
        )}

        {/* Location Picker Sheet */}
        {showLocationPicker && createPortal(
          <>
            <div className="sheet-overlay" onClick={() => setShowLocationPicker(false)} />
            <div className="sheet-content" dir="rtl">
              <div className="sheet-handle" />
              <div className="px-5 pb-6 pt-2">
                <h3 className="text-base font-bold text-foreground mb-1">اختر موقعك</h3>
                <p className="text-xs text-muted-foreground mb-4">حدد الدولة والمدينة لجلب أوقات الصلاة بدقة (يتم احتساب التوقيت تلقائياً)</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">الدولة</label>
                    <select
                      value={pickerCountry}
                      onChange={(e) => setPickerCountry(e.target.value)}
                      className="search-input w-full"
                    >
                      <option value="">— اختر دولة —</option>
                      {[
                        'Saudi Arabia','Egypt','United Arab Emirates','Kuwait','Qatar','Bahrain','Oman','Yemen',
                        'Iraq','Jordan','Lebanon','Syria','Palestine','Morocco','Algeria','Tunisia','Libya','Sudan',
                        'Mauritania','Somalia','Djibouti','Comoros','Turkey','Iran','Pakistan','India','Bangladesh',
                        'Indonesia','Malaysia','Brunei','Maldives','Afghanistan','United Kingdom','United States',
                        'Canada','France','Germany','Netherlands','Belgium','Sweden','Norway','Australia',
                      ].map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">المدينة</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={pickerCity}
                        onChange={(e) => setPickerCity(e.target.value)}
                        placeholder="ابدأ بالكتابة لرؤية الاقتراحات..."
                        className="search-input w-full"
                        autoComplete="off"
                      />
                      {loadingSuggestions && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">جارٍ البحث...</span>
                      )}
                      {citySuggestions.length > 0 && (
                        <div className="absolute z-10 left-0 right-0 mt-1 bg-popover border border-border rounded-xl shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                          {citySuggestions.map((s, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => { setPickerCity(s.name); setCitySuggestions([]); }}
                              className="w-full text-right px-3 py-2 hover:bg-secondary border-b border-border/40 last:border-0 transition-colors"
                            >
                              <div className="text-sm font-medium text-foreground">{s.name}</div>
                              <div className="text-[10px] text-muted-foreground line-clamp-1">{s.display}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-5">
                  <button
                    onClick={() => setShowLocationPicker(false)}
                    className="flex-1 py-2.5 rounded-xl bg-secondary text-foreground text-sm font-medium"
                  >
                    إلغاء
                  </button>
                  <button
                    disabled={!pickerCountry || !pickerCity.trim()}
                    onClick={() => {
                      const loc = { city: pickerCity.trim(), country: pickerCountry };
                      localStorage.setItem('manual_location', JSON.stringify(loc));
                      setManualLocation(loc);
                      setShowLocationPicker(false);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50"
                  >
                    حفظ
                  </button>
                </div>
              </div>
            </div>
          </>,
          document.body
        )}


        {/* Hero Prayer Card — Premium */}
        <div className="gradient-hero islamic-pattern islamic-pattern-arabesque rounded-3xl p-6 mb-5 text-primary-foreground relative shadow-emerald">
          {loading || !nextPrayer ? (
            <div className="space-y-3">
              <div className="skeleton-pulse h-5 w-28 rounded opacity-20" />
              <div className="skeleton-pulse h-10 w-40 rounded opacity-20" />
              <div className="skeleton-pulse h-4 w-48 rounded opacity-20" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm rounded-full px-3 py-1.5 border border-primary-foreground/15">
                  <Clock className="w-3.5 h-3.5 opacity-90" />
                  <span className="text-xs font-semibold opacity-95">الصلاة القادمة</span>
                </div>
                {gregorianDate && <span className="text-[10px] opacity-60">{gregorianDate}</span>}
              </div>
              <div className="text-4xl font-bold mb-1 text-shadow-md font-kufi relative z-10">{nextPrayer.name}</div>
              <div className="text-2xl opacity-95 font-bold mb-2 font-amiri tracking-wide text-shadow-sm relative z-10">{nextPrayer.time}</div>
              <div className="flex items-center gap-2 text-sm opacity-80 relative z-10">
                <span className="w-1.5 h-1.5 rounded-full bg-accent live-pulse" />
                <span>متبقي {nextPrayer.remaining}</span>
              </div>
              {(locationName || timezone || lastUpdated) && (
                <div className="flex items-center gap-2 mt-3 flex-wrap text-[11px] opacity-85 relative z-10">
                  {locationName && (
                    <span className="inline-flex items-center gap-1 bg-primary-foreground/10 backdrop-blur-sm rounded-full px-2.5 py-1 border border-primary-foreground/15">
                      <MapPin className="w-3 h-3" />
                      <span className="font-semibold">{locationName}</span>
                    </span>
                  )}
                  {timezone && (
                    <span className="inline-flex items-center gap-1 bg-primary-foreground/10 backdrop-blur-sm rounded-full px-2.5 py-1 border border-primary-foreground/15">
                      <Clock className="w-3 h-3" />
                      <span className="font-medium">{timezone}</span>
                    </span>
                  )}
                  {lastUpdated && (
                    <span className="inline-flex items-center gap-1 bg-primary-foreground/10 backdrop-blur-sm rounded-full px-2.5 py-1 border border-primary-foreground/15">
                      {fromCache ? <Database className="w-3 h-3" /> : <RefreshCw className="w-3 h-3" />}
                      <span className="font-medium">
                        {fromCache ? 'كاش' : 'API'} · {new Date(lastUpdated).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Cache notice with retry */}
        {fromCache && !loading && (
          <div className="mb-4 flex items-center gap-2 bg-accent/10 border border-accent/25 rounded-2xl px-3 py-2 text-[11px] text-foreground">
            <Database className="w-3.5 h-3.5 text-accent flex-shrink-0" />
            <span className="flex-1 leading-snug">
              تم العرض من البيانات المخزّنة مؤقتاً
              {lastUpdated ? ` · آخر تحديث ${new Date(lastUpdated).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}` : ''}
            </span>
            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/20 hover:bg-accent/30 text-accent font-semibold transition-colors"
              aria-label="إعادة المحاولة"
            >
              <RefreshCw className="w-3 h-3" />
              <span>إعادة المحاولة</span>
            </button>
          </div>
        )}

        {/* Prayer Times Strip */}
        {prayerTimes && (
          <div className="grid grid-cols-6 gap-1.5 mb-5">
            {prayerOrder.map((key) => {
              const Icon = prayerIcons[key];
              const isNext = key === nextPrayerKey;
              const displayTime = prayerTimes[key]?.split(' ')[0] || prayerTimes[key];
              return (
                <div key={key} className={`prayer-chip ${isNext ? 'next-prayer' : ''}`}>
                  <Icon className={`w-3.5 h-3.5 mb-0.5 ${isNext ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-[10px] ${isNext ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>{prayerNames[key]}</span>
                  <span className={`text-xs font-bold mt-0.5 ${isNext ? 'text-primary' : 'text-foreground'}`}>{displayTime}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Premium Stats Bar — unified card with divided cells */}
        <section aria-labelledby="stats-heading" className="relative mb-5 rounded-3xl overflow-hidden border border-border/50 shadow-sm bg-card">
          <h2 id="stats-heading" className="sr-only">إحصائيات القراءة</h2>
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent dark:from-primary/20 dark:via-accent/10" />
          <div aria-hidden="true" className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-primary/10 dark:bg-primary/20 blur-3xl pointer-events-none" />
          <div aria-hidden="true" className="absolute -bottom-12 -right-8 w-40 h-40 rounded-full bg-accent/10 dark:bg-accent/15 blur-3xl pointer-events-none" />
          <ul role="list" className="relative grid grid-cols-3 divide-x divide-x-reverse divide-border/50">
            {/* Streak with mini progress ring */}
            <li className="contents">
              <button
                onClick={() => navigate('/reading-stats')}
                className="p-3.5 text-right active:scale-[0.97] transition group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card rounded-xl"
                aria-label={`أيام القراءة المتتالية: ${streak} من 30 يوماً. اضغط لعرض إحصائيات القراءة`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative w-11 h-11 shrink-0" role="img" aria-label={`${Math.round(Math.min(streak / 30, 1) * 100)} بالمئة من الهدف`}>
                    <svg className="w-11 h-11 -rotate-90" viewBox="0 0 44 44" aria-hidden="true" focusable="false">
                      <circle cx="22" cy="22" r="18" fill="none" stroke="hsl(var(--primary) / 0.18)" strokeWidth="3.5" />
                      <circle
                        cx="22" cy="22" r="18" fill="none"
                        stroke="hsl(var(--primary))" strokeWidth="3.5" strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 18}
                        strokeDashoffset={2 * Math.PI * 18 * (1 - Math.min(streak / 30, 1))}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Flame className="w-4 h-4 text-primary" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xl font-extrabold text-foreground font-kufi tabular-nums leading-none">{streak}</div>
                    <div className="text-[10px] text-muted-foreground font-bold mt-1 leading-none">يوم متتالٍ</div>
                    <div className="text-[9px] text-primary font-bold mt-1">من 30</div>
                  </div>
                </div>
              </button>
            </li>

            {/* Ayahs read */}
            <li className="contents">
              <button
                onClick={() => navigate('/quran-stats')}
                className="p-3.5 text-right active:scale-[0.97] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card rounded-xl"
                aria-label={`عدد الآيات المقروءة: ${totalAyahsRead}. اضغط لعرض إحصائيات القرآن`}
              >
                <div className="flex items-center gap-2.5">
                  <div aria-hidden="true" className="w-11 h-11 rounded-2xl gradient-gold flex items-center justify-center shadow-gold shrink-0">
                    <Trophy className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xl font-extrabold text-foreground font-kufi tabular-nums leading-none truncate">
                      {totalAyahsRead > 999 ? `${(totalAyahsRead / 1000).toFixed(1)}K` : totalAyahsRead}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-bold mt-1 leading-none">آية مقروءة</div>
                    <div className="text-[9px] text-accent font-bold mt-1 flex items-center gap-0.5">
                      <TrendingUp className="w-2.5 h-2.5" aria-hidden="true" /> نموّ
                    </div>
                  </div>
                </div>
              </button>
            </li>

            {/* Favorites */}
            <li className="contents">
              <button
                onClick={() => navigate('/favorites')}
                className="p-3.5 text-right active:scale-[0.97] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card rounded-xl"
                aria-label={`الآيات المفضلة المحفوظة: ${favCount}. اضغط لعرض المفضلة`}
              >
                <div className="flex items-center gap-2.5">
                  <div aria-hidden="true" className="w-11 h-11 rounded-2xl bg-gradient-to-br from-destructive/20 to-destructive/5 dark:from-destructive/30 dark:to-destructive/10 border border-destructive/25 flex items-center justify-center shrink-0">
                    <Heart className="w-5 h-5 text-destructive fill-destructive/30" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xl font-extrabold text-foreground font-kufi tabular-nums leading-none">{favCount}</div>
                    <div className="text-[10px] text-muted-foreground font-bold mt-1 leading-none">مفضّلة</div>
                    <div className="text-[9px] text-destructive font-bold mt-1">محفوظات</div>
                  </div>
                </div>
              </button>
            </li>
          </ul>
        </section>

        {/* Continue reading */}
        {lastRead && (
          <button
            onClick={() => navigate(`/quran/${lastRead.surahNumber}`)}
            className="card-luxury w-full mb-5 flex items-center gap-3 text-right hover:scale-[1.01] transition-transform"
          >
            <div className="w-12 h-12 rounded-2xl gradient-gold flex items-center justify-center flex-shrink-0 shadow-gold">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1 text-right">
              <div className="text-[11px] text-accent font-bold uppercase tracking-wider">متابعة القراءة</div>
              <div className="text-base font-bold text-foreground font-kufi">{lastRead.surahName}</div>
              <div className="text-xs text-muted-foreground mt-0.5">آية {lastRead.ayahNumber}</div>
            </div>
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>
        )}

        {/* Wisdom Carousel — auto-rotating cards (dhikr / ayah / hadith / names / dua) */}
        <WisdomCarousel />

        {/* Primary Actions — Bento (1 hero + 3 compact) */}
        <nav aria-label="اختصارات رئيسية" className="mb-5">
          <ul role="list" className="grid grid-cols-3 gap-2.5 stagger-children list-none p-0">
            {/* Hero tile — full-width */}
            {(() => {
              const hero = primaryActions[0];
              return (
                <li className="col-span-3">
                  <button
                    onClick={() => navigate(hero.path)}
                    aria-label={`${hero.label} — ${hero.desc}. ابدأ الآن`}
                    className="w-full relative overflow-hidden rounded-3xl p-4 flex items-center gap-3 text-right border border-primary/25 press bg-gradient-to-br from-primary/12 via-accent/10 to-transparent dark:from-primary/25 dark:via-accent/15 dark:to-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <div aria-hidden="true" className={`w-16 h-16 rounded-2xl flex items-center justify-center ${hero.gradient} shadow-emerald relative overflow-hidden shrink-0`}>
                      <hero.icon className="w-7 h-7 text-primary-foreground relative z-10" />
                      <span className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold text-primary uppercase tracking-widest">ابدأ الآن</div>
                      <div className="text-base font-extrabold text-foreground font-kufi">{hero.label}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{hero.desc}</div>
                    </div>
                    <ChevronLeft className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
                    <span aria-hidden="true" className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-primary/15 dark:bg-primary/25 blur-2xl pointer-events-none" />
                  </button>
                </li>
              );
            })()}
            {/* Compact tiles */}
            {primaryActions.slice(1).map((link, i) => (
              <li key={link.path}>
                <button
                  onClick={() => navigate(link.path)}
                  aria-label={`${link.label} — ${link.desc}`}
                  className="shortcut-tile w-full h-full press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <span aria-hidden="true" className="shortcut-medallion" style={{ width: 44, height: 44 }}>
                    <span className={`sm-bg ${link.gradient}`} />
                    <span className="sm-shine" />
                    <span className="sm-ring" />
                    <link.icon className="sm-icon w-5 h-5 text-primary-foreground" />
                    <span className="sm-corner" style={{ top: 1, left: '50%', transform: 'translateX(-50%)' }} />
                    <span className="sm-corner" style={{ bottom: 1, left: '50%', transform: 'translateX(-50%)' }} />
                  </span>
                  <span className="text-xs font-extrabold text-foreground leading-tight text-center font-kufi">{link.label}</span>
                  <span className="text-[9px] text-muted-foreground leading-none">{link.desc}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Daily Verse — Premium */}
        <button
          onClick={() => navigate(`/quran/${dailyVerse.surahNum}`)}
          className="daily-verse-card mb-5 w-full text-right"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl gradient-gold flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-xs font-bold text-gold-deep">آية اليوم</span>
            </div>
            <span className="stat-badge-gold">يومياً</span>
          </div>
          <p className="font-amiri text-2xl leading-[2.1] text-foreground text-center mb-3 px-2">{dailyVerse.text}</p>
          <p className="text-xs text-muted-foreground text-center font-medium">سورة {dailyVerse.surah} — آية {dailyVerse.ayah}</p>
        </button>

        {/* Spiritual shortcuts — horizontal snap rail with keyboard nav */}
        <nav aria-label="اختصارات الروح والقلب" className="mb-5">
          <div className="section-title-row">
            <h2 className="section-title mb-0" id="spiritual-heading">الروح والقلب</h2>
            <span className="text-[10px] text-muted-foreground font-bold" aria-hidden="true">{spiritualLinks.length} أداة</span>
          </div>
          <ul
            role="list"
            aria-labelledby="spiritual-heading"
            className="flex gap-2.5 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-4 px-4 pb-1 list-none scroll-smooth focus-visible:outline-none"
            onKeyDown={(e) => {
              // In RTL: ArrowLeft moves to the next (visually leftwards), ArrowRight moves to the previous.
              if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Home' && e.key !== 'End') return;
              const container = e.currentTarget as HTMLElement;
              const buttons = Array.from(container.querySelectorAll<HTMLButtonElement>('button[data-rail-item]'));
              if (!buttons.length) return;
              const active = document.activeElement as HTMLElement | null;
              const currentIdx = buttons.findIndex((b) => b === active);
              let nextIdx = currentIdx;
              if (e.key === 'Home') nextIdx = 0;
              else if (e.key === 'End') nextIdx = buttons.length - 1;
              else if (e.key === 'ArrowLeft') nextIdx = currentIdx < 0 ? 0 : Math.min(currentIdx + 1, buttons.length - 1);
              else if (e.key === 'ArrowRight') nextIdx = currentIdx < 0 ? 0 : Math.max(currentIdx - 1, 0);
              if (nextIdx !== currentIdx && buttons[nextIdx]) {
                e.preventDefault();
                buttons[nextIdx].focus();
                buttons[nextIdx].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
              }
            }}
          >
            {spiritualLinks.map((link, i) => (
              <li key={link.path} className="snap-start shrink-0">
                <button
                  data-rail-item
                  onClick={() => navigate(link.path)}
                  aria-label={link.label}
                  aria-posinset={i + 1}
                  aria-setsize={spiritualLinks.length}
                  className="shortcut-tile w-[108px] press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <span aria-hidden="true" className="shortcut-medallion">
                    <span className={`sm-bg ${i % 2 === 0 ? 'gradient-primary' : 'gradient-gold'}`} />
                    <span className="sm-shine" />
                    <span className="sm-ring" />
                    <link.icon className="sm-icon w-5 h-5 text-primary-foreground" />
                    <span className="sm-corner" style={{ top: 2, left: '50%', transform: 'translateX(-50%)' }} />
                    <span className="sm-corner" style={{ bottom: 2, left: '50%', transform: 'translateX(-50%)' }} />
                    <span className="sm-corner" style={{ top: '50%', left: 2, transform: 'translateY(-50%)' }} />
                    <span className="sm-corner" style={{ top: '50%', right: 2, transform: 'translateY(-50%)' }} />
                  </span>
                  <span className="text-[11px] font-extrabold text-foreground leading-tight text-center font-kufi w-full line-clamp-2">{link.label}</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="sr-only">استخدم مفتاحي السهم يمين ويسار للتنقل، Home للعنصر الأول، End للأخير.</p>
        </nav>

        {/* Featured Surahs */}
        <div className="mb-5">
          <div className="section-title-row">
            <h2 className="section-title mb-0">سور مختارة</h2>
            <button onClick={() => navigate('/quran')} className="text-xs text-primary font-semibold flex items-center gap-1">
              الكل <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 stagger-children">
            {featuredSurahs.map((s) => (
              <button key={s.num} onClick={() => navigate(`/quran/${s.num}`)} className="card-surface-hover flex flex-col items-center py-3 gap-1.5 press">
                <span className="verse-number">{s.num}</span>
                <span className="text-xs font-bold text-foreground mt-1 font-kufi">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Surah List preview */}
        <div className="mb-4">
          <div className="section-title-row">
            <h2 className="section-title mb-0">سور القرآن الكريم</h2>
            <button onClick={() => navigate('/quran')} className="text-xs text-primary font-semibold flex items-center gap-1">
              عرض الكل <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton-pulse h-16 w-full" />)}
            </div>
          ) : (
            <div className="space-y-2 stagger-children">
              {surahs.slice(0, 8).map((surah) => (
                <button key={surah.number} onClick={() => navigate(`/quran/${surah.number}`)} className="card-surface-hover w-full flex items-center gap-3 text-right press">
                  <div className="verse-number flex-shrink-0">{surah.number}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-foreground text-sm font-kufi">{surah.name}</div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                      <span className={surah.revelationType === 'Meccan' ? 'text-primary' : 'text-accent'}>{surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}</span>
                      <span className="w-1 h-1 rounded-full bg-border inline-block" />
                      <span>{surah.numberOfAyahs} آيات</span>
                    </div>
                  </div>
                  <span className="font-amiri text-lg text-primary opacity-70">{surah.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="text-center py-6">
          <p className="font-amiri text-base text-muted-foreground">بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ</p>
        </div>
      </div>
    </div>
    </>
  );
};

export default HomePage;
