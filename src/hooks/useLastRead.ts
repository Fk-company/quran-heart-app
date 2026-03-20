import { useState, useCallback } from 'react';

const KEY = 'last_read_position';

interface LastRead {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  timestamp: number;
}

export function useLastRead() {
  const [lastRead, setLastRead] = useState<LastRead | null>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  const savePosition = useCallback((surahNumber: number, surahName: string, ayahNumber: number) => {
    const data: LastRead = { surahNumber, surahName, ayahNumber, timestamp: Date.now() };
    localStorage.setItem(KEY, JSON.stringify(data));
    setLastRead(data);
  }, []);

  return { lastRead, savePosition };
}
