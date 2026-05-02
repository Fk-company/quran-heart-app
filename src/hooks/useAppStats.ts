import { useState, useEffect, useCallback, useRef } from 'react';

const KEY = 'app_stats_v1';

interface AppStats {
  radioListenSeconds: number;
  reciterListenSeconds: number;
  tasbeehTotal: number;
  tasbeehByDhikr: Record<string, number>;
}

const defaults: AppStats = {
  radioListenSeconds: 0,
  reciterListenSeconds: 0,
  tasbeehTotal: 0,
  tasbeehByDhikr: {},
};

const load = (): AppStats => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...defaults, ...JSON.parse(raw) };
  } catch {}
  return defaults;
};

const save = (s: AppStats) => localStorage.setItem(KEY, JSON.stringify(s));

export function useAppStats() {
  const [stats, setStats] = useState<AppStats>(load);

  const addRadioSeconds = useCallback((s: number) => {
    setStats((p) => {
      const next = { ...p, radioListenSeconds: p.radioListenSeconds + s };
      save(next);
      return next;
    });
  }, []);

  const addReciterSeconds = useCallback((s: number) => {
    setStats((p) => {
      const next = { ...p, reciterListenSeconds: p.reciterListenSeconds + s };
      save(next);
      return next;
    });
  }, []);

  const addTasbeeh = useCallback((dhikr: string, count = 1) => {
    setStats((p) => {
      const byDhikr = { ...p.tasbeehByDhikr, [dhikr]: (p.tasbeehByDhikr[dhikr] || 0) + count };
      const next = { ...p, tasbeehTotal: p.tasbeehTotal + count, tasbeehByDhikr: byDhikr };
      save(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    save(defaults);
    setStats(defaults);
  }, []);

  return { stats, addRadioSeconds, addReciterSeconds, addTasbeeh, reset };
}

/** Format seconds → "1س 23د" */
export function formatListenTime(totalSeconds: number): string {
  if (!totalSeconds || totalSeconds < 60) return `${Math.floor(totalSeconds)} ث`;
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h > 0) return `${h} س ${m} د`;
  return `${m} د`;
}

/** Hook that listens to global audio and tracks listening time per category */
export function useAudioListeningTracker(isPlaying: boolean, trackId: string | undefined) {
  const { addRadioSeconds, addReciterSeconds } = useAppStats();
  const lastTickRef = useRef<number>(0);
  const idRef = useRef<string | undefined>(trackId);

  useEffect(() => {
    idRef.current = trackId;
  }, [trackId]);

  useEffect(() => {
    if (!isPlaying || !trackId) return;
    lastTickRef.current = Date.now();
    const interval = setInterval(() => {
      const now = Date.now();
      const delta = Math.round((now - lastTickRef.current) / 1000);
      lastTickRef.current = now;
      if (delta <= 0) return;
      const id = idRef.current || '';
      if (id.startsWith('radio-')) addRadioSeconds(delta);
      else if (id) addReciterSeconds(delta);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying, trackId, addRadioSeconds, addReciterSeconds]);
}
