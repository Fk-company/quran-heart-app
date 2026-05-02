import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

export interface AudioTrack {
  id: string;
  title: string;
  reciter: string;
  url: string;
  artwork?: string;
}

export type RepeatMode = 'off' | 'one' | 'all';

interface AudioContextType {
  currentTrack: AudioTrack | null;
  queue: AudioTrack[];
  queueIndex: number;
  isPlaying: boolean;
  isLoading: boolean;
  hasError: boolean;
  progress: number;
  duration: number;
  volume: number;
  playbackRate: number;
  repeatMode: RepeatMode;
  shuffle: boolean;
  play: (track: AudioTrack, queue?: AudioTrack[]) => void;
  setQueue: (q: AudioTrack[], startIndex?: number) => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  prev: () => void;
  seekTo: (time: number) => void;
  setVolume: (vol: number) => void;
  setPlaybackRate: (r: number) => void;
  setRepeatMode: (m: RepeatMode) => void;
  toggleShuffle: () => void;
  stop: () => void;
}

const AudioCtx = createContext<AudioContextType | null>(null);

export const useAudioPlayer = () => {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error('useAudioPlayer must be inside AudioProvider');
  return ctx;
};

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [queue, setQueueState] = useState<AudioTrack[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(() => {
    const saved = localStorage.getItem('audio-volume');
    return saved ? parseFloat(saved) : 1;
  });
  const [playbackRate, setPlaybackRateState] = useState(() => {
    const saved = localStorage.getItem('audio-rate');
    return saved ? parseFloat(saved) : 1;
  });
  const [repeatMode, setRepeatModeState] = useState<RepeatMode>(() => {
    return (localStorage.getItem('audio-repeat') as RepeatMode) || 'off';
  });
  const [shuffle, setShuffle] = useState(() => localStorage.getItem('audio-shuffle') === 'true');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queueRef = useRef<AudioTrack[]>([]);
  const indexRef = useRef(0);
  const repeatRef = useRef<RepeatMode>(repeatMode);
  const shuffleRef = useRef(shuffle);

  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { indexRef.current = queueIndex; }, [queueIndex]);
  useEffect(() => { repeatRef.current = repeatMode; }, [repeatMode]);
  useEffect(() => { shuffleRef.current = shuffle; }, [shuffle]);

  const playAtIndex = useCallback((idx: number) => {
    const audio = audioRef.current;
    const q = queueRef.current;
    if (!audio || idx < 0 || idx >= q.length) return;
    const track = q[idx];
    audio.src = track.url;
    audio.volume = volume;
    audio.playbackRate = playbackRate;
    setIsLoading(true);
    setHasError(false);
    audio.play().catch(() => {
      setIsPlaying(false);
      setIsLoading(false);
      setHasError(true);
    });
    setCurrentTrack(track);
    setQueueIndex(idx);
    indexRef.current = idx;
    setProgress(0);
    setDuration(0);
  }, [volume, playbackRate]);

  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;
    audio.playbackRate = playbackRate;
    audio.preload = 'metadata';
    audioRef.current = audio;

    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onLoaded = () => { setDuration(audio.duration); setIsLoading(false); };
    const onPlaying = () => { setIsPlaying(true); setIsLoading(false); };
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsLoading(true);
    const onError = () => { setHasError(true); setIsPlaying(false); setIsLoading(false); };
    const onEnded = () => {
      const mode = repeatRef.current;
      if (mode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
      }
      const q = queueRef.current;
      if (q.length === 0) { setIsPlaying(false); return; }

      let nextIdx: number;
      if (shuffleRef.current && q.length > 1) {
        do { nextIdx = Math.floor(Math.random() * q.length); } while (nextIdx === indexRef.current);
      } else {
        nextIdx = indexRef.current + 1;
      }

      if (nextIdx >= q.length) {
        if (mode === 'all') nextIdx = 0;
        else { setIsPlaying(false); return; }
      }
      playAtIndex(nextIdx);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('error', onError);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('ended', onEnded);
      audio.pause();
      audio.src = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const play = useCallback((track: AudioTrack, q?: AudioTrack[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (q && q.length > 0) {
      setQueueState(q);
      queueRef.current = q;
      const idx = q.findIndex(t => t.id === track.id);
      const startIdx = idx >= 0 ? idx : 0;
      setQueueIndex(startIdx);
      indexRef.current = startIdx;
    } else {
      setQueueState([track]);
      queueRef.current = [track];
      setQueueIndex(0);
      indexRef.current = 0;
    }
    audio.src = track.url;
    audio.volume = volume;
    audio.playbackRate = playbackRate;
    setIsLoading(true);
    setHasError(false);
    audio.play().catch(() => { setHasError(true); setIsLoading(false); });
    setCurrentTrack(track);
    setProgress(0);
    setDuration(0);
  }, [volume, playbackRate]);

  const setQueue = useCallback((q: AudioTrack[], startIndex = 0) => {
    setQueueState(q);
    queueRef.current = q;
    if (q[startIndex]) playAtIndex(startIndex);
  }, [playAtIndex]);

  const pause = useCallback(() => { audioRef.current?.pause(); setIsPlaying(false); }, []);
  const resume = useCallback(() => {
    audioRef.current?.play().catch(() => setHasError(true));
  }, []);

  const next = useCallback(() => {
    const q = queueRef.current;
    if (q.length === 0) return;
    let nextIdx: number;
    if (shuffleRef.current && q.length > 1) {
      do { nextIdx = Math.floor(Math.random() * q.length); } while (nextIdx === indexRef.current);
    } else {
      nextIdx = indexRef.current + 1;
      if (nextIdx >= q.length) nextIdx = repeatRef.current === 'all' ? 0 : indexRef.current;
    }
    if (nextIdx !== indexRef.current) playAtIndex(nextIdx);
  }, [playAtIndex]);

  const prev = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    let prevIdx = indexRef.current - 1;
    if (prevIdx < 0) prevIdx = repeatRef.current === 'all' ? queueRef.current.length - 1 : 0;
    if (prevIdx !== indexRef.current && queueRef.current[prevIdx]) playAtIndex(prevIdx);
  }, [playAtIndex]);

  const seekTo = useCallback((time: number) => {
    if (audioRef.current) audioRef.current.currentTime = time;
  }, []);

  const setVolume = useCallback((vol: number) => {
    const v = Math.max(0, Math.min(1, vol));
    setVolumeState(v);
    if (audioRef.current) audioRef.current.volume = v;
    localStorage.setItem('audio-volume', String(v));
  }, []);

  const setPlaybackRate = useCallback((r: number) => {
    setPlaybackRateState(r);
    if (audioRef.current) audioRef.current.playbackRate = r;
    localStorage.setItem('audio-rate', String(r));
  }, []);

  const setRepeatMode = useCallback((m: RepeatMode) => {
    setRepeatModeState(m);
    localStorage.setItem('audio-repeat', m);
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffle(s => {
      const next = !s;
      localStorage.setItem('audio-shuffle', String(next));
      return next;
    });
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) { audio.pause(); audio.src = ''; }
    setCurrentTrack(null);
    setQueueState([]);
    setQueueIndex(0);
    queueRef.current = [];
    indexRef.current = 0;
    setIsPlaying(false);
    setProgress(0);
    setDuration(0);
    setIsLoading(false);
    setHasError(false);
  }, []);

  return (
    <AudioCtx.Provider value={{
      currentTrack, queue, queueIndex,
      isPlaying, isLoading, hasError,
      progress, duration, volume, playbackRate, repeatMode, shuffle,
      play, setQueue, pause, resume, next, prev,
      seekTo, setVolume, setPlaybackRate, setRepeatMode, toggleShuffle, stop,
    }}>
      {children}
    </AudioCtx.Provider>
  );
};
