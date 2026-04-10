import { useState, useEffect } from 'react';

export function useViewMode(key: string, defaultMode: 'list' | 'grid' = 'list') {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(() => {
    return (localStorage.getItem(`view-mode-${key}`) as 'list' | 'grid') || defaultMode;
  });

  useEffect(() => {
    localStorage.setItem(`view-mode-${key}`, viewMode);
  }, [key, viewMode]);

  return { viewMode, setViewMode };
}
