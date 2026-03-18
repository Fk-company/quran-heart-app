import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Mic, Radio, Clock, Moon, Sun, Sunrise, Sunset, CloudSun, Heart } from 'lucide-react';
import { fetchPrayerTimes, fetchSurahs, type PrayerTimes, type Surah } from '@/lib/api';

const prayerIcons: Record<string, React.ElementType> = {
  Fajr: Sunrise,
  Sunrise: Sun,
  Dhuhr: CloudSun,
  Asr: Sun,
  Maghrib: Sunset,
  Isha: Moon,
};

const prayerNames: Record<string, string> = {
  Fajr: 'الفجر',
  Sunrise: 'الشروق',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء',
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; remaining: string } | null>(null);
  const [locationName, setLocationName] = useState('جاري التحديد...');
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Get location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              const data = await fetchPrayerTimes(pos.coords.latitude, pos.coords.longitude);
              setPrayerTimes(data.timings);
              setLocationName(data.date?.hijri?.designation?.expanded || 'موقعك الحالي');
              calculateNextPrayer(data.timings);
            },
            async () => {
              // Default: Makkah
              const data = await fetchPrayerTimes(21.4225, 39.8262);
              setPrayerTimes(data.timings);
              setLocationName('مكة المكرمة');
              calculateNextPrayer(data.timings);
            }
          );
        }

        const surahData = await fetchSurahs();
        setSurahs(surahData.slice(0, 5));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const calculateNextPrayer = (timings: PrayerTimes) => {
    const now = new Date();
    const prayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

    for (const prayer of prayers) {
      const [h, m] = timings[prayer].split(':').map(Number);
      const prayerDate = new Date();
      prayerDate.setHours(h, m, 0, 0);

      if (prayerDate > now) {
        const diff = prayerDate.getTime() - now.getTime();
        const hours = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        setNextPrayer({
          name: prayerNames[prayer],
          time: timings[prayer],
          remaining: `${hours} ساعة و ${mins} دقيقة`,
        });
        return;
      }
    }
    setNextPrayer({ name: prayerNames.Fajr, time: timings.Fajr, remaining: 'غداً' });
  };

  const quickLinks = [
    { label: 'المصحف', icon: Book, path: '/quran', color: 'bg-primary' },
    { label: 'القراء', icon: Mic, path: '/reciters', color: 'bg-accent' },
    { label: 'الراديو', icon: Radio, path: '/radio', color: 'bg-primary' },
    { label: 'الاذكار', icon: Heart, path: '/adhkar', color: 'bg-accent' },
  ];

  return (
    <div className="page-container" dir="rtl">
      <div className="px-4 pt-6 pb-4 max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">القرآن الكريم</h1>
          <p className="text-sm text-muted-foreground mt-1">بسم الله الرحمن الرحيم</p>
        </div>

        {/* Prayer Times Card */}
        <div className="gradient-primary rounded-2xl p-5 mb-6 text-primary-foreground">
          {loading || !nextPrayer ? (
            <div className="space-y-3">
              <div className="skeleton-pulse h-6 w-32 rounded opacity-30" />
              <div className="skeleton-pulse h-10 w-48 rounded opacity-30" />
              <div className="skeleton-pulse h-4 w-40 rounded opacity-30" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm opacity-90">الصلاة القادمة</span>
              </div>
              <div className="text-3xl font-bold mb-1">{nextPrayer.name}</div>
              <div className="text-lg opacity-90 mb-1">{nextPrayer.time}</div>
              <div className="text-sm opacity-75">متبقي {nextPrayer.remaining}</div>
            </>
          )}
        </div>

        {/* Prayer Times Grid */}
        {prayerTimes && (
          <div className="grid grid-cols-3 gap-2 mb-6">
            {(['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha', 'Sunrise'] as const).map((key) => {
              const Icon = prayerIcons[key];
              return (
                <div key={key} className="card-surface flex flex-col items-center py-3">
                  <Icon className="w-4 h-4 text-primary mb-1" />
                  <span className="text-xs text-muted-foreground">{prayerNames[key]}</span>
                  <span className="text-sm font-semibold text-foreground mt-0.5">{prayerTimes[key]}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {quickLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className="flex flex-col items-center gap-2 py-3"
            >
              <div className={`w-12 h-12 rounded-xl ${link.color} flex items-center justify-center`}>
                <link.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xs font-medium text-foreground">{link.label}</span>
            </button>
          ))}
        </div>

        {/* Recent Surahs */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title mb-0">سور القرآن</h2>
            <button onClick={() => navigate('/quran')} className="text-sm text-primary font-medium">
              عرض الكل
            </button>
          </div>
          <div className="space-y-2">
            {surahs.map((surah) => (
              <button
                key={surah.number}
                onClick={() => navigate(`/quran/${surah.number}`)}
                className="card-surface w-full flex items-center gap-3 text-right"
              >
                <div className="verse-number flex-shrink-0">{surah.number}</div>
                <div className="flex-1">
                  <div className="font-semibold text-foreground text-sm">{surah.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} - {surah.numberOfAyahs} آيات
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
