import React, { useEffect, useState } from 'react';
import SEO from '@/components/SEO';
import { CheckCircle2, Circle, Moon, Flame, TrendingUp } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

const KEY = 'fasting_tracker_v1';

type FastType = 'monday' | 'thursday' | 'white' | 'ashura' | 'arafah' | 'other';

interface FastEntry { date: string; type: FastType; note?: string; }

const typeLabels: Record<FastType, string> = {
  monday: 'الإثنين', thursday: 'الخميس', white: 'الأيام البيض', ashura: 'عاشوراء', arafah: 'عرفة', other: 'أخرى',
};

function load(): FastEntry[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
function save(d: FastEntry[]) { localStorage.setItem(KEY, JSON.stringify(d)); }

const FastingTrackerPage: React.FC = () => {
  const [entries, setEntries] = useState<FastEntry[]>(load);
  const [type, setType] = useState<FastType>('monday');
  const today = new Date().toISOString().slice(0, 10);
  const todayFasted = entries.some(e => e.date === today);

  useEffect(() => { save(entries); }, [entries]);

  const toggleToday = () => {
    if (todayFasted) setEntries(entries.filter(e => e.date !== today));
    else setEntries([{ date: today, type }, ...entries]);
  };

  // Stats
  const thisMonth = entries.filter(e => e.date.startsWith(today.slice(0, 7))).length;
  const total = entries.length;
  // streak of recent consecutive days
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  let cursor = new Date(today);
  for (const e of sorted) {
    if (e.date === cursor.toISOString().slice(0, 10)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else break;
  }

  // Calendar grid: last 35 days
  const days = Array.from({ length: 35 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (34 - i));
    return d.toISOString().slice(0, 10);
  });

  return (
    <>
      <SEO title="متتبع الصيام — صيام النوافل" description="سجّل أيام صيام النوافل وتتبع تقدمك في عبادة الصيام." />
      <div className="page-container page-with-topbar" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <PageHeader icon={Moon} title="متتبع الصيام" subtitle="سجّل صيام النوافل واحفظ أجرك" showBack gradient="primary" />

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="stat-card text-center">
            <div className="stat-card-icon bg-primary/10 mx-auto"><Flame className="w-4 h-4 text-primary" /></div>
            <div className="stat-card-value">{streak}</div>
            <div className="stat-card-label">سلسلة</div>
          </div>
          <div className="stat-card text-center">
            <div className="stat-card-icon bg-accent/10 mx-auto"><Moon className="w-4 h-4 text-accent" /></div>
            <div className="stat-card-value">{thisMonth}</div>
            <div className="stat-card-label">هذا الشهر</div>
          </div>
          <div className="stat-card text-center">
            <div className="stat-card-icon bg-emerald-light mx-auto"><TrendingUp className="w-4 h-4 text-primary" /></div>
            <div className="stat-card-value">{total}</div>
            <div className="stat-card-label">المجموع</div>
          </div>
        </div>

        <div className="card-surface p-5 mb-4">
          <h3 className="font-bold text-foreground mb-3 text-sm">سجل صيام اليوم</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {(Object.keys(typeLabels) as FastType[]).map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  type === t ? 'gradient-primary text-primary-foreground' : 'bg-secondary text-foreground'
                }`}
              >
                {typeLabels[t]}
              </button>
            ))}
          </div>
          <button
            onClick={toggleToday}
            className={`w-full py-3 rounded-2xl font-bold transition-all ${
              todayFasted ? 'bg-primary/15 text-primary border border-primary/30' : 'gradient-primary text-primary-foreground shadow-emerald'
            }`}
          >
            {todayFasted ? '✓ تم تسجيل صيام اليوم' : 'تأكيد صيام اليوم'}
          </button>
        </div>

        <div className="card-surface p-5 mb-4">
          <h3 className="font-bold text-foreground mb-3 text-sm">آخر 35 يوماً</h3>
          <div className="grid grid-cols-7 gap-1.5">
            {days.map(d => {
              const fasted = entries.some(e => e.date === d);
              const isToday = d === today;
              return (
                <div
                  key={d}
                  className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold ${
                    fasted ? 'gradient-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                  } ${isToday ? 'ring-2 ring-accent' : ''}`}
                  title={d}
                >
                  {parseInt(d.slice(-2), 10)}
                </div>
              );
            })}
          </div>
        </div>

        {entries.length > 0 && (
          <div className="card-surface p-5">
            <h3 className="font-bold text-foreground mb-3 text-sm">السجل الأخير</h3>
            <div className="space-y-2">
              {entries.slice(0, 10).map((e, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                  <span className="text-xs text-muted-foreground">{e.date}</span>
                  <span className="text-sm font-semibold text-foreground">{typeLabels[e.type]}</span>
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default FastingTrackerPage;
