import React, { useEffect, useMemo, useState } from 'react';
import { Trophy, Flame, Check, Lock, Star, Award, Target, Calendar } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

interface Challenge {
  id: string;
  title: string;
  desc: string;
  goal: number;
  unit: string;
  reward: string;
}

const CHALLENGES: Challenge[] = [
  { id: 'pages-7', title: 'قارئ الأسبوع', desc: 'اقرأ 7 صفحات خلال الأسبوع', goal: 7, unit: 'صفحة', reward: 'قارئ' },
  { id: 'memorize-3', title: 'حافظ ناشئ', desc: 'احفظ 3 آيات جديدة', goal: 3, unit: 'آية', reward: 'حافظ' },
  { id: 'tasbih-700', title: 'مُسبِّح', desc: 'سبّح 700 مرة هذا الأسبوع', goal: 700, unit: 'تسبيحة', reward: 'مسبّح' },
  { id: 'adhkar-7', title: 'مداوم على الأذكار', desc: 'أتمّ أذكار الصباح/المساء 7 أيام', goal: 7, unit: 'يوم', reward: 'مداوم' },
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

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  const totalProgress = useMemo(() => {
    const pct = CHALLENGES.reduce((acc, c) => acc + Math.min(1, (state.progress[c.id] || 0) / c.goal), 0);
    return Math.round((pct / CHALLENGES.length) * 100);
  }, [state]);

  const increment = (c: Challenge, amount = 1) => {
    setState((s) => {
      const cur = (s.progress[c.id] || 0) + amount;
      const next = { ...s, progress: { ...s.progress, [c.id]: cur } };
      if (cur >= c.goal && !s.badges.includes(c.reward)) {
        next.badges = [...s.badges, c.reward];
      }
      return next;
    });
  };

  return (
    <div className="page-container page-with-topbar" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
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
            const cur = state.progress[c.id] || 0;
            const pct = Math.min(100, Math.round((cur / c.goal) * 100));
            const done = cur >= c.goal;
            return (
              <div key={c.id} className={`card-surface ${done ? 'border-primary/30 bg-primary/5' : ''}`}>
                <div className="flex items-start gap-3 mb-2">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${done ? 'gradient-primary' : 'bg-secondary'}`}>
                    {done ? <Check className="w-5 h-5 text-primary-foreground" /> : <Target className="w-5 h-5 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold font-kufi text-foreground">{c.title}</div>
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
  );
};

export default WeeklyChallengePage;
