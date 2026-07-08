import React, { useMemo, useState } from 'react';
import SEO from '@/components/SEO';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Clock, Gauge, BookOpen, ArrowLeft } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

const SPEED_LABELS: Record<string, { wpm: number; label: string }> = {
  slow: { wpm: 60, label: 'متأنّي (60 ك/د)' },
  normal: { wpm: 100, label: 'معتدل (100 ك/د)' },
  fast: { wpm: 150, label: 'سريع (150 ك/د)' },
};

// Approx words per page in standard Madani Mushaf
const WORDS_PER_PAGE = 150;

const STORAGE_KEY = 'smart_wird_prefs_v1';

const SmartWirdPage: React.FC = () => {
  const navigate = useNavigate();
  const saved = (() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
  })();
  const [minutes, setMinutes] = useState<number>(saved.minutes ?? 10);
  const [speed, setSpeed] = useState<keyof typeof SPEED_LABELS>(saved.speed ?? 'normal');

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ minutes, speed }));
  }, [minutes, speed]);

  const suggestion = useMemo(() => {
    const wpm = SPEED_LABELS[speed].wpm;
    const totalWords = wpm * minutes;
    const pages = Math.max(1, Math.round(totalWords / WORDS_PER_PAGE));
    const ayahs = Math.max(5, Math.round(pages * 8));
    return { pages, ayahs, wpm };
  }, [minutes, speed]);

  // Pick a starting page based on day-of-year so each day differs
  const startPage = useMemo(() => {
    const d = new Date();
    const start = new Date(d.getFullYear(), 0, 0);
    const day = Math.floor((d.getTime() - start.getTime()) / 86400000);
    return ((day * 3) % 604) + 1;
  }, []);

  return (
    <>
      <SEO title="الورد الذكي — قلب القرآن" description="اقتراح يومي للورد القرآني حسب وقتك وروتينك." />
      <div className="page-container page-with-topbar" dir="rtl">
      <div className="page-inner">
        <PageHeader icon={Sparkles} title="الورد القرآني الذكي" subtitle="اقتراح يومي حسب وقتك وسرعتك" showBack />

        <div className="card-surface mb-4 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold font-kufi">الوقت المتاح: {minutes} دقيقة</span>
            </div>
            <input type="range" min={3} max={60} step={1} value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className="w-full accent-primary" />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>3د</span><span>30د</span><span>60د</span></div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold font-kufi">سرعة القراءة</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(SPEED_LABELS) as Array<keyof typeof SPEED_LABELS>).map((k) => (
                <button key={k} onClick={() => setSpeed(k)}
                  className={`rounded-xl py-2 text-xs font-bold transition-all ${speed === k ? 'gradient-primary text-primary-foreground shadow-emerald' : 'bg-secondary text-foreground'}`}>
                  {SPEED_LABELS[k].label.split(' ')[0]}
                </button>
              ))}
            </div>
            <div className="text-[10px] text-muted-foreground mt-1 text-center">{SPEED_LABELS[speed].label}</div>
          </div>
        </div>

        <div className="gradient-hero islamic-pattern islamic-pattern-arabesque rounded-3xl p-5 mb-4 text-primary-foreground relative shadow-emerald">
          <div className="text-[11px] opacity-80 mb-1">ورد اليوم المقترح</div>
          <div className="text-4xl font-bold font-kufi mb-1">{suggestion.pages} صفحة</div>
          <div className="text-sm opacity-90 mb-3">≈ {suggestion.ayahs} آية • سيستغرق ≈ {minutes} دقيقة</div>
          <button onClick={() => navigate(`/mushaf?page=${startPage}`)}
            className="inline-flex items-center gap-2 bg-primary-foreground/15 hover:bg-primary-foreground/25 backdrop-blur-sm border border-primary-foreground/20 rounded-full px-4 py-2 text-sm font-bold transition">
            <BookOpen className="w-4 h-4" /> ابدأ من صفحة {startPage}
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="card-luxury text-center text-[12px] leading-relaxed text-muted-foreground">
          نصيحة: التزم بقدر يسير منتظم خير من كثير منقطع. عدّل وقتك حسب يومك.
        </div>
      </div>
    </div>
    </>
  );
};

export default SmartWirdPage;
