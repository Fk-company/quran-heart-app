import React, { useMemo, useState } from 'react';
import { Brain, CheckCircle2, XCircle, Trophy, RefreshCw } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

interface Q { q: string; options: string[]; answer: number; explain?: string; }

const BANK: Q[] = [
  { q: 'كم عدد سور القرآن الكريم؟', options: ['110', '114', '120', '116'], answer: 1 },
  { q: 'ما أطول سورة في القرآن الكريم؟', options: ['آل عمران', 'النساء', 'البقرة', 'المائدة'], answer: 2 },
  { q: 'ما أقصر سورة في القرآن؟', options: ['الفاتحة', 'الإخلاص', 'الكوثر', 'الناس'], answer: 2 },
  { q: 'في أي سورة يوجد آية الكرسي؟', options: ['البقرة', 'آل عمران', 'يس', 'الفاتحة'], answer: 0 },
  { q: 'كم عدد أركان الإسلام؟', options: ['4', '5', '6', '7'], answer: 1 },
  { q: 'كم عدد أركان الإيمان؟', options: ['5', '6', '7', '4'], answer: 1 },
  { q: 'في أي شهر نزل القرآن الكريم؟', options: ['شعبان', 'رمضان', 'رجب', 'ذو الحجة'], answer: 1 },
  { q: 'من هو أول الخلفاء الراشدين؟', options: ['عمر بن الخطاب', 'أبو بكر الصديق', 'علي بن أبي طالب', 'عثمان بن عفان'], answer: 1 },
  { q: 'كم مرة ذكر اسم محمد ﷺ في القرآن؟', options: ['3', '4', '5', '7'], answer: 1 },
  { q: 'ما السورة التي تسمى قلب القرآن؟', options: ['الفاتحة', 'يس', 'الرحمن', 'الإخلاص'], answer: 1 },
  { q: 'كم عدد أجزاء القرآن الكريم؟', options: ['20', '30', '40', '60'], answer: 1 },
  { q: 'من هو خاتم الأنبياء والمرسلين؟', options: ['عيسى عليه السلام', 'موسى عليه السلام', 'محمد ﷺ', 'إبراهيم عليه السلام'], answer: 2 },
  { q: 'في أي غزوة نزل قوله تعالى "اليوم أكملت لكم دينكم"؟', options: ['بدر', 'أحد', 'حجة الوداع', 'الخندق'], answer: 2 },
  { q: 'ما السورة التي ليس فيها بسملة؟', options: ['التوبة', 'الفاتحة', 'البقرة', 'النمل'], answer: 0 },
  { q: 'كم عدد آيات سورة الفاتحة؟', options: ['5', '6', '7', '8'], answer: 2 },
];

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

const IslamicQuizPage: React.FC = () => {
  const [round, setRound] = useState(0);
  const questions = useMemo(() => shuffle(BANK).slice(0, 10), [round]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const current = questions[idx];

  const pick = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === current.answer) setScore(s => s + 1);
    setTimeout(() => {
      if (idx + 1 >= questions.length) setDone(true);
      else { setIdx(idx + 1); setSelected(null); }
    }, 900);
  };

  const reset = () => {
    setRound(r => r + 1); setIdx(0); setSelected(null); setScore(0); setDone(false);
  };

  return (
    <div className="page-container page-with-topbar" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <PageHeader icon={Brain} title="اختبار إسلامي" subtitle="اختبر معلوماتك الدينية" showBack gradient="primary" />

        {!done ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground">سؤال {idx + 1} من {questions.length}</span>
              <span className="text-xs font-bold text-primary">النتيجة: {score}</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full mb-5 overflow-hidden">
              <div className="h-full gradient-primary transition-all" style={{ width: `${((idx) / questions.length) * 100}%` }} />
            </div>

            <div className="card-surface p-6 mb-4">
              <h2 className="text-base font-bold text-foreground leading-relaxed">{current.q}</h2>
            </div>

            <div className="space-y-2">
              {current.options.map((opt, i) => {
                const isCorrect = i === current.answer;
                const isSelected = selected === i;
                const showState = selected !== null;
                return (
                  <button
                    key={i}
                    onClick={() => pick(i)}
                    disabled={selected !== null}
                    className={`w-full p-4 rounded-2xl text-right font-semibold transition-all border-2 ${
                      showState && isCorrect
                        ? 'bg-primary/15 border-primary text-primary'
                        : showState && isSelected
                          ? 'bg-destructive/15 border-destructive text-destructive'
                          : 'card-surface border-transparent hover:border-primary/30'
                    }`}
                  >
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
          <div className="card-surface p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full gradient-gold flex items-center justify-center shadow-emerald">
              <Trophy className="w-10 h-10 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-gradient-primary mb-2">انتهى الاختبار</h2>
            <p className="text-muted-foreground mb-1">حصلت على</p>
            <div className="text-5xl font-bold text-foreground my-3">{score} / {questions.length}</div>
            <p className="text-sm text-muted-foreground mb-6">
              {score === questions.length ? 'ممتاز! إجابات كاملة 🎯' : score >= questions.length * 0.7 ? 'جيد جداً، استمر' : 'حاول مرة أخرى لتحسين نتيجتك'}
            </p>
            <button onClick={reset} className="gradient-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold shadow-emerald inline-flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> اختبار جديد
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default IslamicQuizPage;
