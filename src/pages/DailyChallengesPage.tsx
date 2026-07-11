import React, { useEffect, useMemo, useState } from 'react';
import { Trophy, CheckCircle2, Circle, Flame, RotateCcw, Sparkles } from 'lucide-react';
import SEO from '@/components/SEO';
import PageHeader from '@/components/PageHeader';
import { toast } from 'sonner';

interface Challenge {
  id: string;
  title: string;
  desc: string;
  category: 'قرآن' | 'ذكر' | 'خُلق' | 'صلة' | 'علم';
  points: number;
}

const POOL: Challenge[] = [
  { id: 'c1', title: 'اقرأ صفحة واحدة من المصحف', desc: 'صفحة واحدة فقط تكفي لبدء العادة', category: 'قرآن', points: 10 },
  { id: 'c2', title: 'احفظ آية جديدة', desc: 'اختر آية قصيرة واحفظها وأعِدها 10 مرات', category: 'قرآن', points: 15 },
  { id: 'c3', title: 'استغفر 100 مرة', desc: 'قسّمها على أوقات اليوم لتسهل عليك', category: 'ذكر', points: 10 },
  { id: 'c4', title: 'سبّح 100 مرة', desc: 'سبحان الله وبحمده، سبحان الله العظيم', category: 'ذكر', points: 10 },
  { id: 'c5', title: 'صلِّ ركعتين نافلة', desc: 'ركعتان قبل الظهر أو بعد المغرب', category: 'قرآن', points: 15 },
  { id: 'c6', title: 'ابتسم في وجه من تلقى', desc: 'الابتسامة صدقة', category: 'خُلق', points: 5 },
  { id: 'c7', title: 'اتصل بأحد أقاربك', desc: 'صلة الرحم تزيد في العمر والرزق', category: 'صلة', points: 15 },
  { id: 'c8', title: 'ادعُ لوالديك', desc: 'رب اغفر لي ولوالدي وارحمهما كما ربياني صغيراً', category: 'صلة', points: 10 },
  { id: 'c9', title: 'اقرأ سورة الملك', desc: 'المُنجية من عذاب القبر', category: 'قرآن', points: 15 },
  { id: 'c10', title: 'تصدّق ولو بالقليل', desc: 'الصدقة تطفئ الخطيئة كما يطفئ الماء النار', category: 'خُلق', points: 15 },
  { id: 'c11', title: 'تعلّم حديثاً واحداً', desc: 'ابحث عن حديث قصير واحفظ معناه', category: 'علم', points: 10 },
  { id: 'c12', title: 'اقرأ أذكار الصباح', desc: 'حصنك اليومي من كل شر', category: 'ذكر', points: 10 },
  { id: 'c13', title: 'اقرأ أذكار المساء', desc: 'اطمئنانك قبل النوم', category: 'ذكر', points: 10 },
  { id: 'c14', title: 'اقرأ آية الكرسي بعد كل صلاة', desc: 'لم يمنعه من دخول الجنة إلا الموت', category: 'ذكر', points: 10 },
  { id: 'c15', title: 'صلِّ على النبي ﷺ 100 مرة', desc: 'من صلى عليّ صلاة صلى الله عليه بها عشراً', category: 'ذكر', points: 15 },
  { id: 'c16', title: 'اقرأ تفسير آية اليوم', desc: 'تفهّم كتاب ربك ولو آية', category: 'علم', points: 10 },
  { id: 'c17', title: 'اترك النميمة والغيبة', desc: 'احفظ لسانك عن أعراض المسلمين', category: 'خُلق', points: 20 },
  { id: 'c18', title: 'ساعد محتاجاً', desc: 'مساعدة عملية أو نصيحة أو دعاء', category: 'خُلق', points: 15 },
  { id: 'c19', title: 'اقرأ آخر آيتين من البقرة', desc: 'من قرأهما ليلاً كفتاه', category: 'قرآن', points: 10 },
  { id: 'c20', title: 'تفكّر في نعمة من نعم الله', desc: 'واشكر الله عليها بلسانك وقلبك', category: 'خُلق', points: 10 },
];

const CATEGORIES = ['الكل', 'قرآن', 'ذكر', 'خُلق', 'صلة', 'علم'] as const;

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

const pickDaily = (): Challenge[] => {
  const seed = new Date().getDate() + new Date().getMonth() * 31;
  const shuffled = [...POOL].sort((a, b) => {
    const ha = (a.id + seed).split('').reduce((s, c) => s + c.charCodeAt(0), 0);
    const hb = (b.id + seed).split('').reduce((s, c) => s + c.charCodeAt(0), 0);
    return ha - hb;
  });
  return shuffled.slice(0, 5);
};

const DailyChallengesPage: React.FC = () => {
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>('الكل');
  const dailyList = useMemo(pickDaily, []);
  const [done, setDone] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(`daily_challenges_${todayKey()}`);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  });
  const [streak, setStreak] = useState<number>(() => {
    try { return parseInt(localStorage.getItem('daily_challenges_streak') || '0'); } catch { return 0; }
  });

  useEffect(() => {
    localStorage.setItem(`daily_challenges_${todayKey()}`, JSON.stringify(done));
  }, [done]);

  const total = dailyList.length;
  const doneCount = dailyList.filter((c) => done[c.id]).length;
  const totalPoints = dailyList.filter((c) => done[c.id]).reduce((s, c) => s + c.points, 0);
  const progress = total ? Math.round((doneCount / total) * 100) : 0;

  useEffect(() => {
    if (doneCount === total && total > 0) {
      const lastDay = localStorage.getItem('daily_challenges_last');
      if (lastDay !== todayKey()) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        localStorage.setItem('daily_challenges_streak', String(newStreak));
        localStorage.setItem('daily_challenges_last', todayKey());
        toast.success(`أحسنت! أكملت تحديات اليوم • سلسلة ${newStreak} 🔥`);
      }
    }
  }, [doneCount, total, streak]);

  const toggle = (id: string) => {
    setDone((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filtered = cat === 'الكل' ? POOL : POOL.filter((c) => c.category === cat);

  return (
    <div className="page-container page-with-topbar" dir="rtl">
      <SEO title="التحديات اليومية | قلب القرآن" description="تحديات إيمانية يومية متجددة لتنمية علاقتك بالله." />
      <div className="max-w-lg mx-auto w-full px-4 pt-6">
        <PageHeader icon={Trophy} title="تحديات يومية" subtitle="خطوات صغيرة نحو الجنة" gradient="gold" showBack />

        <div className="mt-4 space-y-4">
          {/* Progress card */}
          <div className="rounded-2xl gradient-primary p-4 text-primary-foreground">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-xs opacity-90">تقدم اليوم</div>
                <div className="text-2xl font-black mt-0.5">{doneCount} / {total}</div>
              </div>
              <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1.5">
                <Flame className="w-4 h-4" />
                <span className="text-sm font-extrabold">{streak}</span>
              </div>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="text-[11px] opacity-90 mt-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {totalPoints} نقطة اليوم
            </div>
          </div>

          {/* Daily challenges */}
          <section>
            <h3 className="text-sm font-extrabold mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary" />
              تحديات اليوم
            </h3>
            <div className="space-y-2">
              {dailyList.map((c) => {
                const isDone = !!done[c.id];
                return (
                  <button
                    key={c.id}
                    onClick={() => toggle(c.id)}
                    className={`w-full text-right rounded-2xl border p-3.5 flex items-start gap-3 transition ${
                      isDone ? 'bg-primary/8 border-primary/40' : 'bg-card border-border/50'
                    }`}
                  >
                    {isDone
                      ? <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      : <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className={`text-sm font-extrabold ${isDone ? 'line-through opacity-60' : ''}`}>{c.title}</div>
                        <div className="text-[10px] font-bold text-primary bg-primary/10 rounded-full px-2 py-0.5">+{c.points}</div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{c.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* All library */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-extrabold">مكتبة التحديات</h3>
              <button
                onClick={() => {
                  setDone({});
                  toast.info('تم إعادة الضبط');
                }}
                className="text-[11px] text-muted-foreground inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> إعادة
              </button>
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-full border transition ${
                    cat === c ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary/60 border-border/50 text-muted-foreground'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="space-y-1.5 mt-2">
              {filtered.map((c) => (
                <div key={c.id} className="rounded-xl bg-card border border-border/50 p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-primary">{c.category}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold truncate">{c.title}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{c.desc}</div>
                  </div>
                  <div className="text-[10px] font-bold text-primary flex-shrink-0">+{c.points}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DailyChallengesPage;
