import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSurahs, type Surah } from '@/lib/api';
import { Search, Book, Grid3X3, List, Heart } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';

const QuranPage: React.FC = () => {
  const navigate = useNavigate();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [filtered, setFiltered] = useState<Surah[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'Meccan' | 'Medinan' | 'favorites'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(() => (localStorage.getItem('quran-view') as any) || 'list');
  const { toggleSurah, isSurahFav, favorites } = useFavorites();

  useEffect(() => { localStorage.setItem('quran-view', viewMode); }, [viewMode]);

  useEffect(() => {
    fetchSurahs().then((data) => { setSurahs(data); setFiltered(data); setLoading(false); });
  }, []);

  useEffect(() => {
    let result = surahs;
    if (filter === 'favorites') result = result.filter((s) => favorites.surahs.includes(s.number));
    else if (filter !== 'all') result = result.filter((s) => s.revelationType === filter);
    if (search.trim()) {
      result = result.filter((s) =>
        s.name.includes(search) || s.englishName.toLowerCase().includes(search.toLowerCase()) || String(s.number) === search
      );
    }
    setFiltered(result);
  }, [search, surahs, filter, favorites.surahs]);

  return (
    <div className="page-container" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Book className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">المصحف الشريف</h1>
            <p className="text-xs text-muted-foreground">114 سورة</p>
          </div>
          <div className="flex gap-1">
            <button onClick={() => setViewMode('list')} className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}><List className="w-4 h-4" /></button>
            <button onClick={() => setViewMode('grid')} className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}><Grid3X3 className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="relative mb-3">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث عن سورة..." className="search-input pr-10" />
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {([
            { key: 'all' as const, label: 'الكل' },
            { key: 'Meccan' as const, label: 'مكية' },
            { key: 'Medinan' as const, label: 'مدنية' },
            { key: 'favorites' as const, label: 'المفضلة' },
          ] as const).map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)} className={`filter-chip ${filter === f.key ? 'active' : ''}`}>{f.label}</button>
          ))}
          <span className="text-xs text-muted-foreground self-center mr-auto whitespace-nowrap">{filtered.length} سورة</span>
        </div>

        {loading ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-3 gap-2' : 'space-y-2'}>
            {Array.from({ length: viewMode === 'grid' ? 9 : 10 }).map((_, i) => (
              <div key={i} className={`skeleton-pulse ${viewMode === 'grid' ? 'h-24' : 'h-16'} w-full`} />
            ))}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-3 gap-2">
            {filtered.map((surah) => (
              <div key={surah.number} className="card-surface-hover relative flex flex-col items-center py-3 gap-1">
                <button onClick={(e) => { e.stopPropagation(); toggleSurah(surah.number); }} className={`fav-btn absolute top-1 left-1 w-6 h-6 ${isSurahFav(surah.number) ? 'active' : ''}`}>
                  <Heart className="w-3 h-3" fill={isSurahFav(surah.number) ? 'currentColor' : 'none'} />
                </button>
                <button onClick={() => navigate(`/quran/${surah.number}`)} className="flex flex-col items-center gap-1 w-full">
                  <span className="verse-number text-sm">{surah.number}</span>
                  <span className="text-xs font-bold text-foreground mt-1">{surah.name}</span>
                  <span className="text-[10px] text-muted-foreground">{surah.numberOfAyahs} آيات</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((surah) => (
              <div key={surah.number} className="card-surface-hover flex items-center gap-3 text-right">
                <button onClick={() => navigate(`/quran/${surah.number}`)} className="flex items-center gap-3 flex-1 min-w-0">
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
                <button onClick={() => toggleSurah(surah.number)} className={`fav-btn ${isSurahFav(surah.number) ? 'active' : ''}`}>
                  <Heart className="w-4 h-4" fill={isSurahFav(surah.number) ? 'currentColor' : 'none'} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuranPage;
