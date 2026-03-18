import React from 'react';
import { Play, Pause, X } from 'lucide-react';
import { useAudioPlayer } from '@/contexts/AudioContext';

const MiniPlayer: React.FC = () => {
  const { currentTrack, isPlaying, progress, duration, pause, resume } = useAudioPlayer();

  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 bg-card border-t border-border shadow-lg">
      <div className="h-0.5 bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <div className="flex items-center gap-3 px-4 py-2 max-w-lg mx-auto">
        <button
          onClick={isPlaying ? pause : resume}
          className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 text-primary-foreground" />
          ) : (
            <Play className="w-4 h-4 text-primary-foreground ml-0.5" />
          )}
        </button>
        <div className="flex-1 min-w-0 rtl:text-right">
          <p className="text-sm font-medium text-foreground truncate">{currentTrack.title}</p>
          <p className="text-xs text-muted-foreground truncate">{currentTrack.reciter}</p>
        </div>
      </div>
    </div>
  );
};

export default MiniPlayer;
