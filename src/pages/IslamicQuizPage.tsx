import React, { useEffect, useMemo, useState } from 'react';
import { Brain, CheckCircle2, XCircle, Trophy, RefreshCw, Sparkles, ChevronLeft, Target, Infinity as InfinityIcon } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { buildBank, buildSessionQuiz, type Q, type Difficulty, type Category } from '@/data/quizGenerator';

const MISSED_KEY = 'quiz_missed_registry';
const getMissed = (): Record<string, number> => {
  try { return JSON.parse(localStorage.getItem(MISSED_KEY) || '{}'); } catch { return {}; }
};
const bumpMissed = (qText: string) => {
  const m = getMissed();
  m[qText] = (m[qText] || 0) + 1;
  try { localStorage.setItem(MISSED_KEY, JSON.stringify(m)); } catch {}
};
const decrementMissed = (qText: string) => {
  const m = getMissed();
  if (m[qText]) {
    m[qText] = Math.max(0, m[qText] - 1);
    if (!m[qText]) delete m[qText];
    try { localStorage.setItem(MISSED_KEY, JSON.stringify(m)); } catch {}
  }
};

const CATEGORY_LABELS: Record<Category | 'all', string> = {
  all: 'الكل', quran: 'القرآن', hadith: 'الحديث', seerah: 'السيرة',
  fiqh: 'الفقه', aqeedah: 'العقيدة', history: 'التاريخ', general: 'عام',
};
const DIFFICULTY_LABELS: Record<Difficulty | 'all', string> = {
  all: 'جميع المستويات', easy: 'سهل', medium: 'متوسط', hard: 'صعب',
};

const FULL_BANK = buildBank();

const IslamicQuizPage: React.FC = () => {
  const [started, setStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all');
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [count, setCount] = useState(10);
  const [questions, setQuestions] = useState<Q[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState<Q[]>([]);
  const [drillMode, setDrillMode] = useState(false);
  const [missedCount, setMissedCount] = useState(() => Object.keys(getMissed()).length);

  useEffect(() => {
    if (!started) setMissedCount(Object.keys(getMissed()).length);
  }, [started, done]);

  const availableCount = useMemo(() => {
    let pool = FULL_BANK;
    if (difficulty !== 'all') pool = pool.filter(q => q.difficulty === difficulty);
    if (category !== 'all') pool = pool.filter(q => q.category === category);
    return pool.length;
  }, [difficulty, category]);

  const current = questions[idx];

  const pick = (i: number) => {
    if (selected !== null || !current) return;
    setSelected(i);
    if (i === current.answer) {
      setScore(s => s + 1);
      if (drillMode) decrementMissed(current.q);
    } else {
      setWrongAnswers(w => [...w, current]);
      bumpMissed(current.q);
    }
    setTimeout(() => {
      if (idx + 1 >= questions.length) setDone(true);
      else { setIdx(idx + 1); setSelected(null); }
    }, 900);
  };

  const start = (drill = false) => {
    let qs: Q[];
    if (drill) {
      const m = getMissed();
      const ranked = FULL_BANK
        .filter(q => m[q.q])
        .sort((a, b) => (m[b.q] || 0) - (m[a.q] || 0))
        .slice(0, Math.min(count, Object.keys(m).length));
      qs = ranked;
    } else {
      qs = buildSessionQuiz({ count, difficulty, category });
    }
    setDrillMode(drill);
    setQuestions(qs);
    setIdx(0); setSelected(null); setScore(0); setDone(false); setWrongAnswers([]);
    setStarted(true);
  };

  const reset = () => { setStarted(false); setDone(false); setDrillMode(false); };

  const difficultyBadge = (d: Difficulty) => {
    const map: Record<Difficulty, string> = {
      easy: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
      medium: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
      hard: 'bg-rose-500/15 text-rose-500 border-rose-500/30',
    };
    return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${map[d]}`}>{DIFFICULTY_LABELS[d]}</span>;
  };

  // ============ Setup Screen ============
  if (!started) {
    return (
      <div className="page-container page-with-topbar" dir="rtl">
        <div className="px-4 pt-6 max-w-lg mx-auto">
          <PageHeader icon={Brain} title="اختبار إسلامي" subtitle="آلاف الأسئلة المتجددة في كل جولة" showBack gradient="primary" />

          <div className="card-surface p-4 mb-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl gradient-gold flex items-center justify-center">
              <InfinityIcon className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-muted-foreground">حجم البنك الكلي</div>
              <div className="text-lg font-bold text-foreground">{FULL_BANK.length.toLocaleString('ar-EG')} سؤال</div>
              <div className="text-[10px] text-muted-foreground">تختلف الأسئلة وترتيب الخيارات في كل اختبار</div>
            </div>
          </div>

          <div className="card-surface p-5 mb-4">
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" /> الصعوبة
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {(['all', 'easy', 'medium', 'hard'] as const).map(d => (
                <button key={d} onClick={() => setDifficulty(d)}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all border-2 ${
                    difficulty === d ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary text-foreground border-transparent hover:border-primary/30'
                  }`}>
                  {DIFFICULTY_LABELS[d]}
                </button>
              ))}
            </div>
          </div>

          <div className="card-surface p-5 mb-4">
            <h3 className="text-sm font-bold text-foreground mb-3">التصنيف</h3>
            <div className="grid grid-cols-3 gap-2">
              {(['all', 'quran', 'hadith', 'seerah', 'fiqh', 'aqeedah', 'history', 'general'] as const).map(c => (
                <button key={c} onClick={() => setCategory(c)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border-2 ${
                    category === c ? 'bg-accent text-accent-foreground border-accent' : 'bg-secondary text-foreground border-transparent hover:border-accent/30'
                  }`}>
                  {CATEGORY_LABELS[c]}
                </button>
              ))}
            </div>
          </div>

          <div className="card-surface p-5 mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-foreground">عدد الأسئلة</h3>
              <span className="text-base font-bold text-primary">{count}</span>
            </div>
            <input type="range" min={5} max={50} step={5} value={count}
              onChange={e => setCount(parseInt(e.target.value))}
              className="w-full accent-primary" />
            <div className="text-xs text-muted-foreground text-center mt-2">
              متاح: {availableCount.toLocaleString('ar-EG')} سؤال بهذه التصفية
            </div>
          </div>

          {missedCount > 0 && (
            <button onClick={() => start(true)}
              className="w-full mb-3 bg-amber-500/15 text-amber-600 dark:text-amber-400 border-2 border-amber-500/40 py-3 rounded-2xl font-bold inline-flex items-center justify-center gap-2">
              <Target className="w-5 h-5" /> تدريب على أخطائك ({missedCount})
            </button>
          )}
          <button onClick={() => start(false)} disabled={availableCount === 0}
            className="w-full gradient-primary text-primary-foreground py-4 rounded-2xl font-bold shadow-emerald inline-flex items-center justify-center gap-2 disabled:opacity-50">
            <Brain className="w-5 h-5" /> ابدأ الاختبار
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container page-with-topbar" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <PageHeader icon={Brain} title="اختبار إسلامي" subtitle={`${CATEGORY_LABELS[category]} · ${DIFFICULTY_LABELS[difficulty]}`} showBack gradient="primary" />

        {!done && current ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground">سؤال {idx + 1} من {questions.length}</span>
              <span className="text-xs font-bold text-primary">النتيجة: {score}</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full mb-5 overflow-hidden">
              <div className="h-full gradient-primary transition-all" style={{ width: `${((idx) / questions.length) * 100}%` }} />
            </div>

            <div className="card-surface p-6 mb-4">
              <div className="flex items-center gap-2 mb-3">
                {difficultyBadge(current.difficulty)}
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30">
                  {CATEGORY_LABELS[current.category]}
                </span>
              </div>
              <h2 className="text-base font-bold text-foreground leading-relaxed">{current.q}</h2>
            </div>

            <div className="space-y-2">
              {current.options.map((opt, i) => {
                const isCorrect = i === current.answer;
                const isSelected = selected === i;
                const showState = selected !== null;
                return (
                  <button key={i} onClick={() => pick(i)} disabled={selected !== null}
                    className={`w-full p-4 rounded-2xl text-right font-semibold transition-all border-2 ${
                      showState && isCorrect ? 'bg-primary/15 border-primary text-primary'
                        : showState && isSelected ? 'bg-destructive/15 border-destructive text-destructive'
                        : 'card-surface border-transparent hover:border-primary/30'
                    }`}>
                    <div className="flex items-center justify-between">
                      <span>{opt}</span>
                      {showState && isCorrect && <CheckCircle2 className="w-5 h-5" />}
                      {showState && isSelected && !isCorrect && <XCircle className="w-5 h-5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div>
            <div className="card-surface p-8 text-center mb-4">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full gradient-gold flex items-center justify-center shadow-emerald">
                <Trophy className="w-10 h-10 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-gradient-primary mb-2">انتهى الاختبار</h2>
              <p className="text-muted-foreground mb-1">حصلت على</p>
              <div className="text-5xl font-bold text-foreground my-3">{score} / {questions.length}</div>
              <p className="text-sm text-muted-foreground mb-6">
                {score === questions.length ? 'ممتاز! إجابات كاملة' : score >= questions.length * 0.7 ? 'جيد جداً، استمر' : 'حاول مرة أخرى لتحسين نتيجتك'}
              </p>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => start(drillMode)} className="flex-1 min-w-[120px] gradient-primary text-primary-foreground px-4 py-3 rounded-2xl font-bold shadow-emerald inline-flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4" /> أسئلة جديدة
                </button>
                {wrongAnswers.length > 0 && !drillMode && (
                  <button onClick={() => start(true)} className="flex-1 min-w-[120px] bg-amber-500/15 text-amber-600 dark:text-amber-400 border-2 border-amber-500/40 px-4 py-3 rounded-2xl font-bold inline-flex items-center justify-center gap-2">
                    <Target className="w-4 h-4" /> تدريب الأخطاء
                  </button>
                )}
                <button onClick={reset} className="flex-1 min-w-[120px] bg-secondary text-foreground px-4 py-3 rounded-2xl font-bold inline-flex items-center justify-center gap-2">
                  <ChevronLeft className="w-4 h-4" /> الإعدادات
                </button>
              </div>
            </div>

            {wrongAnswers.length > 0 && (
              <div className="card-surface p-5">
                <h3 className="text-sm font-bold text-foreground mb-3">مراجعة الإجابات الخاطئة</h3>
                <div className="space-y-3">
                  {wrongAnswers.map((q, i) => (
                    <div key={i} className="border-r-2 border-destructive/40 pr-3">
                      <p className="text-sm font-semibold text-foreground mb-1">{q.q}</p>
                      <p className="text-xs text-primary">الإجابة الصحيحة: {q.options[q.answer]}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default IslamicQuizPage;
