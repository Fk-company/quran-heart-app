import React, { useEffect, useMemo, useState } from 'react';
import SEO from '@/components/SEO';
import { Trophy, Flame, Check, Lock, Award, Target, Calendar, Zap } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useReadingTracker } from '@/hooks/useReadingTracker';
import { getLastDays } from '@/lib/tasbihHistory';
import { useNotifications } from '@/hooks/useNotifications';

interface Challenge {
  id: string;
  title: string;
  desc: string;
  goal: number;
  unit: string;
  reward: string;
  auto?: boolean;
}

const CHALLENGES: Challenge[] = [
  { id: 'pages-7', title: 'قارئ الأسبوع', desc: 'اقرأ 7 صفحات خلال الأسبوع', goal: 7, unit: 'صفحة', reward: 'قارئ', auto: true },
  { id: 'ayahs-50', title: 'حافظ ناشئ', desc: 'اقرأ/راجع 50 آية', goal: 50, unit: 'آية', reward: 'حافظ', auto: true },
  { id: 'tasbih-700', title: 'مُسبِّح', desc: 'سبّح 700 مرة هذا الأسبوع', goal: 700, unit: 'تسبيحة', reward: 'مسبّح', auto: true },
  { id: 'adhkar-7', title: 'مداوم على الأذكار', desc: 'أتمّ أذكاراً في 7 أيام', goal: 7, unit: 'يوم', reward: 'مداوم', auto: true },
];

interface State {
  weekStart: string;
  progress: Record<string, number>;
  badges: string[];
}

const weekStartStr = () => {
  const d = new Date();
  const day = d.getDay(); // 0=Sun
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
};

const KEY = 'weekly_challenge_v1';
const load = (): State => {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (raw && raw.weekStart === weekStartStr()) return raw;
    return { weekStart: weekStartStr(), progress: {}, badges: raw?.badges || [] };
  } catch { return { weekStart: weekStartStr(), progress: {}, badges: [] }; }
};

const WeeklyChallengePage: React.FC = () => {
  const [state, setState] = useState<State>(load);
  const { tracker } = useReadingTracker();
  const { sendNotification, scheduleDailyReminder, permission } = useNotifications();

  // Weekly challenge notifications: start-of-week kickoff + daily wird reminder (~09:00).
  useEffect(() => {
    if (permission !== 'granted') return;
    if (localStorage.getItem('notifications_enabled') !== 'true') return;
    const startKey = `wc_start_notified_${state.weekStart}`;
    if (!localStorage.getItem(startKey)) {
      sendNotification('بدأ التحدي الأسبوعي 🏆', 'تحديات جديدة تنتظرك هذا الأسبوع — ابدأ الآن واكسب شاراتك');
      localStorage.setItem(startKey, '1');
    }
    const dayKey = new Date().toISOString().slice(0, 10);
    const dailyKey = `wc_wird_notified_${dayKey}`;
    if (!localStorage.getItem(dailyKey)) {
      scheduleDailyReminder(
        '09:00',
        'تذكير الورد اليومي',
        'لا تنسَ وردك ضمن التحدي الأسبوعي — صفحة واحدة تكفي لإكمال هدفك',
        `wc-wird-${dayKey}`,
      );
      localStorage.setItem(dailyKey, '1');
    }
  }, [state.weekStart, permission, sendNotification, scheduleDailyReminder]);

  // Auto-sync with reading tracker + tasbih history (last 7 days)
  const auto = useMemo(() => {
    const ws = new Date(state.weekStart);
    const weekRecords = (tracker?.dailyRecords || []).filter(r => new Date(r.date) >= ws);
    const pages = weekRecords.reduce((a, r) => a + (r.pagesRead || 0), 0);
    const ayahs = weekRecords.reduce((a, r) => a + (r.ayahsRead || 0), 0);
    const tasbihDays = getLastDays(7);
    const tasbih = tasbihDays.reduce((a, d) => a + d.total, 0);
    let adhkarDays = 0;
    try {
      for (let i = 0; i < 7; i++) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const key = `adhkar_done_${d.toISOString().slice(0, 10)}`;
        if (localStorage.getItem(key)) adhkarDays++;
      }
    } catch {}
    return { 'pages-7': pages, 'ayahs-50': ayahs, 'tasbih-700': tasbih, 'adhkar-7': adhkarDays } as Record<string, number>;
  }, [tracker, state.weekStart]);

  // Auto-award badges based on synced progress
  useEffect(() => {
    setState(s => {
      const newBadges = [...s.badges];
      let changed = false;
      for (const c of CHALLENGES) {
        const cur = Math.max(s.progress[c.id] || 0, auto[c.id] || 0);
        if (cur >= c.goal && !newBadges.includes(c.reward)) {
          newBadges.push(c.reward); changed = true;
        }
      }
      return changed ? { ...s, badges: newBadges } : s;
    });
  }, [auto]);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  const getProgress = (c: Challenge) => Math.max(state.progress[c.id] || 0, auto[c.id] || 0);

  const totalProgress = useMemo(() => {
    const pct = CHALLENGES.reduce((acc, c) => acc + Math.min(1, getProgress(c) / c.goal), 0);
    return Math.round((pct / CHALLENGES.length) * 100);
  }, [state, auto]);

  const increment = (c: Challenge, amount = 1) => {
    setState((s) => {
      const cur = (s.progress[c.id] || 0) + amount;
      const next = { ...s, progress: { ...s.progress, [c.id]: cur } };
      const effective = Math.max(cur, auto[c.id] || 0);
      if (effective >= c.goal && !s.badges.includes(c.reward)) {
        next.badges = [...s.badges, c.reward];
      }
      return next;
    });
  };

  return (
    <>
      <SEO title="التحدي الأسبوعي — قلب القرآن" description="تحديات أسبوعية للقراءة والحفظ والذكر مع شارات إنجاز." />
      <div className="page-container page-with-topbar" dir="rtl">
      <div className="page-inner">
        <PageHeader icon={Trophy} title="التحدي الأسبوعي" subtitle="أنجز التحديات واكسب الشارات" showBack />

        <div className="gradient-hero islamic-pattern islamic-pattern-arabesque rounded-3xl p-5 mb-4 text-primary-foreground shadow-emerald">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 bg-primary-foreground/10 rounded-full px-3 py-1.5 border border-primary-foreground/15">
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold">أسبوع {state.weekStart}</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-accent/20 border border-accent/40 rounded-full px-2.5 py-1">
              <Flame className="w-3 h-3" /> {state.badges.length} شارة
            </span>
          </div>
          <div className="text-3xl font-bold mb-1 font-kufi">{totalProgress}%</div>
          <div className="text-[11px] opacity-80 mb-3">من تحديات هذا الأسبوع</div>
          <div className="h-2 rounded-full bg-primary-foreground/15 overflow-hidden">
            <div className="h-full bg-accent transition-all duration-500" style={{ width: `${totalProgress}%` }} />
          </div>
        </div>

        <div className="space-y-2.5 mb-6">
          {CHALLENGES.map((c) => {
            const cur = getProgress(c);
            const pct = Math.min(100, Math.round((cur / c.goal) * 100));
            const done = cur >= c.goal;
            const isAuto = (auto[c.id] || 0) >= (state.progress[c.id] || 0);
            return (
              <div key={c.id} className={`card-surface ${done ? 'border-primary/30 bg-primary/5' : ''}`}>
                <div className="flex items-start gap-3 mb-2">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${done ? 'gradient-primary' : 'bg-secondary'}`}>
                    {done ? <Check className="w-5 h-5 text-primary-foreground" /> : <Target className="w-5 h-5 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <div className="text-sm font-bold font-kufi text-foreground">{c.title}</div>
                      {c.auto && isAuto && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-primary bg-primary/10 rounded-full px-1.5 py-0.5">
                          <Zap className="w-2.5 h-2.5" /> تلقائي
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground">{c.desc}</div>
                  </div>
                  <span className="text-[11px] font-bold text-primary whitespace-nowrap">{cur}/{c.goal}</span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden mb-2">
                  <div className="h-full gradient-primary transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => increment(c, 1)} disabled={done}
                    className="flex-1 text-xs font-bold py-1.5 rounded-lg bg-secondary hover:bg-primary/10 disabled:opacity-40">+1 {c.unit}</button>
                  <button onClick={() => increment(c, 10)} disabled={done}
                    className="flex-1 text-xs font-bold py-1.5 rounded-lg bg-secondary hover:bg-primary/10 disabled:opacity-40">+10</button>
                </div>
              </div>
            );
          })}
        </div>


        <h2 className="section-title">شاراتي ({state.badges.length})</h2>
        <div className="grid grid-cols-4 gap-2 mb-6">
          {['قارئ', 'حافظ', 'مسبّح', 'مداوم'].map((b) => {
            const earned = state.badges.includes(b);
            return (
              <div key={b} className={`flex flex-col items-center py-3 rounded-2xl ${earned ? 'gradient-gold shadow-emerald' : 'bg-secondary opacity-60'}`}>
                {earned ? <Award className="w-6 h-6 text-primary-foreground" /> : <Lock className="w-5 h-5 text-muted-foreground" />}
                <span className={`text-[10px] font-bold mt-1 ${earned ? 'text-primary-foreground' : 'text-muted-foreground'}`}>{b}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
    </>
  );
};

export default WeeklyChallengePage;
