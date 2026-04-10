import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchQuran } from '@/lib/api';
import { Search as SearchIcon, Book, Clock, X } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

interface SearchResult {
  number: number;
  text: string;
  surah: { number: number; name: string };
  numberInSurah: number;
}

const HISTORY_KEY = 'search_history';
const getHistory = (): string[] => { try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; } };
const saveHistory = (q: string) => {
  const h = getHistory().filter(i => i !== q);
  h.unshift(q);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, 10)));
};

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [history, setHistory] = useState<string[]>(getHistory);
  const debounceRef = useRef<NodeJS.Timeout>();

  const handleSearch = useCallback(async (q?: string) => {
    const searchQuery = q || query;
    if (!searchQuery.trim()) return;
    setLoading(true);
    setSearched(true);
    saveHistory(searchQuery);
    setHistory(getHistory());
    try {
      const data = await searchQuran(searchQuery);
      setResults(data?.matches || []);
    } catch { setResults([]); }
    finally { setLoading(false); }
  }, [query]);

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length >= 3) {
      debounceRef.current = setTimeout(() => handleSearch(value), 600);
    }
  };

  return (
    <div className="page-container page-with-topbar" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <PageHeader
          icon={SearchIcon}
          title="البحث في القرآن"
          subtitle="ابحث عن آية أو كلمة"
        />

        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" value={query} onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="ابحث بكلمة او آية..." className="search-input pr-10" />
            {query && (
              <button onClick={() => { setQuery(''); setResults([]); setSearched(false); }} className="absolute left-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <button onClick={() => handleSearch()} disabled={loading}
            className="h-11 px-5 rounded-2xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 transition-colors">
            بحث
          </button>
        </div>

        {/* Search history */}
        {!searched && history.length > 0 && (
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-muted-foreground mb-2">عمليات البحث السابقة</h3>
            <div className="flex flex-wrap gap-2">
              {history.map((h, i) => (
                <button key={i} onClick={() => { setQuery(h); handleSearch(h); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-foreground text-xs">
                  <Clock className="w-3 h-3 text-muted-foreground" /> {h}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton-pulse h-20 w-full" />)}</div>
        ) : results.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground mb-3">{results.length} نتيجة</p>
            {results.map((result, idx) => (
              <button key={idx} onClick={() => navigate(`/quran/${result.surah.number}`)} className="card-surface-hover w-full text-right">
                <div className="flex items-center gap-2 mb-2">
                  <Book className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-primary">{result.surah.name} - آية {result.numberInSurah}</span>
                </div>
                <p className="font-amiri text-lg leading-[2] text-foreground">{result.text}</p>
              </button>
            ))}
          </div>
        ) : searched ? (
          <div className="text-center py-12 text-muted-foreground">
            <SearchIcon className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm">لا توجد نتائج</p>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <SearchIcon className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm">ابحث عن آية او كلمة في القرآن الكريم</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
