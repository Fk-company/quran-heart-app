import { useState, useEffect, useCallback } from 'react';

const SETTINGS_KEY = 'app_settings';

export interface AppSettings {
  fontSize: number; // 16-32
  mushafFontSize: number; // 18-36
  defaultReciter: string;
  colorScheme: 'default' | 'warm' | 'cool' | 'highContrast';
  autoPlayNext: boolean;
  repeatCount: number; // default repeat count for ayah memorization
}

const DEFAULT_SETTINGS: AppSettings = {
  fontSize: 18,
  mushafFontSize: 22,
  defaultReciter: 'alafasy',
  colorScheme: 'default',
  autoPlayNext: true,
  repeatCount: 3,
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
      return { ...DEFAULT_SETTINGS, ...saved };
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return { settings, updateSetting, resetSettings };
}
