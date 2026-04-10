import React, { useEffect, useState } from 'react';
import { fetchReciters, fetchSurahs, type Reciter, type Surah } from '@/lib/api';
import { useAudioPlayer } from '@/contexts/AudioContext';
import { useFavorites } from '@/hooks/useFavorites';
import { Play, Pause, Search, ChevronDown, ChevronUp, Mic, Volume2, Heart, Grid3X3, List, X } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

const RecitersPage: React.FC = () => {
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [search, setSearch] = useState('');
  const [expandedReciter, setExpandedReciter] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(() => (localStorage.getItem('reciters-view') as any) || 'list');
  const { play, pause, currentTrack, isPlaying } = useAudioPlayer();
  const { toggleReciter, isReciterFav, favorites } = useFavorites();

  useEffect(() => { localStorage.setItem('reciters-view', viewMode); }, [viewMode]);

  useEffect(() => {
    Promise.all([fetchReciters(), fetchSurahs()]).then(([r, s]) => { setReciters(r); setSurahs(s); setLoading(false); });
  }, []);

  let filtered = search.trim() ? reciters.filter((r) => r.name.includes(search)) : reciters.slice(0, 50);
  if (filter === 'favorites') filtered = filtered.filter((r) => favorites.reciters.includes(r.id));

  const handlePlay = (reciter: Reciter, surahNum: number) => {
    const moshaf = reciter.moshaf?.[0];
    if (!moshaf) return;
    const url = `${moshaf.server}${String(surahNum).padStart(3, '0')}.mp3`;
    const surah = surahs.find((s) => s.number === surahNum);
    const trackId = `${reciter.id}-${surahNum}`;
    if (currentTrack?.id === trackId && isPlaying) pause();
    else play({ id: trackId, title: surah?.name || `سورة ${surahNum}`, reciter: reciter.name, url });
  };

  const getReciterSurahs = (reciter: Reciter): number[] => {
    const moshaf = reciter.moshaf?.[0];
    return moshaf ? moshaf.surah_list.split(',').map(Number).filter(Boolean) : [];
  };

  const getReciterImage = (reciter: Reciter) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(reciter.name)}&background=0d9488&color=fff&size=128&font-size=0.4&bold=true`;
  };

  // Surah picker dialog for grid mode
  const SurahPicker = ({ reciter, onClose }: { reciter: Reciter; onClose: () => void }) => {
    const surahNums = getReciterSurahs(reciter);
    return (
      <>
        <div className="sheet-overlay" onClick={onClose} />
        <div className="sheet-content" dir="rtl">
          <div className="sheet-handle" />
          <div className="px-5 pb-6 pt-2 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <img src={getReciterImage(reciter)} alt={reciter.name} className="w-10 h-10 rounded-full" />
                <div>
                  <h3 className="text-base font-bold text-foreground">{reciter.name}</h3>
                  <p className="text-xs text-muted-foreground">{surahNums.length} سورة</p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {surahNums.map((num) => {
                const s = surahs.find((su) => su.number === num);
                const trackId = `${reciter.id}-${num}`;
                const isThisPlaying = currentTrack?.id === trackId && isPlaying;
                return (
                  <button key={num} onClick={() => handlePlay(reciter, num)}
                    className={`flex items-center gap-2 p-3 rounded-xl transition-colors text-right ${isThisPlaying ? 'bg-primary/10 border border-primary/20' : 'bg-secondary/50 hover:bg-secondary border border-transparent'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isThisPlaying ? 'bg-primary' : 'bg-primary/10'}`}>
                      {isThisPlaying ? <Pause className="w-3.5 h-3.5 text-primary-foreground" /> : <Play className="w-3.5 h-3.5 text-primary ml-0.5" />}
                    </div>
                    <span className={`text-xs truncate ${isThisPlaying ? 'text-primary font-semibold' : 'text-foreground'}`}>{s?.name || `سورة ${num}`}</span>
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
          subtitle={reciters.length > 0 ? `${reciters.length} قارئ` : 'جاري التحميل...'}
          actions={
            <div className="flex gap-1">
              <button onClick={() => setViewMode('list')} className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}><List className="w-4 h-4" /></button>
              <button onClick={() => setViewMode('grid')} className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}><Grid3X3 className="w-4 h-4" /></button>
            </div>
          }
        />

        <div className="relative mb-3">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث عن قارئ..." className="search-input pr-10" />
        </div>

        <div className="flex gap-2 mb-4">
          <button onClick={() => setFilter('all')} className={`filter-chip ${filter === 'all' ? 'active' : ''}`}>الكل</button>
          <button onClick={() => setFilter('favorites')} className={`filter-chip ${filter === 'favorites' ? 'active' : ''}`}>المفضلة</button>
        </div>

        {currentTrack && currentTrack.id.includes('-') && !currentTrack.id.startsWith('radio-') && (
          <div className="card-surface mb-4 flex items-center gap-3 bg-primary/5 border-primary/20">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <Volume2 className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{currentTrack.title}</p>
              <p className="text-xs text-muted-foreground truncate">{currentTrack.reciter}</p>
            </div>
            <div className="flex gap-0.5 items-end h-5">
              {[60, 100, 40, 80, 50].map((h, i) => (
                <div key={i} className="w-1 bg-primary rounded-full animate-pulse" style={{ height: `${h}%`, animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        {/* Grid Surah Picker */}
        {viewMode === 'grid' && expandedReciter !== null && (() => {
          const reciter = filtered.find(r => r.id === expandedReciter);
          return reciter ? <SurahPicker reciter={reciter} onClose={() => setExpandedReciter(null)} /> : null;
        })()}

        {loading ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-2' : 'space-y-2'}>
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className={`skeleton-pulse ${viewMode === 'grid' ? 'h-28' : 'h-16'} w-full`} />)}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-2">
            {filtered.map((reciter) => {
              const isReciterPlaying = currentTrack?.reciter === reciter.name && isPlaying;
              const surahNums = getReciterSurahs(reciter);
              return (
                <div key={reciter.id} className={`card-surface-hover relative ${isReciterPlaying ? 'border-primary/30' : ''}`}>
                  <button onClick={(e) => { e.stopPropagation(); toggleReciter(reciter.id); }} className={`fav-btn absolute top-2 left-2 w-6 h-6 ${isReciterFav(reciter.id) ? 'active' : ''}`}>
                    <Heart className="w-3 h-3" fill={isReciterFav(reciter.id) ? 'currentColor' : 'none'} />
                  </button>
                  <button onClick={() => setExpandedReciter(reciter.id)} className="w-full flex flex-col items-center py-3 gap-1.5">
                    <img src={getReciterImage(reciter)} alt={reciter.name} className={`w-14 h-14 rounded-full border-2 ${isReciterPlaying ? 'border-primary' : 'border-border'}`} />
                    <span className="text-xs font-semibold text-foreground text-center line-clamp-2">{reciter.name}</span>
                    <span className="text-[10px] text-muted-foreground">{surahNums.length} سورة</span>
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((reciter) => {
              const isExpanded = expandedReciter === reciter.id;
              const surahNums = getReciterSurahs(reciter);
              const isReciterPlaying = currentTrack?.reciter === reciter.name && isPlaying;
              return (
                <div key={reciter.id} className={`card-surface transition-all duration-200 ${isReciterPlaying ? 'border-primary/30 bg-primary/[0.03]' : ''}`}>
                  <button onClick={() => setExpandedReciter(isExpanded ? null : reciter.id)} className="w-full flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <img src={getReciterImage(reciter)} alt={reciter.name} className={`w-11 h-11 rounded-full border-2 ${isReciterPlaying ? 'border-primary' : 'border-border'}`} />
                      <div className="text-right">
                        <div className="font-semibold text-foreground text-sm">{reciter.name}</div>
                        <div className="text-xs text-muted-foreground">{surahNums.length} سورة</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => { e.stopPropagation(); toggleReciter(reciter.id); }} className={`fav-btn ${isReciterFav(reciter.id) ? 'active' : ''}`}>
                        <Heart className="w-4 h-4" fill={isReciterFav(reciter.id) ? 'currentColor' : 'none'} />
                      </button>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 gap-2 animate-fade-in max-h-64 overflow-y-auto">
                      {surahNums.map((num) => {
                        const s = surahs.find((su) => su.number === num);
                        const trackId = `${reciter.id}-${num}`;
                        const isThisPlaying = currentTrack?.id === trackId && isPlaying;
                        return (
                          <button key={num} onClick={() => handlePlay(reciter, num)}
                            className={`flex items-center gap-2 p-2.5 rounded-xl transition-colors text-right ${isThisPlaying ? 'bg-primary/10 border border-primary/20' : 'bg-secondary/50 hover:bg-secondary border border-transparent'}`}>
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${isThisPlaying ? 'bg-primary' : 'bg-primary/10'}`}>
                              {isThisPlaying ? <Pause className="w-3 h-3 text-primary-foreground" /> : <Play className="w-3 h-3 text-primary ml-0.5" />}
                            </div>
                            <span className={`text-xs truncate ${isThisPlaying ? 'text-primary font-semibold' : 'text-foreground'}`}>{s?.name || `سورة ${num}`}</span>
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
