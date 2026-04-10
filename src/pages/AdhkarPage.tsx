import React, { useState, useCallback } from 'react';
import { adhkarCategories, adhkarData } from '@/data/adhkar';
import { ArrowRight, RotateCcw, Sunrise, Sunset, Moon, Circle, Heart, Trophy, Zap, Target, ChevronLeft } from 'lucide-react';

const categoryIcons: Record<string, React.ElementType> = {
  sunrise: Sunrise, sunset: Sunset, moon: Moon, prayer: Circle, circle: Circle, tasbih: Heart,
};

const playClickSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = 800; osc.type = 'sine';
    gain.gain.value = 0.1;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.1);
  } catch {}
};

const STATS_KEY = 'tasbih_daily_stats';
const getTodayKey = () => new Date().toISOString().split('T')[0];
const getDailyStats = (): Record<string, number> => {
  try { const raw = localStorage.getItem(STATS_KEY); if (!raw) return {}; const p = JSON.parse(raw); return p.date === getTodayKey() ? p.counts || {} : {}; } catch { return {}; }
};
const saveDailyStats = (counts: Record<string, number>) => localStorage.setItem(STATS_KEY, JSON.stringify({ date: getTodayKey(), counts }));

const AdhkarPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [counters, setCounters] = useState<Record<number, number>>({});
  const [dailyStats, setDailyStats] = useState<Record<string, number>>(getDailyStats);
  const [tasbihMode, setTasbihMode] = useState(false);
  const [tasbihCount, setTasbihCount] = useState(0);
  const [tasbihTarget, setTasbihTarget] = useState(33);
  const [tasbihText, setTasbihText] = useState('سُبْحَانَ اللهِ');

  const tasbihOptions = [
    { text: 'سُبْحَانَ اللهِ', target: 33 },
    { text: 'الْحَمْدُ لِلَّهِ', target: 33 },
    { text: 'اللهُ أَكْبَرُ', target: 34 },
    { text: 'لَا إِلَهَ إِلَّا اللهُ', target: 100 },
    { text: 'أَسْتَغْفِرُ اللهَ', target: 100 },
    { text: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ', target: 100 },
    { text: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ', target: 100 },
    { text: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّد', target: 100 },
  ];

  const handleCount = (id: number, maxCount: number) => {
    setCounters(prev => { const c = prev[id] || 0; if (c >= maxCount) return prev; return { ...prev, [id]: c + 1 }; });
    playClickSound();
  };
  const resetCounter = (id: number) => setCounters(prev => ({ ...prev, [id]: 0 }));

  const handleTasbihTap = useCallback(() => {
    if (tasbihCount >= tasbihTarget) return;
    setTasbihCount(c => c + 1);
    playClickSound();
    setDailyStats(prev => { const u = { ...prev, [tasbihText]: (prev[tasbihText] || 0) + 1 }; saveDailyStats(u); return u; });
  }, [tasbihCount, tasbihTarget, tasbihText]);

  const tasbihProgress = tasbihTarget > 0 ? (tasbihCount / tasbihTarget) * 100 : 0;
  const totalTodayCount = Object.values(dailyStats).reduce((a, b) => a + b, 0);
  const circumference = 2 * Math.PI * 88;

  // Tasbih mode
  if (tasbihMode) {
    return (
      <div className="page-container page-with-topbar" dir="rtl">
        <div className="px-4 pt-4 max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setTasbihMode(false)} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-foreground" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-foreground">عداد التسبيح</h1>
              <p className="text-xs text-muted-foreground">اضغط على الدائرة للعد</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10">
              <Trophy className="w-3.5 h-3.5 text-accent" />
              <span className="text-xs font-bold text-accent">{totalTodayCount}</span>
            </div>
          </div>

          {/* Tasbih selector - scrollable */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4">
            {tasbihOptions.map(opt => (
              <button key={opt.text} onClick={() => { setTasbihText(opt.text); setTasbihTarget(opt.target); setTasbihCount(0); }}
                className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${tasbihText === opt.text
                  ? 'bg-primary text-primary-foreground shadow-md scale-105' : 'bg-secondary text-secondary-foreground'}`}>
                {opt.text}
              </button>
            ))}
          </div>

          {/* Circular counter */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-64 h-64 mb-5">
              {/* Glow effect */}
              <div className="absolute inset-4 rounded-full" style={{
                background: `radial-gradient(circle, hsl(var(--primary) / ${tasbihProgress > 80 ? 0.15 : 0.05}) 0%, transparent 70%)`
              }} />
              <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="88" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
                <circle cx="100" cy="100" r="88" fill="none" stroke="hsl(var(--primary))" strokeWidth="6"
                  strokeLinecap="round" strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - tasbihProgress / 100)}
                  className="transition-all duration-300" />
                {/* Tick marks */}
                {Array.from({ length: 33 }).map((_, i) => {
                  const angle = (i / 33) * 360 - 90;
                  const rad = (angle * Math.PI) / 180;
                  const x1 = 100 + 78 * Math.cos(rad);
                  const y1 = 100 + 78 * Math.sin(rad);
                  const x2 = 100 + 82 * Math.cos(rad);
                  const y2 = 100 + 82 * Math.sin(rad);
                  return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(var(--border))" strokeWidth="1" />;
                })}
              </svg>
              <button onClick={handleTasbihTap} disabled={tasbihCount >= tasbihTarget}
                className="absolute inset-0 flex flex-col items-center justify-center active:scale-95 transition-transform">
                <span className="text-5xl font-bold text-primary">{tasbihCount}</span>
                <span className="text-sm text-muted-foreground mt-1">/ {tasbihTarget}</span>
                {tasbihCount >= tasbihTarget && (
                  <span className="text-xs text-accent font-semibold mt-2 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" />اكتمل
                  </span>
                )}
              </button>
            </div>

            <p className="font-amiri text-2xl text-foreground mb-5">{tasbihText}</p>

            <div className="flex items-center gap-3">
              <button onClick={() => setTasbihCount(0)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                <RotateCcw className="w-4 h-4" />إعادة
              </button>
              <button onClick={() => { setTasbihCount(0); const idx = tasbihOptions.findIndex(o => o.text === tasbihText); const next = tasbihOptions[(idx + 1) % tasbihOptions.length]; setTasbihText(next.text); setTasbihTarget(next.target); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                <Target className="w-4 h-4" />التالي
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="card-surface">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-bold text-foreground">إحصائيات اليوم</h3>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="rounded-xl bg-primary/5 p-3 text-center">
                <span className="text-2xl font-bold text-primary">{totalTodayCount}</span>
                <p className="text-[10px] text-muted-foreground mt-1">إجمالي التسبيحات</p>
              </div>
              <div className="rounded-xl bg-accent/5 p-3 text-center">
                <span className="text-2xl font-bold text-accent">{Object.keys(dailyStats).length}</span>
                <p className="text-[10px] text-muted-foreground mt-1">أنواع الأذكار</p>
              </div>
            </div>
            <div className="space-y-2">
              {Object.entries(dailyStats).map(([text, count]) => (
                <div key={text} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                  <span className="text-xs text-foreground font-amiri">{text}</span>
                  <span className="text-xs font-semibold text-primary bg-primary/10 rounded-full px-2.5 py-0.5">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Adhkar detail
  if (selectedCategory) {
    const category = adhkarCategories.find(c => c.id === selectedCategory);
    const items = adhkarData[selectedCategory] || [];
    const completedCount = items.filter(d => (counters[d.id] || 0) >= d.count).length;

    return (
      <div className="page-container page-with-topbar" dir="rtl">
        <div className="px-4 pt-4 max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => setSelectedCategory(null)} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-foreground" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-foreground">{category?.name}</h1>
              <p className="text-xs text-muted-foreground">{completedCount}/{items.length} مكتمل</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-muted rounded-full mb-4 overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${items.length > 0 ? (completedCount / items.length) * 100 : 0}%` }} />
          </div>

          <div className="space-y-3">
            {items.map(dhikr => {
              const count = counters[dhikr.id] || 0;
              const completed = count >= dhikr.count;
              const progress = dhikr.count > 0 ? (count / dhikr.count) * 100 : 0;
              return (
                <div key={dhikr.id} className={`card-surface transition-all duration-300 ${completed ? 'opacity-60 border-primary/30 bg-primary/[0.02]' : ''}`}>
                  <p className="font-amiri text-xl leading-[2] text-foreground mb-3">{dhikr.text}</p>
                  <div className="h-1.5 bg-muted rounded-full mb-3 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${completed ? 'bg-accent' : 'bg-primary'}`} style={{ width: `${progress}%` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground bg-secondary rounded-full px-2 py-0.5">{dhikr.reference}</span>
                      {completed && <Zap className="w-3.5 h-3.5 text-accent" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => resetCounter(dhikr.id)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                        <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button onClick={() => handleCount(dhikr.id, dhikr.count)} disabled={completed}
                        className={`min-w-[5rem] h-9 rounded-full text-sm font-bold transition-all active:scale-95 ${completed
                          ? 'bg-accent/20 text-accent' : 'bg-primary text-primary-foreground shadow-sm'}`}>
                        {completed ? 'تم' : `${count}/${dhikr.count}`}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Categories
  return (
    <div className="page-container page-with-topbar" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        {/* Hero header */}
        <div className="gradient-hero islamic-pattern rounded-2xl p-5 mb-5 text-primary-foreground">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-primary-foreground/10 flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">الأذكار والتسبيح</h1>
              <p className="text-xs opacity-80">حصّن يومك بذكر الله</p>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5 bg-primary-foreground/10 rounded-full px-3 py-1.5">
              <Trophy className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">{totalTodayCount} تسبيحة اليوم</span>
            </div>
          </div>
        </div>

        {/* Tasbih Card */}
        <button onClick={() => setTasbihMode(true)}
          className="card-surface w-full mb-5 flex items-center gap-4 bg-primary/5 border-primary/15 hover:shadow-md transition-shadow">
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="25" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
              <circle cx="30" cy="30" r="25" fill="none" stroke="hsl(var(--primary))" strokeWidth="3"
                strokeDasharray={`${2 * Math.PI * 25}`} strokeDashoffset={`${2 * Math.PI * 25 * 0.25}`} strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-primary">{totalTodayCount}</span>
          </div>
          <div className="flex-1 text-right">
            <div className="font-bold text-foreground text-base">عداد التسبيح</div>
            <div className="text-xs text-muted-foreground">عداد دائري احترافي مع إحصائيات يومية</div>
          </div>
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </button>

        <h2 className="section-title">الأذكار</h2>
        <div className="space-y-2.5">
          {adhkarCategories.map(cat => {
            const Icon = categoryIcons[cat.icon] || Circle;
            const count = adhkarData[cat.id]?.length || 0;
            return (
              <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                className="card-surface-hover w-full flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 text-right">
                  <div className="font-semibold text-foreground text-sm">{cat.name}</div>
                  <div className="text-xs text-muted-foreground">{count} ذكر</div>
                </div>
                <ChevronLeft className="w-4 h-4 text-muted-foreground" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdhkarPage;
