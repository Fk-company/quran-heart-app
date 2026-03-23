import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

type Theme = 'light' | 'dark';
type ThemeMode = 'manual' | 'auto';

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setAutoMode: (prayerTimes?: { Fajr?: string; Maghrib?: string }) => void;
}

const ThemeCtx = createContext<ThemeContextType>({ theme: 'light', themeMode: 'manual', toggleTheme: () => {}, setAutoMode: () => {} });

export const useTheme = () => useContext(ThemeCtx);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => (localStorage.getItem('app-theme-mode') as ThemeMode) || 'manual');
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('app-theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeMode('manual');
    localStorage.setItem('app-theme-mode', 'manual');
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }, []);

  const setAutoMode = useCallback((prayerTimes?: { Fajr?: string; Maghrib?: string }) => {
    setThemeMode('auto');
    localStorage.setItem('app-theme-mode', 'auto');
    if (prayerTimes) {
      localStorage.setItem('auto-theme-times', JSON.stringify(prayerTimes));
    }
    applyAutoTheme(prayerTimes);
  }, []);

  const applyAutoTheme = (times?: { Fajr?: string; Maghrib?: string }) => {
    const stored = times || (() => { try { return JSON.parse(localStorage.getItem('auto-theme-times') || '{}'); } catch { return {}; } })();
    const fajr = stored?.Fajr?.split(' ')[0];
    const maghrib = stored?.Maghrib?.split(' ')[0];
    if (!fajr || !maghrib) return;
    const now = new Date();
    const [fH, fM] = fajr.split(':').map(Number);
    const [mH, mM] = maghrib.split(':').map(Number);
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const fajrMins = fH * 60 + fM;
    const maghribMins = mH * 60 + mM;
    setTheme(nowMins >= fajrMins && nowMins < maghribMins ? 'light' : 'dark');
  };

  // Auto-check every minute
  useEffect(() => {
    if (themeMode !== 'auto') return;
    applyAutoTheme();
    const interval = setInterval(() => applyAutoTheme(), 60000);
    return () => clearInterval(interval);
  }, [themeMode]);

  return <ThemeCtx.Provider value={{ theme, themeMode, toggleTheme, setAutoMode }}>{children}</ThemeCtx.Provider>;
};
