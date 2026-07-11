import React, { useMemo, useRef, useState } from 'react';
import { Quote, Share2, Copy, Download, RefreshCw, Heart } from 'lucide-react';
import SEO from '@/components/SEO';
import PageHeader from '@/components/PageHeader';
import { toast } from 'sonner';

interface QuranQuote {
  id: string;
  text: string;
  ref: string;
  theme: 'رحمة' | 'صبر' | 'أمل' | 'توكل' | 'تقوى' | 'دعاء';
}

const QUOTES: QuranQuote[] = [
  { id: 'q1', text: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا', ref: 'الشرح • 6', theme: 'أمل' },
  { id: 'q2', text: 'وَمَنْ يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ', ref: 'الطلاق • 3', theme: 'توكل' },
  { id: 'q3', text: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ', ref: 'الرعد • 28', theme: 'أمل' },
  { id: 'q4', text: 'وَاصْبِرْ فَإِنَّ اللَّهَ لَا يُضِيعُ أَجْرَ الْمُحْسِنِينَ', ref: 'هود • 115', theme: 'صبر' },
  { id: 'q5', text: 'وَمَنْ يَتَّقِ اللَّهَ يَجْعَلْ لَهُ مَخْرَجًا', ref: 'الطلاق • 2', theme: 'تقوى' },
  { id: 'q6', text: 'إِنَّ رَحْمَتَ اللَّهِ قَرِيبٌ مِنَ الْمُحْسِنِينَ', ref: 'الأعراف • 56', theme: 'رحمة' },
  { id: 'q7', text: 'وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ', ref: 'البقرة • 45', theme: 'صبر' },
  { id: 'q8', text: 'لَا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا', ref: 'التوبة • 40', theme: 'أمل' },
  { id: 'q9', text: 'وَعَسَىٰ أَنْ تَكْرَهُوا شَيْئًا وَهُوَ خَيْرٌ لَكُمْ', ref: 'البقرة • 216', theme: 'توكل' },
  { id: 'q10', text: 'ادْعُونِي أَسْتَجِبْ لَكُمْ', ref: 'غافر • 60', theme: 'دعاء' },
  { id: 'q11', text: 'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ', ref: 'البقرة • 186', theme: 'دعاء' },
  { id: 'q12', text: 'وَبَشِّرِ الصَّابِرِينَ', ref: 'البقرة • 155', theme: 'صبر' },
  { id: 'q13', text: 'إِنَّ اللَّهَ يُحِبُّ الْمُتَوَكِّلِينَ', ref: 'آل عمران • 159', theme: 'توكل' },
  { id: 'q14', text: 'يُرِيدُ اللَّهُ بِكُمُ الْيُسْرَ وَلَا يُرِيدُ بِكُمُ الْعُسْرَ', ref: 'البقرة • 185', theme: 'رحمة' },
  { id: 'q15', text: 'وَمَنْ أَحْسَنُ قَوْلًا مِمَّنْ دَعَا إِلَى اللَّهِ', ref: 'فصلت • 33', theme: 'دعاء' },
  { id: 'q16', text: 'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ', ref: 'البقرة • 153', theme: 'صبر' },
  { id: 'q17', text: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', ref: 'آل عمران • 173', theme: 'توكل' },
  { id: 'q18', text: 'وَلَا تَيْأَسُوا مِنْ رَوْحِ اللَّهِ', ref: 'يوسف • 87', theme: 'أمل' },
];

const THEMES = ['الكل', 'رحمة', 'صبر', 'أمل', 'توكل', 'تقوى', 'دعاء'] as const;

const GRADIENTS = [
  'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)',
  'linear-gradient(135deg, #0F766E 0%, #14B8A6 100%)',
  'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
  'linear-gradient(135deg, #B45309 0%, #F59E0B 100%)',
  'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
  'linear-gradient(135deg, #065F46 0%, #10B981 100%)',
];

const QuranQuotesPage: React.FC = () => {
  const [theme, setTheme] = useState<(typeof THEMES)[number]>('الكل');
  const [bgIndex, setBgIndex] = useState(0);
  const [favs, setFavs] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('quote_favs') || '[]'); } catch { return []; }
  });
  const cardRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (theme === 'الكل') return QUOTES;
    return QUOTES.filter((q) => q.theme === theme);
  }, [theme]);

  const [current, setCurrent] = useState<QuranQuote>(QUOTES[0]);

  const shuffle = () => {
    const others = filtered.filter((q) => q.id !== current.id);
    const pick = others[Math.floor(Math.random() * others.length)] || filtered[0];
    setCurrent(pick);
    setBgIndex((i) => (i + 1) % GRADIENTS.length);
  };

  const toggleFav = (id: string) => {
    setFavs((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem('quote_favs', JSON.stringify(next));
      return next;
    });
  };

  const copyText = async (q: QuranQuote) => {
    try {
      await navigator.clipboard.writeText(`${q.text}\n\n(${q.ref})`);
      toast.success('تم النسخ');
    } catch { toast.error('تعذر النسخ'); }
  };

  const share = async (q: QuranQuote) => {
    const text = `${q.text}\n\n(${q.ref})`;
    if (navigator.share) {
      try { await navigator.share({ text }); } catch {}
    } else {
      await copyText(q);
    }
  };

  const downloadImage = async () => {
    if (!cardRef.current) return;
    try {
      const el = cardRef.current;
      const w = el.offsetWidth * 2;
      const h = el.offsetHeight * 2;
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // background gradient
      const gradient = ctx.createLinearGradient(0, 0, w, h);
      const g = GRADIENTS[bgIndex];
      const colors = g.match(/#[0-9A-Fa-f]{6}|hsl\([^)]+\)/g) || ['#0F766E', '#14B8A6'];
      gradient.addColorStop(0, colors[0]);
      gradient.addColorStop(1, colors[1]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      // text
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.direction = 'rtl';
      ctx.font = `bold ${w / 16}px "Amiri", serif`;
      const lines: string[] = [];
      const words = current.text.split(' ');
      let line = '';
      const max = w * 0.8;
      words.forEach((word) => {
        const test = line + word + ' ';
        if (ctx.measureText(test).width > max && line) {
          lines.push(line.trim()); line = word + ' ';
        } else line = test;
      });
      if (line) lines.push(line.trim());
      const startY = h / 2 - (lines.length * (w / 14)) / 2;
      lines.forEach((ln, i) => ctx.fillText(ln, w / 2, startY + i * (w / 14)));
      ctx.font = `${w / 30}px sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.fillText(`﴿ ${current.ref} ﴾`, w / 2, h - h / 8);

      const link = document.createElement('a');
      link.download = `quote_${current.id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('تم تحميل البطاقة');
    } catch { toast.error('تعذر التحميل'); }
  };

  return (
    <div className="page-container page-with-topbar" dir="rtl">
      <SEO title="اقتباسات قرآنية | قلب القرآن" description="بطاقات قرآنية للمشاركة والتذكير بكلام الله." />
      <div className="max-w-lg mx-auto w-full px-4 pt-6">
        <PageHeader icon={Quote} title="اقتباسات قرآنية" subtitle="شارك آية تُغيّر يومك" gradient="hero" showBack />

        <div className="mt-4 space-y-4">
          {/* Theme filter */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {THEMES.map((t) => (
              <button
                key={t}
                onClick={() => { setTheme(t); const list = t === 'الكل' ? QUOTES : QUOTES.filter((q) => q.theme === t); if (list.length) setCurrent(list[0]); }}
                className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-full border transition ${
                  theme === t ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary/60 border-border/50 text-muted-foreground'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Featured card */}
          <div
            ref={cardRef}
            className="rounded-3xl p-6 min-h-[280px] flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl"
            style={{ backgroundImage: GRADIENTS[bgIndex] }}
          >
            <Quote className="w-8 h-8 text-white/40 absolute top-4 right-4" />
            <p className="text-white text-2xl leading-[2.4] font-amiri drop-shadow">{current.text}</p>
            <div className="mt-4 text-white/90 text-xs font-bold bg-white/15 backdrop-blur px-3 py-1 rounded-full">﴿ {current.ref} ﴾</div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-4 gap-2">
            <button onClick={shuffle} className="rounded-xl bg-card border border-border/50 py-2.5 flex flex-col items-center gap-1 text-[11px] font-bold">
              <RefreshCw className="w-4 h-4 text-primary" /> بطاقة جديدة
            </button>
            <button onClick={() => share(current)} className="rounded-xl bg-card border border-border/50 py-2.5 flex flex-col items-center gap-1 text-[11px] font-bold">
              <Share2 className="w-4 h-4 text-primary" /> مشاركة
            </button>
            <button onClick={() => copyText(current)} className="rounded-xl bg-card border border-border/50 py-2.5 flex flex-col items-center gap-1 text-[11px] font-bold">
              <Copy className="w-4 h-4 text-primary" /> نسخ
            </button>
            <button onClick={downloadImage} className="rounded-xl bg-card border border-border/50 py-2.5 flex flex-col items-center gap-1 text-[11px] font-bold">
              <Download className="w-4 h-4 text-primary" /> صورة
            </button>
          </div>

          {/* List */}
          <div className="space-y-2">
            <h3 className="text-sm font-extrabold">جميع الاقتباسات</h3>
            {filtered.map((q) => (
              <div key={q.id} className="rounded-2xl bg-card border border-border/50 p-4">
                <p className="text-lg leading-9 font-amiri text-center">{q.text}</p>
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-[11px] text-muted-foreground">﴿ {q.ref} ﴾ • {q.theme}</div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleFav(q.id)} className="p-1.5 rounded-lg hover:bg-secondary/60">
                      <Heart className={`w-4 h-4 ${favs.includes(q.id) ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} />
                    </button>
                    <button onClick={() => copyText(q)} className="p-1.5 rounded-lg hover:bg-secondary/60">
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button onClick={() => share(q)} className="p-1.5 rounded-lg hover:bg-secondary/60">
                      <Share2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button onClick={() => { setCurrent(q); }} className="p-1.5 rounded-lg hover:bg-secondary/60">
                      <Quote className="w-4 h-4 text-primary" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuranQuotesPage;
