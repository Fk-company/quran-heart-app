import React, { useState, useEffect } from 'react';
import {
  Play, Pause, X, ChevronUp, ChevronDown, SkipBack, SkipForward,
  Volume2, VolumeX, Volume1, Repeat, Repeat1, Shuffle, Gauge, Loader2, AlertCircle, Radio,
} from 'lucide-react';
import { useAudioPlayer } from '@/contexts/AudioContext';
import { useAudioListeningTracker } from '@/hooks/useAppStats';
import { Slider } from '@/components/ui/slider';

const formatTime = (seconds: number) => {
  if (!seconds || !isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 1.75, 2];

const MiniPlayer: React.FC = () => {
  const {
    currentTrack, queue, queueIndex,
    isPlaying, isLoading, hasError, progress, duration, volume, playbackRate, repeatMode, shuffle,
    pause, resume, seekTo, setVolume, setPlaybackRate, setRepeatMode, toggleShuffle, next, prev, stop,
  } = useAudioPlayer();

  const [expanded, setExpanded] = useState(false);
  const [showRate, setShowRate] = useState(false);

  // Track listening time to global stats
  useAudioListeningTracker(isPlaying, currentTrack?.id);

  // Update Media Session metadata for OS-level controls
  useEffect(() => {
    if (!currentTrack || !('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.reciter,
        album: 'Quran Heart',
      });
      navigator.mediaSession.setActionHandler('play', resume);
      navigator.mediaSession.setActionHandler('pause', pause);
      navigator.mediaSession.setActionHandler('previoustrack', prev);
      navigator.mediaSession.setActionHandler('nexttrack', next);
    } catch {}
  }, [currentTrack, resume, pause, prev, next]);

  if (!currentTrack) return null;
  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;
  const isLive = currentTrack.id.startsWith('radio-');
  const hasNext = queue.length > 1 && (queueIndex < queue.length - 1 || repeatMode === 'all');
  const hasPrev = queue.length > 1 && (queueIndex > 0 || repeatMode === 'all');

  const cycleRepeat = () => {
    setRepeatMode(repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off');
  };

  const VolIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  // ==== Expanded full player ====
  if (expanded) {
    return (
      <div
        className="fixed bottom-[4.5rem] left-0 right-0 z-40 glass-surface border-t border-border/60 shadow-2xl"
        style={{ animation: 'sheet-up 0.3s cubic-bezier(0.32,0.72,0,1)' }}
        dir="rtl"
      >
        <div className="max-w-lg mx-auto px-5 py-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setExpanded(false)} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center hover:bg-muted transition-colors">
              <ChevronDown className="w-4 h-4 text-foreground" />
            </button>
            <div className="text-center flex-1 mx-3 min-w-0">
              <p className="text-xs text-muted-foreground font-medium">{isLive ? 'بث مباشر' : 'يتم التشغيل'}</p>
              <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                {!isLive && queue.length > 1 ? `${queueIndex + 1} / ${queue.length}` : 'Quran Heart'}
              </p>
            </div>
            <button onClick={stop} className="w-9 h-9 rounded-xl bg-destructive/10 hover:bg-destructive/20 flex items-center justify-center transition-colors">
              <X className="w-4 h-4 text-destructive" />
            </button>
          </div>

          {/* Artwork / Equalizer */}
          <div className="flex flex-col items-center mb-5">
            <div className={`w-32 h-32 rounded-3xl flex items-center justify-center mb-4 relative overflow-hidden ${isPlaying ? 'shadow-emerald' : ''}`}
              style={{ background: 'var(--grad-primary)' }}>
              {/* Decorative pattern */}
              <div className="absolute inset-0 islamic-pattern-arabesque opacity-40" />
              {isLive ? (
                <Radio className={`w-14 h-14 text-primary-foreground relative z-10 ${isPlaying ? 'animate-pulse' : ''}`} />
              ) : (
                <span className="font-amiri text-5xl text-primary-foreground relative z-10">ﷻ</span>
              )}
              {isLoading && (
                <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center backdrop-blur-sm">
                  <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
                </div>
              )}
              {hasError && (
                <div className="absolute inset-0 bg-destructive/40 flex items-center justify-center backdrop-blur-sm">
                  <AlertCircle className="w-8 h-8 text-primary-foreground" />
                </div>
              )}
            </div>
            <h3 className="text-base font-bold text-foreground text-center font-kufi line-clamp-1 max-w-full">{currentTrack.title}</h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{currentTrack.reciter}</p>
          </div>

          {/* Equalizer bars */}
          {!isLive && (
            <div className="flex items-end justify-center gap-[3px] h-8 mb-3" aria-hidden="true">
              {Array.from({ length: 36 }).map((_, i) => {
                const baseH = isPlaying
                  ? 12 + Math.abs(Math.sin((progress * 2.5) + i * 0.45)) * 18 + (i % 4) * 2
                  : 6 + (i % 3) * 2;
                return <div key={i} className="w-1 rounded-full bg-primary/50 transition-all duration-200" style={{ height: `${Math.max(4, baseH)}px` }} />;
              })}
            </div>
          )}

          {/* Progress */}
          {!isLive && (
            <div className="mb-4">
              <Slider value={[progress]} max={duration || 100} step={1} onValueChange={([val]) => seekTo(val)} className="w-full" />
              <div className="flex justify-between mt-1.5">
                <span className="text-[10px] text-muted-foreground tabular-nums">{formatTime(progress)}</span>
                <span className="text-[10px] text-muted-foreground tabular-nums">-{formatTime((duration || 0) - progress)}</span>
              </div>
            </div>
          )}

          {/* Main controls */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <button onClick={toggleShuffle}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${shuffle ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-secondary'}`}
              title="عشوائي" disabled={isLive}>
              <Shuffle className="w-4 h-4" />
            </button>
            <button onClick={prev} disabled={!hasPrev || isLive}
              className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center disabled:opacity-30 hover:bg-muted transition-colors">
              <SkipBack className="w-4 h-4 text-foreground" />
            </button>
            <button onClick={() => seekTo(Math.max(0, progress - 10))} disabled={isLive}
              className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center disabled:opacity-30 text-[10px] text-foreground hover:bg-muted transition-colors">
              -10
            </button>
            <button onClick={isPlaying ? pause : resume}
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-emerald hover:scale-105 active:scale-95 transition-transform"
              style={{ background: 'var(--grad-primary)' }}>
              {isLoading ? <Loader2 className="w-6 h-6 text-primary-foreground animate-spin" />
                : isPlaying ? <Pause className="w-6 h-6 text-primary-foreground" />
                : <Play className="w-6 h-6 text-primary-foreground ml-0.5" />}
            </button>
            <button onClick={() => seekTo(Math.min(duration, progress + 10))} disabled={isLive}
              className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center disabled:opacity-30 text-[10px] text-foreground hover:bg-muted transition-colors">
              +10
            </button>
            <button onClick={next} disabled={!hasNext || isLive}
              className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center disabled:opacity-30 hover:bg-muted transition-colors">
              <SkipForward className="w-4 h-4 text-foreground" />
            </button>
            <button onClick={cycleRepeat}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${repeatMode !== 'off' ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-secondary'}`}
              title="تكرار" disabled={isLive}>
              {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
            </button>
          </div>

          {/* Volume + Speed */}
          <div className="flex items-center gap-3 px-1">
            <button onClick={() => setVolume(volume > 0 ? 0 : 1)} className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
              <VolIcon className="w-4 h-4" />
            </button>
            <Slider value={[volume * 100]} max={100} step={1} onValueChange={([val]) => setVolume(val / 100)} className="flex-1" />
            <span className="text-[10px] text-muted-foreground w-8 text-center tabular-nums">{Math.round(volume * 100)}%</span>
            {!isLive && (
              <div className="relative">
                <button onClick={() => setShowRate(!showRate)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-colors ${playbackRate !== 1 ? 'bg-accent/15 text-accent' : 'bg-secondary text-foreground'}`}
                  title="سرعة التشغيل">
                  <Gauge className="w-3 h-3" />{playbackRate}×
                </button>
                {showRate && (
                  <div className="absolute bottom-full mb-2 left-0 bg-card border border-border rounded-xl shadow-lg p-1.5 grid grid-cols-3 gap-1 w-32 animate-fade-in z-10">
                    {PLAYBACK_RATES.map(r => (
                      <button key={r}
                        onClick={() => { setPlaybackRate(r); setShowRate(false); }}
                        className={`text-[10px] py-1.5 rounded-lg font-semibold transition-colors ${r === playbackRate ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-foreground'}`}>
                        {r}×
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==== Compact mini player ====
  return (
    <div className="fixed bottom-[4.5rem] left-0 right-0 z-40 glass-surface border-t border-border/50 shadow-lg" dir="rtl">
      <div className="h-0.5 bg-muted overflow-hidden">
        <div className="h-full transition-all duration-300" style={{ width: `${progressPercent}%`, background: 'var(--grad-gold)' }} />
      </div>
      <div className="flex items-center gap-2.5 px-3 py-2 max-w-lg mx-auto">
        <button onClick={isPlaying ? pause : resume}
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm hover:scale-105 active:scale-95 transition-transform"
          style={{ background: 'var(--grad-primary)' }}>
          {isLoading ? <Loader2 className="w-4 h-4 text-primary-foreground animate-spin" />
            : hasError ? <AlertCircle className="w-4 h-4 text-primary-foreground" />
            : isPlaying ? <Pause className="w-4 h-4 text-primary-foreground" />
            : <Play className="w-4 h-4 text-primary-foreground ml-0.5" />}
        </button>
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpanded(true)}>
          <div className="flex items-center gap-1.5">
            {isLive && <span className="w-1.5 h-1.5 rounded-full bg-destructive live-pulse flex-shrink-0" />}
            <p className="text-xs font-bold text-foreground truncate font-kufi">{currentTrack.title}</p>
          </div>
          <p className="text-[10px] text-muted-foreground truncate mt-0.5">
            {currentTrack.reciter}
            {!isLive && duration > 0 && (
              <span className="tabular-nums"> • {formatTime(progress)} / {formatTime(duration)}</span>
            )}
          </p>
        </div>
        {!isLive && queue.length > 1 && (
          <button onClick={next} disabled={!hasNext}
            className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center disabled:opacity-30 hover:bg-muted transition-colors">
            <SkipForward className="w-3.5 h-3.5 text-foreground" />
          </button>
        )}
        <button onClick={() => setExpanded(true)} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-muted transition-colors">
          <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <button onClick={stop} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-destructive/15 transition-colors">
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

export default MiniPlayer;
