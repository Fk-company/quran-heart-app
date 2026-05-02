import React, { useEffect, useState, useMemo } from 'react';
import { fetchRadioStations, type RadioStation } from '@/lib/api';
import { useAudioPlayer } from '@/contexts/AudioContext';
import { Play, Pause, Radio, Signal, Search, Grid3X3, List, ArrowDownAZ, Filter, ChevronDown, History, Heart, X } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import SkeletonGrid from '@/components/SkeletonGrid';
import EmptyState from '@/components/EmptyState';
import { useAppStats, formatListenTime } from '@/hooks/useAppStats';

type SortKey = 'default' | 'name' | 'recent';
const RECENT_KEY = 'radio_recent';
const FAV_KEY = 'radio_favorites';
const SORT_KEY = 'radio_sort';

const getStored = (key: string): number[] => {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
};
const pushRecent = (id: number) => {
  const cur = getStored(RECENT_KEY).filter(i => i !== id);
  cur.unshift(id);
  localStorage.setItem(RECENT_KEY, JSON.stringify(cur.slice(0, 12)));
};
const toggleFav = (id: number): number[] => {
  const cur = getStored(FAV_KEY);
  const next = cur.includes(id) ? cur.filter(i => i !== id) : [...cur, id];
  localStorage.setItem(FAV_KEY, JSON.stringify(next));
  return next;
};

const RadioPage: React.FC = () => {
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(() => (localStorage.getItem('radio-view') as any) || 'list');
  const [filter, setFilter] = useState<'all' | 'favorites' | 'recent'>('all');
  const [sortKey, setSortKey] = useState<SortKey>(() => (localStorage.getItem(SORT_KEY) as SortKey) || 'default');
  const [showSort, setShowSort] = useState(false);
  const [recent, setRecent] = useState<number[]>(() => getStored(RECENT_KEY));
  const [favs, setFavs] = useState<number[]>(() => getStored(FAV_KEY));
  const { play, pause, currentTrack, isPlaying } = useAudioPlayer();
  const { stats } = useAppStats();

  useEffect(() => { localStorage.setItem('radio-view', viewMode); }, [viewMode]);
  useEffect(() => { localStorage.setItem(SORT_KEY, sortKey); }, [sortKey]);

  useEffect(() => {
    fetchRadioStations().then((data) => { setStations(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = [...stations];
    if (filter === 'favorites') list = list.filter(s => favs.includes(s.id));
    else if (filter === 'recent') list = list.filter(s => recent.includes(s.id));
    if (search.trim()) list = list.filter(s => s.name.includes(search.trim()));
    if (sortKey === 'name') list.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
    else if (sortKey === 'recent') list.sort((a, b) => recent.indexOf(a.id) - recent.indexOf(b.id));
    return list;
  }, [stations, search, filter, favs, recent, sortKey]);

  const handlePlay = (station: RadioStation) => {
    const trackId = `radio-${station.id}`;
    if (currentTrack?.id === trackId && isPlaying) { pause(); return; }
    play({ id: trackId, title: station.name, reciter: 'بث مباشر', url: station.url });
    pushRecent(station.id);
    setRecent(getStored(RECENT_KEY));
  };

  const handleFav = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavs(toggleFav(id));
  };

  const sortLabels: Record<SortKey, string> = {
    'default': 'الافتراضي', 'name': 'الاسم (أ-ي)', 'recent': 'مؤخراً',
  };

  return (
    <div className="page-container page-with-topbar" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <PageHeader
          icon={Radio}
          title="الراديو والبث المباشر"
          subtitle={loading ? 'جاري التحميل...' : `${filtered.length} من ${stations.length} محطة`}
        />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="stat-card text-right">
            <div className="stat-card-icon bg-primary/10"><Radio className="w-4 h-4 text-primary" /></div>
            <div className="stat-card-value">{stations.length}</div>
            <div className="stat-card-label">محطة</div>
          </div>
          <div className="stat-card text-right">
            <div className="stat-card-icon bg-gold-light"><Signal className="w-4 h-4 text-gold-deep" /></div>
            <div className="stat-card-value text-base">{formatListenTime(stats.radioListenSeconds)}</div>
            <div className="stat-card-label">وقت الاستماع</div>
          </div>
          <div className="stat-card text-right">
            <div className="stat-card-icon bg-emerald-light"><Heart className="w-4 h-4 text-primary" /></div>
            <div className="stat-card-value">{favs.length}</div>
            <div className="stat-card-label">المفضلة</div>
          </div>
        </div>

        {/* Search + sort */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن محطة..." className="search-input" />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1 p-1 bg-secondary rounded-2xl">
            <button onClick={() => setViewMode('grid')} className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}><Grid3X3 className="w-4 h-4" /></button>
            <button onClick={() => setViewMode('list')} className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}><List className="w-4 h-4" /></button>
          </div>
          <div className="relative">
            <button onClick={() => setShowSort(!showSort)}
              className="h-12 px-3 rounded-2xl bg-card border border-border flex items-center gap-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors">
              <Filter className="w-3.5 h-3.5 text-primary" />
              <ChevronDown className={`w-3 h-3 transition-transform ${showSort ? 'rotate-180' : ''}`} />
            </button>
            {showSort && (
              <div className="absolute left-0 top-full mt-2 w-44 bg-card border border-border rounded-2xl shadow-lg p-1.5 z-20 animate-fade-in">
                {(Object.keys(sortLabels) as SortKey[]).map(key => (
                  <button key={key} onClick={() => { setSortKey(key); setShowSort(false); }}
                    className={`w-full text-right px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${sortKey === key ? 'bg-primary/10 text-primary' : 'hover:bg-secondary text-foreground'}`}>
                    {key === 'name' ? <ArrowDownAZ className="w-3.5 h-3.5" /> : key === 'recent' ? <History className="w-3.5 h-3.5" /> : <Filter className="w-3.5 h-3.5" />}
                    {sortLabels[key]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
          {[
            { k: 'all' as const, l: 'الكل', c: stations.length },
            { k: 'favorites' as const, l: 'المفضلة', c: favs.length },
            { k: 'recent' as const, l: 'مؤخراً', c: recent.length },
          ].map(f => (
            <button key={f.k} onClick={() => setFilter(f.k)}
              className={`filter-chip flex-shrink-0 ${filter === f.k ? 'active' : ''}`}>
              {f.l} <span className="opacity-70 text-[10px] mr-1">({f.c})</span>
            </button>
          ))}
        </div>

        {/* Now playing banner */}
        {currentTrack && currentTrack.id.startsWith('radio-') && (
          <div className="card-luxury mb-4 flex items-center gap-3 islamic-pattern">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0 relative shadow-emerald">
              <Signal className="w-5 h-5 text-primary-foreground" />
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-destructive rounded-full live-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate font-kufi">{currentTrack.title}</p>
              <p className="text-xs text-primary font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-destructive live-pulse" /> بث مباشر
              </p>
            </div>
            <div className="flex gap-0.5 items-end h-6">
              {[60, 100, 40, 80, 50].map((h, i) => (
                <div key={i} className="w-1 bg-primary rounded-full animate-pulse" style={{ height: `${h}%`, animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <SkeletonGrid count={8} variant={viewMode === 'grid' ? 'tile' : 'list'} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={Radio} title="لا توجد محطات" description="جرّب تغيير البحث أو الفلتر" />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-2.5">
            {filtered.map((station) => {
              const trackId = `radio-${station.id}`;
              const isThisPlaying = currentTrack?.id === trackId && isPlaying;
              const isFav = favs.includes(station.id);
              return (
                <div key={station.id} className={`card-surface-hover relative ${isThisPlaying ? 'border-primary/30' : ''}`}>
                  <button onClick={(e) => handleFav(station.id, e)}
                    className={`fav-btn absolute top-2 left-2 w-7 h-7 ${isFav ? 'active' : ''}`}>
                    <Heart className="w-3.5 h-3.5" fill={isFav ? 'currentColor' : 'none'} />
                  </button>
                  <button onClick={() => handlePlay(station)} className="w-full flex flex-col items-center py-4 gap-2">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center relative ${isThisPlaying ? 'shadow-emerald' : ''}`}
                      style={{ background: isThisPlaying ? 'var(--grad-primary)' : 'hsl(var(--primary) / 0.1)' }}>
                      {isThisPlaying ? <Pause className="w-6 h-6 text-primary-foreground" /> : <Play className="w-6 h-6 text-primary ml-0.5" />}
                      {isThisPlaying && <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-destructive rounded-full live-pulse" />}
                    </div>
                    <span className="text-xs font-bold text-foreground text-center line-clamp-2 font-kufi">{station.name}</span>
                    {isThisPlaying ? (
                      <span className="text-[10px] text-primary font-semibold">يعمل الآن</span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">بث مباشر</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((station, index) => {
              const trackId = `radio-${station.id}`;
              const isThisPlaying = currentTrack?.id === trackId && isPlaying;
              const isFav = favs.includes(station.id);
              return (
                <div key={station.id} className={`card-surface flex items-center gap-3 transition-all duration-200 ${isThisPlaying ? 'border-primary/30 bg-primary/[0.03]' : ''}`}>
                  <button onClick={() => handlePlay(station)}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${isThisPlaying ? 'shadow-emerald' : ''}`}
                    style={{ background: isThisPlaying ? 'var(--grad-primary)' : 'hsl(var(--primary) / 0.1)' }}>
                    {isThisPlaying ? <Pause className="w-4 h-4 text-primary-foreground" /> : <Play className="w-4 h-4 text-primary ml-0.5" />}
                  </button>
                  <button onClick={() => handlePlay(station)} className="flex-1 text-right min-w-0">
                    <div className="font-bold text-foreground text-sm font-kufi truncate">{station.name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      {isThisPlaying ? (
                        <><span className="w-1.5 h-1.5 rounded-full bg-destructive live-pulse" /><span className="text-primary font-semibold">يعمل الآن</span></>
                      ) : (
                        <span>محطة #{index + 1}</span>
                      )}
                    </div>
                  </button>
                  {isThisPlaying && (
                    <div className="flex gap-0.5 items-end h-4">
                      <div className="w-1 bg-primary rounded-full animate-pulse" style={{ height: '60%' }} />
                      <div className="w-1 bg-primary rounded-full animate-pulse" style={{ height: '100%', animationDelay: '0.2s' }} />
                      <div className="w-1 bg-primary rounded-full animate-pulse" style={{ height: '40%', animationDelay: '0.4s' }} />
                    </div>
                  )}
                  <button onClick={(e) => handleFav(station.id, e)}
                    className={`fav-btn flex-shrink-0 ${isFav ? 'active' : ''}`}>
                    <Heart className="w-4 h-4" fill={isFav ? 'currentColor' : 'none'} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RadioPage;
