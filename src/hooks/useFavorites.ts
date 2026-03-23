import { useState, useCallback } from 'react';

const FAVORITES_KEY = 'app_favorites';

interface FavoriteItem {
  id: string;
  type: 'ayah' | 'dua' | 'hadith';
  text: string;
  source: string;
  timestamp: number;
}

interface Favorites {
  surahs: number[];
  reciters: number[];
  items: FavoriteItem[];
}

const load = (): Favorites => {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { surahs: parsed.surahs || [], reciters: parsed.reciters || [], items: parsed.items || [] };
    }
  } catch {}
  return { surahs: [], reciters: [], items: [] };
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

  const addItem = useCallback((item: Omit<FavoriteItem, 'timestamp'>) => {
    setFavorites((prev) => {
      if (prev.items.some(i => i.id === item.id)) return prev;
      const next = { ...prev, items: [...prev.items, { ...item, timestamp: Date.now() }] };
      save(next);
      return next;
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = { ...prev, items: prev.items.filter(i => i.id !== id) };
      save(next);
      return next;
    });
  }, []);

  const isItemFav = useCallback((id: string) => favorites.items.some(i => i.id === id), [favorites.items]);

  const isSurahFav = useCallback((num: number) => favorites.surahs.includes(num), [favorites.surahs]);
  const isReciterFav = useCallback((id: number) => favorites.reciters.includes(id), [favorites.reciters]);

  const exportFavorites = useCallback(() => {
    const lines = favorites.items.map(item => `${item.text}\n— ${item.source}\n`);
    const content = `المفضلة\n${'═'.repeat(30)}\n\n${lines.join('\n')}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'favorites.txt';
    a.click();
    URL.revokeObjectURL(url);
  }, [favorites.items]);

  return { favorites, toggleSurah, toggleReciter, isSurahFav, isReciterFav, addItem, removeItem, isItemFav, exportFavorites };
}

export type { FavoriteItem };
