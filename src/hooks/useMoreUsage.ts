import { useCallback, useEffect, useState } from 'react';

const RECENTS_KEY = 'more_recents_v1';
const PINS_KEY = 'more_pins_v1';
const MAX_RECENTS = 8;

function loadArr(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function useMoreUsage() {
  const [recents, setRecents] = useState<string[]>(() => loadArr(RECENTS_KEY));
  const [pins, setPins] = useState<string[]>(() => loadArr(PINS_KEY));

  useEffect(() => {
    try { localStorage.setItem(RECENTS_KEY, JSON.stringify(recents)); } catch {}
  }, [recents]);
  useEffect(() => {
    try { localStorage.setItem(PINS_KEY, JSON.stringify(pins)); } catch {}
  }, [pins]);

  const trackVisit = useCallback((path: string) => {
    setRecents((prev) => [path, ...prev.filter((p) => p !== path)].slice(0, MAX_RECENTS));
  }, []);

  const togglePin = useCallback((path: string) => {
    setPins((prev) => (prev.includes(path) ? prev.filter((p) => p !== path) : [path, ...prev].slice(0, 12)));
  }, []);

  const isPinned = useCallback((path: string) => pins.includes(path), [pins]);

  const clearRecents = useCallback(() => setRecents([]), []);

  return { recents, pins, trackVisit, togglePin, isPinned, clearRecents };
}
