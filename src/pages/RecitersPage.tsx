import React, { useEffect, useState, useMemo } from 'react';
import { fetchReciters, fetchSurahs, type Reciter, type Surah } from '@/lib/api';
import { useAudioPlayer, type AudioTrack } from '@/contexts/AudioContext';
import { useFavorites } from '@/hooks/useFavorites';
import {
  Play, Pause, Mic, Volume2, Heart, X, ListPlus, ArrowDownAZ, Clock,
  Hash, ChevronDown, Filter, History,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import SearchFilterBar from '@/components/SearchFilterBar';
import SkeletonGrid from '@/components/SkeletonGrid';
import EmptyState from '@/components/EmptyState';

type SortKey = 'default' | 'name' | 'most-surahs' | 'recent';
const RECENT_KEY = 'reciters_recent';
const SORT_KEY = 'reciters_sort';

const getRecent = (): number[] => {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
};
const pushRecent = (id: number) => {
  const cur = getRecent().filter(i => i !== id);
  cur.unshift(id);
  localStorage.setItem(RECENT_KEY, JSON.stringify(cur.slice(0, 12)));
};

const RecitersPage: React.FC = () => {
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [search, setSearch] = useState('');
  const [expandedReciter, setExpandedReciter] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'favorites' | 'recent'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(() => (localStorage.getItem('reciters-view') as any) || 'list');
  const [sortKey, setSortKey] = useState<SortKey>(() => (localStorage.getItem(SORT_KEY) as SortKey) || 'default');
  const [showSort, setShowSort] = useState(false);
  const [recent, setRecent] = useState<number[]>(getRecent);
  const { play, pause, currentTrack, isPlaying } = useAudioPlayer();
  const { toggleReciter, isReciterFav, favorites } = useFavorites();

  useEffect(() => { localStorage.setItem('reciters-view', viewMode); }, [viewMode]);
  useEffect(() => { localStorage.setItem(SORT_KEY, sortKey); }, [sortKey]);

  useEffect(() => {
    Promise.all([fetchReciters(), fetchSurahs()]).then(([r, s]) => { setReciters(r); setSurahs(s); setLoading(false); });
  }, []);

  const getSurahNums = (r: Reciter): number[] => {
    const m = r.moshaf?.[0];
    return m ? m.surah_list.split(',').map(Number).filter(Boolean) : [];
  };

  const filtered = useMemo(() => {
    let list = [...reciters];
    if (filter === 'favorites') list = list.filter((r) => favorites.reciters.includes(r.id));
    else if (filter === 'recent') list = list.filter((r) => recent.includes(r.id));
    if (search.trim()) {
      const q = search.trim();
      list = list.filter((r) => r.name.includes(q));
    }
    if (sortKey === 'name') list.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
    else if (sortKey === 'most-surahs') list.sort((a, b) => getSurahNums(b).length - getSurahNums(a).length);
    else if (sortKey === 'recent') list.sort((a, b) => recent.indexOf(a.id) - recent.indexOf(b.id));
    if (filter === 'all' && !search.trim() && sortKey === 'default') list = list.slice(0, 60);
    return list;
  }, [reciters, search, filter, favorites.reciters, sortKey, recent]);

  const counts = {
    all: reciters.length,
    favorites: favorites.reciters.length,
    recent: recent.length,
  };

  const buildQueue = (reciter: Reciter): AudioTrack[] => {
    const moshaf = reciter.moshaf?.[0];
    if (!moshaf) return [];
    return getSurahNums(reciter).map((num) => {
      const s = surahs.find((su) => su.number === num);
      return {
        id: `${reciter.id}-${num}`,
        title: s?.name || `سورة ${num}`,
        reciter: reciter.name,
        url: `${moshaf.server}${String(num).padStart(3, '0')}.mp3`,
      };
    });
  };

  const handlePlay = (reciter: Reciter, surahNum: number) => {
    const queue = buildQueue(reciter);
    const track = queue.find(t => t.id === `${reciter.id}-${surahNum}`);
    if (!track) return;
    const trackId = track.id;
    if (currentTrack?.id === trackId && isPlaying) {
      pause();
      return;
    }
    play(track, queue);
    pushRecent(reciter.id);
    setRecent(getRecent());
  };

  const handlePlayAll = (reciter: Reciter) => {
    const queue = buildQueue(reciter);
    if (queue.length === 0) return;
    play(queue[0], queue);
    pushRecent(reciter.id);
    setRecent(getRecent());
  };

  const getReciterImage = (r: Reciter) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(r.name)}&background=0d3b2e&color=fff&size=128&font-size=0.4&bold=true`;

  const sortLabels: Record<SortKey, string> = {
    'default': 'الافتراضي',
    'name': 'الاسم (أ-ي)',
    'most-surahs': 'الأكثر سوراً',
    'recent': 'المستمع إليه مؤخراً',
  };

  const SurahPicker = ({ reciter, onClose }: { reciter: Reciter; onClose: () => void }) => {
    const surahNums = getSurahNums(reciter);
    return (
      <>
        <div className="sheet-overlay" onClick={onClose} />
        <div className="sheet-content" dir="rtl">
          <div className="sheet-handle" />
          <div className="px-5 pb-6 pt-2 max-h-[75vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <img src={getReciterImage(reciter)} alt={reciter.name} className="w-12 h-12 rounded-2xl" />
                <div>
                  <h3 className="text-base font-bold text-foreground font-kufi">{reciter.name}</h3>
                  <p className="text-xs text-muted-foreground">{surahNums.length} سورة متاحة</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handlePlayAll(reciter)}
                  className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-emerald"
                  style={{ background: 'var(--grad-primary)', color: 'hsl(var(--primary-foreground))' }}>
                  <Play className="w-3.5 h-3.5" /> تشغيل الكل
                </button>
                <button onClick={onClose} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {surahNums.map((num) => {
                const s = surahs.find((su) => su.number === num);
                const trackId = `${reciter.id}-${num}`;
                const isThisPlaying = currentTrack?.id === trackId && isPlaying;
                return (
                  <button key={num} onClick={() => handlePlay(reciter, num)}
                    className={`flex items-center gap-2 p-3 rounded-xl transition-all text-right ${isThisPlaying ? 'bg-primary/10 border border-primary/25 shadow-sm' : 'bg-secondary/50 hover:bg-secondary border border-transparent'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isThisPlaying ? 'bg-primary' : 'bg-primary/10'}`}>
                      {isThisPlaying ? <Pause className="w-3.5 h-3.5 text-primary-foreground" /> : <Play className="w-3.5 h-3.5 text-primary ml-0.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs truncate font-semibold ${isThisPlaying ? 'text-primary' : 'text-foreground'} font-kufi`}>{s?.name || `سورة ${num}`}</div>
                      <div className="text-[10px] text-muted-foreground">رقم {num}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="page-container page-with-topbar" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <PageHeader
          icon={Mic}
          title="القراء"
          subtitle={loading ? 'جاري التحميل...' : `${filtered.length} من ${reciters.length} قارئ`}
        />

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="stat-card text-right">
            <div className="stat-card-icon bg-primary/10"><Mic className="w-4 h-4 text-primary" /></div>
            <div className="stat-card-value">{reciters.length}</div>
            <div className="stat-card-label">قارئ</div>
          </div>
          <div className="stat-card text-right">
            <div className="stat-card-icon bg-gold-light"><Heart className="w-4 h-4 text-gold-deep" /></div>
            <div className="stat-card-value">{favorites.reciters.length}</div>
            <div className="stat-card-label">المفضلون</div>
          </div>
          <div className="stat-card text-right">
            <div className="stat-card-icon bg-emerald-light"><History className="w-4 h-4 text-primary" /></div>
            <div className="stat-card-value">{recent.length}</div>
            <div className="stat-card-label">مستمع مؤخراً</div>
          </div>
        </div>

        <SearchFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="ابحث عن قارئ..."
          filters={[
            { key: 'all', label: 'الكل', count: counts.all },
            { key: 'favorites', label: 'المفضلة', count: counts.favorites },
            { key: 'recent', label: 'مؤخراً', count: counts.recent },
          ]}
          activeFilter={filter}
          onFilterChange={(k) => setFilter(k as any)}
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
                <div className="absolute left-0 top-full mt-2 w-52 bg-card border border-border rounded-2xl shadow-lg p-1.5 z-20 animate-fade-in">
                  {(Object.keys(sortLabels) as SortKey[]).map(key => (
                    <button key={key} onClick={() => { setSortKey(key); setShowSort(false); }}
                      className={`w-full text-right px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${sortKey === key ? 'bg-primary/10 text-primary' : 'hover:bg-secondary text-foreground'}`}>
                      {key === 'name' && <ArrowDownAZ className="w-3.5 h-3.5" />}
                      {key === 'most-surahs' && <Hash className="w-3.5 h-3.5" />}
                      {key === 'recent' && <Clock className="w-3.5 h-3.5" />}
                      {key === 'default' && <Filter className="w-3.5 h-3.5" />}
                      {sortLabels[key]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          }
        />

        {viewMode === 'grid' && expandedReciter !== null && (() => {
          const reciter = filtered.find(r => r.id === expandedReciter);
          return reciter ? <SurahPicker reciter={reciter} onClose={() => setExpandedReciter(null)} /> : null;
        })()}

        {loading ? (
          <SkeletonGrid count={8} variant={viewMode === 'grid' ? 'tile' : 'list'} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={Mic} title="لا يوجد قراء" description="لا توجد نتائج مطابقة" />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-2.5">
            {filtered.map((reciter) => {
              const isReciterPlaying = currentTrack?.reciter === reciter.name && isPlaying;
              const surahNums = getSurahNums(reciter);
              return (
                <div key={reciter.id} className={`card-surface-hover relative ${isReciterPlaying ? 'border-primary/30' : ''}`}>
                  <button onClick={(e) => { e.stopPropagation(); toggleReciter(reciter.id); }}
                    className={`fav-btn absolute top-2 left-2 w-7 h-7 ${isReciterFav(reciter.id) ? 'active' : ''}`}>
                    <Heart className="w-3.5 h-3.5" fill={isReciterFav(reciter.id) ? 'currentColor' : 'none'} />
                  </button>
                  <button onClick={() => setExpandedReciter(reciter.id)} className="w-full flex flex-col items-center py-3 gap-1.5">
                    <div className="relative">
                      <img src={getReciterImage(reciter)} alt={reciter.name}
                        className={`w-16 h-16 rounded-2xl border-2 transition-all ${isReciterPlaying ? 'border-primary shadow-emerald' : 'border-border'}`} />
                      {isReciterPlaying && (
                        <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-md">
                          <Volume2 className="w-3 h-3 text-primary-foreground" />
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-foreground text-center line-clamp-2 font-kufi">{reciter.name}</span>
                    <span className="stat-badge text-[9px] py-0.5 px-2">{surahNums.length} سورة</span>
                  </button>
                  <button onClick={() => handlePlayAll(reciter)}
                    className="absolute bottom-2 left-2 w-7 h-7 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                    title="تشغيل الكل">
                    <ListPlus className="w-3.5 h-3.5 text-primary" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((reciter) => {
              const isExpanded = expandedReciter === reciter.id;
              const surahNums = getSurahNums(reciter);
              const isReciterPlaying = currentTrack?.reciter === reciter.name && isPlaying;
              return (
                <div key={reciter.id} className={`card-surface transition-all duration-200 ${isReciterPlaying ? 'border-primary/30 bg-primary/[0.03]' : ''}`}>
                  <div className="flex items-center gap-3">
                    <img src={getReciterImage(reciter)} alt={reciter.name}
                      className={`w-12 h-12 rounded-2xl border-2 flex-shrink-0 ${isReciterPlaying ? 'border-primary' : 'border-border'}`} />
                    <button onClick={() => setExpandedReciter(isExpanded ? null : reciter.id)} className="flex-1 text-right min-w-0">
                      <div className="font-bold text-foreground text-sm font-kufi truncate">{reciter.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                        <span className="stat-badge text-[10px] py-0 px-1.5">{surahNums.length} سورة</span>
                        {isReciterPlaying && <span className="text-primary font-semibold">يعمل الآن</span>}
                      </div>
                    </button>
                    <button onClick={() => handlePlayAll(reciter)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center shadow-emerald flex-shrink-0"
                      style={{ background: 'var(--grad-primary)' }} title="تشغيل الكل">
                      <Play className="w-3.5 h-3.5 text-primary-foreground ml-0.5" />
                    </button>
                    <button onClick={() => toggleReciter(reciter.id)}
                      className={`fav-btn flex-shrink-0 ${isReciterFav(reciter.id) ? 'active' : ''}`}>
                      <Heart className="w-4 h-4" fill={isReciterFav(reciter.id) ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 gap-2 animate-fade-in max-h-72 overflow-y-auto">
                      {surahNums.map((num) => {
                        const s = surahs.find((su) => su.number === num);
                        const trackId = `${reciter.id}-${num}`;
                        const isThisPlaying = currentTrack?.id === trackId && isPlaying;
                        return (
                          <button key={num} onClick={() => handlePlay(reciter, num)}
                            className={`flex items-center gap-2 p-2.5 rounded-xl transition-all text-right ${isThisPlaying ? 'bg-primary/10 border border-primary/25' : 'bg-secondary/50 hover:bg-secondary border border-transparent'}`}>
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isThisPlaying ? 'bg-primary' : 'bg-primary/10'}`}>
                              {isThisPlaying ? <Pause className="w-3 h-3 text-primary-foreground" /> : <Play className="w-3 h-3 text-primary ml-0.5" />}
                            </div>
                            <span className={`text-xs truncate ${isThisPlaying ? 'text-primary font-semibold' : 'text-foreground'} font-kufi`}>{s?.name || `سورة ${num}`}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecitersPage;
