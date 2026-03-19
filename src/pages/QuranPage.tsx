import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSurahs, type Surah } from '@/lib/api';
import { Search, Book, Filter } from 'lucide-react';

const QuranPage: React.FC = () => {
  const navigate = useNavigate();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [filtered, setFiltered] = useState<Surah[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'Meccan' | 'Medinan'>('all');

  useEffect(() => {
    fetchSurahs().then((data) => {
      setSurahs(data);
      setFiltered(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let result = surahs;
    if (filter !== 'all') {
      result = result.filter((s) => s.revelationType === filter);
    }
    if (search.trim()) {
      result = result.filter(
        (s) =>
          s.name.includes(search) ||
          s.englishName.toLowerCase().includes(search.toLowerCase()) ||
          String(s.number) === search
      );
    }
    setFiltered(result);
  }, [search, surahs, filter]);

  return (
    <div className="page-container" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Book className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">المصحف الشريف</h1>
            <p className="text-xs text-muted-foreground">114 سورة</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن سورة..."
            className="w-full h-10 pr-10 pl-4 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 mb-4">
          {[
            { key: 'all' as const, label: 'الكل' },
            { key: 'Meccan' as const, label: 'مكية' },
            { key: 'Medinan' as const, label: 'مدنية' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === f.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
          <span className="text-xs text-muted-foreground self-center mr-auto">{filtered.length} سورة</span>
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
                className="card-surface-hover w-full flex items-center gap-3 text-right"
              >
                <div className="verse-number flex-shrink-0">{surah.number}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-foreground text-sm">{surah.name}</div>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                    <span>{surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}</span>
                    <span className="w-1 h-1 rounded-full bg-border inline-block" />
                    <span>{surah.numberOfAyahs} آيات</span>
                  </div>
                </div>
                <span className="font-amiri text-lg text-primary opacity-70">{surah.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuranPage;
