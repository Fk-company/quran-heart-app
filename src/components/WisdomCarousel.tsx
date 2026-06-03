import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Sparkles, BookOpen, Quote, Star, Hand, Pause, Play, Feather, ChevronLeft, ChevronRight } from 'lucide-react';
import { pickDailySet, WisdomCategory, WisdomItem } from '@/data/wisdomPool';

const CAT_META: Record<WisdomCategory, { label: string; icon: React.ElementType; gradient: string; chip: string }> = {
  dhikr:  { label: 'ذكر',  icon: Sparkles, gradient: 'from-primary/15 via-primary/5 to-transparent',     chip: 'bg-primary/15 text-primary' },
  ayah:   { label: 'آية',  icon: BookOpen, gradient: 'from-accent/15 via-accent/5 to-transparent',       chip: 'bg-accent/15 text-accent' },
  hadith: { label: 'حديث', icon: Quote,    gradient: 'from-emerald-500/15 via-emerald-500/5 to-transparent', chip: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
  name:   { label: 'من أسماء الله', icon: Star, gradient: 'from-amber-500/15 via-amber-500/5 to-transparent', chip: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' },
  dua:    { label: 'دعاء', icon: Hand,     gradient: 'from-violet-500/15 via-violet-500/5 to-transparent',   chip: 'bg-violet-500/15 text-violet-600 dark:text-violet-400' },
  wisdom: { label: 'حكمة', icon: Feather,  gradient: 'from-rose-500/15 via-rose-500/5 to-transparent',       chip: 'bg-rose-500/15 text-rose-600 dark:text-rose-400' },
};

const ROTATE_MS = 6000;

const WisdomCarousel: React.FC = () => {
  const items: WisdomItem[] = useMemo(() => pickDailySet(24), []);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  // Respect reduced motion
  const prefersReducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
    []
  );

  useEffect(() => {
    if (paused) return;
    timerRef.current = window.setTimeout(() => {
      setIdx(i => (i + 1) % items.length);
    }, ROTATE_MS);
    return () => { if (timerRef.current) window.clearTimeout(timerRef.current); };
  }, [idx, paused, items.length]);

  const go = (next: number) => setIdx(((next % items.length) + items.length) % items.length);

  const cur = items[idx];
  const meta = CAT_META[cur.cat];
  const Icon = meta.icon;

  return (
    <div
      className="wisdom-carousel mb-5 relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; setPaused(true); }}
      onTouchEnd={(e) => {
        const sx = touchStartX.current; touchStartX.current = null;
        if (sx == null) return;
        const dx = e.changedTouches[0].clientX - sx;
        if (Math.abs(dx) > 40) go(idx + (dx > 0 ? -1 : 1));
        // Resume after a short delay
        window.setTimeout(() => setPaused(false), 800);
      }}
    >
      {/* Smooth crossfading gradient backdrops per item */}
      <div className="absolute inset-0 pointer-events-none">
        {items.map((it, i) => (
          <div
            key={i}
            className={`absolute inset-0 bg-gradient-to-l ${CAT_META[it.cat].gradient} transition-opacity duration-[900ms] ease-out`}
            style={{ opacity: i === idx ? 1 : 0 }}
          />
        ))}
      </div>
      <div className="absolute inset-0 islamic-pattern-arabesque opacity-[0.07] pointer-events-none" />

      <div className="relative px-4 pt-3 pb-3">
        {/* Header row */}
        <div className="flex items-center justify-between mb-2">
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-colors duration-500 ${meta.chip}`}>
            <Icon className="w-3 h-3" />
            <span>{meta.label}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => go(idx - 1)}
              className="w-6 h-6 rounded-full bg-secondary/60 hover:bg-secondary text-muted-foreground inline-flex items-center justify-center"
              aria-label="السابق"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => setPaused(p => !p)}
              className="w-6 h-6 rounded-full bg-secondary/60 hover:bg-secondary text-muted-foreground inline-flex items-center justify-center"
              aria-label={paused ? 'تشغيل' : 'إيقاف'}
            >
              {paused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            </button>
            <button
              onClick={() => go(idx + 1)}
              className="w-6 h-6 rounded-full bg-secondary/60 hover:bg-secondary text-muted-foreground inline-flex items-center justify-center"
              aria-label="التالي"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Smooth slide track — translate by index, no remount, no flicker.
            IMPORTANT: keep LTR on the track so translateX(-idx*100%) advances forward.
            With dir="rtl" the flex children physically extend leftward and the same
            translate moves the track into empty space, showing a blank slide. */}
        <div className="relative overflow-hidden" style={{ minHeight: 84 }}>
          <div
            ref={trackRef}
            className="flex"
            dir="ltr"
            style={{
              transform: `translate3d(${-idx * 100}%, 0, 0)`,
              transition: prefersReducedMotion
                ? 'none'
                : 'transform 700ms cubic-bezier(0.22, 1, 0.36, 1)',
              willChange: 'transform',
            }}
          >
            {items.map((it, i) => (
              <div
                key={i}
                dir="rtl"
                className="shrink-0 w-full px-3 flex flex-col items-center justify-center text-center"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <p className="font-amiri text-foreground leading-[1.95] text-[15px] sm:text-base max-w-[44ch] break-words">
                  {it.text}
                </p>
                {it.meta && (
                  <p className="text-[10px] text-muted-foreground mt-1.5 font-medium tracking-wide">{it.meta}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-1.5 mt-2">
          {items.slice(0, Math.min(items.length, 8)).map((_, i) => {
            const active = i === idx % 8;
            return (
              <span
                key={i}
                className={`h-1 rounded-full transition-all duration-500 ${active ? 'w-5 bg-primary' : 'w-1 bg-muted-foreground/30'}`}
              />
            );
          })}
        </div>

        {/* Bottom progress bar (per-item) */}
        {!paused && !prefersReducedMotion && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-transparent overflow-hidden">
            <div
              key={`pb-${idx}`}
              className="h-full bg-gradient-to-l from-primary via-accent to-primary"
              style={{ animation: `wc-progress ${ROTATE_MS}ms linear forwards` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default WisdomCarousel;
