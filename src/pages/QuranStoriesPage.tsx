import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scroll, Search, ChevronDown, ChevronLeft } from 'lucide-react';
import SEO from '@/components/SEO';
import PageHeader from '@/components/PageHeader';

interface Story {
  id: string;
  title: string;
  summary: string;
  lessons: string[];
  refs: { surah: number; surahName: string; ayahs: string }[];
  era: 'أنبياء' | 'أمم سابقة' | 'صحابة' | 'من عهد النبي ﷺ' | 'حكم وعبر';
}

const STORIES: Story[] = [
  {
    id: 's1', era: 'أنبياء',
    title: 'قصة آدم عليه السلام',
    summary: 'خلق الله آدم من طين ونفخ فيه من روحه، وأمر الملائكة بالسجود له فسجدوا إلا إبليس. أُسكن الجنة ثم أُهبط إلى الأرض بعد الأكل من الشجرة، وتاب الله عليه.',
    lessons: ['الاستكبار سبب الطرد من رحمة الله', 'التوبة تجبّ ما قبلها', 'الابتلاء سنة إلهية منذ آدم'],
    refs: [{ surah: 2, surahName: 'البقرة', ayahs: '30-38' }, { surah: 7, surahName: 'الأعراف', ayahs: '11-25' }, { surah: 20, surahName: 'طه', ayahs: '115-123' }],
  },
  {
    id: 's2', era: 'أنبياء',
    title: 'قصة نوح عليه السلام',
    summary: 'دعا نوح قومه ألف سنة إلا خمسين عاماً فما آمن معه إلا قليل. بنى السفينة بأمر الله، ونجّاه الله ومن معه من الطوفان، وأغرق الكافرين ومنهم ابنه.',
    lessons: ['الصبر على الدعوة أساس النجاح', 'رابطة الإيمان أقوى من رابطة الدم', 'وعد الله بالنجاة للمؤمنين حق'],
    refs: [{ surah: 11, surahName: 'هود', ayahs: '25-49' }, { surah: 71, surahName: 'نوح', ayahs: '1-28' }],
  },
  {
    id: 's3', era: 'أنبياء',
    title: 'قصة إبراهيم عليه السلام',
    summary: 'حطّم أصنام قومه، وألقوه في النار فجعلها الله برداً وسلاماً. هاجر وابتُلي بذبح ابنه إسماعيل ففداه الله بذبح عظيم، وبنى الكعبة مع ابنه.',
    lessons: ['التوحيد الخالص أساس الدعوة', 'اليقين بالله ينجّي من كل نار', 'الطاعة تفتح أبواب الفرج'],
    refs: [{ surah: 21, surahName: 'الأنبياء', ayahs: '51-73' }, { surah: 37, surahName: 'الصافات', ayahs: '99-113' }, { surah: 2, surahName: 'البقرة', ayahs: '124-127' }],
  },
  {
    id: 's4', era: 'أنبياء',
    title: 'قصة يوسف عليه السلام',
    summary: 'أحسن القصص. حسده إخوته وألقوه في الجب، فبيع في مصر، وسُجن ظلماً، ثم مكّنه الله في الأرض. جمع أهله في النهاية وسامحهم.',
    lessons: ['العفو بعد المقدرة سمة الأنبياء', 'مع العسر يسراً', 'الأخذ بالأسباب مع التوكل'],
    refs: [{ surah: 12, surahName: 'يوسف', ayahs: 'كاملة' }],
  },
  {
    id: 's5', era: 'أنبياء',
    title: 'قصة موسى وفرعون',
    summary: 'ربّى الله موسى في قصر عدوه، ثم أرسله إلى فرعون فأنكر وطغى. شقّ الله البحر لبني إسرائيل ونجّاهم، وأغرق فرعون وجنوده.',
    lessons: ['الظالم لا يفلح مهما تجبّر', 'النصر مع الصبر', 'التربية بيد الله لا بيد البشر'],
    refs: [{ surah: 20, surahName: 'طه', ayahs: '9-98' }, { surah: 26, surahName: 'الشعراء', ayahs: '10-68' }, { surah: 28, surahName: 'القصص', ayahs: '3-42' }],
  },
  {
    id: 's6', era: 'أنبياء',
    title: 'قصة عيسى ابن مريم',
    summary: 'حملت مريم بعيسى بكلمة من الله، وتكلّم في المهد، وأيّده الله بالمعجزات. رفعه الله إليه ولم يُقتل ولم يُصلب، وسيعود في آخر الزمان.',
    lessons: ['قدرة الله لا تحدها الأسباب', 'العفة والصدق سبيل النجاة', 'كلمة الله فوق كل مخلوق'],
    refs: [{ surah: 3, surahName: 'آل عمران', ayahs: '42-59' }, { surah: 19, surahName: 'مريم', ayahs: '16-36' }],
  },
  {
    id: 's7', era: 'أمم سابقة',
    title: 'أصحاب الكهف',
    summary: 'فتية آمنوا بربهم ففروا بدينهم إلى كهف، فأنامهم الله ثلاثمائة سنة وازدادوا تسعاً، آية للناس على قدرة الله على البعث.',
    lessons: ['الفرار بالدين أعظم الهجرات', 'اللجوء إلى الله يفتح كل باب', 'البعث حق'],
    refs: [{ surah: 18, surahName: 'الكهف', ayahs: '9-26' }],
  },
  {
    id: 's8', era: 'أمم سابقة',
    title: 'قارون وكنوزه',
    summary: 'كان من قوم موسى فبغى عليهم بكثرة ماله، ونسب النعمة لنفسه، فخُسف به وبداره الأرض عبرة للطغاة.',
    lessons: ['المال فتنة إن لم يُشكر', 'الغرور يقود إلى الهلاك', 'النعم منح من الله لا كسب مطلق'],
    refs: [{ surah: 28, surahName: 'القصص', ayahs: '76-82' }],
  },
  {
    id: 's9', era: 'أمم سابقة',
    title: 'أصحاب الأخدود',
    summary: 'قوم آمنوا بالله فحفر لهم الطاغية أخاديد النار وألقاهم فيها، فصبروا حتى الموت. ذكرهم الله ومدح ثباتهم في سورة البروج.',
    lessons: ['الثبات على الحق حتى الموت', 'المؤمن يبيع الدنيا للآخرة', 'ابتلاء المؤمنين سنة'],
    refs: [{ surah: 85, surahName: 'البروج', ayahs: '4-11' }],
  },
  {
    id: 's10', era: 'من عهد النبي ﷺ',
    title: 'غزوة بدر الكبرى',
    summary: 'أول لقاء عسكري بين المسلمين وقريش. نصر الله المؤمنين مع قلتهم على المشركين بجنود من الملائكة، وسمّاها القرآن يوم الفرقان.',
    lessons: ['النصر من عند الله لا بالعدد', 'الأخذ بالأسباب مع اليقين', 'دعاء النبي ﷺ ولحظات الاضطرار'],
    refs: [{ surah: 3, surahName: 'آل عمران', ayahs: '123-127' }, { surah: 8, surahName: 'الأنفال', ayahs: '5-19' }],
  },
  {
    id: 's11', era: 'من عهد النبي ﷺ',
    title: 'حادثة الإفك',
    summary: 'اتُّهمت أم المؤمنين عائشة رضي الله عنها بالإفك، فنزل القرآن ببراءتها من فوق سبع سماوات، درساً في حفظ الأعراض.',
    lessons: ['التثبت قبل الحكم', 'حفظ اللسان عن الأعراض', 'الله يدافع عن أوليائه'],
    refs: [{ surah: 24, surahName: 'النور', ayahs: '11-26' }],
  },
  {
    id: 's12', era: 'حكم وعبر',
    title: 'صاحب الجنّتين',
    summary: 'مثل ضربه الله لرجلين: أحدهما اغترّ بجنّته وكفر بالبعث، فأهلك الله جنته، ليعتبر الناس أن الدنيا زائلة.',
    lessons: ['المال زائل والدين باقٍ', 'ذكر الله عند النعمة يحفظها', 'العاقبة للمتقين'],
    refs: [{ surah: 18, surahName: 'الكهف', ayahs: '32-44' }],
  },
];

const ERAS = ['الكل', 'أنبياء', 'أمم سابقة', 'من عهد النبي ﷺ', 'حكم وعبر'] as const;

const QuranStoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [era, setEra] = useState<(typeof ERAS)[number]>('الكل');
  const [expanded, setExpanded] = useState<string | null>(STORIES[0].id);

  const filtered = useMemo(() => {
    const query = q.trim();
    return STORIES.filter((s) => {
      if (era !== 'الكل' && s.era !== era) return false;
      if (!query) return true;
      return s.title.includes(query) || s.summary.includes(query) || s.lessons.some((l) => l.includes(query));
    });
  }, [q, era]);

  return (
    <div className="page-container page-with-topbar" dir="rtl">
      <SEO title="قصص القرآن الكريم | قلب القرآن" description="قصص القرآن مع العبر والدروس المستفادة وربطها بالآيات." />
      <div className="max-w-lg mx-auto w-full px-4 pt-6">
        <PageHeader icon={Scroll} title="قصص القرآن" subtitle="عِبر ودروس من كتاب الله" gradient="gold" showBack />

        <div className="mt-4 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث في القصص..."
              className="w-full text-sm rounded-xl bg-card border border-border/50 py-2.5 pr-9 pl-3"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
            {ERAS.map((e) => (
              <button
                key={e}
                onClick={() => setEra(e)}
                className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-full border transition ${
                  era === e ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary/60 border-border/50 text-muted-foreground'
                }`}
              >
                {e}
              </button>
            ))}
          </div>

          <div className="text-xs text-muted-foreground text-center">
            {filtered.length} قصة
          </div>

          <div className="space-y-2.5">
            {filtered.map((s) => {
              const open = expanded === s.id;
              return (
                <div key={s.id} className="rounded-2xl bg-card border border-border/50 overflow-hidden">
                  <button
                    onClick={() => setExpanded(open ? null : s.id)}
                    className="w-full text-right p-4 flex items-start gap-3"
                    aria-expanded={open}
                  >
                    <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center flex-shrink-0">
                      <Scroll className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-extrabold text-sm">{s.title}</h3>
                        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{s.era}</div>
                    </div>
                  </button>

                  {open && (
                    <div className="px-4 pb-4 space-y-3 border-t border-border/40 pt-3">
                      <p className="text-sm leading-7 text-foreground/90">{s.summary}</p>

                      <div>
                        <div className="text-xs font-bold text-primary mb-1.5">الدروس المستفادة</div>
                        <ul className="space-y-1">
                          {s.lessons.map((l, i) => (
                            <li key={i} className="text-xs leading-6 text-muted-foreground flex gap-1.5">
                              <span className="text-primary">•</span> {l}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <div className="text-xs font-bold text-primary mb-1.5">مواضع القصة في القرآن</div>
                        <div className="flex flex-wrap gap-1.5">
                          {s.refs.map((r, i) => (
                            <button
                              key={i}
                              onClick={() => navigate(`/quran/${r.surah}`)}
                              className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-secondary/60 border border-border/50 hover:bg-secondary transition inline-flex items-center gap-1"
                            >
                              <ChevronLeft className="w-3 h-3" />
                              {r.surahName} {r.ayahs}
                            </button>
                          ))}
                        </div>
                      </div>
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

export default QuranStoriesPage;
