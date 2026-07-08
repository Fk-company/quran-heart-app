import React, { useEffect, useState, useMemo } from 'react';
import SEO from '@/components/SEO';
import { useNavigate } from 'react-router-dom';
import { fetchSurahs, type Surah } from '@/lib/api';
import { Book, Heart, BookOpen, SearchX, Layers, Filter, ChevronDown, ArrowDownAZ, Hash, Clock, Star, ArrowDown01 } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import PageHeader from '@/components/PageHeader';
import SearchFilterBar from '@/components/SearchFilterBar';
import SkeletonGrid from '@/components/SkeletonGrid';
import EmptyState from '@/components/EmptyState';
import { getCached, setCached } from '@/lib/dataCache';

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
  const cachedSurahs = getCached<Surah[]>('surahs');
  const [surahs, setSurahs] = useState<Surah[]>(cachedSurahs ?? []);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(!cachedSurahs);
  const [filter, setFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(() => (localStorage.getItem('quran-view') as any) || 'list');
  const [sortKey, setSortKey] = useState<SortKey>(() => (localStorage.getItem(SORT_KEY) as SortKey) || 'number');
  const [showSort, setShowSort] = useState(false);
  const { toggleSurah, isSurahFav, favorites } = useFavorites();

  useEffect(() => { localStorage.setItem('quran-view', viewMode); }, [viewMode]);
  useEffect(() => { localStorage.setItem(SORT_KEY, sortKey); }, [sortKey]);
  useEffect(() => {
    fetchSurahs().then((data) => { setCached('surahs', data); setSurahs(data); setLoading(false); });
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
    <>
      <SEO title="سور القرآن الكريم — قلب القرآن" description="تصفح قائمة سور القرآن الكريم 114 سورة مع البحث والفرز والترتيب وإمكانية القراءة والاستماع." />
      <div className="page-container page-with-topbar" dir="rtl">
      <div className="page-inner">
        <PageHeader
          icon={Book}
          title="المصحف الشريف"
          subtitle={`${filtered.length} من ${surahs.length} سورة`}
          badge={<span className="badge-tone badge-tone-gold">{counts.favorites} مفضلة</span>}
        />

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2 mb-4 stagger-children">
          <div className="stat-card text-right">
            <div className="icon-tile !w-9 !h-9 !rounded-xl mb-2"><Book className="w-4 h-4" /></div>
            <div className="stat-card-value">114</div>
            <div className="stat-card-label">سورة</div>
          </div>
          <div className="stat-card text-right">
            <div className="icon-tile icon-tile-gold !w-9 !h-9 !rounded-xl mb-2"><Layers className="w-4 h-4" /></div>
            <div className="stat-card-value">30</div>
            <div className="stat-card-label">جزء</div>
          </div>
          <div className="stat-card text-right">
            <div className="icon-tile icon-tile-emerald !w-9 !h-9 !rounded-xl mb-2"><BookOpen className="w-4 h-4" /></div>
            <div className="stat-card-value">604</div>
            <div className="stat-card-label">صفحة</div>
          </div>
        </div>

        {/* Mushaf entry */}
        <button onClick={() => navigate('/mushaf')} className="card-luxury w-full mb-4 flex items-center gap-3 text-right press lift-hover">
          <div className="icon-tile icon-tile-lg gradient-gold !border-transparent shadow-gold">
            <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1 text-right">
            <div className="text-[11px] text-accent font-bold uppercase tracking-wider flex items-center gap-1">
              <Star className="w-3 h-3" /> ميزة مميزة
            </div>
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
                <div className="absolute left-0 top-full mt-2 w-56 bg-card border border-border rounded-2xl shadow-lg p-1.5 z-30 animate-scale-in">
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
            action={
              search || filter !== 'all' ? (
                <button onClick={() => { setSearch(''); setFilter('all'); }} className="chip">إعادة تعيين</button>
              ) : undefined
            }
          />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-3 gap-2.5 stagger-children">
            {filtered.map((surah) => (
              <div key={surah.number} className="action-tile !items-center !text-center press">
                <button
                  onClick={(e) => { e.stopPropagation(); toggleSurah(surah.number); }}
                  className={`fav-btn absolute top-1.5 left-1.5 w-7 h-7 z-10 ${isSurahFav(surah.number) ? 'active' : ''}`}
                  aria-label={isSurahFav(surah.number) ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                >
                  <Heart className="w-3.5 h-3.5" fill={isSurahFav(surah.number) ? 'currentColor' : 'none'} />
                </button>
                <button onClick={() => navigate(`/quran/${surah.number}`)} className="flex flex-col items-center gap-1.5 w-full">
                  <span className="verse-number">{surah.number}</span>
                  <span className="text-xs font-bold text-foreground mt-1 font-kufi">{surah.name}</span>
                  <span className="text-[10px] text-muted-foreground font-medium">{surah.numberOfAyahs} آيات</span>
                  <span className={`badge-tone ${surah.revelationType === 'Meccan' ? 'badge-tone-primary' : 'badge-tone-gold'} !text-[9px] !py-0`}>
                    {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                  </span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2 stagger-children">
            {filtered.map((surah) => (
              <div key={surah.number} className="list-row press">
                <button onClick={() => navigate(`/quran/${surah.number}`)} className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="verse-number flex-shrink-0">{surah.number}</div>
                  <div className="flex-1 min-w-0 text-right">
                    <div className="list-row-title font-kufi">{surah.name}</div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                      <span className={`badge-tone ${surah.revelationType === 'Meccan' ? 'badge-tone-primary' : 'badge-tone-gold'} !text-[10px] !py-0`}>
                        {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                      </span>
                      <span>{surah.numberOfAyahs} آيات</span>
                    </div>
                  </div>
                  <span className="font-amiri text-lg text-primary opacity-70">{surah.name}</span>
                </button>
                <button onClick={() => toggleSurah(surah.number)} className={`fav-btn ${isSurahFav(surah.number) ? 'active' : ''}`} aria-label="مفضلة">
                  <Heart className="w-4 h-4" fill={isSurahFav(surah.number) ? 'currentColor' : 'none'} />
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
    </>
  );
};

export default QuranPage;
