import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ChevronLeft, PlayCircle, BookOpen, Mic2, Brain, Heart, ScrollText, CheckCircle2 } from 'lucide-react';
import SEO from '@/components/SEO';
import PageHeader from '@/components/PageHeader';

interface Path {
  id: string;
  title: string;
  description: string;
  level: 'مبتدئ' | 'متوسط' | 'متقدم';
  duration: string;
  icon: React.ElementType;
  gradient: string;
  steps: { title: string; desc: string; link?: { label: string; path: string } }[];
}

const PATHS: Path[] = [
  {
    id: 'tajweed',
    title: 'مسار التجويد',
    description: 'تعلّم أحكام التلاوة خطوة بخطوة من الصفر حتى الإتقان',
    level: 'مبتدئ',
    duration: '4 أسابيع',
    icon: Mic2,
    gradient: 'from-emerald-500 to-teal-600',
    steps: [
      { title: 'أساسيات التجويد', desc: 'تعريف التجويد، حكمه، آداب التلاوة', link: { label: 'صفحة التجويد', path: '/tajweed' } },
      { title: 'النون الساكنة والتنوين', desc: 'الإظهار، الإدغام، الإقلاب، الإخفاء' },
      { title: 'الميم الساكنة', desc: 'الإدغام، الإخفاء، والإظهار الشفوي' },
      { title: 'المدود', desc: 'الطبيعي، المتصل، المنفصل، اللازم' },
      { title: 'مخارج الحروف', desc: 'الجوف، الحلق، اللسان، الشفتان، الخيشوم' },
      { title: 'التطبيق العملي', desc: 'تلاوة مع قارئ مجود واستماع مركز', link: { label: 'القراء', path: '/reciters' } },
    ],
  },
  {
    id: 'hifz',
    title: 'مسار الحفظ',
    description: 'خطة عملية لحفظ القرآن مع أساليب التثبيت والمراجعة',
    level: 'متوسط',
    duration: 'مستمر',
    icon: Brain,
    gradient: 'from-amber-500 to-orange-600',
    steps: [
      { title: 'اختر خطة الختمة', desc: 'حدد وقت الختمة ثم قسّم الورد اليومي', link: { label: 'خطة الختمة', path: '/khatm-plan' } },
      { title: 'الحفظ الجديد', desc: 'اقرأ الآية 20 مرة نظراً ثم أعِدها مغلقاً' },
      { title: 'الربط بالمعنى', desc: 'اقرأ التفسير قبل الحفظ لتثبيت المعنى', link: { label: 'التفسير', path: '/tafsir' } },
      { title: 'المراجعة اليومية', desc: 'راجع الحفظ القديم كل يوم — الحفظ بلا مراجعة كالماء بلا وعاء' },
      { title: 'اختبار الذات', desc: 'اختبر حفظك أسبوعياً لتكشف مواضع الضعف', link: { label: 'اختبار الحفظ', path: '/memorization-test' } },
      { title: 'المتشابهات', desc: 'ركّز على الآيات المتشابهة لتجنب الخلط', link: { label: 'المتشابهات', path: '/mutashabihat' } },
    ],
  },
  {
    id: 'tafsir',
    title: 'مسار التفسير',
    description: 'ابدأ رحلة فهم كلام الله من التفسير الميسر إلى التدبر',
    level: 'مبتدئ',
    duration: '8 أسابيع',
    icon: BookOpen,
    gradient: 'from-sky-500 to-indigo-600',
    steps: [
      { title: 'التفسير الميسر', desc: 'ابدأ بالتفسير الأشهر والأيسر', link: { label: 'التفسير', path: '/tafsir' } },
      { title: 'أسباب النزول', desc: 'فهم السياق التاريخي للآيات', link: { label: 'أسباب النزول', path: '/asbab-al-nuzul' } },
      { title: 'قصص القرآن', desc: 'تدبر قصص الأنبياء والأمم', link: { label: 'قصص القرآن', path: '/quran-stories' } },
      { title: 'التدبر الموجه', desc: 'جلسة تدبر عملية 5-10 دقائق', link: { label: 'جلسة تدبر', path: '/guided-tadabbur' } },
      { title: 'المساعد الذكي', desc: 'اسأل عن أي آية بلغتك', link: { label: 'المساعد', path: '/ai-tafsir' } },
    ],
  },
  {
    id: 'ruh',
    title: 'مسار تزكية الروح',
    description: 'برنامج يومي لتصفية القلب وترقيق الروح مع الله',
    level: 'مبتدئ',
    duration: 'يومي',
    icon: Heart,
    gradient: 'from-rose-500 to-pink-600',
    steps: [
      { title: 'أذكار الصباح والمساء', desc: 'حصنك اليومي من كل شر', link: { label: 'الأذكار', path: '/adhkar' } },
      { title: 'الورد اليومي', desc: 'قراءة يومية ثابتة ولو يسيرة', link: { label: 'الورد', path: '/daily-wird' } },
      { title: 'آية اليوم وتأملها', desc: 'ابدأ صباحك برسالة إيمانية', link: { label: 'رسالة الصباح', path: '/daily-iman' } },
      { title: 'التسبيح والاستغفار', desc: 'اجعل لسانك رطباً بذكر الله', link: { label: 'التسبيح', path: '/tasbih-stats' } },
      { title: 'يوميات إيمانية', desc: 'دوّن لحظاتك الروحية مع الله', link: { label: 'اليوميات', path: '/faith-journal' } },
      { title: 'التحديات اليومية', desc: 'خطوات صغيرة نحو تغيير كبير', link: { label: 'التحديات', path: '/daily-challenges' } },
    ],
  },
  {
    id: 'seerah',
    title: 'مسار السيرة والعقيدة',
    description: 'تعرّف على نبيك ﷺ ورسّخ عقيدتك الصحيحة',
    level: 'متوسط',
    duration: '6 أسابيع',
    icon: ScrollText,
    gradient: 'from-purple-500 to-fuchsia-600',
    steps: [
      { title: 'أسماء الله الحسنى', desc: 'تعرف على ربك بأسمائه وصفاته', link: { label: 'الأسماء الحسنى', path: '/asma-al-husna' } },
      { title: 'قصص الأنبياء', desc: 'من آدم إلى محمد ﷺ', link: { label: 'الأنبياء', path: '/prophets' } },
      { title: 'الأحاديث النبوية', desc: 'من كلام سيد الخلق ﷺ', link: { label: 'الأحاديث', path: '/hadith' } },
      { title: 'المصطلحات الشرعية', desc: 'مفاهيم أساسية يجب معرفتها' },
    ],
  },
];

const LEVELS = ['الكل', 'مبتدئ', 'متوسط', 'متقدم'] as const;

const LearnPathsPage: React.FC = () => {
  const navigate = useNavigate();
  const [level, setLevel] = useState<(typeof LEVELS)[number]>('الكل');
  const [openId, setOpenId] = useState<string | null>(PATHS[0].id);
  const [done, setDone] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem('learn_steps_done') || '{}'); } catch { return {}; }
  });

  const filtered = useMemo(
    () => (level === 'الكل' ? PATHS : PATHS.filter((p) => p.level === level)),
    [level],
  );

  const toggleStep = (pathId: string, idx: number) => {
    const key = `${pathId}_${idx}`;
    setDone((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem('learn_steps_done', JSON.stringify(next));
      return next;
    });
  };

  const pathProgress = (p: Path) => {
    const total = p.steps.length;
    const doneCount = p.steps.filter((_, i) => done[`${p.id}_${i}`]).length;
    return { total, doneCount, percent: Math.round((doneCount / total) * 100) };
  };

  return (
    <div className="page-container page-with-topbar" dir="rtl">
      <SEO title="مسارات التعلم | قلب القرآن" description="مسارات تعلم شاملة: تجويد، حفظ، تفسير، تزكية، وسيرة." />
      <div className="max-w-lg mx-auto w-full px-4 pt-6">
        <PageHeader icon={GraduationCap} title="مسارات التعلّم" subtitle="رحلتك المنظمة نحو العلم" gradient="primary" showBack />

        <div className="mt-4 space-y-4">
          {/* Intro */}
          <div className="rounded-2xl bg-primary/5 border border-primary/20 p-4">
            <p className="text-xs leading-6 text-foreground/80">
              اختر المسار الذي يناسبك، وسِر فيه خطوة خطوة. كل مسار مكوّن من محاور مترابطة، وستجد روابط لكل صفحات التطبيق المرتبطة بالمحور.
            </p>
          </div>

          {/* Filter */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {LEVELS.map((l) => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-full border transition ${
                  level === l ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary/60 border-border/50 text-muted-foreground'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Paths */}
          <div className="space-y-3">
            {filtered.map((p) => {
              const Icon = p.icon;
              const open = openId === p.id;
              const { doneCount, total, percent } = pathProgress(p);
              return (
                <div key={p.id} className="rounded-2xl bg-card border border-border/50 overflow-hidden">
                  <button onClick={() => setOpenId(open ? null : p.id)} className="w-full text-right p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.gradient} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-extrabold text-sm">{p.title}</h3>
                          <span className="text-[10px] font-bold bg-secondary/70 text-muted-foreground px-2 py-0.5 rounded-full flex-shrink-0">{p.level}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="text-[10px] text-muted-foreground">{p.duration}</div>
                          <div className="text-[10px] font-bold text-primary">{doneCount}/{total}</div>
                          <div className="flex-1 h-1.5 bg-secondary/60 rounded-full overflow-hidden">
                            <div className={`h-full bg-gradient-to-r ${p.gradient}`} style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>

                  {open && (
                    <div className="border-t border-border/40 p-3 space-y-2 bg-secondary/20">
                      {p.steps.map((s, i) => {
                        const isDone = !!done[`${p.id}_${i}`];
                        return (
                          <div key={i} className="rounded-xl bg-card border border-border/50 p-3">
                            <div className="flex items-start gap-2.5">
                              <button
                                onClick={() => toggleStep(p.id, i)}
                                className="flex-shrink-0 mt-0.5"
                                aria-label={isDone ? 'إلغاء إكمال' : 'إكمال'}
                              >
                                {isDone
                                  ? <CheckCircle2 className="w-5 h-5 text-primary" />
                                  : <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/40" />}
                              </button>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold text-primary bg-primary/10 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">{i + 1}</span>
                                  <h4 className={`text-xs font-extrabold ${isDone ? 'line-through opacity-60' : ''}`}>{s.title}</h4>
                                </div>
                                <p className="text-[11px] leading-5 text-muted-foreground mt-1">{s.desc}</p>
                                {s.link && (
                                  <button
                                    onClick={() => navigate(s.link!.path)}
                                    className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 rounded-full px-2.5 py-1"
                                  >
                                    <PlayCircle className="w-3 h-3" /> {s.link.label}
                                    <ChevronLeft className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnPathsPage;
