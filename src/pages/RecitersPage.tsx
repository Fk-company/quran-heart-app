import React, { useEffect, useState } from 'react';
import { fetchReciters, fetchSurahs, type Reciter, type Surah } from '@/lib/api';
import { useAudioPlayer } from '@/contexts/AudioContext';
import { Play, Pause, Search, ChevronDown, ChevronUp } from 'lucide-react';

const RecitersPage: React.FC = () => {
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [search, setSearch] = useState('');
  const [expandedReciter, setExpandedReciter] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const { play, pause, currentTrack, isPlaying } = useAudioPlayer();

  useEffect(() => {
    Promise.all([fetchReciters(), fetchSurahs()]).then(([r, s]) => {
      setReciters(r);
      setSurahs(s);
      setLoading(false);
    });
  }, []);

  const filtered = search.trim()
    ? reciters.filter((r) => r.name.includes(search))
    : reciters.slice(0, 50);

  const handlePlay = (reciter: Reciter, surahNum: number) => {
    const moshaf = reciter.moshaf?.[0];
    if (!moshaf) return;
    const paddedNum = String(surahNum).padStart(3, '0');
    const url = `${moshaf.server}${paddedNum}.mp3`;
    const surah = surahs.find((s) => s.number === surahNum);

    const trackId = `${reciter.id}-${surahNum}`;
    if (currentTrack?.id === trackId && isPlaying) {
      pause();
    } else {
      play({
        id: trackId,
        title: surah?.name || `سورة ${surahNum}`,
        reciter: reciter.name,
        url,
      });
    }
  };

  const getReciterSurahs = (reciter: Reciter): number[] => {
    const moshaf = reciter.moshaf?.[0];
    if (!moshaf) return [];
    return moshaf.surah_list.split(',').map(Number).filter(Boolean);
  };

  return (
    <div className="page-container" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-foreground mb-4">القراء</h1>

        <div className="relative mb-4">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن قارئ..."
            className="w-full h-10 pr-10 pl-4 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton-pulse h-16 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((reciter) => {
              const isExpanded = expandedReciter === reciter.id;
              const surahNums = getReciterSurahs(reciter);

              return (
                <div key={reciter.id} className="card-surface">
                  <button
                    onClick={() => setExpandedReciter(isExpanded ? null : reciter.id)}
                    className="w-full flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-bold text-sm">{reciter.name.charAt(0)}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-foreground text-sm">{reciter.name}</div>
                        <div className="text-xs text-muted-foreground">{surahNums.length} سورة</div>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 gap-2 animate-fade-in max-h-60 overflow-y-auto">
                      {surahNums.map((num) => {
                        const s = surahs.find((su) => su.number === num);
                        const trackId = `${reciter.id}-${num}`;
                        const isThisPlaying = currentTrack?.id === trackId && isPlaying;
                        return (
                          <button
                            key={num}
                            onClick={() => handlePlay(reciter, num)}
                            className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-right"
                          >
                            {isThisPlaying ? (
                              <Pause className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                            ) : (
                              <Play className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                            )}
                            <span className="text-xs text-foreground truncate">{s?.name || `سورة ${num}`}</span>
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
