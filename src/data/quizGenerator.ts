import { SURAHS_META, SurahMeta } from './surahsMeta';

export type Difficulty = 'easy' | 'medium' | 'hard';
export type Category = 'quran' | 'hadith' | 'seerah' | 'fiqh' | 'aqeedah' | 'history' | 'general';

export interface Q {
  id: string;
  q: string;
  options: string[];
  answer: number;
  difficulty: Difficulty;
  category: Category;
  source?: 'local' | 'api';
}

// -------- Seeded RNG (Mulberry32) for shuffles per session --------
function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6D2B79F5) >>> 0;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleSeeded<T>(arr: T[], rand: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// -------- Distractor helpers --------
function uniqueNumberDistractors(correct: number, rand: () => number, count = 3): string[] {
  const set = new Set<number>();
  let guard = 0;
  while (set.size < count && guard++ < 60) {
    const delta = Math.max(1, Math.round((rand() * Math.max(3, correct * 0.4)) + 1));
    const sign = rand() < 0.5 ? -1 : 1;
    const v = correct + sign * delta;
    if (v > 0 && v !== correct && !set.has(v)) set.add(v);
  }
  while (set.size < count) set.add(correct + set.size + 1);
  return [...set].map(String);
}

function pickDistractors<T>(pool: T[], correct: T, rand: () => number, count = 3, keyFn?: (x: T) => string): T[] {
  const key = keyFn || ((x: any) => String(x));
  const k = key(correct);
  const filtered = pool.filter(x => key(x) !== k);
  const shuffled = shuffleSeeded(filtered, rand);
  return shuffled.slice(0, count);
}

function stableId(input: string): string {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

function buildQ(text: string, correct: string, distractors: string[], difficulty: Difficulty, category: Category, rand: () => number, source: 'local' | 'api' = 'local'): Q {
  const options = shuffleSeeded([correct, ...distractors], rand);
  return { id: stableId(`${text}|${correct}|${category}`), q: text, options, answer: options.indexOf(correct), difficulty, category, source };
}

// -------- Generators --------
function genFromSurah(s: SurahMeta, rand: () => number): Q[] {
  const out: Q[] = [];

  // 1. ayat count
  out.push(buildQ(
    `كم عدد آيات سورة ${s.name}؟`,
    String(s.ayat),
    uniqueNumberDistractors(s.ayat, rand),
    s.ayat < 20 ? 'medium' : 'hard',
    'quran',
    rand,
  ));

  // 2. makki / madani
  out.push(buildQ(
    `هل سورة ${s.name} مكية أم مدنية؟`,
    s.type,
    [s.type === 'مكية' ? 'مدنية' : 'مكية', 'مكية ومدنية', 'لا يُعرف'],
    'medium',
    'quran',
    rand,
  ));

  // 3. order in mushaf
  out.push(buildQ(
    `ما ترتيب سورة ${s.name} في المصحف؟`,
    String(s.n),
    uniqueNumberDistractors(s.n, rand),
    'hard',
    'quran',
    rand,
  ));

  // 4. juz
  out.push(buildQ(
    `في أي جزء تبدأ سورة ${s.name}؟`,
    `الجزء ${s.juz}`,
    uniqueNumberDistractors(s.juz, rand).map(v => `الجزء ${v}`),
    'hard',
    'quran',
    rand,
  ));

  // 5. name from order
  const otherSurahs = pickDistractors(SURAHS_META, s, rand, 3, x => x.name).map(x => x.name);
  out.push(buildQ(
    `ما اسم السورة رقم ${s.n} في ترتيب المصحف؟`,
    s.name,
    otherSurahs,
    'medium',
    'quran',
    rand,
  ));

  // 6. which surah has X ayat (only when ayat count is somewhat unique)
  out.push(buildQ(
    `أي سورة عدد آياتها ${s.ayat}؟`,
    s.name,
    otherSurahs,
    'hard',
    'quran',
    rand,
  ));

  return out;
}

// -------- Prophets pool --------
const PROPHETS = [
  { name: 'آدم', fact: 'أبو البشر' },
  { name: 'نوح', fact: 'أبو الأنبياء بعد الطوفان' },
  { name: 'إبراهيم', fact: 'خليل الرحمن' },
  { name: 'إسماعيل', fact: 'الذبيح' },
  { name: 'إسحاق', fact: 'ابن إبراهيم من سارة' },
  { name: 'يعقوب', fact: 'إسرائيل' },
  { name: 'يوسف', fact: 'صاحب رؤيا الكواكب' },
  { name: 'موسى', fact: 'كليم الله' },
  { name: 'هارون', fact: 'أخو موسى' },
  { name: 'داود', fact: 'صاحب الزبور' },
  { name: 'سليمان', fact: 'علّمه الله منطق الطير' },
  { name: 'أيوب', fact: 'الصابر على البلاء' },
  { name: 'يونس', fact: 'صاحب الحوت' },
  { name: 'زكريا', fact: 'والد يحيى' },
  { name: 'يحيى', fact: 'سيد شباب أهل الجنة من النبيين' },
  { name: 'عيسى', fact: 'ابن مريم' },
  { name: 'محمد ﷺ', fact: 'خاتم النبيين' },
  { name: 'إدريس', fact: 'رُفع إلى السماء' },
  { name: 'لوط', fact: 'نبي قوم سدوم' },
  { name: 'صالح', fact: 'نبي قوم ثمود' },
  { name: 'هود', fact: 'نبي قوم عاد' },
  { name: 'شعيب', fact: 'خطيب الأنبياء' },
];

function genProphets(rand: () => number): Q[] {
  return PROPHETS.map(p => {
    const distractors = pickDistractors(PROPHETS, p, rand, 3, x => x.name).map(x => x.name);
    return buildQ(`من النبي المعروف بأنه ${p.fact}؟`, p.name, distractors, 'medium', 'general', rand);
  });
}

// -------- Static seed bank kept for variety --------
const STATIC: Q[] = [
  buildQ('كم عدد أركان الإسلام؟', '5', ['4','6','7'], 'easy', 'fiqh', () => 0.35),
  buildQ('كم عدد أركان الإيمان؟', '6', ['5','7','4'], 'easy', 'aqeedah', () => 0.35),
  buildQ('كم عدد الصلوات المفروضة في اليوم؟', '5', ['3','4','6'], 'easy', 'fiqh', () => 0.35),
  buildQ('كم مقدار زكاة المال؟', '2.5%', ['1%','5%','10%'], 'easy', 'fiqh', () => 0.35),
  buildQ('في أي شهر نزل القرآن الكريم؟', 'رمضان', ['شعبان','رجب','ذو الحجة'], 'easy', 'quran', () => 0.35),
];

// -------- Public API --------
let cache: Q[] | null = null;

export function buildBank(seed = 1): Q[] {
  if (cache) return cache;
  const rand = mulberry32(seed);
  const out: Q[] = [];
  SURAHS_META.forEach(s => out.push(...genFromSurah(s, rand)));
  out.push(...genProphets(rand));
  out.push(...STATIC);
  cache = out;
  return out;
}

export const TOTAL_VARIANTS_ESTIMATE = 1000000;

export function generateRoundSeed(): number {
  const cryptoSeed = typeof crypto !== 'undefined' && 'getRandomValues' in crypto
    ? crypto.getRandomValues(new Uint32Array(1))[0]
    : Math.floor(Math.random() * 0xffffffff);
  return (Date.now() ^ cryptoSeed) >>> 0;
}

export async function fetchApiQuizQuestions(seed: number, count = 12): Promise<Q[]> {
  const rand = mulberry32(seed ^ 0x9e3779b9);
  const picked = shuffleSeeded(SURAHS_META, rand).slice(0, Math.min(8, Math.max(3, Math.ceil(count / 2))));
  const out: Q[] = [];
  await Promise.all(picked.map(async (s) => {
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${s.n}/quran-uthmani`);
      const data = await res.json();
      const ayahs = data?.data?.ayahs || [];
      if (!ayahs.length) return;
      const ayah = ayahs[Math.floor(rand() * ayahs.length)];
      const text = String(ayah.text || '').replace(/[۝\d]+/g, '').trim();
      const shortText = text.length > 110 ? `${text.slice(0, 110)}…` : text;
      const surahDistractors = pickDistractors(SURAHS_META, s, rand, 3, x => x.name).map(x => x.name);
      out.push(buildQ(`في أي سورة وردت الآية: ${shortText}`, s.name, surahDistractors, 'hard', 'quran', rand, 'api'));
      out.push(buildQ(`ما رقم هذه الآية تقريباً في سورة ${s.name}: ${shortText}`, String(ayah.numberInSurah), uniqueNumberDistractors(ayah.numberInSurah, rand), 'hard', 'quran', rand, 'api'));
    } catch {}
  }));
  return shuffleSeeded(out, rand).slice(0, count);
}

/**
 * Build a randomized quiz for the current session.
 * Each call generates a fresh seed -> different questions every round.
 */
export function buildSessionQuiz(opts: {
  count?: number;
  difficulty?: Difficulty | 'all';
  category?: Category | 'all';
  seed?: number;
  excludeIds?: string[];
  apiQuestions?: Q[];
}): Q[] {
  const seed = opts.seed ?? generateRoundSeed();
  const rand = mulberry32(seed);
  let pool = [...(opts.apiQuestions || []), ...buildBank(seed)];
  if (opts.difficulty && opts.difficulty !== 'all') pool = pool.filter(q => q.difficulty === opts.difficulty);
  if (opts.category && opts.category !== 'all') pool = pool.filter(q => q.category === opts.category);
  const exclude = new Set(opts.excludeIds || []);
  const filtered = pool.filter(q => !exclude.has(q.id));
  if (filtered.length >= (opts.count ?? 10)) pool = filtered;
  const shuffled = shuffleSeeded(pool, rand);
  const count = opts.count ?? 10;
  // Re-shuffle option order so the correct index varies even on repeated questions
  return shuffled.slice(0, count).map(q => {
    const correct = q.options[q.answer];
    const newOpts = shuffleSeeded(q.options, rand);
    return { ...q, options: newOpts, answer: newOpts.indexOf(correct) };
  });
}
