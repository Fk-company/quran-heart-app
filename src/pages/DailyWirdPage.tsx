import React, { useEffect, useMemo, useState } from 'react';
import SEO from '@/components/SEO';
import { useNavigate } from 'react-router-dom';
import { Sparkles, BookOpen, Heart, Feather, Check, ChevronLeft, RotateCcw, Flame, Sunrise, Moon } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

interface WirdItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  path: string;
  color: string;
  category: 'quran' | 'morning' | 'evening' | 'dua' | 'tasbih';
}

const DEFAULT_ITEMS: WirdItem[] = [
  { id: 'quran-page', title: 'صفحة من المصحف', subtitle: 'قراءة صفحة واحدة على الأقل', icon: BookOpen, path: '/mushaf', color: 'gradient-primary', category: 'quran' },
  { id: 'morning-adhkar', title: 'أذكار الصباح', subtitle: 'الورد الصباحي الكامل', icon: Sunrise, path: '/adhkar?cat=morning', color: 'gradient-gold', category: 'morning' },
  { id: 'evening-adhkar', title: 'أذكار المساء', subtitle: 'الورد المسائي الكامل', icon: Moon, path: '/adhkar?cat=evening', color: 'gradient-primary', category: 'evening' },
  { id: 'tasbih-100', title: 'تسبيح ١٠٠ مرة', subtitle: 'سبحان الله وبحمده', icon: Heart, path: '/adhkar?cat=tasbih', color: 'gradient-gold', category: 'tasbih' },
  { id: 'dua-day', title: 'دعاء اليوم', subtitle: 'دعاء واحد على الأقل', icon: Feather, path: '/dua', color: 'gradient-primary', category: 'dua' },
];

interface WirdState {
  date: string; // YYYY-MM-DD
  completed: string[]; // item ids
  streak: number;
  lastCompleteDate: string | null;
}

const STORAGE_KEY = 'daily_wird_v1';
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const yesterdayStr = () => {
  const d = new Date(Date.now() - 86400000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const loadState = (): WirdState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as WirdState;
      // Reset completion if a new day has begun
      if (parsed.date !== todayStr()) {
        return { ...parsed, date: todayStr(), completed: [] };
      }
      return parsed;
    }
  } catch {}
  return { date: todayStr(), completed: [], streak: 0, lastCompleteDate: null };
};

const DailyWirdPage: React.FC = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<WirdState>(loadState);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }, [state]);

  const allDone = state.completed.length === DEFAULT_ITEMS.length;

  // Update streak when day fully completed
  useEffect(() => {
    if (allDone && state.lastCompleteDate !== state.date) {
      const newStreak = state.lastCompleteDate === yesterdayStr() ? state.streak + 1 : 1;
      setState((s) => ({ ...s, streak: newStreak, lastCompleteDate: s.date }));
    }
  }, [allDone, state.date, state.lastCompleteDate, state.streak]);

  const toggle = (id: string) => {
    setState((s) => ({
      ...s,
      completed: s.completed.includes(id) ? s.completed.filter((x) => x !== id) : [...s.completed, id],
    }));
  };

  const reset = () => {
    if (confirm('هل تريد مسح إنجازات اليوم؟')) {
      setState((s) => ({ ...s, completed: [] }));
    }
  };

  const progressPct = (state.completed.length / DEFAULT_ITEMS.length) * 100;

  const todayLabel = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' });
  }, []);

  return (
    <>
      <SEO title="وردي اليومي — قلب القرآن" description="تتبع وردك اليومي من القرآن والأذكار بسلاسة." />
      <div className="page-container page-with-topbar" dir="rtl">
      <div className="page-inner">
        <PageHeader
          icon={Sparkles}
          title="وردي اليومي"
          subtitle={todayLabel}
          gradient="primary"
          showBack
          actions={
            <button onClick={reset} className="w-9 h-9 rounded-xl bg-secondary hover:bg-destructive/15 flex items-center justify-center transition-colors" aria-label="إعادة">
              <RotateCcw className="w-4 h-4 text-muted-foreground" />
            </button>
          }
        />

        {/* Progress hero */}
        <div className="gradient-hero islamic-pattern islamic-pattern-arabesque rounded-3xl p-5 mb-4 text-primary-foreground relative shadow-emerald">
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm rounded-full px-3 py-1.5 border border-primary-foreground/15">
              <Sparkles className="w-3.5 h-3.5 opacity-90" />
              <span className="text-[11px] font-semibold opacity-95">إنجاز اليوم</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-accent/20 border border-accent/40 rounded-full px-2.5 py-1">
              <Flame className="w-3 h-3" /> {state.streak} يوم متتالي
            </span>
          </div>
          <div className="text-3xl font-bold mb-1 font-kufi relative z-10">
            {state.completed.length} <span className="text-base opacity-70">/ {DEFAULT_ITEMS.length}</span>
          </div>
          <div className="text-[11px] opacity-80 mb-3 relative z-10">
            {allDone ? 'بارك الله فيك — أتممت وردك اليوم!' : 'استمر، لم يتبقَّ الكثير'}
          </div>
          <div className="h-2 rounded-full bg-primary-foreground/15 overflow-hidden relative z-10">
            <div className="h-full bg-accent transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        {/* Items */}
        <div className="space-y-2.5 mb-6">
          {DEFAULT_ITEMS.map((item) => {
            const done = state.completed.includes(item.id);
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`card-surface flex items-center gap-3 transition-all ${done ? 'bg-primary/5 border-primary/20' : ''}`}
              >
                <button
                  onClick={() => toggle(item.id)}
                  aria-label={done ? 'إلغاء الإنجاز' : 'تم الإنجاز'}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                    done
                      ? 'bg-primary border-primary text-primary-foreground shadow-emerald'
                      : 'bg-transparent border-border text-muted-foreground hover:border-primary/40'
                  }`}
                >
                  <Check className={`w-5 h-5 transition-opacity ${done ? 'opacity-100' : 'opacity-0'}`} />
                </button>
                <button
                  onClick={() => navigate(item.path)}
                  className="flex-1 flex items-center gap-3 text-right min-w-0"
                >
                  <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center shadow-sm flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-bold font-kufi line-clamp-1 ${done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {item.title}
                    </div>
                    <div className="text-[11px] text-muted-foreground line-clamp-1">{item.subtitle}</div>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Streak motivation */}
        <div className="card-luxury text-center mb-6">
          <Flame className="w-6 h-6 text-accent mx-auto mb-2" />
          <p className="text-sm font-bold text-foreground font-kufi mb-1">سلسلة المداومة</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            أتمم جميع بنود وردك يومياً لتنمو سلسلتك. أحب الأعمال إلى الله أدومها وإن قلّ.
          </p>
        </div>
      </div>
    </div>
    </>
  );
};

export default DailyWirdPage;
