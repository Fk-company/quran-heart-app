import { useCallback, useEffect, useState } from 'react';

const KEY = 'tajweed_progress_v1';

export interface LessonRecord {
  completed: boolean;
  rating: number; // 0-5
  completedAt?: number;
}

export type TajweedProgress = Record<string, LessonRecord>;

function load(): TajweedProgress {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

export function useTajweedProgress() {
  const [progress, setProgress] = useState<TajweedProgress>(load);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(progress)); } catch {}
  }, [progress]);

  const toggleComplete = useCallback((lessonId: string) => {
    setProgress((p) => {
      const cur = p[lessonId] || { completed: false, rating: 0 };
      return {
        ...p,
        [lessonId]: {
          ...cur,
          completed: !cur.completed,
          completedAt: !cur.completed ? Date.now() : undefined,
        },
      };
    });
  }, []);

  const rate = useCallback((lessonId: string, rating: number) => {
    setProgress((p) => ({
      ...p,
      [lessonId]: { ...(p[lessonId] || { completed: false, rating: 0 }), rating },
    }));
  }, []);

  const reset = useCallback(() => setProgress({}), []);

  const stats = (totalLessons: number) => {
    const done = Object.values(progress).filter((r) => r.completed).length;
    const ratings = Object.values(progress).map((r) => r.rating).filter((n) => n > 0);
    const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    return {
      done,
      total: totalLessons,
      percent: totalLessons ? Math.round((done / totalLessons) * 100) : 0,
      avgRating: avg,
    };
  };

  return { progress, toggleComplete, rate, reset, stats };
}
