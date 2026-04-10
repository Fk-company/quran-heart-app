import { useState, useRef, useCallback, useEffect } from 'react';

interface AyahAudio {
  number: number;
  numberInSurah: number;
  surahNumber: number;
  surahName: string;
}

const RECITERS: Record<string, { name: string; identifier: string }> = {
  alafasy: { name: 'مشاري العفاسي', identifier: 'ar.alafasy' },
  husary: { name: 'محمود خليل الحصري', identifier: 'ar.husary' },
  minshawi: { name: 'محمد صديق المنشاوي', identifier: 'ar.minshawi' },
  abdulbasit: { name: 'عبد الباسط عبد الصمد', identifier: 'ar.abdulbasitmurattal' },
  sudais: { name: 'عبد الرحمن السديس', identifier: 'ar.abdurrahmansudais' },
};

export function useAyahByAyahPlayer() {
  const [playingAyahNumber, setPlayingAyahNumber] = useState<number | null>(null);
  const [isAyahPlaying, setIsAyahPlaying] = useState(false);
  const [ayahQueue, setAyahQueue] = useState<AyahAudio[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reciterId, setReciterId] = useState('alafasy');
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queueRef = useRef<AyahAudio[]>([]);
  const indexRef = useRef(0);
  const onAyahEndRef = useRef<(() => boolean) | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    audio.addEventListener('timeupdate', () => {
      setProgress(audio.currentTime);
    });
    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });
    audio.addEventListener('ended', () => {
      // Check if repeat callback wants to handle this
      if (onAyahEndRef.current) {
        const handled = onAyahEndRef.current();
        if (handled) return; // repeat is handling it
      }
      
      // Auto-advance to next ayah
      const nextIdx = indexRef.current + 1;
      if (nextIdx < queueRef.current.length) {
        indexRef.current = nextIdx;
        setCurrentIndex(nextIdx);
        playAyahAtIndex(nextIdx);
      } else {
        setIsAyahPlaying(false);
        setPlayingAyahNumber(null);
        setProgress(0);
        setDuration(0);
      }
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  const playAyahAtIndex = useCallback((idx: number) => {
    const audio = audioRef.current;
    const queue = queueRef.current;
    if (!audio || idx >= queue.length) return;
    
    const ayah = queue[idx];
    setPlayingAyahNumber(ayah.number);
    setIsAyahPlaying(true);
    setProgress(0);
    setDuration(0);

    const reciter = RECITERS[reciterId] || RECITERS.alafasy;
    audio.src = `https://cdn.islamic.network/quran/audio/128/${reciter.identifier}/${ayah.number}.mp3`;
    audio.play().catch(() => {
      setIsAyahPlaying(false);
      setPlayingAyahNumber(null);
    });
  }, [reciterId]);

  const startPlayback = useCallback((ayahs: AyahAudio[], startFromIndex = 0) => {
    queueRef.current = ayahs;
    indexRef.current = startFromIndex;
    setAyahQueue(ayahs);
    setCurrentIndex(startFromIndex);
    playAyahAtIndex(startFromIndex);
  }, [playAyahAtIndex]);

  const playFromAyah = useCallback((ayahs: AyahAudio[], ayahNumber: number) => {
    const idx = ayahs.findIndex(a => a.number === ayahNumber);
    if (idx >= 0) startPlayback(ayahs, idx);
  }, [startPlayback]);

  const pausePlayback = useCallback(() => {
    audioRef.current?.pause();
    setIsAyahPlaying(false);
  }, []);

  const resumePlayback = useCallback(() => {
    audioRef.current?.play();
    setIsAyahPlaying(true);
  }, []);

  const stopPlayback = useCallback(() => {
    const audio = audioRef.current;
    if (audio) { audio.pause(); audio.src = ''; }
    setPlayingAyahNumber(null);
    setIsAyahPlaying(false);
    setAyahQueue([]);
    setCurrentIndex(0);
    setProgress(0);
    setDuration(0);
    queueRef.current = [];
    indexRef.current = 0;
  }, []);

  const skipNext = useCallback(() => {
    const nextIdx = indexRef.current + 1;
    if (nextIdx < queueRef.current.length) {
      indexRef.current = nextIdx;
      setCurrentIndex(nextIdx);
      playAyahAtIndex(nextIdx);
    }
  }, [playAyahAtIndex]);

  const skipPrev = useCallback(() => {
    const prevIdx = indexRef.current - 1;
    if (prevIdx >= 0) {
      indexRef.current = prevIdx;
      setCurrentIndex(prevIdx);
      playAyahAtIndex(prevIdx);
    }
  }, [playAyahAtIndex]);

  const changeReciter = useCallback((id: string) => {
    setReciterId(id);
  }, []);

  const replayCurrentAyah = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.src) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  }, []);

  const setOnAyahEnd = useCallback((cb: (() => boolean) | null) => {
    onAyahEndRef.current = cb;
  }, []);

  const availableReciters = Object.entries(RECITERS).map(([id, r]) => ({ id, name: r.name }));

  return {
    playingAyahNumber,
    isAyahPlaying,
    currentIndex,
    totalAyahs: ayahQueue.length,
    progress,
    duration,
    reciterId,
    availableReciters,
    startPlayback,
    playFromAyah,
    pausePlayback,
    resumePlayback,
    stopPlayback,
    skipNext,
    skipPrev,
    changeReciter,
    replayCurrentAyah,
    setOnAyahEnd,
  };
}
