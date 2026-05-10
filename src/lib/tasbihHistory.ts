// Tasbih history utility — keeps a rolling 60-day record of dhikr counts.
const HISTORY_KEY = 'tasbih_history_v1';

export interface TasbihHistory {
  // dateKey (YYYY-MM-DD) -> { phrase: count }
  days: Record<string, Record<string, number>>;
}

const todayKey = () => new Date().toISOString().split('T')[0];

const read = (): TasbihHistory => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return { days: {} };
    const p = JSON.parse(raw);
    return p && typeof p === 'object' && p.days ? p : { days: {} };
  } catch {
    return { days: {} };
  }
};

const write = (h: TasbihHistory) => {
  // Trim to last 60 days
  const keys = Object.keys(h.days).sort();
  if (keys.length > 60) {
    const drop = keys.slice(0, keys.length - 60);
    drop.forEach((k) => delete h.days[k]);
  }
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
    window.dispatchEvent(new Event('tasbih-history-changed'));
  } catch { }
};

export const recordTasbih = (phrase: string, increment = 1) => {
  const h = read();
  const k = todayKey();
  if (!h.days[k]) h.days[k] = {};
  h.days[k][phrase] = (h.days[k][phrase] || 0) + increment;
  write(h);
};

export const getHistory = (): TasbihHistory => read();

export const getDayTotal = (dateKey: string): number => {
  const h = read();
  return Object.values(h.days[dateKey] || {}).reduce((a, b) => a + b, 0);
};

export const getLastDays = (
  count: number,
): Array<{ date: string; total: number; byPhrase: Record<string, number> }> => {
  const h = read();
  const out: Array<{ date: string; total: number; byPhrase: Record<string, number> }> = [];
  const d = new Date();
  for (let i = 0; i < count; i++) {
    const key = d.toISOString().split('T')[0];
    const byPhrase = h.days[key] || {};
    const total = Object.values(byPhrase).reduce((a, b) => a + b, 0);
    out.push({ date: key, total, byPhrase });
    d.setDate(d.getDate() - 1);
  }
  return out.reverse();
};

export const getStreak = (): number => {
  const h = read();
  let streak = 0;
  const d = new Date();
  while (true) {
    const key = d.toISOString().split('T')[0];
    if ((h.days[key] && Object.keys(h.days[key]).length > 0)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else break;
  }
  return streak;
};

export const getTopPhrases = (
  days = 30,
): Array<{ phrase: string; total: number }> => {
  const last = getLastDays(days);
  const map: Record<string, number> = {};
  for (const d of last) {
    for (const [p, c] of Object.entries(d.byPhrase)) {
      map[p] = (map[p] || 0) + c;
    }
  }
  return Object.entries(map)
    .map(([phrase, total]) => ({ phrase, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);
};

export const getAllTimeTotal = (): number => {
  const h = read();
  let sum = 0;
  for (const day of Object.values(h.days)) {
    for (const c of Object.values(day)) sum += c;
  }
  return sum;
};
