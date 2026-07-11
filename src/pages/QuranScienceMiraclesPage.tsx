import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Atom, Search, ChevronDown, ChevronLeft } from 'lucide-react';
import SEO from '@/components/SEO';
import PageHeader from '@/components/PageHeader';

interface Miracle {
  id: string;
  title: string;
  category: 'كون' | 'أرض' | 'إنسان' | 'بحار' | 'نبات وحيوان' | 'تاريخ';
  ayah: string;
  ref: { surah: number; surahName: string; ayah: string };
  explanation: string;
}

const DATA: Miracle[] = [
  {
    id: 'm1', category: 'كون',
    title: 'توسع الكون',
    ayah: 'وَالسَّمَاءَ بَنَيْنَاهَا بِأَيْدٍ وَإِنَّا لَمُوسِعُونَ',
    ref: { surah: 51, surahName: 'الذاريات', ayah: '47' },
    explanation: 'أشار القرآن قبل 1400 سنة إلى توسع الكون، وهو ما أثبته العالم إدوين هابل سنة 1929م حين اكتشف أن المجرات تبتعد عن بعضها باستمرار.',
  },
  {
    id: 'm2', category: 'كون',
    title: 'الانفجار العظيم',
    ayah: 'أَوَلَمْ يَرَ الَّذِينَ كَفَرُوا أَنَّ السَّمَاوَاتِ وَالْأَرْضَ كَانَتَا رَتْقًا فَفَتَقْنَاهُمَا',
    ref: { surah: 21, surahName: 'الأنبياء', ayah: '30' },
    explanation: 'وصف علمي دقيق لنظرية "الانفجار العظيم" التي تقول إن الكون كان كتلة واحدة ثم انفصلت السماوات عن الأرض.',
  },
  {
    id: 'm3', category: 'كون',
    title: 'دوران الكواكب',
    ayah: 'وَهُوَ الَّذِي خَلَقَ اللَّيْلَ وَالنَّهَارَ وَالشَّمْسَ وَالْقَمَرَ ۖ كُلٌّ فِي فَلَكٍ يَسْبَحُونَ',
    ref: { surah: 21, surahName: 'الأنبياء', ayah: '33' },
    explanation: 'كلمة "يسبحون" فعل يدل على الحركة والسير في مسار محدد، وهو ما أثبته العلم الحديث من أن الشمس والقمر والكواكب تدور في أفلاك محددة.',
  },
  {
    id: 'm4', category: 'أرض',
    title: 'الجبال أوتاد',
    ayah: 'أَلَمْ نَجْعَلِ الْأَرْضَ مِهَادًا * وَالْجِبَالَ أَوْتَادًا',
    ref: { surah: 78, surahName: 'النبأ', ayah: '6-7' },
    explanation: 'أثبت العلم أن للجبال جذوراً عميقة تمتد داخل الأرض تشبه الوتد، وتساهم في تثبيت القشرة الأرضية ومنع الزلازل.',
  },
  {
    id: 'm5', category: 'أرض',
    title: 'كروية الأرض',
    ayah: 'يُكَوِّرُ اللَّيْلَ عَلَى النَّهَارِ وَيُكَوِّرُ النَّهَارَ عَلَى اللَّيْلِ',
    ref: { surah: 39, surahName: 'الزمر', ayah: '5' },
    explanation: 'كلمة "يكور" مشتقة من الكرة، وتفيد أن الليل يلتف حول النهار والنهار يلتف حول الليل، وهو ما لا يحصل إلا إذا كانت الأرض كروية.',
  },
  {
    id: 'm6', category: 'بحار',
    title: 'البرزخ بين البحرين',
    ayah: 'مَرَجَ الْبَحْرَيْنِ يَلْتَقِيَانِ * بَيْنَهُمَا بَرْزَخٌ لَا يَبْغِيَانِ',
    ref: { surah: 55, surahName: 'الرحمن', ayah: '19-20' },
    explanation: 'كشف العلم الحديث وجود حاجز مائي غير مرئي يفصل بين البحار المختلفة (كالبحر المتوسط والمحيط الأطلسي) فلا تختلط مياهها ولا كثافتها.',
  },
  {
    id: 'm7', category: 'بحار',
    title: 'ظلمات البحر العميق',
    ayah: 'أَوْ كَظُلُمَاتٍ فِي بَحْرٍ لُجِّيٍّ يَغْشَاهُ مَوْجٌ مِنْ فَوْقِهِ مَوْجٌ مِنْ فَوْقِهِ سَحَابٌ ۚ ظُلُمَاتٌ بَعْضُهَا فَوْقَ بَعْضٍ',
    ref: { surah: 24, surahName: 'النور', ayah: '40' },
    explanation: 'وصف دقيق للأمواج الداخلية في أعماق البحار التي لم تُكتشف إلا حديثاً، والظلمات المتتابعة بحسب العمق حيث يختفي كل لون على عمق معين.',
  },
  {
    id: 'm8', category: 'إنسان',
    title: 'مراحل خلق الجنين',
    ayah: 'ثُمَّ خَلَقْنَا النُّطْفَةَ عَلَقَةً فَخَلَقْنَا الْعَلَقَةَ مُضْغَةً فَخَلَقْنَا الْمُضْغَةَ عِظَامًا فَكَسَوْنَا الْعِظَامَ لَحْمًا',
    ref: { surah: 23, surahName: 'المؤمنون', ayah: '14' },
    explanation: 'وصف دقيق لمراحل تكوين الجنين في رحم الأم بترتيبها الحقيقي، وقد أسلم بسببها الدكتور "كيث مور" أحد كبار علماء الأجنة في العالم.',
  },
  {
    id: 'm9', category: 'إنسان',
    title: 'بصمة الأصابع',
    ayah: 'بَلَىٰ قَادِرِينَ عَلَىٰ أَنْ نُسَوِّيَ بَنَانَهُ',
    ref: { surah: 75, surahName: 'القيامة', ayah: '4' },
    explanation: 'أشار القرآن إلى أهمية "البنان" (أطراف الأصابع)، ولم يُكتشف تميز بصمة الإنسان عن غيره إلا سنة 1823م، فأصبحت وسيلة رئيسية للتعرف.',
  },
  {
    id: 'm10', category: 'إنسان',
    title: 'الجلد ومستقبلات الألم',
    ayah: 'كُلَّمَا نَضِجَتْ جُلُودُهُمْ بَدَّلْنَاهُمْ جُلُودًا غَيْرَهَا لِيَذُوقُوا الْعَذَابَ',
    ref: { surah: 4, surahName: 'النساء', ayah: '56' },
    explanation: 'أثبت الطب الحديث أن مستقبلات الإحساس بالحرارة والألم تقع في الجلد. فإذا احترق الجلد لا يشعر الإنسان بالألم، وهذا ما يفسر ذكر تبديل الجلود في الآية.',
  },
  {
    id: 'm11', category: 'نبات وحيوان',
    title: 'الزوجية في النبات',
    ayah: 'وَمِن كُلِّ الثَّمَرَاتِ جَعَلَ فِيهَا زَوْجَيْنِ اثْنَيْنِ',
    ref: { surah: 13, surahName: 'الرعد', ayah: '3' },
    explanation: 'أثبت علم النبات وجود الذكر والأنثى في النباتات (الأسدية والمدقة)، والتلقيح الذي يحدث بينها لإنتاج الثمار — كل ذلك أشار إليه القرآن.',
  },
  {
    id: 'm12', category: 'نبات وحيوان',
    title: 'مجتمع النمل',
    ayah: 'قَالَتْ نَمْلَةٌ يَا أَيُّهَا النَّمْلُ ادْخُلُوا مَسَاكِنَكُمْ لَا يَحْطِمَنَّكُمْ سُلَيْمَانُ وَجُنُودُهُ',
    ref: { surah: 27, surahName: 'النمل', ayah: '18' },
    explanation: 'أثبت العلم أن النمل يعيش في مجتمعات منظمة، يتواصل بلغة كيميائية وصوتية، وأن الأنثى هي القائدة (كما جاء بصيغة "قالت نملة").',
  },
];

const CATEGORIES = ['الكل', 'كون', 'أرض', 'إنسان', 'بحار', 'نبات وحيوان'] as const;

const QuranScienceMiraclesPage: React.FC = () => {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>('الكل');
  const [openId, setOpenId] = useState<string | null>(DATA[0].id);

  const filtered = useMemo(() => {
    const query = q.trim();
    return DATA.filter((d) => {
      if (cat !== 'الكل' && d.category !== cat) return false;
      if (!query) return true;
      return d.title.includes(query) || d.ayah.includes(query) || d.explanation.includes(query);
    });
  }, [q, cat]);

  return (
    <div className="page-container page-with-topbar" dir="rtl">
      <SEO title="الإعجاز العلمي في القرآن | قلب القرآن" description="حقائق علمية أشار إليها القرآن قبل اكتشافها بقرون." />
      <div className="max-w-lg mx-auto w-full px-4 pt-6">
        <PageHeader icon={Atom} title="الإعجاز العلمي" subtitle="حقائق سبق القرآن إليها العلم" gradient="hero" showBack />

        <div className="mt-4 space-y-3">
          <div className="rounded-2xl bg-primary/5 border border-primary/20 p-4">
            <p className="text-xs leading-6 text-foreground/80">
              القرآن كتاب هداية أولاً، وما فيه من إشارات علمية تزيد المؤمنَ يقيناً وتدعو غيرَه للتفكر. هذه أمثلة مختارة مما أشار إليه القرآن وأثبته العلم الحديث.
            </p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث..."
              className="w-full text-sm rounded-xl bg-card border border-border/50 py-2.5 pr-9 pl-3"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
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

          <div className="space-y-2.5">
            {filtered.map((d) => {
              const open = openId === d.id;
              return (
                <div key={d.id} className="rounded-2xl bg-card border border-border/50 overflow-hidden">
                  <button
                    onClick={() => setOpenId(open ? null : d.id)}
                    className="w-full text-right p-4 flex items-start gap-3"
                    aria-expanded={open}
                  >
                    <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                      <Atom className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-extrabold text-sm">{d.title}</h3>
                        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{d.category}</div>
                    </div>
                  </button>

                  {open && (
                    <div className="px-4 pb-4 space-y-3 border-t border-border/40 pt-3">
                      <div className="rounded-xl bg-primary/5 border border-primary/20 p-3">
                        <p className="text-base leading-9 font-amiri text-center">{d.ayah}</p>
                        <div className="text-[10px] text-center text-muted-foreground mt-2">﴿ {d.ref.surahName} • {d.ref.ayah} ﴾</div>
                      </div>

                      <p className="text-xs leading-6 text-foreground/85">{d.explanation}</p>

                      <button
                        onClick={() => navigate(`/quran/${d.ref.surah}`)}
                        className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-secondary/60 border border-border/50 inline-flex items-center gap-1"
                      >
                        <ChevronLeft className="w-3 h-3" />
                        قراءة السورة
                      </button>
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

export default QuranScienceMiraclesPage;
