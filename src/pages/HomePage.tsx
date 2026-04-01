import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Book, Mic, Radio, Clock, Moon, Sun, Sunrise, Sunset,
  CloudSun, Heart, Search, MapPin, ChevronLeft, Star, BookOpen,
  Users, Quote, Calendar, Bell, BellOff, Feather, BarChart3,
  TrendingUp, Sparkles, Baby, Download
} from 'lucide-react';
import { fetchPrayerTimes, fetchSurahs, type PrayerTimes, type Surah } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';
import { fetchPrayerTimesByCity } from '@/lib/api';
import { useLastRead } from '@/hooks/useLastRead';
import { useNotifications } from '@/hooks/useNotifications';

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
  'رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ',
  'حَسْبُنَا اللهُ وَنِعْمَ الْوَكِيلُ',
  'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
  'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ',
  'فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ',
  'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً',
  'وَقُل رَّبِّ زِدْنِي عِلْمًا',
  'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
  'وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ لِّلْمُؤْمِنِينَ',
  'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا',
  'وَإِلَـٰهُكُمْ إِلَـٰهٌ وَاحِدٌ لَّا إِلَـٰهَ إِلَّا هُوَ الرَّحْمَـٰنُ الرَّحِيمُ',
  'سُبْحَانَ رَبِّكَ رَبِّ الْعِزَّةِ عَمَّا يَصِفُونَ',
  'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
];

const dailyVerses = [
  { text: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا', surah: 'الشرح', ayah: 6 },
  { text: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ', surah: 'الطلاق', ayah: 3 },
  { text: 'فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ', surah: 'البقرة', ayah: 152 },
  { text: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', surah: 'البقرة', ayah: 201 },
  { text: 'وَقُل رَّبِّ زِدْنِي عِلْمًا', surah: 'طه', ayah: 114 },
  { text: 'وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ لِّلْمُؤْمِنِينَ', surah: 'الإسراء', ayah: 82 },
  { text: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ', surah: 'الرعد', ayah: 28 },
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
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [nextPrayerKey, setNextPrayerKey] = useState('');
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; remaining: string } | null>(null);
  const [hijriDate, setHijriDate] = useState('');
  const [gregorianDate, setGregorianDate] = useState('');
  const [locationName, setLocationName] = useState('');
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => localStorage.getItem('notifications_enabled') === 'true');

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
      // Schedule adhkar reminders
      sendAdhkarReminder();
      // Schedule prayer notifications if available
      if (prayerTimes) {
        prayerOrder.forEach(key => {
          if (key === 'Sunrise') return;
          const time = prayerTimes[key]?.split(' ')[0];
          if (time) schedulePrayerNotification(prayerNames[key], time);
        });
      }
    }
  }, [notificationsEnabled, requestPermission, prayerTimes, schedulePrayerNotification, sendAdhkarReminder]);

  // Schedule notifications when prayer times load
  useEffect(() => {
    if (prayerTimes && notificationsEnabled) {
      prayerOrder.forEach(key => {
        if (key === 'Sunrise') return;
        const time = prayerTimes[key]?.split(' ')[0];
        if (time) schedulePrayerNotification(prayerNames[key], time);
      });
    }
  }, [prayerTimes, notificationsEnabled]);

  useEffect(() => {
    const load = async () => {
      try {
        const handlePrayerData = (data: any, locName: string) => {
          setPrayerTimes(data.timings);
          setLocationName(locName);
          if (data.date?.hijri) {
            const h = data.date.hijri;
            setHijriDate(`${h.day} ${h.month?.ar || ''} ${h.year}`);
          }
          const g = data.date?.gregorian;
          if (g) setGregorianDate(`${g.weekday?.en || ''}, ${g.day} ${g.month?.en || ''} ${g.year}`);
          calculateNextPrayer(data.timings);
        };

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              try {
                const data = await fetchPrayerTimes(pos.coords.latitude, pos.coords.longitude);
                let locName = 'موقعك الحالي';
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
        setSurahs(surahData);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  useEffect(() => {
    if (!prayerTimes) return;
    const interval = setInterval(() => calculateNextPrayer(prayerTimes), 30000);
    return () => clearInterval(interval);
  }, [prayerTimes]);

  const calculateNextPrayer = (timings: PrayerTimes) => {
    const now = new Date();
    for (const prayer of prayerOrder) {
      const timeStr = timings[prayer];
      if (!timeStr) continue;
      const cleanTime = timeStr.split(' ')[0];
      const [h, m] = cleanTime.split(':').map(Number);
      if (isNaN(h) || isNaN(m)) continue;
      const prayerDate = new Date();
      prayerDate.setHours(h, m, 0, 0);
      if (prayerDate > now) {
        const diff = prayerDate.getTime() - now.getTime();
        const hours = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        const remaining = hours > 0 ? `${hours} ساعة و ${mins} دقيقة` : `${mins} دقيقة`;
        setNextPrayer({ name: prayerNames[prayer], time: cleanTime, remaining });
        setNextPrayerKey(prayer);
        return;
      }
    }
    const fajrClean = timings.Fajr?.split(' ')[0] || timings.Fajr;
    setNextPrayer({ name: prayerNames.Fajr, time: fajrClean, remaining: 'غداً إن شاء الله' });
    setNextPrayerKey('Fajr');
  };

  const quickLinks = [
    { label: 'المصحف', icon: Book, path: '/quran', gradient: 'gradient-primary' },
    { label: 'القراء', icon: Mic, path: '/reciters', gradient: 'gradient-gold' },
    { label: 'الراديو', icon: Radio, path: '/radio', gradient: 'gradient-primary' },
    { label: 'الاذكار', icon: Heart, path: '/adhkar', gradient: 'gradient-gold' },
    { label: 'الأنبياء', icon: Users, path: '/prophets', gradient: 'gradient-primary' },
    { label: 'الأحاديث', icon: Quote, path: '/hadith', gradient: 'gradient-gold' },
  ];

  const featuredSurahs = [
    { num: 1, label: 'الفاتحة' }, { num: 36, label: 'يس' }, { num: 55, label: 'الرحمن' },
    { num: 67, label: 'الملك' }, { num: 18, label: 'الكهف' }, { num: 112, label: 'الإخلاص' },
  ];

  return (
    <div className="page-container" dir="rtl">
      <div className="px-4 pt-5 pb-4 max-w-lg mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-foreground">القرآن الكريم</h1>
            {hijriDate && <p className="text-xs text-muted-foreground mt-0.5">{hijriDate}</p>}
          </div>
          <div className="flex items-center gap-2">
            {isSupported && (
              <button onClick={handleToggleNotifications} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center transition-colors hover:bg-muted" title={notificationsEnabled ? 'إيقاف الإشعارات' : 'تفعيل الإشعارات'}>
                {notificationsEnabled ? <Bell className="w-4 h-4 text-primary" /> : <BellOff className="w-4 h-4 text-muted-foreground" />}
              </button>
            )}
            <button onClick={toggleTheme} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center transition-colors hover:bg-muted" title={themeMode === 'auto' ? 'تلقائي' : theme}>
              {theme === 'dark' ? <Sun className="w-4 h-4 text-accent" /> : <Moon className="w-4 h-4 text-foreground" />}
            </button>
            {prayerTimes && themeMode !== 'auto' && (
              <button onClick={() => setAutoMode({ Fajr: prayerTimes.Fajr, Maghrib: prayerTimes.Maghrib })} className="text-[9px] text-primary bg-primary/10 rounded-full px-2 py-1 font-medium" title="الوضع التلقائي حسب مواقيت الصلاة">
                تلقائي
              </button>
            )}
            {locationName && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary rounded-full px-3 py-1.5">
                <MapPin className="w-3 h-3" />
                <span>{locationName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Ticker */}
        <div className="mb-5 overflow-hidden rounded-2xl bg-primary/5 border border-primary/10">
          <div className="ticker-container py-2.5 px-4">
            <div className="ticker-track">
              {[...tickerItems, ...tickerItems, ...tickerItems].map((item, i) => (
                <span key={i} className="font-amiri text-sm text-primary whitespace-nowrap mx-8">{item}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Continue reading */}
        {lastRead && (
          <button
            onClick={() => navigate(`/quran/${lastRead.surahNumber}`)}
            className="w-full card-surface mb-4 flex items-center gap-3 bg-accent/5 border-accent/15"
          >
            <div className="w-11 h-11 rounded-xl gradient-gold flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1 text-right">
              <div className="text-xs text-accent font-medium">متابعة القراءة</div>
              <div className="text-sm font-bold text-foreground">{lastRead.surahName} - آية {lastRead.ayahNumber}</div>
            </div>
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
        )}

        {/* Hero Prayer Card */}
        <div className="gradient-hero islamic-pattern rounded-2xl p-5 mb-5 text-primary-foreground relative">
          {loading || !nextPrayer ? (
            <div className="space-y-3">
              <div className="skeleton-pulse h-5 w-28 rounded opacity-20" />
              <div className="skeleton-pulse h-9 w-36 rounded opacity-20" />
              <div className="skeleton-pulse h-4 w-44 rounded opacity-20" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 opacity-80" />
                  <span className="text-xs opacity-80">الصلاة القادمة</span>
                </div>
                <span className="text-[10px] opacity-60 bg-primary-foreground/10 rounded-full px-2 py-0.5">{gregorianDate}</span>
              </div>
              <div className="text-3xl font-bold mb-0.5 text-shadow-sm">{nextPrayer.name}</div>
              <div className="text-xl opacity-95 font-semibold mb-1 font-amiri tracking-wide">{nextPrayer.time}</div>
              <div className="text-sm opacity-70">متبقي {nextPrayer.remaining}</div>
            </>
          )}
        </div>

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
                  <span className={`text-xs font-semibold mt-0.5 ${isNext ? 'text-primary' : 'text-foreground'}`}>{displayTime}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Access */}
        <div className="mb-5">
          <h2 className="section-title">الوصول السريع</h2>
          <div className="grid grid-cols-3 gap-2.5">
            {quickLinks.map((link) => (
              <button key={link.path} onClick={() => navigate(link.path)} className="quick-link-btn">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${link.gradient}`}>
                  <link.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xs font-medium text-foreground">{link.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Daily Verse */}
        <div className="daily-verse-card mb-5">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-accent" />
            <span className="text-xs font-semibold text-accent">آية اليوم</span>
          </div>
          <p className="font-amiri text-xl leading-[2] text-foreground text-center mb-2">{dailyVerse.text}</p>
          <p className="text-xs text-muted-foreground text-center">سورة {dailyVerse.surah} - آية {dailyVerse.ayah}</p>
        </div>

        {/* Featured Surahs */}
        <div className="mb-5">
          <h2 className="section-title">سور مختارة</h2>
          <div className="grid grid-cols-3 gap-2">
            {featuredSurahs.map((s) => (
              <button key={s.num} onClick={() => navigate(`/quran/${s.num}`)} className="card-surface-hover flex flex-col items-center py-3 gap-1">
                <span className="verse-number text-sm">{s.num}</span>
                <span className="text-xs font-semibold text-foreground mt-1">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Surah List */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title mb-0">سور القرآن الكريم</h2>
            <button onClick={() => navigate('/quran')} className="flex items-center gap-1 text-xs text-primary font-medium">
              عرض الكل <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton-pulse h-16 w-full" />)}
            </div>
          ) : (
            <div className="space-y-2">
              {surahs.slice(0, 10).map((surah) => (
                <button key={surah.number} onClick={() => navigate(`/quran/${surah.number}`)} className="card-surface-hover w-full flex items-center gap-3 text-right">
                  <div className="verse-number flex-shrink-0">{surah.number}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground text-sm">{surah.name}</div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                      <span>{surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}</span>
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

        <div className="text-center py-4">
          <p className="font-amiri text-sm text-muted-foreground">بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
