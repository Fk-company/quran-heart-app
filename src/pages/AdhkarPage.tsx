import React, { useState, useCallback, useEffect } from 'react';
import { adhkarCategories, adhkarData } from '@/data/adhkar';
import { ArrowRight, RotateCcw, Sunrise, Sunset, Moon, Circle, Heart } from 'lucide-react';

const categoryIcons: Record<string, React.ElementType> = {
  sunrise: Sunrise,
  sunset: Sunset,
  moon: Moon,
  prayer: Circle,
  circle: Circle,
  tasbih: Heart,
};

// Simple click sound using AudioContext
const playClickSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    osc.type = 'sine';
    gain.gain.value = 0.1;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  } catch {}
};

const STATS_KEY = 'tasbih_daily_stats';

const getTodayKey = () => new Date().toISOString().split('T')[0];

const getDailyStats = (): Record<string, number> => {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed.date !== getTodayKey()) return {};
    return parsed.counts || {};
  } catch { return {}; }
};

const saveDailyStats = (counts: Record<string, number>) => {
  localStorage.setItem(STATS_KEY, JSON.stringify({ date: getTodayKey(), counts }));
};

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
  ];

  const handleCount = (id: number, maxCount: number) => {
    setCounters((prev) => {
      const current = prev[id] || 0;
      if (current >= maxCount) return prev;
      return { ...prev, [id]: current + 1 };
    });
    playClickSound();
  };

  const resetCounter = (id: number) => {
    setCounters((prev) => ({ ...prev, [id]: 0 }));
  };

  const handleTasbihTap = useCallback(() => {
    if (tasbihCount >= tasbihTarget) return;
    setTasbihCount((c) => c + 1);
    playClickSound();
    // Update daily stats
    setDailyStats((prev) => {
      const updated = { ...prev, [tasbihText]: (prev[tasbihText] || 0) + 1 };
      saveDailyStats(updated);
      return updated;
    });
  }, [tasbihCount, tasbihTarget, tasbihText]);

  const tasbihProgress = tasbihTarget > 0 ? (tasbihCount / tasbihTarget) * 100 : 0;
  const totalTodayCount = Object.values(dailyStats).reduce((a, b) => a + b, 0);

  // Tasbih Counter Mode
  if (tasbihMode) {
    return (
      <div className="page-container" dir="rtl">
        <div className="px-4 pt-4 max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setTasbihMode(false)}
              className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center"
            >
              <ArrowRight className="w-4 h-4 text-foreground" />
            </button>
            <h1 className="text-lg font-bold text-foreground">عداد التسبيح</h1>
          </div>

          {/* Tasbih selector */}
          <div className="flex flex-wrap gap-2 mb-6">
            {tasbihOptions.map((opt) => (
              <button
                key={opt.text}
                onClick={() => { setTasbihText(opt.text); setTasbihTarget(opt.target); setTasbihCount(0); }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  tasbihText === opt.text
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {opt.text}
              </button>
            ))}
          </div>

          {/* Circular counter */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-56 h-56 mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                <circle
                  cx="100" cy="100" r="88"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="8"
                />
                <circle
                  cx="100" cy="100" r="88"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${2 * Math.PI * 88 * (1 - tasbihProgress / 100)}`}
                  className="transition-all duration-200"
                />
              </svg>
              <button
                onClick={handleTasbihTap}
                disabled={tasbihCount >= tasbihTarget}
                className="absolute inset-0 flex flex-col items-center justify-center"
              >
                <span className="text-4xl font-bold text-primary">{tasbihCount}</span>
                <span className="text-xs text-muted-foreground mt-1">/ {tasbihTarget}</span>
              </button>
            </div>

            <p className="font-amiri text-xl text-foreground mb-4">{tasbihText}</p>

            <button
              onClick={() => setTasbihCount(0)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              إعادة
            </button>
          </div>

          {/* Daily stats */}
          <div className="card-surface">
            <h3 className="text-sm font-bold text-foreground mb-3">إحصائيات اليوم</h3>
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-border">
              <span className="text-xs text-muted-foreground">إجمالي التسبيحات</span>
              <span className="text-sm font-bold text-primary">{totalTodayCount}</span>
            </div>
            <div className="space-y-2">
              {Object.entries(dailyStats).map(([text, count]) => (
                <div key={text} className="flex items-center justify-between">
                  <span className="text-xs text-foreground font-amiri">{text}</span>
                  <span className="text-xs font-semibold text-primary bg-primary/10 rounded-full px-2 py-0.5">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Adhkar detail view
  if (selectedCategory) {
    const category = adhkarCategories.find((c) => c.id === selectedCategory);
    const items = adhkarData[selectedCategory] || [];

    return (
      <div className="page-container" dir="rtl">
        <div className="px-4 pt-4 max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center"
            >
              <ArrowRight className="w-4 h-4 text-foreground" />
            </button>
            <h1 className="text-lg font-bold text-foreground">{category?.name}</h1>
          </div>

          <div className="space-y-3">
            {items.map((dhikr) => {
              const count = counters[dhikr.id] || 0;
              const completed = count >= dhikr.count;
              const progress = dhikr.count > 0 ? (count / dhikr.count) * 100 : 0;
              return (
                <div key={dhikr.id} className={`card-surface transition-all duration-200 ${completed ? 'opacity-60 border-primary/20' : ''}`}>
                  <p className="font-amiri text-xl leading-[2] text-foreground mb-3">{dhikr.text}</p>
                  {/* Progress bar */}
                  <div className="h-1 bg-muted rounded-full mb-3 overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{dhikr.reference}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => resetCounter(dhikr.id)}
                        className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center"
                      >
                        <RotateCcw className="w-3 h-3 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => handleCount(dhikr.id, dhikr.count)}
                        disabled={completed}
                        className={`min-w-[4rem] h-8 rounded-full text-sm font-semibold transition-colors ${
                          completed
                            ? 'bg-primary/20 text-primary'
                            : 'bg-primary text-primary-foreground active:scale-95'
                        }`}
                      >
                        {count}/{dhikr.count}
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

  // Categories view
  return (
    <div className="page-container" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center">
            <Heart className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">الاذكار والتسبيح</h1>
            <p className="text-xs text-muted-foreground">حصّن يومك بالذكر</p>
          </div>
        </div>

        {/* Tasbih Counter Card */}
        <button
          onClick={() => setTasbihMode(true)}
          className="card-surface w-full mb-4 flex items-center gap-3 bg-primary/5 border-primary/15"
        >
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground font-bold text-lg">{totalTodayCount}</span>
          </div>
          <div className="flex-1 text-right">
            <div className="font-bold text-foreground text-sm">عداد التسبيح</div>
            <div className="text-xs text-muted-foreground">عداد تسبيح دائري مع إحصائيات يومية</div>
          </div>
        </button>

        <div className="space-y-2.5">
          {adhkarCategories.map((cat) => {
            const Icon = categoryIcons[cat.icon] || Circle;
            const count = adhkarData[cat.id]?.length || 0;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className="card-surface-hover w-full flex items-center gap-3"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 text-right">
                  <div className="font-semibold text-foreground text-sm">{cat.name}</div>
                  <div className="text-xs text-muted-foreground">{count} ذكر</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdhkarPage;
