import React, { useEffect, useMemo, useState } from 'react';
import SEO from '@/components/SEO';
import { CalendarDays, ChevronLeft, ChevronRight, Loader2, Star, Moon } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

const ALADHAN = 'https://api.aladhan.com/v1';

const HIJRI_MONTHS_AR = [
  'محرّم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة',
  'رجب', 'شعبان', 'رمضان', 'شوّال', 'ذو القعدة', 'ذو الحجّة'
];

const WEEKDAYS_AR = ['الأحد', 'الإث', 'الثلا', 'الأرب', 'الخمي', 'الجم', 'السبت'];

interface CalendarDay {
  hijri: { day: string; month: { number: number; ar: string }; year: string; weekday: { en: string }; holidays?: string[] };
  gregorian: { day: string; month: { number: number; en: string }; year: string };
}

const ISLAMIC_EVENTS: Record<string, { name: string; type: 'fast' | 'eid' | 'sacred' | 'history' }> = {
  '1-1': { name: 'رأس السنة الهجرية', type: 'sacred' },
  '1-10': { name: 'يوم عاشوراء — استحباب الصيام', type: 'fast' },
  '3-12': { name: 'المولد النبوي الشريف', type: 'sacred' },
  '7-27': { name: 'الإسراء والمعراج', type: 'history' },
  '8-15': { name: 'ليلة النصف من شعبان', type: 'sacred' },
  '9-1': { name: 'بداية شهر رمضان المبارك', type: 'fast' },
  '9-27': { name: 'ليلة القدر (محتملة)', type: 'sacred' },
  '10-1': { name: 'عيد الفطر المبارك', type: 'eid' },
  '12-9': { name: 'يوم عرفة — استحباب الصيام', type: 'fast' },
  '12-10': { name: 'عيد الأضحى المبارك', type: 'eid' },
};

const eventBadgeClass = (type: string) => {
  switch (type) {
    case 'eid': return 'bg-accent/15 text-accent border-accent/30';
    case 'fast': return 'bg-primary/15 text-primary border-primary/30';
    case 'sacred': return 'bg-purple-500/15 text-purple-500 border-purple-500/30';
    default: return 'bg-secondary text-foreground border-border';
  }
};

const HijriCalendarPage: React.FC = () => {
  const [days, setDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [hMonth, setHMonth] = useState<number>(0);
  const [hYear, setHYear] = useState<number>(0);

  // Initialize current Hijri month/year from API
  useEffect(() => {
    (async () => {
      try {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const res = await fetch(`${ALADHAN}/gToH/${dd}-${mm}-${today.getFullYear()}`);
        const data = await res.json();
        const h = data?.data?.hijri;
        if (h) {
          setHMonth(parseInt(h.month.number, 10));
          setHYear(parseInt(h.year, 10));
        }
      } catch {
        const fallbackYear = 1447;
        setHMonth(1);
        setHYear(fallbackYear);
      }
    })();
  }, []);

  useEffect(() => {
    if (!hMonth || !hYear) return;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(`${ALADHAN}/hToGCalendar/${hMonth}/${hYear}`);
        const data = await res.json();
        if (Array.isArray(data?.data)) setDays(data.data);
      } catch {
        setDays([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [hMonth, hYear]);

  const todayKey = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  }, []);

  const goPrev = () => {
    if (hMonth === 1) { setHMonth(12); setHYear(hYear - 1); }
    else setHMonth(hMonth - 1);
  };
  const goNext = () => {
    if (hMonth === 12) { setHMonth(1); setHYear(hYear + 1); }
    else setHMonth(hMonth + 1);
  };

  // Build calendar grid: pad with empty cells to align first day to its weekday
  const grid = useMemo(() => {
    if (!days.length) return [] as Array<CalendarDay | null>;
    const firstWeekday = new Date(
      parseInt(days[0].gregorian.year, 10),
      parseInt(String(days[0].gregorian.month.number), 10) - 1,
      parseInt(days[0].gregorian.day, 10)
    ).getDay(); // 0=Sun
    const cells: Array<CalendarDay | null> = Array(firstWeekday).fill(null);
    return cells.concat(days);
  }, [days]);

  const monthEvents = useMemo(() => {
    return days
      .map((d) => {
        const key = `${parseInt(String(d.hijri.month.number), 10)}-${parseInt(d.hijri.day, 10)}`;
        return ISLAMIC_EVENTS[key] ? { day: d, ...ISLAMIC_EVENTS[key] } : null;
      })
      .filter(Boolean) as Array<{ day: CalendarDay; name: string; type: string }>;
  }, [days]);

  return (
    <>
      <SEO title="التقويم الهجري والمناسبات الإسلامية" description="التقويم الهجري الإسلامي مع المناسبات والأشهر الحرم وتحويل التواريخ." />
      <div className="page-container page-with-topbar" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <PageHeader
          icon={CalendarDays}
          title="التقويم الهجري"
          subtitle="الأشهر والمناسبات الإسلامية"
          gradient="primary"
          showBack
        />

        {/* Month navigation */}
        <div className="card-luxury mb-4 flex items-center justify-between">
          <button onClick={goPrev} className="w-10 h-10 rounded-xl bg-secondary hover:bg-muted flex items-center justify-center transition-colors" aria-label="الشهر السابق">
            <ChevronRight className="w-4 h-4 text-foreground" />
          </button>
          <div className="text-center">
            <div className="text-base font-bold text-foreground font-kufi">
              {hMonth ? HIJRI_MONTHS_AR[hMonth - 1] : '...'} {hYear || ''}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">هجري</div>
          </div>
          <button onClick={goNext} className="w-10 h-10 rounded-xl bg-secondary hover:bg-muted flex items-center justify-center transition-colors" aria-label="الشهر التالي">
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
        </div>

        {/* Calendar grid */}
        <div className="card-luxury mb-5">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS_AR.map((d) => (
              <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground py-1">{d}</div>
            ))}
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {grid.map((cell, idx) => {
                if (!cell) return <div key={idx} className="aspect-square" />;
                const gKey = `${parseInt(cell.gregorian.year, 10)}-${parseInt(String(cell.gregorian.month.number), 10)}-${parseInt(cell.gregorian.day, 10)}`;
                const isToday = gKey === todayKey;
                const eventKey = `${parseInt(String(cell.hijri.month.number), 10)}-${parseInt(cell.hijri.day, 10)}`;
                const event = ISLAMIC_EVENTS[eventKey];
                return (
                  <div
                    key={idx}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center text-center transition-all border ${
                      isToday
                        ? 'bg-primary text-primary-foreground border-primary shadow-emerald'
                        : event
                          ? 'bg-accent/10 border-accent/30 text-foreground'
                          : 'bg-secondary/40 border-border/40 text-foreground hover:bg-secondary'
                    }`}
                  >
                    <span className={`text-sm font-bold font-kufi leading-none ${isToday ? 'text-primary-foreground' : ''}`}>{parseInt(cell.hijri.day, 10)}</span>
                    <span className={`text-[8px] mt-0.5 ${isToday ? 'opacity-80' : 'text-muted-foreground'}`}>{parseInt(cell.gregorian.day, 10)}</span>
                    {event && !isToday && <span className="w-1 h-1 rounded-full bg-accent mt-0.5" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Events */}
        <div className="mb-6">
          <h2 className="section-title flex items-center gap-2"><Star className="w-4 h-4 text-accent" /> مناسبات هذا الشهر</h2>
          {monthEvents.length === 0 ? (
            <div className="card-surface text-center text-sm text-muted-foreground py-6">
              <Moon className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
              لا توجد مناسبات بارزة في هذا الشهر
            </div>
          ) : (
            <div className="space-y-2">
              {monthEvents.map((ev, i) => (
                <div key={i} className="card-surface flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-kufi text-sm font-bold text-primary">{parseInt(ev.day.hijri.day, 10)}</span>
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <div className="font-bold text-foreground text-sm font-kufi line-clamp-1">{ev.name}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {parseInt(ev.day.hijri.day, 10)} {HIJRI_MONTHS_AR[hMonth - 1]} · {parseInt(ev.day.gregorian.day, 10)}/{parseInt(String(ev.day.gregorian.month.number), 10)}
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold rounded-full px-2 py-1 border ${eventBadgeClass(ev.type)}`}>
                    {ev.type === 'eid' ? 'عيد' : ev.type === 'fast' ? 'صيام' : ev.type === 'sacred' ? 'مبارك' : 'تاريخي'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default HijriCalendarPage;
