import { useState, useCallback } from 'react';

const FAVORITES_KEY = 'app_favorites';

interface Favorites {
  surahs: number[];
  reciters: number[];
}

const load = (): Favorites => {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { surahs: [], reciters: [] };
};

const save = (f: Favorites) => localStorage.setItem(FAVORITES_KEY, JSON.stringify(f));

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorites>(load);

  const toggleSurah = useCallback((num: number) => {
    setFavorites((prev) => {
      const next = prev.surahs.includes(num)
        ? { ...prev, surahs: prev.surahs.filter((n) => n !== num) }
        : { ...prev, surahs: [...prev.surahs, num] };
      save(next);
      return next;
    });
  }, []);

  const toggleReciter = useCallback((id: number) => {
    setFavorites((prev) => {
      const next = prev.reciters.includes(id)
        ? { ...prev, reciters: prev.reciters.filter((n) => n !== id) }
        : { ...prev, reciters: [...prev.reciters, id] };
      save(next);
      return next;
    });
  }, []);

  const isSurahFav = useCallback((num: number) => favorites.surahs.includes(num), [favorites.surahs]);
  const isReciterFav = useCallback((id: number) => favorites.reciters.includes(id), [favorites.reciters]);

  return { favorites, toggleSurah, toggleReciter, isSurahFav, isReciterFav };
}
