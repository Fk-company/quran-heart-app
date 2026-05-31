import React, { useMemo, useState, useEffect } from 'react';
import SEO from '@/components/SEO';
import { useFavorites } from '@/hooks/useFavorites';
import {
  Search, Heart, BookOpen, Share2, X, Type, Minus, Plus,
  ChevronDown, Clock, Sparkles, Bookmark, Copy, Check,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { duaCategories, type LongDua } from '@/data/longDuas';
import { allDuas } from '@/data/generatedDuas';
const longDuas = allDuas;

const FONT_KEY = 'dua-font-size';

const DuaPage: React.FC = () => {
  const [selectedCat, setSelectedCat] = useState<LongDua['category'] | 'all'>('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [reader, setReader] = useState<LongDua | null>(null);
  const [visibleCount, setVisibleCount] = useState(40);
  const [fontSize, setFontSize] = useState<number>(() => {
    const v = Number(localStorage.getItem(FONT_KEY));
    return v >= 14 && v <= 36 ? v : 22;
  });
  const [copied, setCopied] = useState<string | null>(null);
  const { addItem, removeItem, isItemFav } = useFavorites();

  // Debounce search input for snappy mobile UX.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 220);
    return () => clearTimeout(t);
  }, [search]);
  useEffect(() => { setVisibleCount(40); }, [debouncedSearch, selectedCat]);

  useEffect(() => { localStorage.setItem(FONT_KEY, String(fontSize)); }, [fontSize]);
  useEffect(() => {
    if (!reader) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setReader(null); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [reader]);

  const filtered = useMemo(() => {
    const q = debouncedSearch;
    return longDuas.filter(d => {
      if (selectedCat !== 'all' && d.category !== selectedCat) return false;
      if (q && !d.title.includes(q) && !d.text.includes(q) && !d.reference.includes(q)) return false;
      return true;
    });
  }, [debouncedSearch, selectedCat]);

  const visible = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);

  const totalMinutes = useMemo(() => longDuas.reduce((s, d) => s + d.estimatedMinutes, 0), []);

  const toggleFav = (d: LongDua) => {
    const id = `longdua-${d.id}`;
    if (isItemFav(id)) removeItem(id);
    else addItem({ id, type: 'dua', text: d.text.slice(0, 200), source: d.title });
  };

  const shareDua = (d: LongDua) => {
    const text = `${d.title}\n\n${d.text}\n\n— ${d.reference}`;
    if (navigator.share) navigator.share({ title: d.title, text }).catch(() => {});
    else {
      navigator.clipboard.writeText(text);
      setCopied(d.id);
      setTimeout(() => setCopied(null), 1500);
    }
  };

  const copyDua = (d: LongDua) => {
    navigator.clipboard.writeText(d.text);
    setCopied(d.id);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <>
      <SEO
        title="الأدعية المطوّلة — قلب القرآن"
        description="مكتبة الأدعية الطويلة والأحزاب: سيد الاستغفار، دعاء الكرب، حزب البحر، أدعية القرآن، وأدعية القنوت وحسن الخاتمة."
      />
      <div className="page-container page-with-topbar" dir="rtl">
        <div className="px-4 pt-6 max-w-2xl mx-auto pb-12">
          <PageHeader
            icon={BookOpen}
            title="الأدعية المطوّلة"
            subtitle={`${longDuas.length.toLocaleString('ar-EG')} دعاء · بحث فوري وتصفية ذكية`}
            gradient="gold"
          />

          {/* Hero */}
          <div className="card-luxury mb-5 relative overflow-hidden">
            <div className="absolute inset-0 islamic-pattern-arabesque opacity-30 pointer-events-none" />
            <div className="relative">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl gradient-gold flex items-center justify-center shadow-gold flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-foreground font-kufi">صلِ، استغفر، ادعُ…</h2>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    اختر دعاءً مطوّلاً وادخل وضع القراءة الكامل بخط مريح. كل دعاء بمصدره وزمن قراءته التقديري.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث في المتن أو العنوان أو المصدر..."
              className="search-input pr-10"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-5">
            {duaCategories.map(cat => {
              const active = selectedCat === cat.id;
              const count = cat.id === 'all'
                ? longDuas.length
                : longDuas.filter(d => d.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCat(cat.id as any)}
                  className={`filter-chip ${active ? 'active' : ''}`}
                >
                  {cat.name}
                  <span className={`mr-1 text-[10px] px-1.5 rounded-full ${active ? 'bg-primary-foreground/20' : 'bg-muted'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* List */}
          {filtered.length === 0 ? (
            <div className="card-surface text-center py-10 text-sm text-muted-foreground">
              لا توجد أدعية مطابقة. جرّب كلمة أخرى.
            </div>
          ) : (
            <>
            <div className="flex items-center justify-between mb-2 px-1 text-[11px] text-muted-foreground">
              <span>عرض {visible.length.toLocaleString('ar-EG')} من {filtered.length.toLocaleString('ar-EG')}</span>
              {search && search !== debouncedSearch && <span className="opacity-60">…يبحث</span>}
            </div>
            <div className="space-y-3">
              {visible.map(dua => {
                const fid = `longdua-${dua.id}`;
                const fav = isItemFav(fid);
                const isOpen = expanded === dua.id;
                return (
                  <article
                    key={dua.id}
                    className={`card-surface transition-all ${isOpen ? 'border-primary/30 shadow-emerald' : 'hover:border-primary/20'}`}
                  >
                    <header
                      className="flex items-start gap-3 cursor-pointer"
                      onClick={() => setExpanded(isOpen ? null : dua.id)}
                    >
                      <div className="w-10 h-10 rounded-2xl gradient-gold flex items-center justify-center shadow-gold flex-shrink-0">
                        <Bookmark className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-extrabold text-foreground font-kufi leading-tight">{dua.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {dua.estimatedMinutes} د
                          </span>
                          <span className="truncate">{dua.reference}</span>
                        </div>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                    </header>

                    {isOpen && (
                      <div className="mt-3 pt-3 border-t border-border animate-fade-in">
                        <div
                          className="font-amiri text-foreground whitespace-pre-line"
                          style={{ fontSize: `${fontSize - 2}px`, lineHeight: 2.1 }}
                        >
                          {dua.text}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-border">
                          <button
                            onClick={() => setReader(dua)}
                            className="px-3 py-2 rounded-xl gradient-primary text-primary-foreground text-xs font-bold inline-flex items-center gap-1.5 shadow-emerald"
                          >
                            <Type className="w-3.5 h-3.5" /> وضع القراءة
                          </button>
                          <button
                            onClick={() => copyDua(dua)}
                            className="px-3 py-2 rounded-xl bg-secondary text-foreground text-xs font-semibold inline-flex items-center gap-1.5"
                          >
                            {copied === dua.id ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                            {copied === dua.id ? 'تم النسخ' : 'نسخ'}
                          </button>
                          <button
                            onClick={() => shareDua(dua)}
                            className="px-3 py-2 rounded-xl bg-secondary text-foreground text-xs font-semibold inline-flex items-center gap-1.5"
                          >
                            <Share2 className="w-3.5 h-3.5" /> مشاركة
                          </button>
                          <button
                            onClick={() => toggleFav(dua)}
                            className={`px-3 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 mr-auto ${fav ? 'bg-destructive/10 text-destructive' : 'bg-secondary text-foreground'}`}
                          >
                            <Heart className="w-3.5 h-3.5" fill={fav ? 'currentColor' : 'none'} />
                            {fav ? 'محفوظ' : 'حفظ'}
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
            {visibleCount < filtered.length && (
              <button
                onClick={() => setVisibleCount(c => c + 40)}
                className="mt-4 w-full py-3 rounded-2xl bg-secondary text-foreground text-sm font-bold hover:bg-muted transition-colors"
              >
                عرض المزيد ({(filtered.length - visibleCount).toLocaleString('ar-EG')} متبقٍ)
              </button>
            )}
            </>
          )}
        </div>
      </div>

      {/* ============= Full-screen Reader ============= */}
      {reader && (
        <div className="fixed inset-0 z-[60] bg-background flex flex-col" dir="rtl">
          {/* Reader header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/80 backdrop-blur-md">
            <button
              onClick={() => setReader(null)}
              className="w-9 h-9 rounded-xl bg-secondary inline-flex items-center justify-center hover:bg-muted"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4 text-foreground" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-extrabold text-foreground truncate font-kufi">{reader.title}</div>
              <div className="text-[10px] text-muted-foreground truncate">{reader.reference}</div>
            </div>
            <div className="flex items-center gap-1 bg-secondary rounded-xl p-1">
              <button
                onClick={() => setFontSize(s => Math.max(14, s - 2))}
                className="w-7 h-7 rounded-lg hover:bg-background flex items-center justify-center"
                aria-label="تصغير الخط"
              >
                <Minus className="w-3.5 h-3.5 text-foreground" />
              </button>
              <span className="text-[11px] font-bold text-foreground tabular-nums w-7 text-center">{fontSize}</span>
              <button
                onClick={() => setFontSize(s => Math.min(36, s + 2))}
                className="w-7 h-7 rounded-lg hover:bg-background flex items-center justify-center"
                aria-label="تكبير الخط"
              >
                <Plus className="w-3.5 h-3.5 text-foreground" />
              </button>
            </div>
          </div>

          {/* Reader body */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-6 py-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                  <Clock className="w-3 h-3" /> {reader.estimatedMinutes} دقيقة قراءة
                </div>
              </div>
              <p
                className="font-amiri text-foreground text-center whitespace-pre-line"
                style={{ fontSize: `${fontSize}px`, lineHeight: 2.3 }}
              >
                {reader.text}
              </p>
              <div className="text-center mt-10 pt-6 border-t border-border">
                <p className="text-xs text-muted-foreground">{reader.reference}</p>
                <button
                  onClick={() => setReader(null)}
                  className="mt-5 px-6 py-2.5 rounded-2xl gradient-primary text-primary-foreground text-sm font-bold inline-flex items-center gap-2 shadow-emerald"
                >
                  <Check className="w-4 h-4" /> إنهاء القراءة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DuaPage;
