import React, { useMemo, useState } from 'react';
import SEO from '@/components/SEO';
import PageHeader from '@/components/PageHeader';
import { pickDailySet, WISDOM_POOL, WisdomCategory } from '@/data/wisdomPool';
import { Sparkles, BookOpen, Quote, Star, Hand, Feather, Share2, RefreshCcw, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const CAT_META: Record<WisdomCategory, { label: string; icon: React.ElementType; chip: string; ring: string }> = {
  dhikr:  { label: 'ذكر',  icon: Sparkles, chip: 'bg-primary/15 text-primary', ring: 'ring-primary/30' },
  ayah:   { label: 'آية',  icon: BookOpen, chip: 'bg-accent/15 text-accent', ring: 'ring-accent/30' },
  hadith: { label: 'حديث', icon: Quote,    chip: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-500/30' },
  name:   { label: 'من أسماء الله', icon: Star, chip: 'bg-amber-500/15 text-amber-600 dark:text-amber-400', ring: 'ring-amber-500/30' },
  dua:    { label: 'دعاء', icon: Hand,     chip: 'bg-violet-500/15 text-violet-600 dark:text-violet-400', ring: 'ring-violet-500/30' },
  wisdom: { label: 'حكمة', icon: Feather,  chip: 'bg-rose-500/15 text-rose-600 dark:text-rose-400', ring: 'ring-rose-500/30' },
};

const DailyKhatirahPage: React.FC = () => {
  const [seedShift, setSeedShift] = useState(0);
  const items = useMemo(() => {
    const base = pickDailySet(8);
    if (!seedShift) return base;
    // Shuffle a slice from full pool when user taps "تجديد"
    const start = (Math.abs(seedShift) * 17) % WISDOM_POOL.length;
    return Array.from({ length: 8 }, (_, i) => WISDOM_POOL[(start + i * 7) % WISDOM_POOL.length]);
  }, [seedShift]);

  const today = useMemo(() => new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' }), []);

  const share = async (text: string, meta?: string) => {
    const full = `${text}\n${meta ?? ''}\n— من تطبيق قلب القرآن`.trim();
    try {
      if (navigator.share) await navigator.share({ text: full });
      else { await navigator.clipboard.writeText(full); toast.success('تم النسخ'); }
    } catch { /* user cancelled */ }
  };

  return (
    <div className="page-container page-with-topbar" dir="rtl">
      <SEO
        title="خاطرة اليوم — قلب القرآن"
        description="آية وحديث وذكر ودعاء واسم من أسماء الله مختارة لك كل يوم في بطاقة واحدة."
      />
      <div className="page-inner">
      <PageHeader title="خاطرة اليوم" subtitle={today} icon={Sparkles} showBack />

      <div className="flex items-center justify-between mb-4 mt-2">
        <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          <span>تتغير المختارات يومياً تلقائياً</span>
        </div>
        <button
          onClick={() => setSeedShift(s => s + 1)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 text-xs font-bold text-foreground"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          تجديد المختارات
        </button>
      </div>

      <div className="grid gap-3">
        {items.map((it, i) => {
          const m = CAT_META[it.cat];
          const Icon = m.icon;
          return (
            <article
              key={`${it.text}-${i}`}
              className={`relative rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-4 sm:p-5 ring-1 ${m.ring} transition-transform hover:-translate-y-0.5`}
            >
              <div className="absolute inset-0 islamic-pattern-arabesque opacity-[0.06] rounded-2xl pointer-events-none" />
              <div className="relative flex items-start justify-between gap-3 mb-3">
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${m.chip}`}>
                  <Icon className="w-3 h-3" />
                  <span>{m.label}</span>
                </div>
                <button
                  onClick={() => share(it.text, it.meta)}
                  className="w-8 h-8 rounded-full bg-secondary/70 hover:bg-secondary text-muted-foreground inline-flex items-center justify-center"
                  aria-label="مشاركة"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
              <p className="relative font-amiri text-foreground text-lg sm:text-xl leading-[2] text-center">
                {it.text}
              </p>
              {it.meta && (
                <p className="relative text-[11px] text-muted-foreground mt-2 text-center font-semibold">
                  {it.meta}
                </p>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default DailyKhatirahPage;
