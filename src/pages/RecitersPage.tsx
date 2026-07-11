import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import SEO from '@/components/SEO';
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
import { getCached, setCached } from '@/lib/dataCache';
import appLogo from '@/assets/app-logo.png';

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


// Stable top-level SurahPicker — defining this inside RecitersPage caused
// React to remount the sheet on every parent render (e.g. when currentTrack
// changed after pressing play), producing the flicker / grid overlap the user
// reported. Keeping it outside guarantees a stable component identity.
interface SurahPickerProps {
  reciter: Reciter;
  surahs: Surah[];
  surahNums: number[];
  reciterImage: string;
  currentTrackId?: string;
  isPlaying: boolean;
  hasActiveTrack: boolean;
  onPlay: (num: number) => void;
  onPlayAll: () => void;
  onClose: () => void;
}

const SurahPicker: React.FC<SurahPickerProps> = ({
  reciter, surahs, surahNums, reciterImage,
  currentTrackId, isPlaying, hasActiveTrack,
  onPlay, onPlayAll, onClose,
}) => {
  // Always reserve MiniPlayer space so the sheet never jumps when playback starts/stops.
  // Using a stable offset prevents the ayah list from being covered or reflowed on state change.
  void hasActiveTrack;
  const bottomOffset = 'calc(var(--nav-height) + var(--player-height) + env(safe-area-inset-bottom, 0px) + 0.5rem)';
  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`سور القارئ ${reciter.name}`}
        dir="rtl"
        className="fixed left-0 right-0 z-[72] bg-card rounded-t-3xl border-t border-border shadow-2xl flex flex-col overflow-hidden animate-[sheet-up_0.32s_cubic-bezier(0.32,0.72,0,1)]"
        style={{
          bottom: bottomOffset,
          top: 'max(15vh, 4rem)',
          maxWidth: '640px',
          margin: '0 auto',
        }}
      >
        <div className="sheet-handle flex-shrink-0" />
        <div className="flex items-center justify-between px-5 py-3 border-b border-border/50 flex-shrink-0 bg-card">
          <div className="flex items-center gap-3 min-w-0">
            <img src={reciterImage} alt={reciter.name} loading="lazy" className="app-logo-img w-12 h-12 rounded-2xl flex-shrink-0" />
            <div className="min-w-0">
              <h3 className="text-base font-bold text-foreground font-kufi truncate">{reciter.name}</h3>
              <p className="text-xs text-muted-foreground">{surahNums.length} سورة متاحة</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onPlayAll}
              className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-emerald"
              style={{ background: 'var(--grad-primary)', color: 'hsl(var(--primary-foreground))' }}
            >
              <Play className="w-3.5 h-3.5" /> تشغيل الكل
            </button>
            <button onClick={onClose} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center" aria-label="إغلاق">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-3" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)' }}>
          {surahNums.length === 0 ? (
            <div className="text-center py-10 text-sm text-muted-foreground">لا توجد سور متاحة لهذا القارئ</div>
          ) : (
            <div
              className="grid gap-1.5"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))' }}
            >
              {surahNums.map((num) => {
                const s = surahs.find((su) => su.number === num);
                const trackId = `${reciter.id}-${num}`;
                const isThisPlaying = currentTrackId === trackId && isPlaying;
                return (
                  <button
                    key={num}
                    onClick={() => onPlay(num)}
                    className={`group relative flex flex-col items-center justify-center gap-1 py-2 px-1.5 rounded-xl border transition-all text-center overflow-hidden ${
                      isThisPlaying
                        ? 'bg-primary/10 border-primary/40 shadow-[0_4px_14px_-6px_hsl(var(--primary)/0.5)]'
                        : 'bg-card border-border/50 hover:border-primary/30 hover:bg-secondary/60 active:scale-[0.97]'
                    }`}
                    aria-label={`${s?.name || `سورة ${num}`} - ${isThisPlaying ? 'إيقاف' : 'تشغيل'}`}
                  >
                    {/* Small corner number badge */}
                    <span
                      className={`absolute top-1 right-1 text-[9px] font-bold leading-none px-1.5 py-0.5 rounded-md ${
                        isThisPlaying
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground group-hover:bg-primary/15 group-hover:text-primary'
                      }`}
                    >
                      {num}
                    </span>
                    {/* Play indicator */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        isThisPlaying
                          ? 'bg-primary text-primary-foreground shadow-md'
                          : 'bg-primary/10 text-primary group-hover:bg-primary/20 group-hover:scale-110'
                      }`}
                    >
                      {isThisPlaying ? <Pause className="w-3 h-3" fill="currentColor" /> : <Play className="w-3 h-3 ml-0.5" fill="currentColor" />}
                    </div>
                    <div
                      className={`text-[11px] font-bold leading-tight line-clamp-1 font-kufi mt-0.5 w-full ${
                        isThisPlaying ? 'text-primary' : 'text-foreground'
                      }`}
                    >
                      {s?.name?.replace(/^سُورَةُ\s*/, '') || `سورة ${num}`}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const RecitersPage: React.FC = () => {

  const cachedReciters = getCached<Reciter[]>('reciters');
  const cachedSurahs = getCached<Surah[]>('surahs');
  const [reciters, setReciters] = useState<Reciter[]>(cachedReciters ?? []);
  const [surahs, setSurahs] = useState<Surah[]>(cachedSurahs ?? []);
  const [search, setSearch] = useState('');
  const [expandedReciter, setExpandedReciter] = useState<number | null>(null);
  const [loading, setLoading] = useState(!(cachedReciters && cachedSurahs));
  const [filter, setFilter] = useState<'all' | 'favorites' | 'recent'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(() => (localStorage.getItem('reciters-view') as any) || 'list');
  const [sortKey, setSortKey] = useState<SortKey>(() => (localStorage.getItem(SORT_KEY) as SortKey) || 'default');
  const [showSort, setShowSort] = useState(false);
  const [recent, setRecent] = useState<number[]>(getRecent);
  const { play, pause, currentTrack, isPlaying } = useAudioPlayer();
  const { toggleReciter, isReciterFav, favorites } = useFavorites();

  // ---- Scroll position persistence ----
  const SCROLL_KEY = 'reciters_scroll_y';
  const savedScrollRef = useRef<number>(0);

  // Restore scroll on mount (once data is available)
  useEffect(() => {
    if (loading) return;
    const raw = sessionStorage.getItem(SCROLL_KEY);
    const y = raw ? parseInt(raw, 10) : NaN;
    if (!Number.isNaN(y) && y > 0) {
      // Two rAFs so images/layout settle first
      requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, y)));
    }
  }, [loading]);

  // Persist scroll continuously (throttled)
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        savedScrollRef.current = window.scrollY;
        sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
        raf = 0;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Wraps an action so scroll position is restored after React re-renders
  const preserveScroll = useCallback(<A extends any[]>(fn: (...args: A) => void) => {
    return (...args: A) => {
      const y = window.scrollY;
      savedScrollRef.current = y;
      fn(...args);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (Math.abs(window.scrollY - y) > 2) window.scrollTo(0, y);
      }));
    };
  }, []);

  useEffect(() => { localStorage.setItem('reciters-view', viewMode); }, [viewMode]);
  useEffect(() => { localStorage.setItem(SORT_KEY, sortKey); }, [sortKey]);

  useEffect(() => {
    Promise.all([fetchReciters(), fetchSurahs()]).then(([r, s]) => { setCached('reciters', r); setCached('surahs', s); setReciters(r); setSurahs(s); setLoading(false); });
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

  const handlePlay = preserveScroll((reciter: Reciter, surahNum: number) => {
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
  });

  const handlePlayAll = preserveScroll((reciter: Reciter) => {
    const queue = buildQueue(reciter);
    if (queue.length === 0) return;
    play(queue[0], queue);
    pushRecent(reciter.id);
    setRecent(getRecent());
  });

  const closeExpanded = preserveScroll(() => setExpandedReciter(null));

  const getReciterImage = (_r: Reciter) => appLogo;

  const sortLabels: Record<SortKey, string> = {
    'default': 'الافتراضي',
    'name': 'الاسم (أ-ي)',
    'most-surahs': 'الأكثر سوراً',
    'recent': 'المستمع إليه مؤخراً',
  };

  return (

    <div className="page-container page-with-topbar" dir="rtl">
      <div className="page-inner">
        <PageHeader
          icon={Mic}
          title="القراء"
          subtitle={loading ? 'جاري التحميل...' : `${filtered.length} من ${reciters.length} قارئ`}
          badge={
            currentTrack ? (
              <span className="badge-tone badge-tone-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-primary live-pulse inline-block" />
                يعمل الآن
              </span>
            ) : undefined
          }
        />

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2 mb-4 stagger-children">
          <div className="stat-card text-right">
            <div className="icon-tile !w-9 !h-9 !rounded-xl mb-2"><Mic className="w-4 h-4" /></div>
            <div className="stat-card-value">{reciters.length}</div>
            <div className="stat-card-label">قارئ</div>
          </div>
          <div className="stat-card text-right">
            <div className="icon-tile icon-tile-gold !w-9 !h-9 !rounded-xl mb-2"><Heart className="w-4 h-4" /></div>
            <div className="stat-card-value">{favorites.reciters.length}</div>
            <div className="stat-card-label">المفضلون</div>
          </div>
          <div className="stat-card text-right">
            <div className="icon-tile icon-tile-emerald !w-9 !h-9 !rounded-xl mb-2"><History className="w-4 h-4" /></div>
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
          if (!reciter) return null;
          const surahNums = getSurahNums(reciter);
          return (
            <SurahPicker
              reciter={reciter}
              surahs={surahs}
              surahNums={surahNums}
              reciterImage={getReciterImage(reciter)}
              currentTrackId={currentTrack?.id}
              isPlaying={isPlaying}
              hasActiveTrack={!!currentTrack}
              onPlay={(num) => handlePlay(reciter, num)}
              onPlayAll={() => handlePlayAll(reciter)}
              onClose={closeExpanded}
            />
          );
        })()}


        {loading ? (
          <SkeletonGrid count={8} variant={viewMode === 'grid' ? 'tile' : 'list'} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={Mic} title="لا يوجد قراء" description="لا توجد نتائج مطابقة" />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-2.5 stagger-children">
            {filtered.map((reciter) => {
              const isReciterPlaying = currentTrack?.reciter === reciter.name && isPlaying;
              const surahNums = getSurahNums(reciter);
              return (
                <div key={reciter.id} className={`action-tile !items-center !text-center press ${isReciterPlaying ? '!border-primary/40' : ''}`}>
                  <button onClick={(e) => { e.stopPropagation(); toggleReciter(reciter.id); }}
                    className={`fav-btn absolute top-2 left-2 w-7 h-7 z-10 ${isReciterFav(reciter.id) ? 'active' : ''}`}
                    aria-label="مفضلة">
                    <Heart className="w-3.5 h-3.5" fill={isReciterFav(reciter.id) ? 'currentColor' : 'none'} />
                  </button>
                  <button onClick={() => setExpandedReciter(reciter.id)} className="w-full flex flex-col items-center gap-1.5">
                    <div className="relative">
                      <div
                        className="absolute -inset-1 rounded-2xl blur-md opacity-60"
                        style={{ background: isReciterPlaying ? 'hsl(var(--primary) / 0.45)' : 'transparent' }}
                      />
                      <img src={getReciterImage(reciter)} alt={reciter.name} loading="lazy"
                        className={`app-logo-img relative w-16 h-16 rounded-2xl border-2 transition-all ${isReciterPlaying ? 'border-primary shadow-emerald' : 'border-border'}`} />
                      {isReciterPlaying && (
                        <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-md">
                          <Volume2 className="w-3 h-3 text-primary-foreground live-pulse" />
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-foreground text-center line-clamp-2 font-kufi">{reciter.name}</span>
                    <span className="badge-tone badge-tone-primary !text-[10px] !py-0">{surahNums.length} سورة</span>
                  </button>
                  <button onClick={() => handlePlayAll(reciter)}
                    className="absolute bottom-2 left-2 w-7 h-7 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                    aria-label="تشغيل الكل">
                    <ListPlus className="w-3.5 h-3.5 text-primary" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2.5 stagger-children">
            {filtered.map((reciter, idx) => {
              const isExpanded = expandedReciter === reciter.id;
              const surahNums = getSurahNums(reciter);
              const isReciterPlaying = currentTrack?.reciter === reciter.name && isPlaying;
              const isFav = isReciterFav(reciter.id);
              return (
                <div
                  key={reciter.id}
                  className={`relative overflow-hidden rounded-2xl border transition-all duration-300 group ${
                    isReciterPlaying
                      ? 'border-primary/50 shadow-[0_10px_30px_-12px_hsl(var(--primary)/0.45)]'
                      : 'border-border/60 hover:border-primary/30 hover:shadow-lg'
                  }`}
                  style={{
                    background:
                      'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--card)) 60%, hsl(var(--primary) / 0.04) 100%)',
                  }}
                >
                  {/* Elegant gradient accent bar */}
                  <div
                    className="absolute top-0 bottom-0 right-0 w-[3px] pointer-events-none"
                    style={{
                      background: isReciterPlaying
                        ? 'linear-gradient(180deg, hsl(var(--primary)), hsl(var(--accent)))'
                        : 'linear-gradient(180deg, hsl(var(--primary) / 0.35), hsl(var(--accent) / 0.25))',
                    }}
                  />
                  {/* Playing shimmer */}
                  {isReciterPlaying && (
                    <div
                      className="absolute inset-0 opacity-40 pointer-events-none"
                      style={{
                        background:
                          'radial-gradient(circle at 100% 50%, hsl(var(--primary) / 0.18), transparent 60%)',
                      }}
                    />
                  )}

                  <div className="relative flex items-center gap-3 p-3">
                    {/* Rank badge */}
                    <div className="hidden sm:flex flex-shrink-0 w-7 h-7 rounded-lg items-center justify-center text-[11px] font-bold text-muted-foreground bg-muted/40">
                      {idx + 1}
                    </div>

                    {/* Avatar */}
                    <button
                      onClick={() => setExpandedReciter(isExpanded ? null : reciter.id)}
                      className="relative flex-shrink-0"
                      aria-label={`فتح سور ${reciter.name}`}
                    >
                      <div
                        className={`absolute -inset-0.5 rounded-2xl blur-md transition-opacity ${
                          isReciterPlaying ? 'opacity-70' : 'opacity-0 group-hover:opacity-40'
                        }`}
                        style={{ background: 'hsl(var(--primary) / 0.45)' }}
                      />
                      <img
                        src={getReciterImage(reciter)}
                        alt={reciter.name}
                        loading="lazy"
                        className={`app-logo-img relative w-14 h-14 rounded-2xl border-2 transition-transform group-hover:scale-105 ${
                          isReciterPlaying ? 'border-primary' : 'border-border'
                        }`}
                      />
                      {isReciterPlaying && (
                        <span className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-md">
                          <Volume2 className="w-3 h-3 text-primary-foreground live-pulse" />
                        </span>
                      )}
                    </button>

                    {/* Info */}
                    <button
                      onClick={() => setExpandedReciter(isExpanded ? null : reciter.id)}
                      className="flex-1 text-right min-w-0"
                    >
                      <div className="font-bold text-foreground text-[15px] font-kufi truncate leading-tight">
                        {reciter.name}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5">
                          <Hash className="w-2.5 h-2.5" />
                          {surahNums.length} سورة
                        </span>
                        {isFav && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-full px-2 py-0.5">
                            <Heart className="w-2.5 h-2.5" fill="currentColor" />
                            مفضل
                          </span>
                        )}
                        {isReciterPlaying && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary live-pulse" />
                            يعمل الآن
                          </span>
                        )}
                      </div>
                    </button>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => toggleReciter(reciter.id)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                          isFav
                            ? 'bg-rose-500/15 text-rose-500 hover:bg-rose-500/25'
                            : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                        }`}
                        aria-label={isFav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                      >
                        <Heart className="w-4 h-4" fill={isFav ? 'currentColor' : 'none'} />
                      </button>
                      <button
                        onClick={() => setExpandedReciter(isExpanded ? null : reciter.id)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center bg-muted/50 text-muted-foreground hover:bg-muted transition-all"
                        aria-label={isExpanded ? 'إغلاق' : 'عرض السور'}
                        aria-expanded={isExpanded}
                      >
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                      <button
                        onClick={() => handlePlayAll(reciter)}
                        className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-emerald hover:scale-105 active:scale-95 transition-transform"
                        style={{ background: 'var(--grad-primary)' }}
                        title="تشغيل الكل"
                        aria-label="تشغيل الكل"
                      >
                        <Play className="w-4 h-4 text-primary-foreground ml-0.5" fill="currentColor" />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="relative border-t border-border/60 bg-muted/20 px-3 py-3 animate-fade-in">
                      <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto overscroll-contain pr-1">
                        {surahNums.map((num) => {
                          const s = surahs.find((su) => su.number === num);
                          const trackId = `${reciter.id}-${num}`;
                          const isThisPlaying = currentTrack?.id === trackId && isPlaying;
                          return (
                            <button
                              key={num}
                              onClick={() => handlePlay(reciter, num)}
                              className={`flex items-center gap-2 p-2.5 rounded-xl transition-all text-right ${
                                isThisPlaying
                                  ? 'bg-primary/10 border border-primary/30 shadow-sm'
                                  : 'bg-card hover:bg-secondary border border-border/40'
                              }`}
                            >
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isThisPlaying ? 'bg-primary' : 'bg-primary/10'}`}>
                                {isThisPlaying ? <Pause className="w-3 h-3 text-primary-foreground" /> : <Play className="w-3 h-3 text-primary ml-0.5" />}
                              </div>
                              <div className="flex-1 min-w-0 text-right">
                                <div className={`text-xs truncate ${isThisPlaying ? 'text-primary font-semibold' : 'text-foreground'} font-kufi`}>{s?.name || `سورة ${num}`}</div>
                                <div className="text-[9px] text-muted-foreground">رقم {num}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
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
