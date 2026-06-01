import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Sparkles, BookOpen, Quote, Star, Hand, Pause, Play } from 'lucide-react';

type Category = 'dhikr' | 'ayah' | 'hadith' | 'name' | 'dua';

interface Item {
  cat: Category;
  text: string;
  meta?: string;
}

const CAT_META: Record<Category, { label: string; icon: React.ElementType; gradient: string; chip: string }> = {
  dhikr:  { label: 'ذكر',  icon: Sparkles, gradient: 'from-primary/15 via-primary/5 to-transparent',     chip: 'bg-primary/15 text-primary' },
  ayah:   { label: 'آية',  icon: BookOpen, gradient: 'from-accent/15 via-accent/5 to-transparent',       chip: 'bg-accent/15 text-accent' },
  hadith: { label: 'حديث', icon: Quote,    gradient: 'from-emerald-500/15 via-emerald-500/5 to-transparent', chip: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
  name:   { label: 'من أسماء الله', icon: Star, gradient: 'from-amber-500/15 via-amber-500/5 to-transparent', chip: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' },
  dua:    { label: 'دعاء', icon: Hand,     gradient: 'from-violet-500/15 via-violet-500/5 to-transparent',   chip: 'bg-violet-500/15 text-violet-600 dark:text-violet-400' },
};

const ITEMS: Item[] = [
  // Dhikr
  { cat: 'dhikr', text: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ سُبْحَانَ اللهِ الْعَظِيمِ', meta: 'تُثقّل الميزان' },
  { cat: 'dhikr', text: 'لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ', meta: 'أفضل الذكر' },
  { cat: 'dhikr', text: 'أَسْتَغْفِرُ اللهَ الْعَظِيمَ وَأَتُوبُ إِلَيْهِ', meta: 'سيد الاستغفار' },
  { cat: 'dhikr', text: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ', meta: 'كنز من كنوز الجنة' },
  { cat: 'dhikr', text: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّد', meta: 'الصلاة على النبي ﷺ' },
  // Ayat
  { cat: 'ayah', text: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا', meta: 'الشرح · 6' },
  { cat: 'ayah', text: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ', meta: 'الطلاق · 3' },
  { cat: 'ayah', text: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ', meta: 'الرعد · 28' },
  { cat: 'ayah', text: 'وَقُل رَّبِّ زِدْنِي عِلْمًا', meta: 'طه · 114' },
  { cat: 'ayah', text: 'فَاذْكُرُونِي أَذْكُرْكُمْ', meta: 'البقرة · 152' },
  { cat: 'ayah', text: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', meta: 'آل عمران · 173' },
  // Hadith
  { cat: 'hadith', text: '«كلمتان خفيفتان على اللسان، ثقيلتان في الميزان، حبيبتان إلى الرحمن: سبحان الله وبحمده، سبحان الله العظيم»', meta: 'متفق عليه' },
  { cat: 'hadith', text: '«من قال لا إله إلا الله وحده لا شريك له... في يوم مئة مرة كانت له عدل عشر رقاب»', meta: 'متفق عليه' },
  { cat: 'hadith', text: '«إنما الأعمال بالنيات، وإنما لكل امرئ ما نوى»', meta: 'متفق عليه' },
  // Names
  { cat: 'name', text: 'يَا رَحْمٰنُ يَا رَحِيمُ', meta: 'الرحمن الرحيم' },
  { cat: 'name', text: 'يَا حَيُّ يَا قَيُّومُ', meta: 'الحي القيوم' },
  { cat: 'name', text: 'يَا لَطِيفُ يَا خَبِيرُ', meta: 'اللطيف الخبير' },
  { cat: 'name', text: 'يَا وَدُودُ يَا غَفُورُ', meta: 'الودود الغفور' },
  // Dua
  { cat: 'dua', text: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى', meta: 'دعاء جامع' },
  { cat: 'dua', text: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', meta: 'دعاء قرآني' },
  { cat: 'dua', text: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ', meta: 'تفريج الكرب' },
];

function shuffle<T>(arr: T[], seed: number): T[] {
  const out = [...arr]; let s = seed || 1;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const ROTATE_MS = 5200;

const WisdomCarousel: React.FC = () => {
  const seed = useMemo(() => Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000) || 1, []);
  const items = useMemo(() => shuffle(ITEMS, seed), [seed]);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);

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
      className="wisdom-carousel mb-5 relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; setPaused(true); }}
      onTouchEnd={(e) => {
        const sx = touchStartX.current; touchStartX.current = null;
        if (sx == null) return;
        const dx = e.changedTouches[0].clientX - sx;
        if (Math.abs(dx) > 40) go(idx + (dx > 0 ? -1 : 1));
        setTimeout(() => setPaused(false), 600);
      }}
    >
      {/* Animated gradient backdrop per category */}
      <div key={`bg-${idx}`} className={`absolute inset-0 bg-gradient-to-l ${meta.gradient} animate-wc-fade pointer-events-none`} />
      <div className="absolute inset-0 islamic-pattern-arabesque opacity-[0.07] pointer-events-none" />

      <div className="relative px-4 pt-3 pb-2.5">
        {/* Header row */}
        <div className="flex items-center justify-between mb-2">
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${meta.chip}`}>
            <Icon className="w-3 h-3" />
            <span>{meta.label}</span>
          </div>
          <button
            onClick={() => setPaused(p => !p)}
            className="w-6 h-6 rounded-full bg-secondary/60 hover:bg-secondary text-muted-foreground inline-flex items-center justify-center"
            aria-label={paused ? 'تشغيل' : 'إيقاف'}
          >
            {paused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
          </button>
        </div>

        {/* Item content with key-based animation */}
        <div className="relative min-h-[56px] flex items-center justify-center" dir="rtl">
          <div key={idx} className="wc-item w-full text-center">
            <p className="font-amiri text-foreground leading-[1.9] text-[15px] sm:text-base px-1">
              {cur.text}
            </p>
            {cur.meta && (
              <p className="text-[10px] text-muted-foreground mt-1 font-medium">{cur.meta}</p>
            )}
          </div>
        </div>

        {/* Progress + dots */}
        <div className="flex items-center justify-center gap-1.5 mt-2">
          {items.slice(0, Math.min(items.length, 7)).map((_, i) => {
            const active = i === idx % 7;
            return (
              <span
                key={i}
                className={`h-1 rounded-full transition-all duration-500 ${active ? 'w-5 bg-primary' : 'w-1 bg-muted-foreground/30'}`}
              />
            );
          })}
        </div>

        {/* Bottom progress bar (per-item) */}
        {!paused && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-transparent overflow-hidden">
            <div key={`pb-${idx}`} className="wc-progress h-full bg-gradient-to-l from-primary via-accent to-primary" />
          </div>
        )}
      </div>
    </div>
  );
};

export default WisdomCarousel;
