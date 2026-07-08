import React, { useEffect, useMemo, useState } from 'react';
import SEO from '@/components/SEO';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Flame, Trophy, TrendingUp, Heart, BarChart3 } from 'lucide-react';
import {
  getLastDays,
  getStreak,
  getTopPhrases,
  getAllTimeTotal,
} from '@/lib/tasbihHistory';

const formatShortDate = (d: string) => {
  const dt = new Date(d);
  return `${dt.getDate()}/${dt.getMonth() + 1}`;
};

const TasbihStatsPage: React.FC = () => {
  const navigate = useNavigate();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const onChange = () => setTick((t) => t + 1);
    window.addEventListener('tasbih-history-changed', onChange);
    return () => window.removeEventListener('tasbih-history-changed', onChange);
  }, []);

  const last14 = useMemo(() => getLastDays(14), [tick]);
  const last7Total = useMemo(
    () => last14.slice(-7).reduce((a, b) => a + b.total, 0),
    [last14],
  );
  const streak = useMemo(() => getStreak(), [tick]);
  const top = useMemo(() => getTopPhrases(30), [tick]);
  const allTime = useMemo(() => getAllTimeTotal(), [tick]);

  const max = Math.max(...last14.map((d) => d.total), 1);
  const todayTotal = last14[last14.length - 1]?.total || 0;

  return (
    <>
      <SEO title="إحصاء التسبيح اليومي — قلب القرآن" description="تتبع ذكرك وتسبيحك اليومي بالأرقام." />
      <div className="page-container page-with-topbar" dir="rtl">
      <div className="page-inner">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center"
            aria-label="رجوع"
          >
            <ArrowRight className="w-4 h-4 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">إحصائيات التسبيح</h1>
            <p className="text-xs text-muted-foreground">رحلتك مع الذكر</p>
          </div>
          <button
            onClick={() => navigate('/adhkar')}
            className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold"
          >
            ابدأ التسبيح
          </button>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-2xl p-4 border border-border/40 bg-gradient-to-br from-primary/10 to-primary/5">
            <Heart className="w-5 h-5 text-primary mb-2" />
            <div className="text-2xl font-extrabold text-foreground">
              {todayTotal.toLocaleString('ar-EG')}
            </div>
            <div className="text-[11px] text-muted-foreground">تسبيحة اليوم</div>
          </div>
          <div className="rounded-2xl p-4 border border-border/40 bg-gradient-to-br from-accent/15 to-accent/5">
            <Flame className="w-5 h-5 text-accent mb-2" />
            <div className="text-2xl font-extrabold text-foreground">
              {streak.toLocaleString('ar-EG')}
            </div>
            <div className="text-[11px] text-muted-foreground">يوم متتالي</div>
          </div>
          <div className="rounded-2xl p-4 border border-border/40 bg-card">
            <TrendingUp className="w-5 h-5 text-primary mb-2" />
            <div className="text-2xl font-extrabold text-foreground">
              {last7Total.toLocaleString('ar-EG')}
            </div>
            <div className="text-[11px] text-muted-foreground">آخر ٧ أيام</div>
          </div>
          <div className="rounded-2xl p-4 border border-border/40 bg-card">
            <Trophy className="w-5 h-5 text-accent mb-2" />
            <div className="text-2xl font-extrabold text-foreground">
              {allTime.toLocaleString('ar-EG')}
            </div>
            <div className="text-[11px] text-muted-foreground">المجموع الكلي</div>
          </div>
        </div>

        {/* 14-day chart */}
        <div className="rounded-2xl p-4 border border-border/40 bg-card mb-5">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">آخر ١٤ يومًا</h2>
          </div>
          <div className="flex items-end justify-between gap-1 h-32" dir="ltr">
            {last14.map((d) => {
              const h = d.total > 0 ? Math.max(6, (d.total / max) * 100) : 4;
              const isToday = d.date === last14[last14.length - 1].date;
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md transition-all"
                    style={{
                      height: `${h}%`,
                      background: isToday
                        ? 'linear-gradient(180deg, hsl(var(--primary)), hsl(var(--accent)))'
                        : d.total === 0
                        ? 'hsl(var(--muted))'
                        : 'hsl(var(--primary) / 0.5)',
                    }}
                    title={`${d.date}: ${d.total}`}
                  />
                  <span className="text-[9px] text-muted-foreground tabular-nums">
                    {formatShortDate(d.date)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top phrases */}
        <div className="rounded-2xl p-4 border border-border/40 bg-card">
          <h2 className="text-sm font-bold text-foreground mb-3">الأكثر ذكراً (٣٠ يوم)</h2>
          {top.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">
              لا توجد بيانات بعد. ابدأ التسبيح لتظهر إحصاءاتك هنا.
            </p>
          ) : (
            <div className="space-y-2.5">
              {top.map((p, idx) => {
                const pct = (p.total / top[0].total) * 100;
                return (
                  <div key={p.phrase}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-foreground font-medium truncate">
                        {idx + 1}. {p.phrase}
                      </span>
                      <span className="text-xs text-primary font-bold tabular-nums">
                        {p.total.toLocaleString('ar-EG')}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          background:
                            'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default TasbihStatsPage;
