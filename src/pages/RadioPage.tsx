import React, { useEffect, useState } from 'react';
import { fetchRadioStations, type RadioStation } from '@/lib/api';
import { useAudioPlayer } from '@/contexts/AudioContext';
import { Play, Pause, Radio } from 'lucide-react';

const RadioPage: React.FC = () => {
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [loading, setLoading] = useState(true);
  const { play, pause, currentTrack, isPlaying } = useAudioPlayer();

  useEffect(() => {
    fetchRadioStations().then((data) => {
      setStations(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handlePlay = (station: RadioStation) => {
    const trackId = `radio-${station.id}`;
    if (currentTrack?.id === trackId && isPlaying) {
      pause();
    } else {
      play({
        id: trackId,
        title: station.name,
        reciter: 'بث مباشر',
        url: station.url,
      });
    }
  };

  return (
    <div className="page-container" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-foreground mb-4">الراديو والبث المباشر</h1>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton-pulse h-16 w-full" />
            ))}
          </div>
        ) : stations.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Radio className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm">لا توجد محطات متاحة حالياً</p>
          </div>
        ) : (
          <div className="space-y-2">
            {stations.map((station) => {
              const trackId = `radio-${station.id}`;
              const isThisPlaying = currentTrack?.id === trackId && isPlaying;
              return (
                <button
                  key={station.id}
                  onClick={() => handlePlay(station)}
                  className="card-surface w-full flex items-center gap-3"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isThisPlaying ? 'bg-primary' : 'bg-primary/10'}`}>
                    {isThisPlaying ? (
                      <Pause className="w-4 h-4 text-primary-foreground" />
                    ) : (
                      <Play className="w-4 h-4 text-primary ml-0.5" />
                    )}
                  </div>
                  <div className="flex-1 text-right">
                    <div className="font-semibold text-foreground text-sm">{station.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {isThisPlaying ? 'يعمل الآن' : 'بث مباشر'}
                    </div>
                  </div>
                  {isThisPlaying && (
                    <div className="flex gap-0.5 items-end h-4">
                      <div className="w-1 bg-primary rounded-full animate-pulse-glow" style={{ height: '60%' }} />
                      <div className="w-1 bg-primary rounded-full animate-pulse-glow" style={{ height: '100%', animationDelay: '0.2s' }} />
                      <div className="w-1 bg-primary rounded-full animate-pulse-glow" style={{ height: '40%', animationDelay: '0.4s' }} />
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
