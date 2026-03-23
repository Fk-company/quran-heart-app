import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

interface AudioTrack {
  id: string;
  title: string;
  reciter: string;
  url: string;
}

interface AudioContextType {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  play: (track: AudioTrack) => void;
  pause: () => void;
  resume: () => void;
  seekTo: (time: number) => void;
  setVolume: (vol: number) => void;
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(() => {
    const saved = localStorage.getItem('audio-volume');
    return saved ? parseFloat(saved) : 1;
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;
    audioRef.current = audio;

    audio.addEventListener('timeupdate', () => setProgress(audio.currentTime));
    audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
    audio.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  const play = (track: AudioTrack) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = track.url;
    audio.volume = volume;
    audio.play();
    setCurrentTrack(track);
    setIsPlaying(true);
    setProgress(0);
    setDuration(0);
  };

  const pause = () => { audioRef.current?.pause(); setIsPlaying(false); };
  const resume = () => { audioRef.current?.play(); setIsPlaying(true); };

  const seekTo = (time: number) => {
    if (audioRef.current) audioRef.current.currentTime = time;
  };

  const setVolume = (vol: number) => {
    const v = Math.max(0, Math.min(1, vol));
    setVolumeState(v);
    if (audioRef.current) audioRef.current.volume = v;
    localStorage.setItem('audio-volume', String(v));
  };

  const stop = () => {
    const audio = audioRef.current;
    if (audio) { audio.pause(); audio.src = ''; }
    setCurrentTrack(null);
    setIsPlaying(false);
    setProgress(0);
    setDuration(0);
  };

  return (
    <AudioCtx.Provider value={{ currentTrack, isPlaying, progress, duration, volume, play, pause, resume, seekTo, setVolume, stop }}>
      {children}
    </AudioCtx.Provider>
  );
};
