import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSurahs, type Surah } from '@/lib/api';
import { Search } from 'lucide-react';

const QuranPage: React.FC = () => {
  const navigate = useNavigate();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [filtered, setFiltered] = useState<Surah[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSurahs().then((data) => {
      setSurahs(data);
      setFiltered(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(surahs);
    } else {
      setFiltered(
        surahs.filter(
          (s) =>
            s.name.includes(search) ||
            s.englishName.toLowerCase().includes(search.toLowerCase()) ||
            String(s.number) === search
        )
      );
    }
  }, [search, surahs]);

  return (
    <div className="page-container" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-foreground mb-4">المصحف الشريف</h1>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن سورة..."
            className="w-full h-10 pr-10 pl-4 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="skeleton-pulse h-16 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((surah) => (
              <button
                key={surah.number}
                onClick={() => navigate(`/quran/${surah.number}`)}
                className="card-surface w-full flex items-center gap-3 text-right transition-colors hover:bg-secondary/50"
              >
                <div className="verse-number flex-shrink-0">{surah.number}</div>
                <div className="flex-1">
                  <div className="font-semibold text-foreground text-sm">{surah.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} - {surah.numberOfAyahs} آيات
                  </div>
                </div>
                <div className="font-amiri text-lg text-primary">{surah.name}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuranPage;
