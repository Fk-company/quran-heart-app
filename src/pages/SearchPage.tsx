import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchQuran } from '@/lib/api';
import { Search as SearchIcon, Book } from 'lucide-react';

interface SearchResult {
  number: number;
  text: string;
  surah: { number: number; name: string };
  numberInSurah: number;
}

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await searchQuran(query);
      setResults(data?.matches || []);
    } catch { setResults([]); }
    finally { setLoading(false); }
  };

  return (
    <div className="page-container" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <SearchIcon className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">البحث في القرآن</h1>
            <p className="text-xs text-muted-foreground">ابحث عن آية أو كلمة</p>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="ابحث بكلمة او آية..." className="search-input pr-10"
            />
          </div>
          <button onClick={handleSearch} disabled={loading}
            className="h-11 px-5 rounded-2xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 transition-colors">
            بحث
          </button>
        </div>

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
