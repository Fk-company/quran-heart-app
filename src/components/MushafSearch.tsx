import React, { useState, useCallback, useRef } from 'react';
import { Search, X, Loader2, ArrowLeft } from 'lucide-react';

interface SearchResult {
  number: number;
  text: string;
  numberInSurah: number;
  page: number;
  surah: { number: number; name: string; englishName: string };
  juz: number;
}

interface MushafSearchProps {
  onNavigateToPage: (page: number) => void;
  nightMode?: boolean;
}

const MushafSearch: React.FC<MushafSearchProps> = ({ onNavigateToPage, nightMode }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); setSearched(false); return; }
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/search/${encodeURIComponent(q.trim())}/all/ar`);
      const data = await res.json();
      if (data.code === 200 && data.data?.matches) {
        setResults(data.data.matches.slice(0, 30));
      } else {
        setResults([]);
      }
    } catch { setResults([]); }
    setLoading(false);
  }, []);

  const handleChange = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 500);
  };

  const handleSelect = (r: SearchResult) => {
    onNavigateToPage(r.page);
    setOpen(false);
    setQuery('');
    setResults([]);
    setSearched(false);
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${nightMode ? 'bg-amber-500/20 text-amber-400' : 'bg-secondary text-foreground'}`}
        title="بحث في المصحف">
        <Search className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" dir="rtl">
      <div className={`flex-1 flex flex-col ${nightMode ? 'bg-[#1a1408]' : 'bg-background'}`}>
        {/* Search header */}
        <div className={`flex items-center gap-2 px-4 py-3 border-b ${nightMode ? 'border-amber-900/30 bg-[#1a1408]' : 'border-border bg-card'}`}>
          <button onClick={() => { setOpen(false); setQuery(''); setResults([]); setSearched(false); }}
            className={`w-8 h-8 rounded-full flex items-center justify-center ${nightMode ? 'text-amber-400' : 'text-foreground'}`}>
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 relative">
            <Search className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 ${nightMode ? 'text-amber-500/50' : 'text-muted-foreground'}`} />
            <input
              autoFocus
              value={query}
              onChange={e => handleChange(e.target.value)}
              placeholder="ابحث عن آية في المصحف..."
              className={`w-full pr-10 pl-4 py-2.5 rounded-xl text-sm outline-none ${nightMode ? 'bg-amber-900/20 text-amber-100 placeholder:text-amber-500/40 border border-amber-700/20' : 'bg-secondary text-foreground placeholder:text-muted-foreground border border-border'}`}
            />
          </div>
          {query && (
            <button onClick={() => { setQuery(''); setResults([]); setSearched(false); }}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${nightMode ? 'text-amber-400' : 'text-muted-foreground'}`}>
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className={`w-6 h-6 animate-spin ${nightMode ? 'text-amber-400' : 'text-primary'}`} />
            </div>
          )}

          {!loading && searched && results.length === 0 && (
            <div className="text-center py-12">
              <p className={`text-sm ${nightMode ? 'text-amber-400/60' : 'text-muted-foreground'}`}>لا توجد نتائج</p>
            </div>
          )}

          {!loading && !searched && (
            <div className="text-center py-12">
              <Search className={`w-10 h-10 mx-auto mb-3 ${nightMode ? 'text-amber-500/30' : 'text-muted-foreground/30'}`} />
              <p className={`text-sm ${nightMode ? 'text-amber-400/60' : 'text-muted-foreground'}`}>اكتب كلمة أو جزء من آية للبحث</p>
            </div>
          )}

          <div className="space-y-2">
            {results.map((r, i) => (
              <button key={`${r.number}-${i}`} onClick={() => handleSelect(r)}
                className={`w-full text-right p-3 rounded-xl transition-colors ${nightMode ? 'bg-amber-900/15 hover:bg-amber-900/30 border border-amber-700/15' : 'bg-card hover:bg-secondary border border-border'}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${nightMode ? 'bg-amber-500/20 text-amber-300' : 'bg-primary/10 text-primary'}`}>
                    صفحة {r.page}
                  </span>
                  <span className={`text-xs font-semibold ${nightMode ? 'text-amber-300' : 'text-primary'}`}>
                    {r.surah.name} - آية {r.numberInSurah}
                  </span>
                </div>
                <p className={`font-amiri text-sm leading-relaxed ${nightMode ? 'text-amber-100' : 'text-foreground'}`}>
                  {r.text.length > 120 ? r.text.slice(0, 120) + '...' : r.text}
                </p>
                <div className={`flex items-center gap-2 mt-1.5 text-[10px] ${nightMode ? 'text-amber-500/50' : 'text-muted-foreground'}`}>
                  <span>الجزء {r.juz}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MushafSearch;
