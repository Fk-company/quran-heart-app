import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Book, Mic, Radio, Clock, Moon, Sun, Sunrise, Sunset,
  CloudSun, Heart, Search, MapPin, ChevronLeft, Star, BookOpen,
  Users, Quote, Calendar, Bell, BellOff, Feather, BarChart3,
  TrendingUp, Sparkles, Baby, Brain, Smile, Lightbulb, Bot, Settings,
  Flame, Trophy
} from 'lucide-react';
import { fetchPrayerTimes, fetchSurahs, type PrayerTimes, type Surah } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';
import { useLastRead } from '@/hooks/useLastRead';
import { useNotifications } from '@/hooks/useNotifications';
import { useReadingTracker } from '@/hooks/useReadingTracker';
import { useFavorites } from '@/hooks/useFavorites';

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
      sendAdhkarReminder();
      if (prayerTimes) {
        prayerOrder.forEach(key => {
          if (key === 'Sunrise') return;
          const time = prayerTimes[key]?.split(' ')[0];
          if (time) schedulePrayerNotification(prayerNames[key], time);
        });
      }
    }
  }, [notificationsEnabled, requestPermission, prayerTimes, schedulePrayerNotification, sendAdhkarReminder]);

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

  const primaryActions = [
    { label: 'المصحف', icon: Book, path: '/quran', gradient: 'gradient-primary' },
    { label: 'القراء', icon: Mic, path: '/reciters', gradient: 'gradient-gold' },
    { label: 'الأذكار', icon: Heart, path: '/adhkar', gradient: 'gradient-primary' },
    { label: 'الراديو', icon: Radio, path: '/radio', gradient: 'gradient-gold' },
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
    <div className="page-container" dir="rtl">
      <div className="px-4 pt-6 pb-4 max-w-lg mx-auto">

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
          <div className="flex items-center gap-2 mb-4 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground bg-secondary/60 rounded-full px-3 py-1.5 border border-border/40">
              <MapPin className="w-3 h-3" />
              <span className="font-medium">{locationName}</span>
            </div>
            {prayerTimes && themeMode !== 'auto' && (
              <button onClick={() => setAutoMode({ Fajr: prayerTimes.Fajr, Maghrib: prayerTimes.Maghrib })} className="text-[10px] text-primary bg-primary/10 rounded-full px-2.5 py-1.5 font-semibold border border-primary/15">
                وضع تلقائي
              </button>
            )}
          </div>
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
                  <span className={`text-xs font-bold mt-0.5 ${isNext ? 'text-primary' : 'text-foreground'}`}>{displayTime}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <button onClick={() => navigate('/reading-stats')} className="stat-card text-right">
            <div className="stat-card-icon bg-primary/10"><Flame className="w-4 h-4 text-primary" /></div>
            <div className="stat-card-value">{streak}</div>
            <div className="stat-card-label">يوم متتالي</div>
          </button>
          <button onClick={() => navigate('/quran-stats')} className="stat-card text-right">
            <div className="stat-card-icon bg-gold-light"><Trophy className="w-4 h-4 text-gold-deep" /></div>
            <div className="stat-card-value">{totalAyahsRead}</div>
            <div className="stat-card-label">آية مقروءة</div>
          </button>
          <button onClick={() => navigate('/favorites')} className="stat-card text-right">
            <div className="stat-card-icon bg-destructive/10"><Heart className="w-4 h-4 text-destructive" /></div>
            <div className="stat-card-value">{favCount}</div>
            <div className="stat-card-label">المفضلة</div>
          </button>
        </div>

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

        {/* Primary Actions — Big icons */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          {primaryActions.map((link) => (
            <button key={link.path} onClick={() => navigate(link.path)} className="quick-link-btn">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${link.gradient} shadow-emerald`}>
                <link.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xs font-bold text-foreground leading-tight text-center">{link.label}</span>
            </button>
          ))}
        </div>

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

        {/* Spiritual shortcuts */}
        <div className="mb-5">
          <h2 className="section-title">الروح والقلب</h2>
          <div className="grid grid-cols-4 gap-2">
            {spiritualLinks.map((link) => (
              <button key={link.path} onClick={() => navigate(link.path)} className="quick-link-btn">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/8 to-accent/8 border border-border/50 flex items-center justify-center">
                  <link.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-[10px] font-semibold text-foreground leading-tight text-center">{link.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Featured Surahs */}
        <div className="mb-5">
          <div className="section-title-row">
            <h2 className="section-title mb-0">سور مختارة</h2>
            <button onClick={() => navigate('/quran')} className="text-xs text-primary font-semibold flex items-center gap-1">
              الكل <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {featuredSurahs.map((s) => (
              <button key={s.num} onClick={() => navigate(`/quran/${s.num}`)} className="card-surface-hover flex flex-col items-center py-3 gap-1.5">
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
            <div className="space-y-2">
              {surahs.slice(0, 8).map((surah) => (
                <button key={surah.number} onClick={() => navigate(`/quran/${surah.number}`)} className="card-surface-hover w-full flex items-center gap-3 text-right">
                  <div className="verse-number flex-shrink-0">{surah.number}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-foreground text-sm font-kufi">{surah.name}</div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
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

        <div className="text-center py-6">
          <p className="font-amiri text-base text-muted-foreground">بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
