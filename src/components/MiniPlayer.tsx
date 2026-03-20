import React, { useState } from 'react';
import { Play, Pause, X, ChevronUp, ChevronDown, SkipBack, SkipForward } from 'lucide-react';
import { useAudioPlayer } from '@/contexts/AudioContext';
import { Slider } from '@/components/ui/slider';

const formatTime = (seconds: number) => {
  if (!seconds || !isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const MiniPlayer: React.FC = () => {
  const { currentTrack, isPlaying, progress, duration, pause, resume, seekTo, stop } = useAudioPlayer();
  const [expanded, setExpanded] = useState(false);

  if (!currentTrack) return null;
  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  if (expanded) {
    return (
      <div className="fixed bottom-16 left-0 right-0 z-40 bg-card border-t border-border shadow-2xl" style={{ animation: 'sheet-up 0.3s cubic-bezier(0.32,0.72,0,1)' }}>
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setExpanded(false)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <ChevronDown className="w-4 h-4 text-foreground" />
            </button>
            <div className="text-center flex-1 mx-3">
              <p className="text-sm font-bold text-foreground truncate">{currentTrack.title}</p>
              <p className="text-xs text-muted-foreground truncate">{currentTrack.reciter}</p>
            </div>
            <button onClick={stop} className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
              <X className="w-4 h-4 text-destructive" />
            </button>
          </div>

          {/* Waveform */}
          <div className="flex items-end justify-center gap-[3px] h-12 mb-4">
            {Array.from({ length: 30 }).map((_, i) => {
              const height = isPlaying ? 20 + Math.sin((progress * 3) + i * 0.5) * 15 + Math.random() * 10 : 8 + Math.sin(i * 0.5) * 6;
              return <div key={i} className="w-1 rounded-full bg-primary/60 transition-all duration-150" style={{ height: `${Math.max(4, height)}px` }} />;
            })}
          </div>

          <div className="mb-3">
            <Slider value={[progress]} max={duration || 100} step={1} onValueChange={([val]) => seekTo(val)} className="w-full" />
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] text-muted-foreground">{formatTime(progress)}</span>
              <span className="text-[10px] text-muted-foreground">{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6">
            <button onClick={() => seekTo(Math.max(0, progress - 10))} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <SkipBack className="w-4 h-4 text-foreground" />
            </button>
            <button onClick={isPlaying ? pause : resume} className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg">
              {isPlaying ? <Pause className="w-6 h-6 text-primary-foreground" /> : <Play className="w-6 h-6 text-primary-foreground ml-0.5" />}
            </button>
            <button onClick={() => seekTo(Math.min(duration, progress + 10))} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <SkipForward className="w-4 h-4 text-foreground" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 glass-surface border-t border-border/50 shadow-lg">
      <div className="h-0.5 bg-muted">
        <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progressPercent}%` }} />
      </div>
      <div className="flex items-center gap-3 px-4 py-2 max-w-lg mx-auto">
        <button onClick={isPlaying ? pause : resume} className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          {isPlaying ? <Pause className="w-4 h-4 text-primary-foreground" /> : <Play className="w-4 h-4 text-primary-foreground ml-0.5" />}
        </button>
        <div className="flex-1 min-w-0 rtl:text-right cursor-pointer" onClick={() => setExpanded(true)}>
          <p className="text-sm font-medium text-foreground truncate">{currentTrack.title}</p>
          <p className="text-xs text-muted-foreground truncate">
            {currentTrack.reciter} {duration > 0 && `- ${formatTime(progress)} / ${formatTime(duration)}`}
          </p>
        </div>
        <button onClick={() => setExpanded(true)} className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center">
          <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <button onClick={stop} className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center">
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

export default MiniPlayer;
