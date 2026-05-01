import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSurahs, type Surah } from '@/lib/api';
import { Book, Heart, BookOpen, SearchX, Layers } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import PageHeader from '@/components/PageHeader';
import SearchFilterBar from '@/components/SearchFilterBar';
import SkeletonGrid from '@/components/SkeletonGrid';
import EmptyState from '@/components/EmptyState';

const QuranPage: React.FC = () => {
  const navigate = useNavigate();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(() => (localStorage.getItem('quran-view') as any) || 'list');
  const { toggleSurah, isSurahFav, favorites } = useFavorites();

  useEffect(() => { localStorage.setItem('quran-view', viewMode); }, [viewMode]);
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
    return result;
  }, [search, surahs, filter, favorites.surahs]);

  const filters = [
    { key: 'all', label: 'الكل', count: counts.all },
    { key: 'Meccan', label: 'مكية', count: counts.Meccan },
    { key: 'Medinan', label: 'مدنية', count: counts.Medinan },
    { key: 'favorites', label: 'المفضلة', count: counts.favorites },
  ];

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
