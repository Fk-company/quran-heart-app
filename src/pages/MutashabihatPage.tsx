import React, { useEffect, useMemo, useState } from 'react';
import { Layers, Search, Loader2, BookOpen, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { searchQuran } from '@/lib/api';

interface Match {
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
  text: string;
}

interface Group {
  phrase: string;
  tip: string;
}

const CURATED: Group[] = [
  { phrase: 'فبأي آلاء ربكما تكذبان', tip: 'تكرّرت في سورة الرحمن 31 مرة لتأكيد التذكير بنعم الله على الثقلين.' },
  { phrase: 'ولقد يسرنا القرآن للذكر فهل من مدكر', tip: 'تكرّرت في القمر 4 مرات بعد كل قصة قوم مكذّب.' },
  { phrase: 'إن في ذلك لآية وما كان أكثرهم مؤمنين', tip: 'تكرّرت في الشعراء 8 مرات بعد كل قصة من قصص الأنبياء.' },
  { phrase: 'ادخلوا هذه القرية فكلوا منها', tip: 'البقرة "ادخلوا" والأعراف "اسكنوا" — فرّق بينهما بأول الآية.' },
  { phrase: 'وما يعلم جنود ربك إلا هو', tip: 'موضع منفرد في القرآن في سياق ذكر خزنة النار (المدثر 31).' },
];

// Normalize Arabic text — strip diacritics + tatweel for comparison
const normalize = (s: string) =>
  s
    .replace(/[\u064B-\u0652\u0670\u0640]/g, '')
    .replace(/[إأآا]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ')
    .trim();

const MutashabihatPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openCurated, setOpenCurated] = useState<Set<number>>(new Set([0]));

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), 400);
    return () => clearTimeout(id);
  }, [query]);

  useEffect(() => {
    if (!debounced || debounced.length < 3) { setMatches([]); setError(null); return; }
    let cancelled = false;
    (async () => {
      setLoading(true); setError(null);
      try {
        const data = await searchQuran(debounced);
        const list: Match[] = (data?.matches || []).map((m: any) => ({
          surahName: m.surah?.name || '',
          surahNumber: m.surah?.number || 0,
          ayahNumber: m.numberInSurah || 0,
          text: m.text || '',
        }));
        if (!cancelled) setMatches(list);
      } catch {
        if (!cancelled) setError('تعذّر جلب النتائج. حاول مجدداً.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [debounced]);

  const normQuery = useMemo(() => normalize(debounced), [debounced]);
  const ranked = useMemo(() => {
    if (!normQuery) return matches;
    return [...matches].sort((a, b) => {
      const an = normalize(a.text); const bn = normalize(b.text);
      const ai = an.includes(normQuery) ? 0 : 1;
      const bi = bn.includes(normQuery) ? 0 : 1;
      return ai - bi || an.length - bn.length;
    });
  }, [matches, normQuery]);

  const highlight = (text: string) => {
    if (!normQuery) return text;
    const words = normQuery.split(' ').filter(w => w.length > 2);
    if (words.length === 0) return text;
    const parts = text.split(/(\s+)/);
    return parts.map((p, i) => {
      const np = normalize(p);
      const hit = words.some(w => np.includes(w));
      return hit ? <mark key={i} className="bg-accent/30 text-foreground rounded px-0.5">{p}</mark> : <span key={i}>{p}</span>;
    });
  };

  const toggleCurated = (i: number) => {
    setOpenCurated(s => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; });
  };

  return (
    <div className="page-container page-with-topbar" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <PageHeader icon={Layers} title="المتشابهات اللفظية" subtitle="ابحث عن آية لتجد كل مواضعها المتشابهة" showBack />

        {/* Search input */}
        <div className="card-luxury mb-3 p-2">
          <div className="flex items-center gap-2 bg-secondary/60 rounded-xl px-3">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              dir="rtl"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="اكتب جزءاً من الآية... مثل: فبأي آلاء ربكما"
              className="quran-text flex-1 bg-transparent py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
            />
            {loading && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2 px-1">
            {['فبأي آلاء', 'ولقد يسرنا', 'إن في ذلك لآية', 'يا أيها الذين آمنوا'].map(s => (
              <button key={s} onClick={() => setQuery(s)}
                className="text-[10px] font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/15">
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Search results */}
        {debounced.length >= 3 && (
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2 px-1">
              <h2 className="text-xs font-bold text-muted-foreground">
                {loading ? 'جاري البحث...' : `${ranked.length} موضع مطابق`}
              </h2>
              {ranked.length > 0 && (
                <span className="text-[10px] font-bold text-primary bg-primary/10 rounded-full px-2 py-0.5 inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> متشابهات
                </span>
              )}
            </div>
            {error && <div className="text-xs text-destructive bg-destructive/10 rounded-xl p-3 mb-2">{error}</div>}
            {!loading && !error && ranked.length === 0 && (
              <div className="card-surface text-center text-xs text-muted-foreground py-6">
                لا توجد نتائج لهذا النص.
              </div>
            )}
            <div className="space-y-2">
              {ranked.slice(0, 40).map((m, i) => (
                <div key={`${m.surahNumber}-${m.ayahNumber}-${i}`} className="card-surface">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-primary bg-primary/10 rounded-full px-2 py-0.5 inline-flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> {m.surahName} • آية {m.ayahNumber}
                    </span>
                    <span className="text-[10px] text-muted-foreground">سورة {m.surahNumber}</span>
                  </div>
                  <p className="quran-text text-base leading-loose text-foreground">{highlight(m.text)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Curated guide (always visible) */}
        {debounced.length < 3 && (
          <>
            <h2 className="section-title">دليل المتشابهات المشهورة</h2>
            <div className="space-y-2 mb-6">
              {CURATED.map((g, i) => {
                const isOpen = openCurated.has(i);
                return (
                  <div key={i} className="card-surface">
                    <button onClick={() => toggleCurated(i)} className="w-full flex items-center gap-3 text-right">
                      <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                        <Layers className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="quran-text text-sm text-foreground leading-relaxed line-clamp-2">{g.phrase}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">اضغط للبحث عن كل المواضع</div>
                      </div>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </button>
                    {isOpen && (
                      <div className="mt-3 pt-3 border-t border-dashed border-border space-y-2 animate-fade-in">
                        <div className="text-[11px] text-primary bg-primary/5 rounded-xl p-2.5 border border-primary/15 font-medium">
                          💡 {g.tip}
                        </div>
                        <button onClick={() => setQuery(g.phrase)}
                          className="w-full text-xs font-bold py-2 rounded-xl gradient-primary text-primary-foreground shadow-emerald inline-flex items-center justify-center gap-1.5">
                          <Search className="w-3.5 h-3.5" /> ابحث عن مواضعها في القرآن
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MutashabihatPage;
