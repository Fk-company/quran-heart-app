import { useState, useEffect, useCallback } from 'react';

const BOOKMARKS_KEY = 'mushaf_bookmarks';

export interface MushafBookmark {
  id: string;
  page: number;
  surahName: string;
  juz: number;
  note?: string;
  createdAt: number;
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<MushafBookmark[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  }, [bookmarks]);

  const addBookmark = useCallback((bookmark: Omit<MushafBookmark, 'id' | 'createdAt'>) => {
    const existing = bookmarks.find(b => b.page === bookmark.page);
    if (existing) return; // already bookmarked
    setBookmarks(prev => [
      ...prev,
      { ...bookmark, id: `bm-${Date.now()}`, createdAt: Date.now() },
    ]);
  }, [bookmarks]);

  const removeBookmark = useCallback((page: number) => {
    setBookmarks(prev => prev.filter(b => b.page !== page));
  }, []);

  const isBookmarked = useCallback((page: number) => {
    return bookmarks.some(b => b.page === page);
  }, [bookmarks]);

  const toggleBookmark = useCallback((page: number, surahName: string, juz: number) => {
    if (isBookmarked(page)) {
      removeBookmark(page);
    } else {
      addBookmark({ page, surahName, juz });
    }
  }, [isBookmarked, removeBookmark, addBookmark]);

  return { bookmarks, addBookmark, removeBookmark, isBookmarked, toggleBookmark };
}
