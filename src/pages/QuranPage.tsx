import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSurahs, type Surah } from '@/lib/api';
import { Book, Heart, BookOpen, SearchX, Layers, Filter, ChevronDown, ArrowDownAZ, Hash, Clock, Star, ArrowDown01 } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import PageHeader from '@/components/PageHeader';
import SearchFilterBar from '@/components/SearchFilterBar';
import SkeletonGrid from '@/components/SkeletonGrid';
import EmptyState from '@/components/EmptyState';

type SortKey = 'number' | 'number-desc' | 'name' | 'most-ayahs' | 'least-ayahs' | 'favorites-first';
const SORT_KEY = 'quran-sort';

const sortLabels: Record<SortKey, string> = {
  'number': 'حسب الترتيب (1 → 114)',
  'number-desc': 'حسب الترتيب (114 → 1)',
  'name': 'الاسم (أ → ي)',
  'most-ayahs': 'الأكثر آيات',
  'least-ayahs': 'الأقل آيات',
  'favorites-first': 'المفضلة أولاً',
};

const QuranPage: React.FC = () => {
  const navigate = useNavigate();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(() => (localStorage.getItem('quran-view') as any) || 'list');
  const [sortKey, setSortKey] = useState<SortKey>(() => (localStorage.getItem(SORT_KEY) as SortKey) || 'number');
  const [showSort, setShowSort] = useState(false);
  const { toggleSurah, isSurahFav, favorites } = useFavorites();

  useEffect(() => { localStorage.setItem('quran-view', viewMode); }, [viewMode]);
  useEffect(() => { localStorage.setItem(SORT_KEY, sortKey); }, [sortKey]);
  useEffect(() => {
    fetchSurahs().then((data) => { setSurahs(data); setLoading(false); });
  }, []);

  const counts = useMemo(() => ({
    all: surahs.length,
    Meccan: surahs.filter(s => s.revelationType === 'Meccan').length,
    Medinan: surahs.filter(s => s.revelationType === 'Medinan').length,
    favorites: favorites.surahs.length,
  }), [surahs, favorites.surahs]);

  const filtered = useMemo(() => {
    let result = surahs;
    if (filter === 'favorites') result = result.filter((s) => favorites.surahs.includes(s.number));
    else if (filter !== 'all') result = result.filter((s) => s.revelationType === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((s) =>
        s.name.includes(search) || s.englishName.toLowerCase().includes(q) || String(s.number) === search
      );
    }
    const sorted = [...result];
    switch (sortKey) {
      case 'number': sorted.sort((a, b) => a.number - b.number); break;
      case 'number-desc': sorted.sort((a, b) => b.number - a.number); break;
      case 'name': sorted.sort((a, b) => a.name.localeCompare(b.name, 'ar')); break;
      case 'most-ayahs': sorted.sort((a, b) => b.numberOfAyahs - a.numberOfAyahs); break;
      case 'least-ayahs': sorted.sort((a, b) => a.numberOfAyahs - b.numberOfAyahs); break;
      case 'favorites-first':
        sorted.sort((a, b) => {
          const af = favorites.surahs.includes(a.number) ? 0 : 1;
          const bf = favorites.surahs.includes(b.number) ? 0 : 1;
          if (af !== bf) return af - bf;
          return a.number - b.number;
        });
        break;
    }
    return sorted;
  }, [search, surahs, filter, favorites.surahs, sortKey]);

  const filters = [
    { key: 'all', label: 'الكل', count: counts.all },
    { key: 'Meccan', label: 'مكية', count: counts.Meccan },
    { key: 'Medinan', label: 'مدنية', count: counts.Medinan },
    { key: 'favorites', label: 'المفضلة', count: counts.favorites },
  ];

  const sortIcon: Record<SortKey, React.ReactNode> = {
    'number': <Hash className="w-3.5 h-3.5" />,
    'number-desc': <ArrowDown01 className="w-3.5 h-3.5" />,
    'name': <ArrowDownAZ className="w-3.5 h-3.5" />,
    'most-ayahs': <Layers className="w-3.5 h-3.5" />,
    'least-ayahs': <Layers className="w-3.5 h-3.5" />,
    'favorites-first': <Star className="w-3.5 h-3.5" />,
  };

  return (
    <div className="page-container page-with-topbar" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <PageHeader
          icon={Book}
          title="المصحف الشريف"
          subtitle={`${filtered.length} من ${surahs.length} سورة`}
        />

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="stat-card text-right">
            <div className="stat-card-icon bg-primary/10"><Book className="w-4 h-4 text-primary" /></div>
            <div className="stat-card-value">114</div>
            <div className="stat-card-label">سورة</div>
          </div>
          <div className="stat-card text-right">
            <div className="stat-card-icon bg-gold-light"><Layers className="w-4 h-4 text-gold-deep" /></div>
            <div className="stat-card-value">30</div>
            <div className="stat-card-label">جزء</div>
          </div>
          <div className="stat-card text-right">
            <div className="stat-card-icon bg-emerald-light"><BookOpen className="w-4 h-4 text-primary" /></div>
            <div className="stat-card-value">604</div>
            <div className="stat-card-label">صفحة</div>
          </div>
        </div>

        {/* Mushaf entry */}
        <button onClick={() => navigate('/mushaf')} className="card-luxury w-full mb-4 flex items-center gap-3 text-right hover:scale-[1.01] transition-transform">
          <div className="w-12 h-12 rounded-2xl gradient-gold flex items-center justify-center flex-shrink-0 shadow-gold">
            <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1 text-right">
            <div className="text-[11px] text-accent font-bold uppercase tracking-wider">جديد</div>
            <div className="text-base font-bold text-foreground font-kufi">المصحف صفحة بصفحة</div>
            <div className="text-xs text-muted-foreground mt-0.5">اقرأ كالمصحف الورقي — 604 صفحة</div>
          </div>
        </button>

        <SearchFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="ابحث عن سورة باسمها أو رقمها..."
          filters={filters}
          activeFilter={filter}
          onFilterChange={setFilter}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showViewToggle
          rightActions={
            <div className="relative">
              <button onClick={() => setShowSort(!showSort)}
                className="h-12 px-3 rounded-2xl bg-card border border-border flex items-center gap-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors">
                <Filter className="w-3.5 h-3.5 text-primary" />
                <ChevronDown className={`w-3 h-3 transition-transform ${showSort ? 'rotate-180' : ''}`} />
              </button>
              {showSort && (
                <div className="absolute left-0 top-full mt-2 w-56 bg-card border border-border rounded-2xl shadow-lg p-1.5 z-30 animate-fade-in">
                  <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase">الفرز</div>
                  {(Object.keys(sortLabels) as SortKey[]).map(key => (
                    <button key={key} onClick={() => { setSortKey(key); setShowSort(false); }}
                      className={`w-full text-right px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${sortKey === key ? 'bg-primary/10 text-primary' : 'hover:bg-secondary text-foreground'}`}>
                      {sortIcon[key]}
                      {sortLabels[key]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          }
        />

        {loading ? (
          <SkeletonGrid count={8} variant={viewMode === 'grid' ? 'tile' : 'list'} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="لا توجد نتائج"
            description={search ? `لم يتم العثور على سور مطابقة لـ "${search}"` : 'لا توجد سور في هذا التصنيف'}
          />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-3 gap-2.5">
            {filtered.map((surah) => (
              <div key={surah.number} className="card-surface-hover relative flex flex-col items-center py-4 gap-1.5">
                <button onClick={(e) => { e.stopPropagation(); toggleSurah(surah.number); }} className={`fav-btn absolute top-1.5 left-1.5 w-7 h-7 ${isSurahFav(surah.number) ? 'active' : ''}`}>
                  <Heart className="w-3.5 h-3.5" fill={isSurahFav(surah.number) ? 'currentColor' : 'none'} />
                </button>
                <button onClick={() => navigate(`/quran/${surah.number}`)} className="flex flex-col items-center gap-1.5 w-full">
                  <span className="verse-number">{surah.number}</span>
                  <span className="text-xs font-bold text-foreground mt-1 font-kufi">{surah.name}</span>
                  <span className="text-[10px] text-muted-foreground font-medium">{surah.numberOfAyahs} آيات</span>
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
                    <div className="font-bold text-foreground text-sm font-kufi">{surah.name}</div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                      <span className={surah.revelationType === 'Meccan' ? 'text-primary font-medium' : 'text-accent font-medium'}>
                        {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                      </span>
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
