import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchQuran, fetchSurahs, type Surah } from '@/lib/api';
import { Search as SearchIcon, Book, Clock, X, Filter, ChevronDown, BookOpen, Sparkles, Layers } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

interface SearchResult {
  number: number;
  text: string;
  surah: { number: number; name: string; revelationType?: string; numberOfAyahs?: number };
  numberInSurah: number;
}

const HISTORY_KEY = 'search_history';
const FILTER_KEY = 'search_filter';

const getHistory = (): string[] => {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; }
};
const saveHistory = (q: string) => {
  const h = getHistory().filter(i => i !== q);
  h.unshift(q);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, 10)));
};

type RevelationFilter = 'all' | 'Meccan' | 'Medinan';
type AyahCountFilter = 'all' | 'short' | 'medium' | 'long';

const SUGGESTED_KEYWORDS = [
  'الرحمن', 'الجنة', 'الصبر', 'التقوى', 'الإيمان', 'النور', 'الهدى',
  'الصلاة', 'الزكاة', 'الصيام', 'الحج', 'القرآن', 'النبي', 'الآخرة',
  'الرزق', 'الشكر', 'المغفرة', 'التوبة', 'العلم', 'الذكر',
];

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [history, setHistory] = useState<string[]>(getHistory);
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [showSuggest, setShowSuggest] = useState(false);

  const [filters, setFilters] = useState(() => {
    try { return JSON.parse(localStorage.getItem(FILTER_KEY) || '{}'); }
    catch { return {}; }
  });
  const revelation: RevelationFilter = filters.revelation || 'all';
  const ayahLen: AyahCountFilter = filters.ayahLen || 'all';
  const matchAll = filters.matchAll ?? false;
  const [showFilters, setShowFilters] = useState(false);

  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => { fetchSurahs().then(setSurahs).catch(() => {}); }, []);
  useEffect(() => { localStorage.setItem(FILTER_KEY, JSON.stringify(filters)); }, [filters]);

  // Build a map for surah metadata enrichment
  const surahMap = useMemo(() => {
    const m = new Map<number, Surah>();
    surahs.forEach(s => m.set(s.number, s));
    return m;
  }, [surahs]);

  // Autocomplete suggestions
  const suggestions = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    const out: { type: 'history' | 'keyword' | 'surah'; value: string; meta?: string }[] = [];
    // History
    history.filter(h => h.includes(q) && h !== q).slice(0, 3).forEach(h => out.push({ type: 'history', value: h }));
    // Surah names
    surahs.filter(s => s.name.includes(q)).slice(0, 4).forEach(s => out.push({
      type: 'surah', value: s.name, meta: `${s.numberOfAyahs} آيات`,
    }));
    // Keywords
    SUGGESTED_KEYWORDS.filter(k => k.includes(q) || q.includes(k)).slice(0, 4).forEach(k => out.push({ type: 'keyword', value: k }));
    return out.slice(0, 8);
  }, [query, history, surahs]);

  const applyFilters = useCallback((items: SearchResult[]): SearchResult[] => {
    return items.filter(r => {
      const meta = surahMap.get(r.surah.number);
      if (revelation !== 'all' && meta && meta.revelationType !== revelation) return false;
      if (ayahLen !== 'all' && meta) {
        const ay = meta.numberOfAyahs;
        if (ayahLen === 'short' && ay > 50) return false;
        if (ayahLen === 'medium' && (ay <= 50 || ay > 150)) return false;
        if (ayahLen === 'long' && ay <= 150) return false;
      }
      return true;
    });
  }, [revelation, ayahLen, surahMap]);

  const handleSearch = useCallback(async (q?: string) => {
    const raw = (q ?? query).trim();
    if (!raw) return;
    setLoading(true);
    setSearched(true);
    setShowSuggest(false);
    saveHistory(raw);
    setHistory(getHistory());

    try {
      const tokens = raw.split(/\s+/).filter(Boolean);
      let merged: SearchResult[] = [];

      if (tokens.length === 1) {
        const data = await searchQuran(raw);
        merged = data?.matches || [];
      } else {
        // multi-word: fetch each token
        const all = await Promise.all(tokens.map(t => searchQuran(t).catch(() => null)));
        const buckets = all.map(d => d?.matches || []);
        if (matchAll) {
          // intersect by ayah number
          const counts = new Map<number, { count: number; item: SearchResult }>();
          buckets.forEach(b => {
            const seen = new Set<number>();
            (b as SearchResult[]).forEach(it => {
              if (seen.has(it.number)) return;
              seen.add(it.number);
              const cur = counts.get(it.number);
              if (cur) cur.count++; else counts.set(it.number, { count: 1, item: it });
            });
          });
          merged = Array.from(counts.values())
            .filter(v => v.count === tokens.length)
            .map(v => v.item);
        } else {
          // union
          const seen = new Set<number>();
          buckets.flat().forEach((it: SearchResult) => {
            if (seen.has(it.number)) return;
            seen.add(it.number);
            merged.push(it);
          });
        }
      }
      setResults(applyFilters(merged));
    } catch { setResults([]); }
    finally { setLoading(false); }
  }, [query, matchAll, applyFilters]);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setShowSuggest(value.trim().length > 0);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length >= 3) {
      debounceRef.current = setTimeout(() => handleSearch(value), 700);
    }
  };

  const updateFilter = (k: string, v: any) => setFilters((f: any) => ({ ...f, [k]: v }));

  const tokens = query.trim().split(/\s+/).filter(Boolean);
  const highlight = (text: string) => {
    if (tokens.length === 0) return text;
    const parts: React.ReactNode[] = [text];
    tokens.forEach((tok) => {
      const next: React.ReactNode[] = [];
      parts.forEach((p) => {
        if (typeof p !== 'string') { next.push(p); return; }
        const split = p.split(tok);
        split.forEach((seg, i) => {
          next.push(seg);
          if (i < split.length - 1) {
            next.push(<mark key={`${tok}-${i}-${Math.random()}`} className="bg-accent/25 text-foreground rounded px-0.5">{tok}</mark>);
          }
        });
      });
      parts.length = 0;
      parts.push(...next);
    });
    return <>{parts}</>;
  };

  return (
    <div className="page-container page-with-topbar" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <PageHeader
          icon={SearchIcon}
          title="البحث المتقدم"
          subtitle="ابحث عن آية أو كلمة أو موضوع في القرآن"
        />

        {/* Search input */}
        <div className="flex gap-2 mb-3 relative">
          <div className="relative flex-1">
            <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" value={query} onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              onFocus={() => setShowSuggest(query.trim().length > 0 || true)}
              placeholder="ابحث بكلمة أو عدة كلمات..." className="search-input pr-10" />
            {query && (
              <button onClick={() => { setQuery(''); setResults([]); setSearched(false); setShowSuggest(false); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            )}

            {/* Autocomplete dropdown */}
            {showSuggest && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-card border border-border rounded-2xl shadow-lg z-30 overflow-hidden animate-fade-in">
                {suggestions.map((s, i) => (
                  <button key={i} onClick={() => { setQuery(s.value); setShowSuggest(false); handleSearch(s.value); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-secondary text-right transition-colors border-b border-border/40 last:border-0">
                    {s.type === 'history' && <Clock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
                    {s.type === 'surah' && <Book className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                    {s.type === 'keyword' && <Sparkles className="w-3.5 h-3.5 text-accent flex-shrink-0" />}
                    <span className="text-sm text-foreground flex-1 font-medium">{s.value}</span>
                    {s.meta && <span className="text-[10px] text-muted-foreground">{s.meta}</span>}
                    <span className="text-[10px] text-muted-foreground/60">
                      {s.type === 'history' ? 'سابق' : s.type === 'surah' ? 'سورة' : 'كلمة'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => handleSearch()} disabled={loading}
            className="h-12 px-5 rounded-2xl text-sm font-bold disabled:opacity-50 transition-all shadow-emerald hover:scale-105"
            style={{ background: 'var(--grad-primary)', color: 'hsl(var(--primary-foreground))' }}>
            {loading ? '...' : 'بحث'}
          </button>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`h-12 px-3 rounded-2xl border flex items-center gap-1 text-xs font-semibold transition-colors ${showFilters || revelation !== 'all' || ayahLen !== 'all' || matchAll ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-card border-border text-foreground'}`}>
            <Filter className="w-3.5 h-3.5" />
            <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Advanced filters panel */}
        {showFilters && (
          <div className="card-surface mb-4 animate-fade-in space-y-3">
            <div>
              <label className="text-[11px] font-bold text-muted-foreground mb-1.5 block uppercase">نوع السورة</label>
              <div className="flex gap-1.5 flex-wrap">
                {(['all', 'Meccan', 'Medinan'] as RevelationFilter[]).map(v => (
                  <button key={v} onClick={() => updateFilter('revelation', v)}
                    className={`filter-chip ${revelation === v ? 'active' : ''}`}>
                    {v === 'all' ? 'الكل' : v === 'Meccan' ? 'مكية' : 'مدنية'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold text-muted-foreground mb-1.5 block uppercase">عدد الآيات</label>
              <div className="flex gap-1.5 flex-wrap">
                {([
                  { k: 'all', l: 'الكل' },
                  { k: 'short', l: 'قصيرة (≤50)' },
                  { k: 'medium', l: 'متوسطة (51-150)' },
                  { k: 'long', l: 'طويلة (>150)' },
                ] as { k: AyahCountFilter; l: string }[]).map(o => (
                  <button key={o.k} onClick={() => updateFilter('ayahLen', o.k)}
                    className={`filter-chip ${ayahLen === o.k ? 'active' : ''}`}>{o.l}</button>
                ))}
              </div>
            </div>
            {tokens.length > 1 && (
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div>
                  <p className="text-xs font-semibold text-foreground">طريقة المطابقة</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {matchAll ? 'الآية تحوي جميع الكلمات' : 'الآية تحوي إحدى الكلمات'}
                  </p>
                </div>
                <button onClick={() => updateFilter('matchAll', !matchAll)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${matchAll ? 'bg-primary' : 'bg-muted'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${matchAll ? 'right-0.5' : 'right-[calc(100%-1.375rem)]'}`} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Initial state: keywords + history */}
        {!searched && !loading && (
          <>
            {history.length > 0 && (
              <div className="mb-4">
                <h3 className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" />آخر عمليات البحث
                </h3>
                <div className="flex flex-wrap gap-2">
                  {history.map((h, i) => (
                    <button key={i} onClick={() => { setQuery(h); handleSearch(h); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-foreground text-xs hover:bg-muted transition-colors">
                      <Clock className="w-3 h-3 text-muted-foreground" /> {h}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="mb-4">
              <h3 className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> كلمات شائعة
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_KEYWORDS.map((k) => (
                  <button key={k} onClick={() => { setQuery(k); handleSearch(k); }}
                    className="px-3 py-1.5 rounded-full bg-primary/8 text-primary text-xs font-semibold hover:bg-primary/15 transition-colors border border-primary/15">
                    {k}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {loading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton-pulse h-24 w-full" />)}</div>
        ) : results.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground"><span className="font-bold text-foreground">{results.length}</span> نتيجة</p>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                {tokens.length > 1 && <span className="stat-badge text-[10px] py-0.5">{tokens.length} كلمات</span>}
                {revelation !== 'all' && <span className="stat-badge text-[10px] py-0.5">{revelation === 'Meccan' ? 'مكية' : 'مدنية'}</span>}
              </div>
            </div>
            {results.map((result, idx) => {
              const meta = surahMap.get(result.surah.number);
              return (
                <button key={idx} onClick={() => navigate(`/quran/${result.surah.number}`)} className="card-surface-hover w-full text-right">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="verse-number flex-shrink-0">{result.surah.number}</span>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-primary truncate font-kufi block">
                          {result.surah.name} · آية {result.numberInSurah}
                        </span>
                        {meta && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            <span className={meta.revelationType === 'Meccan' ? 'text-primary' : 'text-accent'}>
                              {meta.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-border inline-block" />
                            <span>{meta.numberOfAyahs} آيات</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <BookOpen className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  </div>
                  <p className="font-amiri text-lg leading-[2] text-foreground">{highlight(result.text)}</p>
                </button>
              );
            })}
          </div>
        ) : searched ? (
          <div className="empty-state">
            <div className="empty-state-icon-box"><SearchIcon className="empty-state-icon" /></div>
            <h3 className="empty-state-title">لا توجد نتائج</h3>
            <p className="empty-state-text">جرّب كلمات مختلفة أو أزل بعض الفلاتر</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SearchPage;
