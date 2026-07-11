import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Mic, Search, Play, Pause, GraduationCap, ChevronLeft, Headphones, Book, Compass, Brain, CheckCircle2, Circle, Star, RotateCcw, Link2, Youtube, ExternalLink } from 'lucide-react';
import SEO from '@/components/SEO';
import PageHeader from '@/components/PageHeader';
import { useTajweedProgress } from '@/hooks/useTajweedProgress';
import { toast } from 'sonner';
import ReadingProgress from '@/components/ReadingProgress';


interface Rule {
  id: string;
  category: 'النون الساكنة والتنوين' | 'الميم الساكنة' | 'المدود' | 'القلقلة' | 'اللام' | 'الراء';
  name: string;
  short: string;
  detail: string;
  example: string;
  ref?: { surah: number; ayah: number };
  color: string;
}

const RULES: Rule[] = [
  { id: 'idhhar', category: 'النون الساكنة والتنوين', name: 'الإظهار الحلقي', short: 'النون قبل: ء هـ ع ح غ خ', detail: 'إخراج النون الساكنة أو التنوين من مخرجها دون غنة كاملة عند ملاقاة أحد حروف الحلق الستة.', example: 'مَنْ آمَنَ — يَنْهَوْنَ', ref: { surah: 2, ayah: 62 }, color: 'from-emerald-500/15 to-emerald-500/5' },
  { id: 'idgham', category: 'النون الساكنة والتنوين', name: 'الإدغام', short: 'يرملون — بغنة وبغير غنة', detail: 'إدخال النون أو التنوين في الحرف التالي بحيث يصيران حرفاً واحداً مشدداً. حروفه: ي ر م ل و ن.', example: 'مِنْ رَبِّهِمْ — مِنْ يَعْمَلْ', ref: { surah: 2, ayah: 5 }, color: 'from-amber-500/15 to-amber-500/5' },
  { id: 'iqlab', category: 'النون الساكنة والتنوين', name: 'الإقلاب', short: 'النون قبل الباء تُقلب ميماً', detail: 'قلب النون الساكنة أو التنوين ميماً مخفاة بغنة عند ملاقاة حرف الباء.', example: 'مِنْ بَعْدِ — أَنْبِئْهُمْ', ref: { surah: 2, ayah: 27 }, color: 'from-sky-500/15 to-sky-500/5' },
  { id: 'ikhfa', category: 'النون الساكنة والتنوين', name: 'الإخفاء الحقيقي', short: '15 حرفاً بين الإظهار والإدغام', detail: 'النطق بالنون بصفة بين الإظهار والإدغام مع بقاء الغنة عند 15 حرفاً.', example: 'مِنْ قَبْلُ — أَنْتُمْ', ref: { surah: 2, ayah: 4 }, color: 'from-violet-500/15 to-violet-500/5' },
  { id: 'mim-idgham', category: 'الميم الساكنة', name: 'إدغام شفوي', short: 'الميم الساكنة قبل الميم', detail: 'إدغام الميم الساكنة في ميم متحركة بعدها مع الغنة.', example: 'لَهُمْ مَا', ref: { surah: 2, ayah: 7 }, color: 'from-rose-500/15 to-rose-500/5' },
  { id: 'mim-ikhfa', category: 'الميم الساكنة', name: 'إخفاء شفوي', short: 'الميم الساكنة قبل الباء', detail: 'إخفاء الميم الساكنة عند ملاقاة الباء مع الغنة.', example: 'تَرْمِيهِمْ بِحِجَارَةٍ', ref: { surah: 105, ayah: 4 }, color: 'from-fuchsia-500/15 to-fuchsia-500/5' },
  { id: 'mim-idhhar', category: 'الميم الساكنة', name: 'إظهار شفوي', short: 'بقية الحروف', detail: 'إظهار الميم الساكنة عند ملاقاة بقية الحروف.', example: 'أَلَمْ تَرَ', ref: { surah: 105, ayah: 1 }, color: 'from-teal-500/15 to-teal-500/5' },
  { id: 'madd-tabii', category: 'المدود', name: 'المد الطبيعي', short: 'حركتان', detail: 'لا تقوم ذات الحرف إلا به، ويُمد بمقدار حركتين.', example: 'قَالَ — يَقُولُ', ref: { surah: 1, ayah: 2 }, color: 'from-blue-500/15 to-blue-500/5' },
  { id: 'madd-muttasil', category: 'المدود', name: 'المد المتصل', short: '4 أو 5 حركات', detail: 'أن يأتي بعد حرف المد همزة في نفس الكلمة. واجب المد.', example: 'جَاءَ — السَّمَاءِ', ref: { surah: 2, ayah: 22 }, color: 'from-cyan-500/15 to-cyan-500/5' },
  { id: 'madd-munfasil', category: 'المدود', name: 'المد المنفصل', short: '4 أو 5 حركات', detail: 'حرف المد آخر الكلمة والهمزة أول الكلمة التي تليها. جائز.', example: 'بِمَا أُنْزِلَ', ref: { surah: 2, ayah: 4 }, color: 'from-indigo-500/15 to-indigo-500/5' },
  { id: 'madd-lazim', category: 'المدود', name: 'المد اللازم', short: '6 حركات', detail: 'سكون أصلي بعد حرف المد. أقواها وأوجبها.', example: 'الْحَاقَّةُ — الضَّالِّينَ', ref: { surah: 1, ayah: 7 }, color: 'from-purple-500/15 to-purple-500/5' },
  { id: 'qalqala', category: 'القلقلة', name: 'القلقلة', short: 'قطب جد', detail: 'اضطراب الصوت عند النطق بالحرف ساكناً. صغرى في وسط الكلمة، كبرى عند الوقف.', example: 'يَدْخُلُونَ — أَحَدٌ', ref: { surah: 112, ayah: 1 }, color: 'from-orange-500/15 to-orange-500/5' },
  { id: 'lam-shamsi', category: 'اللام', name: 'اللام الشمسية', short: 'تُدغم في الحرف بعدها', detail: 'لام «أل» التعريف لا تُنطق عند 14 حرفاً، ويُشدد الحرف التالي.', example: 'الشَّمْسُ — النَّاسُ', ref: { surah: 114, ayah: 1 }, color: 'from-yellow-500/15 to-yellow-500/5' },
  { id: 'lam-qamari', category: 'اللام', name: 'اللام القمرية', short: 'تُنطق ظاهرة', detail: 'لام «أل» التعريف تُنطق ظاهرة عند 14 حرفاً.', example: 'الْقَمَرُ — الْكِتَابُ', ref: { surah: 1, ayah: 2 }, color: 'from-lime-500/15 to-lime-500/5' },
  { id: 'ra-tafkhim', category: 'الراء', name: 'تفخيم الراء', short: 'مع الفتح والضم', detail: 'تُفخم الراء إذا كانت مفتوحة أو مضمومة أو ساكنة بعد فتح/ضم.', example: 'رَبِّ — رُسُلٌ', ref: { surah: 1, ayah: 2 }, color: 'from-red-500/15 to-red-500/5' },
  { id: 'ra-tarqiq', category: 'الراء', name: 'ترقيق الراء', short: 'مع الكسر', detail: 'تُرقق الراء إذا كانت مكسورة أو ساكنة بعد كسر أصلي.', example: 'رِجَالٌ — فِرْعَوْنَ', ref: { surah: 7, ayah: 46 }, color: 'from-pink-500/15 to-pink-500/5' },
];

const CATEGORIES = ['الكل', ...Array.from(new Set(RULES.map((r) => r.category)))] as const;

interface Lesson {
  id: string;
  title: string;
  minutes: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  steps: string[];
  ruleIds: string[];
}

const LESSONS: Lesson[] = [
  {
    id: 'L1', title: 'الدرس الأول: مدخل التجويد وآداب التلاوة', minutes: 5, level: 'beginner',
    steps: [
      'تعريف التجويد: تحسين النطق بالقرآن وإعطاء الحروف حقها ومستحقها.',
      'حكم التجويد: العمل به واجب، والتعلّم النظري فرض كفاية.',
      'آداب التلاوة: الإخلاص، الطهارة، الاستعاذة، البسملة، الترتيل.',
      'تطبيق: ابدأ بقراءة الفاتحة بترتيل ودون عجلة.',
    ],
    ruleIds: ['madd-tabii', 'lam-qamari'],
  },
  {
    id: 'L2', title: 'الدرس الثاني: أحكام النون الساكنة والتنوين', minutes: 7, level: 'beginner',
    steps: [
      'الإظهار: عند حروف الحلق (ء هـ ع ح غ خ) بلا غنة كاملة.',
      'الإدغام: حروف «يرملون» مع الغنة في (ي ن م و) وبدونها في (ل ر).',
      'الإقلاب: قلب النون ميماً مخفاة عند الباء.',
      'الإخفاء: بصفة بين الإظهار والإدغام مع الغنة عند 15 حرفاً.',
      'تدريب: استمع للأمثلة ثم اقرأها بنفسك ثلاث مرات.',
    ],
    ruleIds: ['idhhar', 'idgham', 'iqlab', 'ikhfa'],
  },
  {
    id: 'L3', title: 'الدرس الثالث: أحكام الميم الساكنة', minutes: 5, level: 'beginner',
    steps: [
      'إدغام شفوي: ميم ساكنة قبل ميم متحركة مع الغنة.',
      'إخفاء شفوي: ميم ساكنة قبل الباء مع الغنة.',
      'إظهار شفوي: في باقي الحروف، أوضحها عند الواو والفاء.',
    ],
    ruleIds: ['mim-idgham', 'mim-ikhfa', 'mim-idhhar'],
  },
  {
    id: 'L4', title: 'الدرس الرابع: المدود — الطبيعي والفرعي', minutes: 8, level: 'intermediate',
    steps: [
      'المد الطبيعي: حركتان فقط.',
      'المتصل: واجب 4-5 حركات (همزة في نفس الكلمة).',
      'المنفصل: جائز 4-5 حركات (همزة في كلمة تالية).',
      'اللازم: 6 حركات (سكون أصلي بعد حرف المد).',
      'تدريب: عدّ الحركات بضربات اليد أثناء التلاوة.',
    ],
    ruleIds: ['madd-tabii', 'madd-muttasil', 'madd-munfasil', 'madd-lazim'],
  },
  {
    id: 'L5', title: 'الدرس الخامس: القلقلة واللام والراء', minutes: 6, level: 'intermediate',
    steps: [
      'القلقلة: اضطراب الصوت في «قطب جد» — صغرى في الوسط، كبرى عند الوقف.',
      'اللام الشمسية والقمرية في «أل» التعريف.',
      'تفخيم الراء وترقيقها بحسب حركتها وما قبلها.',
    ],
    ruleIds: ['qalqala', 'lam-shamsi', 'lam-qamari', 'ra-tafkhim', 'ra-tarqiq'],
  },
  {
    id: 'L6', title: 'الدرس السادس: مخارج الحروف وصفاتها', minutes: 10, level: 'advanced',
    steps: [
      'المخارج العامة: الجوف، الحلق، اللسان، الشفتان، الخيشوم.',
      'صفات الحروف لها ضد: الهمس/الجهر، الشدة/الرخاوة، الاستعلاء/الاستفال، الإطباق/الانفتاح.',
      'صفات لا ضد لها: الصفير، القلقلة، اللين، الانحراف، التكرير، التفشي، الاستطالة، الغنة.',
      'تطبيق: ميّز حروف الإطباق (ص ض ط ظ) وفخّمها دائماً.',
    ],
    ruleIds: ['qalqala', 'ra-tafkhim'],
  },
  {
    id: 'L7', title: 'الدرس السابع: الوقف والابتداء', minutes: 8, level: 'advanced',
    steps: [
      'أنواع الوقف: تام، كافٍ، حسن، قبيح.',
      'علامات المصحف: مـ (لازم)، لا (ممنوع)، ج (جائز)، صلى/قلى (الأولى الوصل/الوقف).',
      'هاء التأنيث: تُقلب تاء عند الوصل وتاءً مربوطة عند الوقف.',
      'الابتداء يجب أن يكون بكلام مستقل المعنى.',
    ],
    ruleIds: [],
  },
];

const TOPIC_LINKS = [
  { label: 'المصحف', path: '/quran', icon: Book },
  { label: 'القراء', path: '/reciters', icon: Headphones },
  { label: 'اختبار الحفظ', path: '/memorization-test', icon: Brain },
  { label: 'المتشابهات', path: '/mutashabihat', icon: Compass },
  { label: 'جلسة تدبر', path: '/guided-tadabbur', icon: BookOpen },
];

const RECITERS = [
  { id: 'ar.alafasy', name: 'مشاري العفاسي' },
  { id: 'ar.husary', name: 'محمود الحصري' },
  { id: 'ar.minshawi', name: 'محمد المنشاوي' },
  { id: 'ar.abdulbasitmurattal', name: 'عبد الباسط' },
  { id: 'ar.sudais', name: 'عبد الرحمن السديس' },
];

const fetchAyahAudio = async (surah: number, ayah: number, reciter: string): Promise<string | null> => {
  try {
    const r = await fetch(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/${reciter}`);
    const j = await r.json();
    return j?.data?.audio || null;
  } catch {
    return null;
  }
};


const TajweedPage: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<typeof CATEGORIES[number]>('الكل');
  const [tab, setTab] = useState<'rules' | 'lessons' | 'videos'>('rules');
  const [expandedLesson, setExpandedLesson] = useState<string | null>(LESSONS[0].id);
  const [levelFilter, setLevelFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [reciter, setReciter] = useState<string>(() => localStorage.getItem('tajweed_reciter') || 'ar.alafasy');
  const { progress, toggleComplete, rate, reset, stats } = useTajweedProgress();
  const lessonStats = stats(LESSONS.length);

  // audio state
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loadingAudio, setLoadingAudio] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cacheRef = useRef<Record<string, string>>({});

  const filtered = useMemo(() => {
    const q = query.trim();
    return RULES.filter((r) => {
      if (cat !== 'الكل' && r.category !== cat) return false;
      if (!q) return true;
      return r.name.includes(q) || r.short.includes(q) || r.detail.includes(q) || r.example.includes(q);
    });
  }, [query, cat]);

  const filteredLessons = useMemo(() => {
    const q = query.trim();
    return LESSONS.filter((l) => {
      if (levelFilter !== 'all' && l.level !== levelFilter) return false;
      if (!q) return true;
      return l.title.includes(q) ||
        l.steps.some((s) => s.includes(q)) ||
        l.ruleIds.some((rid) => {
          const r = RULES.find((x) => x.id === rid);
          return r && (r.name.includes(q) || r.short.includes(q));
        });
    });
  }, [query, levelFilter]);

  // Reverse map: which lessons reference a given rule
  const lessonsForRule = useMemo(() => {
    const map: Record<string, Lesson[]> = {};
    LESSONS.forEach((l) => l.ruleIds.forEach((rid) => {
      (map[rid] = map[rid] || []).push(l);
    }));
    return map;
  }, []);

  const changeReciter = (id: string) => {
    setReciter(id);
    localStorage.setItem('tajweed_reciter', id);
    cacheRef.current = {};
    audioRef.current?.pause();
    setPlayingId(null);
  };

  const togglePlay = async (rule: Rule) => {
    if (!rule.ref) return;
    if (playingId === rule.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    audioRef.current?.pause();
    setLoadingAudio(rule.id);
    const key = `${rule.id}_${reciter}`;
    let url = cacheRef.current[key];
    if (!url) {
      const got = await fetchAyahAudio(rule.ref.surah, rule.ref.ayah, reciter);
      if (got) {
        url = got;
        cacheRef.current[key] = got;
      }
    }
    setLoadingAudio(null);
    if (!url) return;

    const a = new Audio(url);
    audioRef.current = a;
    a.onended = () => setPlayingId(null);
    a.onerror = () => setPlayingId(null);
    setPlayingId(rule.id);
    try { await a.play(); } catch { setPlayingId(null); }
  };

  const scrollToRule = (id: string) => {
    setTab('rules');
    setCat('الكل');
    setQuery('');
    setTimeout(() => {
      const el = document.getElementById(`rule-${id}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el?.classList.add('ring-2', 'ring-primary');
      setTimeout(() => el?.classList.remove('ring-2', 'ring-primary'), 1600);
    }, 80);
  };

  const openLesson = (id: string) => {
    setTab('lessons');
    setQuery('');
    setExpandedLesson(id);
    setTimeout(() => {
      const el = document.getElementById(`lesson-${id}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 80);
  };

  const handleToggleComplete = (l: Lesson) => {
    const wasDone = !!progress[l.id]?.completed;
    toggleComplete(l.id);
    toast.success(wasDone ? `أُلغي إكمال: ${l.title}` : `أحسنت! تم إكمال: ${l.title}`);
  };

  return (
    <div className="page-container page-with-topbar" dir="rtl">
      <SEO title="أحكام التجويد والتلاوة | قلب القرآن" description="مرجع تفاعلي لأحكام التجويد مع دروس قصيرة وأمثلة صوتية." />
      <ReadingProgress storageKey={`read_pos_tajweed_${tab}`} label={tab === 'rules' ? 'الأحكام' : 'الدروس'} ariaLabel="تقدم صفحة التجويد" />
      <div className="max-w-lg mx-auto w-full px-4 pt-6">
      <PageHeader icon={Mic} title="التجويد والتلاوة" subtitle="دروس وأمثلة صوتية" gradient="primary" showBack />

      <div className="px-4 mt-3 space-y-3">
        {/* Tabs */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-secondary/60 rounded-2xl">
          {[
            { id: 'rules' as const, label: 'الأحكام', icon: BookOpen },
            { id: 'lessons' as const, label: 'دروس', icon: GraduationCap },
            { id: 'videos' as const, label: 'فيديوهات', icon: Youtube },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-extrabold transition ${
                  tab === t.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Unified search across rules + lessons */}
        <div className="relative">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tab === 'rules' ? 'ابحث عن حكم...' : 'ابحث في الدروس...'}
            className="w-full text-sm rounded-xl bg-card border border-border/50 py-2.5 pr-9 pl-3"
          />
        </div>

        {tab === 'rules' && (
          <>

            <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition ${
                    cat === c
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-secondary/60 text-foreground border-border/40'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Reciter selector — applies to all examples */}
            <div className="rounded-2xl border border-accent/30 bg-gradient-to-l from-accent/10 to-transparent p-3">
              <div className="flex items-center gap-2 mb-2">
                <Headphones className="w-4 h-4 text-accent" />
                <div className="text-[11px] font-extrabold text-accent tracking-widest">قارن بين القرّاء</div>
              </div>
              <div className="flex gap-1.5 overflow-x-auto -mx-1 px-1">
                {RECITERS.map((rc) => (
                  <button
                    key={rc.id}
                    onClick={() => changeReciter(rc.id)}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold border transition ${
                      reciter === rc.id
                        ? 'bg-accent text-accent-foreground border-accent shadow-sm'
                        : 'bg-secondary/60 text-foreground border-border/40'
                    }`}
                  >
                    {rc.name}
                  </button>
                ))}
              </div>
            </div>


            <div className="rounded-2xl border border-primary/20 bg-gradient-to-l from-primary/10 to-transparent p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <BookOpen className="w-4 h-4 text-primary" />
                <div className="text-xs font-extrabold text-primary tracking-widest">آداب التلاوة</div>
              </div>
              <ul className="text-[12px] leading-6 text-muted-foreground list-disc pr-5 space-y-1">
                <li>الإخلاص والاستحضار لعظمة كلام الله.</li>
                <li>الطهارة والاستعاذة والبسملة.</li>
                <li>الترتيل والتدبر دون استعجال.</li>
                <li>تحسين الصوت ومراعاة الوقف والابتداء.</li>
              </ul>
            </div>

            <div className="space-y-2.5">
              {filtered.map((r) => {
                const isPlaying = playingId === r.id;
                const isLoading = loadingAudio === r.id;
                return (
                  <article
                    id={`rule-${r.id}`}
                    key={r.id}
                    className={`rounded-2xl border border-border/50 bg-gradient-to-br ${r.color} p-4 transition-all`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <h3 className="text-base font-extrabold text-foreground">{r.name}</h3>
                      <span className="text-[10px] font-bold text-muted-foreground bg-background/60 rounded-full px-2 py-0.5">
                        {r.category}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-foreground/80 mb-1.5">{r.short}</p>
                    <p className="text-[13px] leading-7 text-muted-foreground mb-2">{r.detail}</p>
                    <div className="rounded-xl bg-background/70 border border-border/40 p-2.5">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-[10px] text-muted-foreground">مثال</div>
                        {r.ref && (
                          <button
                            onClick={() => togglePlay(r)}
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full transition ${
                              isPlaying ? 'bg-primary text-primary-foreground' : 'bg-secondary/70 text-foreground'
                            }`}
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : isPlaying ? (
                              <Pause className="w-3 h-3" />
                            ) : (
                              <Play className="w-3 h-3" />
                            )}
                            {isPlaying ? 'إيقاف' : 'تلاوة'} ({r.ref.surah}:{r.ref.ayah})
                          </button>
                        )}
                      </div>
                      <div className="font-amiri text-lg text-foreground text-center" dir="rtl">{r.example}</div>
                    </div>
                    {lessonsForRule[r.id]?.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                        <Link2 className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground font-bold">يظهر في:</span>
                        {lessonsForRule[r.id].map((l) => (
                          <button
                            key={l.id}
                            onClick={() => openLesson(l.id)}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/25"
                          >
                            {l.title.split('—')[0].replace(/الدرس.*?:/, '').trim() || l.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </article>
                );
              })}
              {filtered.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-8">لا توجد نتائج مطابقة.</div>
              )}
            </div>
          </>
        )}

        {tab === 'lessons' && (
          <div className="space-y-2.5">
            <div className="rounded-2xl border border-accent/30 bg-gradient-to-l from-accent/10 to-transparent p-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-accent" />
                  <div className="text-xs font-extrabold text-accent tracking-widest">المسار التدريبي</div>
                </div>
                {lessonStats.done > 0 && (
                  <button
                    onClick={() => { reset(); toast.success('تمت إعادة ضبط التقدم'); }}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="w-3 h-3" /> إعادة
                  </button>
                )}
              </div>
              <p className="text-[12px] leading-6 text-muted-foreground mb-2">
                سبع جلسات قصيرة بمستويات متدرّجة — من المبادئ حتى المخارج والوقف.
              </p>
              {/* Level filter */}
              <div className="flex gap-1.5 mb-2">
                {([
                  { id: 'all', label: 'الكل' },
                  { id: 'beginner', label: 'مبتدئ' },
                  { id: 'intermediate', label: 'متوسط' },
                  { id: 'advanced', label: 'متقدم' },
                ] as const).map((lv) => (
                  <button
                    key={lv.id}
                    onClick={() => setLevelFilter(lv.id)}
                    className={`flex-1 px-2 py-1 rounded-lg text-[10px] font-extrabold border transition ${
                      levelFilter === lv.id
                        ? 'bg-accent text-accent-foreground border-accent'
                        : 'bg-background/60 text-muted-foreground border-border/40'
                    }`}
                  >
                    {lv.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                <span className="text-foreground">التقدم {lessonStats.done}/{lessonStats.total}</span>
                <span className="text-accent">{lessonStats.percent}%</span>
              </div>
              <div className="h-2 rounded-full bg-secondary/60 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-l from-primary to-accent transition-all"
                  style={{ width: `${lessonStats.percent}%` }}
                />
              </div>
              {lessonStats.avgRating > 0 && (
                <div className="mt-2 text-[11px] text-muted-foreground flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  متوسط تقييمك: {lessonStats.avgRating.toFixed(1)}/5
                </div>
              )}
            </div>
            {filteredLessons.map((l) => {
              const idx = LESSONS.indexOf(l);
              const open = expandedLesson === l.id;
              const rec = progress[l.id];
              const done = !!rec?.completed;
              const rating = rec?.rating || 0;
              return (
                <article
                  id={`lesson-${l.id}`}
                  key={l.id}
                  className={`rounded-2xl border bg-card overflow-hidden transition-all ${done ? 'border-primary/40 bg-primary/5' : 'border-border/50'}`}
                >
                  <button
                    onClick={() => setExpandedLesson(open ? null : l.id)}
                    className="w-full flex items-center justify-between gap-3 p-4 text-right"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-extrabold shrink-0 ${done ? 'bg-primary text-primary-foreground' : 'bg-primary/15 text-primary'}`}>
                        {done ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-extrabold text-foreground truncate">{l.title}</div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                          <span>~{l.minutes} دقائق</span>
                          {rating > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-amber-500">
                              <Star className="w-3 h-3 fill-current" />{rating}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <ChevronLeft className={`w-4 h-4 text-muted-foreground transition-transform ${open ? '-rotate-90' : ''}`} />
                  </button>
                  {open && (
                    <div className="px-4 pb-4 space-y-3">
                      <ol className="text-[13px] leading-7 text-foreground list-decimal pr-5 space-y-1">
                        {l.steps.map((s, i) => <li key={i}>{s}</li>)}
                      </ol>
                      {l.ruleIds.length > 0 && (
                        <div>
                          <div className="text-[11px] font-bold text-muted-foreground mb-1.5">الأحكام المرتبطة</div>
                          <div className="flex flex-wrap gap-1.5">
                            {l.ruleIds.map((rid) => {
                              const rule = RULES.find((x) => x.id === rid);
                              if (!rule) return null;
                              return (
                                <button
                                  key={rid}
                                  onClick={() => scrollToRule(rid)}
                                  className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
                                >
                                  {rule.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {/* Rating */}
                      <div className="rounded-xl bg-background/60 border border-border/40 p-2.5">
                        <div className="text-[11px] font-bold text-muted-foreground mb-1.5">قيّم هذا الدرس</div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <button
                                key={n}
                                onClick={() => { rate(l.id, n); toast.success(`تقييمك: ${n}/5`); }}
                                aria-label={`تقييم ${n}`}
                                className="p-1"
                              >
                                <Star
                                  className={`w-5 h-5 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40'}`}
                                />
                              </button>
                            ))}
                          </div>
                          <button
                            onClick={() => handleToggleComplete(l)}
                            className={`inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1.5 rounded-full transition ${
                              done ? 'bg-primary text-primary-foreground' : 'bg-secondary/70 text-foreground border border-border/40'
                            }`}
                          >
                            {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                            {done ? 'مكتمل' : 'اعتبره مكتملاً'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
            {filteredLessons.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-8">لا توجد دروس مطابقة.</div>
            )}
          </div>
        )}

        {/* Related topics */}
        <div className="rounded-2xl border border-border/50 bg-card p-4">
          <div className="text-xs font-extrabold text-foreground mb-2">مواضيع مرتبطة</div>
          <div className="flex flex-wrap gap-2">
            {TOPIC_LINKS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.path}
                  onClick={() => navigate(t.path)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/70 border border-border/40 text-xs font-bold text-foreground active:scale-95"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default TajweedPage;
