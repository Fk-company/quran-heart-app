import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Clock, X, Sun, Moon, RotateCw, Volume2, BookOpen, Car, Building2 } from 'lucide-react';
import SEO from '@/components/SEO';
import { usePrayerTimes, PRAYER_NAMES_AR, type PrayerTimings } from '@/hooks/usePrayerTimes';

const ORDER: (keyof PrayerTimings)[] = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const FocusModePage: React.FC = () => {
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());
  const [mode, setMode] = useState<'mosque' | 'car'>(() => (localStorage.getItem('focus_mode_v1') as any) || 'mosque');
  const { data, loading, refresh, nextPrayer } = usePrayerTimes();

  useEffect(() => { localStorage.setItem('focus_mode_v1', mode); }, [mode]);
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Try to wake-lock the screen for mosque/car mode
  useEffect(() => {
    let lock: any = null;
    (async () => {
      try {
        // @ts-ignore — Wake Lock API
        if ('wakeLock' in navigator) { lock = await (navigator as any).wakeLock.request('screen'); }
      } catch {}
    })();
    return () => { try { lock?.release?.(); } catch {} };
  }, []);

  const fmtTime = (s: string) => {
    if (!s) return '—';
    const [h, m] = s.split(':');
    return `${h}:${m}`;
  };

  const remaining = useMemo(() => {
    if (!nextPrayer) return '';
    const total = nextPrayer.minutesUntil;
    const h = Math.floor(total / 60);
    const m = total % 60;
    if (h > 0) return `${h} ساعة و ${m} دقيقة`;
    return `${m} دقيقة`;
  }, [nextPrayer, now]);

  const isCar = mode === 'car';
  const bigText = isCar ? 'text-[10vw]' : 'text-[14vw]';
  const subText = isCar ? 'text-3xl' : 'text-2xl';

  return (
    <div className="fixed inset-0 z-[80] bg-background flex flex-col" dir="rtl" style={{ height: '100dvh' }}>
      <SEO title="وضع المسجد والسيارة | قلب القرآن" description="شاشة عرض كبيرة لمواقيت الصلاة والقبلة والذكر." />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-card/70 backdrop-blur">
        <button
          onClick={() => navigate(-1)}
          className="w-12 h-12 rounded-2xl bg-secondary inline-flex items-center justify-center"
          aria-label="إغلاق"
        >
          <X className="w-6 h-6 text-foreground" />
        </button>
        <div className="flex gap-1.5 p-1 bg-secondary/60 rounded-2xl">
          <button
            onClick={() => setMode('mosque')}
            className={`px-4 py-2 rounded-xl text-sm font-extrabold inline-flex items-center gap-1.5 transition ${
              mode === 'mosque' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground'
            }`}
          >
            <Building2 className="w-4 h-4" /> مسجد
          </button>
          <button
            onClick={() => setMode('car')}
            className={`px-4 py-2 rounded-xl text-sm font-extrabold inline-flex items-center gap-1.5 transition ${
              mode === 'car' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground'
            }`}
          >
            <Car className="w-4 h-4" /> سيارة
          </button>
        </div>
        <button
          onClick={() => refresh({ useGeo: true })}
          disabled={loading}
          className="w-12 h-12 rounded-2xl bg-secondary inline-flex items-center justify-center disabled:opacity-50"
          aria-label="تحديث"
        >
          <RotateCw className={`w-5 h-5 text-foreground ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">

          {/* Giant clock + next prayer */}
          <div className="text-center">
            <div className={`font-bold tabular-nums tracking-tight text-foreground ${bigText} leading-none`}>
              {String(now.getHours()).padStart(2, '0')}:{String(now.getMinutes()).padStart(2, '0')}
            </div>
            <div className={`mt-2 text-muted-foreground ${subText} font-semibold`}>
              {now.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}
              {data?.date?.hijri && ` · ${data.date.hijri.date} ${data.date.hijri.month.ar}`}
            </div>
          </div>

          {/* Next prayer banner — extra large */}
          {nextPrayer && (
            <div className="rounded-3xl p-8 border-2 border-primary/30 bg-gradient-to-br from-primary/15 via-accent/10 to-transparent text-center shadow-lg">
              <div className="text-sm font-extrabold text-primary tracking-widest mb-2">الصلاة القادمة</div>
              <div className="text-5xl md:text-7xl font-extrabold text-foreground mb-3">{nextPrayer.name}</div>
              <div className="text-3xl md:text-5xl font-bold tabular-nums text-accent mb-3">{fmtTime(nextPrayer.time)}</div>
              <div className="inline-flex items-center gap-2 text-lg md:text-2xl text-foreground/80 bg-background/60 rounded-full px-5 py-2">
                <Clock className="w-5 h-5 md:w-6 md:h-6" />
                <span>متبقّي {remaining}</span>
              </div>
            </div>
          )}

          {/* All prayers grid — big */}
          {data && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {ORDER.map((k) => {
                const active = nextPrayer?.key === k;
                return (
                  <div
                    key={k}
                    className={`rounded-2xl p-4 md:p-6 text-center border-2 transition ${
                      active
                        ? 'bg-primary text-primary-foreground border-primary shadow-lg scale-[1.02]'
                        : 'bg-card border-border/40 text-foreground'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5 text-base md:text-xl font-extrabold mb-1">
                      {k === 'Fajr' && <Moon className="w-4 h-4 md:w-5 md:h-5" />}
                      {k === 'Sunrise' && <Sun className="w-4 h-4 md:w-5 md:h-5" />}
                      {PRAYER_NAMES_AR[k]}
                    </div>
                    <div className="text-2xl md:text-4xl font-bold tabular-nums">{fmtTime(data.timings[k])}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Big action buttons */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => navigate('/qibla')}
              className="rounded-2xl p-5 md:p-7 bg-accent/15 border-2 border-accent/30 text-accent font-extrabold text-base md:text-xl inline-flex flex-col items-center gap-2"
            >
              <Compass className="w-8 h-8 md:w-10 md:h-10" />
              القبلة
            </button>
            <button
              onClick={() => navigate('/adhkar')}
              className="rounded-2xl p-5 md:p-7 bg-primary/15 border-2 border-primary/30 text-primary font-extrabold text-base md:text-xl inline-flex flex-col items-center gap-2"
            >
              <BookOpen className="w-8 h-8 md:w-10 md:h-10" />
              الأذكار
            </button>
            <button
              onClick={() => navigate('/radio')}
              className="rounded-2xl p-5 md:p-7 bg-secondary border-2 border-border/40 text-foreground font-extrabold text-base md:text-xl inline-flex flex-col items-center gap-2"
            >
              <Volume2 className="w-8 h-8 md:w-10 md:h-10" />
              الإذاعة
            </button>
          </div>

          {!data && !loading && (
            <div className="text-center py-10">
              <button
                onClick={() => refresh({ useGeo: true })}
                className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-extrabold"
              >
                تحديد موقعي وعرض المواقيت
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FocusModePage;
