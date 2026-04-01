import { useState, useCallback } from 'react';

const KEY = 'quran_reading_tracker';

interface DailyRecord {
  date: string;
  surahs: number[];
  ayahsRead: number;
  pagesRead: number;
  timeSpentMinutes: number;
}

interface ReadingTracker {
  totalAyahsRead: number;
  totalPagesRead: number;
  completedSurahs: number[];
  khatmCount: number;
  dailyRecords: DailyRecord[];
  streak: number;
}

const defaultTracker: ReadingTracker = {
  totalAyahsRead: 0, totalPagesRead: 0, completedSurahs: [], khatmCount: 0, dailyRecords: [], streak: 0,
};

function getToday() {
  return new Date().toISOString().split('T')[0];
}

export function useReadingTracker() {
  const [tracker, setTracker] = useState<ReadingTracker>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? { ...defaultTracker, ...JSON.parse(raw) } : defaultTracker;
    } catch { return defaultTracker; }
  });

  const save = useCallback((t: ReadingTracker) => {
    localStorage.setItem(KEY, JSON.stringify(t));
    setTracker(t);
  }, []);

  const recordReading = useCallback((surahNumber: number, ayahCount: number, pages: number) => {
    const today = getToday();
    const t = { ...tracker };
    t.totalAyahsRead += ayahCount;
    t.totalPagesRead += pages;

    if (!t.completedSurahs.includes(surahNumber)) {
      t.completedSurahs = [...t.completedSurahs, surahNumber];
    }
    if (t.completedSurahs.length >= 114) {
      t.khatmCount += 1;
      t.completedSurahs = [];
    }

    let todayRecord = t.dailyRecords.find(r => r.date === today);
    if (!todayRecord) {
      todayRecord = { date: today, surahs: [], ayahsRead: 0, pagesRead: 0, timeSpentMinutes: 0 };
      t.dailyRecords = [...t.dailyRecords, todayRecord];
    }
    todayRecord.ayahsRead += ayahCount;
    todayRecord.pagesRead += pages;
    if (!todayRecord.surahs.includes(surahNumber)) todayRecord.surahs.push(surahNumber);
    t.dailyRecords = t.dailyRecords.map(r => r.date === today ? todayRecord! : r).slice(-60);

    // Calculate streak
    let streak = 0;
    const sortedDates = t.dailyRecords.map(r => r.date).sort().reverse();
    const d = new Date();
    for (const date of sortedDates) {
      const expected = d.toISOString().split('T')[0];
      if (date === expected) { streak++; d.setDate(d.getDate() - 1); }
      else break;
    }
    t.streak = streak;

    save(t);
  }, [tracker, save]);

  const todayStats = tracker.dailyRecords.find(r => r.date === getToday()) || { ayahsRead: 0, pagesRead: 0, surahs: [], timeSpentMinutes: 0 };
  const khatmProgress = Math.round((tracker.completedSurahs.length / 114) * 100);

  return { tracker, todayStats, khatmProgress, recordReading };
}
