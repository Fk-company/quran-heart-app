import React, { useEffect, useState, useCallback } from 'react';
import { BookmarkCheck, X } from 'lucide-react';

interface SavedPosition {
  scrollTop: number;
  scrollPct: number;
  label?: string;
  ts: number;
}

interface ReadingProgressProps {
  storageKey: string;          // unique per page (e.g. `read_pos_surah_2` or `read_pos_mushaf_120`)
  label?: string;              // displayed in resume chip (e.g. "السورة - آية 5")
  topOffset?: number;          // px from top for the bar (under TopBar). default 56
  containerRef?: React.RefObject<HTMLElement>; // optional, defaults to window scroll
  autoSaveMs?: number;         // throttle saves. default 800
  ariaLabel?: string;
}

const ReadingProgress: React.FC<ReadingProgressProps> = ({
  storageKey,
  label,
  topOffset = 56,
  containerRef,
  autoSaveMs = 800,
  ariaLabel = 'تقدم القراءة',
}) => {
  const [progress, setProgress] = useState(0);
  const [saved, setSaved] = useState<SavedPosition | null>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });
  const [showResume, setShowResume] = useState(false);

  // measure scroll
  useEffect(() => {
    const target = containerRef?.current;
    const getMetrics = () => {
      if (target) {
        const max = target.scrollHeight - target.clientHeight;
        const y = target.scrollTop;
        return { y, max };
      }
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      return { y, max };
    };

    let saveT: number | null = null;
    const onScroll = () => {
      const { y, max } = getMetrics();
      const pct = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      setProgress(pct);

      if (saveT) window.clearTimeout(saveT);
      saveT = window.setTimeout(() => {
        const data: SavedPosition = { scrollTop: y, scrollPct: pct, label, ts: Date.now() };
        try { localStorage.setItem(storageKey, JSON.stringify(data)); } catch {}
        setSaved(data);
      }, autoSaveMs);
    };

    const src: any = target ?? window;
    src.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      src.removeEventListener('scroll', onScroll);
      if (saveT) window.clearTimeout(saveT);
    };
  }, [storageKey, label, autoSaveMs, containerRef]);

  // show resume chip on mount if a meaningful saved position exists and we're at top
  useEffect(() => {
    if (!saved) return;
    if (saved.scrollPct < 0.05) return;
    const initial = containerRef?.current?.scrollTop ?? window.scrollY;
    if (initial < 80) setShowResume(true);
    // hide after 10s automatically
    const t = window.setTimeout(() => setShowResume(false), 10000);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resume = useCallback(() => {
    if (!saved) return;
    if (containerRef?.current) {
      containerRef.current.scrollTo({ top: saved.scrollTop, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: saved.scrollTop, behavior: 'smooth' });
    }
    setShowResume(false);
  }, [saved, containerRef]);

  return (
    <>
      {/* Progress bar */}
      <div
        role="progressbar"
        aria-label={ariaLabel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        className="fixed left-0 right-0 z-30 h-[3px] pointer-events-none"
        style={{ top: topOffset }}
      >
        <div
          className="h-full origin-right transition-transform duration-150"
          style={{
            transform: `scaleX(${progress})`,
            background: 'linear-gradient(90deg, hsl(var(--accent)), hsl(var(--primary)))',
            boxShadow: '0 0 10px hsl(var(--accent) / 0.55)',
          }}
        />
      </div>

      {/* Resume chip */}
      {showResume && saved && (
        <div
          className="fixed left-1/2 -translate-x-1/2 z-40 animate-fade-in"
          style={{ top: topOffset + 12 }}
        >
          <div
            className="flex items-center gap-2 rounded-full bg-card/95 border border-primary/30 shadow-lg pl-2 pr-1 py-1 backdrop-blur"
            role="region"
            aria-label="استئناف القراءة"
          >
            <button
              onClick={resume}
              className="flex items-center gap-1.5 text-xs font-bold text-primary px-3 py-1.5 rounded-full hover:bg-primary/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label={`استئناف من ${Math.round(saved.scrollPct * 100)}%`}
            >
              <BookmarkCheck className="w-3.5 h-3.5" aria-hidden="true" />
              <span>استكمل من {Math.round(saved.scrollPct * 100)}%</span>
              {saved.label && <span className="text-muted-foreground font-medium">· {saved.label}</span>}
            </button>
            <button
              onClick={() => setShowResume(false)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="إغلاق"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ReadingProgress;
