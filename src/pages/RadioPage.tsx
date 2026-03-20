import React, { useEffect, useState } from 'react';
import { fetchRadioStations, type RadioStation } from '@/lib/api';
import { useAudioPlayer } from '@/contexts/AudioContext';
import { Play, Pause, Radio, Signal, Search, Grid3X3, List } from 'lucide-react';

const RadioPage: React.FC = () => {
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(() => (localStorage.getItem('radio-view') as any) || 'list');
  const { play, pause, currentTrack, isPlaying } = useAudioPlayer();

  useEffect(() => { localStorage.setItem('radio-view', viewMode); }, [viewMode]);

  useEffect(() => {
    fetchRadioStations().then((data) => { setStations(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = search.trim() ? stations.filter((s) => s.name.includes(search)) : stations;

  const handlePlay = (station: RadioStation) => {
    const trackId = `radio-${station.id}`;
    if (currentTrack?.id === trackId && isPlaying) pause();
    else play({ id: trackId, title: station.name, reciter: 'بث مباشر', url: station.url });
  };

  return (
    <div className="page-container" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Radio className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">الراديو والبث المباشر</h1>
            <p className="text-xs text-muted-foreground">{stations.length > 0 ? `${stations.length} محطة` : 'جاري التحميل...'}</p>
          </div>
          <div className="flex gap-1">
            <button onClick={() => setViewMode('list')} className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}><List className="w-4 h-4" /></button>
            <button onClick={() => setViewMode('grid')} className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}><Grid3X3 className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="relative mb-4">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث عن محطة..." className="search-input pr-10" />
        </div>

        {currentTrack && currentTrack.id.startsWith('radio-') && (
          <div className="card-surface mb-4 flex items-center gap-3 bg-primary/5 border-primary/20">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0 relative">
              <Signal className="w-5 h-5 text-primary-foreground" />
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-destructive rounded-full live-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{currentTrack.title}</p>
              <p className="text-xs text-primary">يعمل الآن - بث مباشر</p>
            </div>
            <div className="flex gap-0.5 items-end h-5">
              {[60, 100, 40, 80, 50].map((h, i) => (
                <div key={i} className="w-1 bg-primary rounded-full animate-pulse" style={{ height: `${h}%`, animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-2' : 'space-y-2'}>
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className={`skeleton-pulse ${viewMode === 'grid' ? 'h-24' : 'h-16'} w-full`} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Radio className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm">لا توجد محطات متاحة حالياً</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-2">
            {filtered.map((station) => {
              const trackId = `radio-${station.id}`;
              const isThisPlaying = currentTrack?.id === trackId && isPlaying;
              return (
                <button key={station.id} onClick={() => handlePlay(station)}
                  className={`card-surface-hover flex flex-col items-center py-4 gap-2 ${isThisPlaying ? 'border-primary/30' : ''}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center relative ${isThisPlaying ? 'bg-primary' : 'bg-primary/10'}`}>
                    {isThisPlaying ? <Pause className="w-5 h-5 text-primary-foreground" /> : <Play className="w-5 h-5 text-primary ml-0.5" />}
                    {isThisPlaying && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-destructive rounded-full live-pulse" />}
                  </div>
                  <span className="text-xs font-semibold text-foreground text-center line-clamp-2">{station.name}</span>
                  {isThisPlaying && <span className="text-[10px] text-primary font-medium">يعمل الآن</span>}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((station, index) => {
              const trackId = `radio-${station.id}`;
              const isThisPlaying = currentTrack?.id === trackId && isPlaying;
              return (
                <button key={station.id} onClick={() => handlePlay(station)}
                  className={`card-surface w-full flex items-center gap-3 transition-all duration-200 ${isThisPlaying ? 'border-primary/30 bg-primary/[0.03]' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isThisPlaying ? 'bg-primary' : 'bg-primary/10'}`}>
                    {isThisPlaying ? <Pause className="w-4 h-4 text-primary-foreground" /> : <Play className="w-4 h-4 text-primary ml-0.5" />}
                  </div>
                  <div className="flex-1 text-right min-w-0">
                    <div className="font-semibold text-foreground text-sm truncate">{station.name}</div>
                    <div className="text-xs text-muted-foreground">{isThisPlaying ? 'يعمل الآن' : `محطة ${index + 1}`}</div>
                  </div>
                  {isThisPlaying && (
                    <div className="flex gap-0.5 items-end h-4">
                      <div className="w-1 bg-primary rounded-full animate-pulse" style={{ height: '60%' }} />
                      <div className="w-1 bg-primary rounded-full animate-pulse" style={{ height: '100%', animationDelay: '0.2s' }} />
                      <div className="w-1 bg-primary rounded-full animate-pulse" style={{ height: '40%', animationDelay: '0.4s' }} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RadioPage;
