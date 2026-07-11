import React, { useMemo, useState } from 'react';
import { Library, Search } from 'lucide-react';
import SEO from '@/components/SEO';
import PageHeader from '@/components/PageHeader';

interface Term {
  id: string;
  term: string;
  category: 'عقيدة' | 'فقه' | 'قرآن' | 'حديث' | 'سيرة' | 'أخلاق';
  short: string;
  detail: string;
}

const TERMS: Term[] = [
  { id: 't1', term: 'التوحيد', category: 'عقيدة', short: 'إفراد الله بالعبادة', detail: 'إفراد الله سبحانه بما يختص به من الربوبية والألوهية والأسماء والصفات. وهو أول واجب على المكلف، وأصل الدين كله.' },
  { id: 't2', term: 'الإيمان', category: 'عقيدة', short: 'قول باللسان وعمل بالجوارح واعتقاد بالجَنان', detail: 'يزيد بالطاعة وينقص بالمعصية، وأركانه ستة: الإيمان بالله وملائكته وكتبه ورسله واليوم الآخر والقدر خيره وشره.' },
  { id: 't3', term: 'الإحسان', category: 'عقيدة', short: 'أن تعبد الله كأنك تراه', detail: 'أعلى مراتب الدين. عرّفه النبي ﷺ بقوله: "أن تعبد الله كأنك تراه، فإن لم تكن تراه فإنه يراك".' },
  { id: 't4', term: 'التقوى', category: 'عقيدة', short: 'أن يجعل العبد بينه وبين عذاب الله وقاية', detail: 'بامتثال الأوامر واجتناب النواهي. قال علي رضي الله عنه: "التقوى هي الخوف من الجليل، والعمل بالتنزيل، والقناعة بالقليل، والاستعداد ليوم الرحيل".' },
  { id: 't5', term: 'الشرك', category: 'عقيدة', short: 'صرف شيء من العبادة لغير الله', detail: 'أعظم الذنوب على الإطلاق، وهو الذنب الذي لا يغفره الله إن مات صاحبه مصراً عليه. أنواعه: أكبر (يخرج من الملة) وأصغر (كالرياء).' },
  { id: 't6', term: 'البدعة', category: 'عقيدة', short: 'إحداث في الدين ما ليس منه', detail: 'كل عبادة أو اعتقاد لم يشرعه الله ورسوله ﷺ ثم أُدخل في الدين. قال ﷺ: "كل بدعة ضلالة".' },

  { id: 't7', term: 'الفرض', category: 'فقه', short: 'ما طلب الشارع فعله على وجه الإلزام', detail: 'يُثاب فاعله ويُعاقب تاركه. مثل: الصلوات الخمس، الزكاة، الصوم، الحج.' },
  { id: 't8', term: 'الواجب', category: 'فقه', short: 'ما طُلب فعله على سبيل الإلزام (وقيل مرادف للفرض)', detail: 'عند الحنفية: الفرض ما ثبت بدليل قطعي، والواجب ما ثبت بدليل ظني. عند الجمهور: مترادفان.' },
  { id: 't9', term: 'السنة', category: 'فقه', short: 'ما طُلب فعله على غير وجه الإلزام', detail: 'يُثاب فاعله ولا يُعاقب تاركه. أنواعها: مؤكدة وغير مؤكدة. ومن معانيها الأخرى: طريقة النبي ﷺ.' },
  { id: 't10', term: 'المكروه', category: 'فقه', short: 'ما طُلب تركه بدون إلزام', detail: 'يُثاب تاركه ولا يُعاقب فاعله. عكس المندوب/السنة.' },
  { id: 't11', term: 'الحرام', category: 'فقه', short: 'ما طُلب تركه على وجه الإلزام', detail: 'يُعاقب فاعله ويُثاب تاركه. مثل: الربا، الزنا، شرب الخمر.' },
  { id: 't12', term: 'المباح', category: 'فقه', short: 'ما استوى فعله وتركه', detail: 'لا ثواب في فعله ولا عقاب في تركه إلا بنية.' },
  { id: 't13', term: 'الاجتهاد', category: 'فقه', short: 'بذل الوسع لاستنباط الحكم الشرعي', detail: 'من دلته من الكتاب والسنة. لا يقوم به إلا العالم بشروط الاجتهاد.' },
  { id: 't14', term: 'الإجماع', category: 'فقه', short: 'اتفاق مجتهدي الأمة في عصر على حكم شرعي', detail: 'ثالث الأدلة الشرعية بعد الكتاب والسنة، وهو حجة قاطعة.' },
  { id: 't15', term: 'القياس', category: 'فقه', short: 'إلحاق فرع بأصل لعلة جامعة', detail: 'رابع الأدلة الشرعية. مثل قياس المخدرات على الخمر لعلة الإسكار.' },

  { id: 't16', term: 'المكي والمدني', category: 'قرآن', short: 'تصنيف السور حسب زمان النزول', detail: 'المكي: ما نزل قبل الهجرة، ويغلب عليه الحديث عن التوحيد والقصص. المدني: ما نزل بعد الهجرة، ويغلب عليه التشريع.' },
  { id: 't17', term: 'الناسخ والمنسوخ', category: 'قرآن', short: 'رفع حكم شرعي بحكم لاحق', detail: 'من علوم القرآن. أمثلة: نسخ استقبال بيت المقدس إلى الكعبة، تدرج تحريم الخمر.' },
  { id: 't18', term: 'المتشابهات', category: 'قرآن', short: 'الآيات المتقاربة في اللفظ', detail: 'كلمات أو تراكيب تكررت في مواضع عدة بتغيير يسير، ويحتاج الحافظ لتمييزها.' },
  { id: 't19', term: 'التدبر', category: 'قرآن', short: 'التأمل في معاني القرآن للعمل به', detail: 'قال تعالى: (كِتَابٌ أَنْزَلْنَاهُ إِلَيْكَ مُبَارَكٌ لِيَدَّبَّرُوا آيَاتِهِ). هدف نزول القرآن.' },
  { id: 't20', term: 'المصحف', category: 'قرآن', short: 'الجامع لكلام الله في كتاب', detail: 'جُمع في عهد أبي بكر ثم نُسخ في عهد عثمان رضي الله عنهما، بروايات متواترة.' },

  { id: 't21', term: 'الحديث القدسي', category: 'حديث', short: 'ما يرويه النبي ﷺ عن ربه', detail: 'لفظه من النبي ﷺ ومعناه من الله، بخلاف القرآن الذي لفظه ومعناه من الله.' },
  { id: 't22', term: 'المتواتر', category: 'حديث', short: 'ما رواه جمع يستحيل تواطؤهم على الكذب', detail: 'أعلى درجات الحديث. لا يحتاج للنظر في الأسانيد لإفادته العلم.' },
  { id: 't23', term: 'الصحيح', category: 'حديث', short: 'ما اتصل سنده بنقل عدل ضابط عن مثله', detail: 'من غير شذوذ ولا علة. أعلى درجات الآحاد. أشهر كتبه: صحيح البخاري ومسلم.' },
  { id: 't24', term: 'الحسن', category: 'حديث', short: 'كالصحيح لكن مع خفة ضبط أحد رواته', detail: 'أدنى مرتبة من الصحيح لكنه حجة يُعمل به.' },
  { id: 't25', term: 'الضعيف', category: 'حديث', short: 'ما فقد شرطاً من شروط القبول', detail: 'لا يُحتج به في الأحكام. أنواعه كثيرة: منقطع، معلل، شاذ، منكر...' },
  { id: 't26', term: 'الموضوع', category: 'حديث', short: 'المكذوب على النبي ﷺ', detail: 'أشد الأحاديث ضعفاً. لا تحل روايته إلا لبيان وضعه.' },

  { id: 't27', term: 'الهجرة', category: 'سيرة', short: 'انتقال النبي ﷺ من مكة إلى المدينة', detail: 'حدثت في السنة 13 من البعثة، وهي مبدأ التقويم الهجري. أوامرها ما تزال قائمة لكل مسلم يخاف على دينه.' },
  { id: 't28', term: 'الغزوة', category: 'سيرة', short: 'المعركة التي حضرها النبي ﷺ', detail: 'بلغت 27 غزوة، أشهرها: بدر، أحد، الخندق، خيبر، فتح مكة، حنين، تبوك. أما السرايا فهي التي بعث فيها ولم يحضرها.' },
  { id: 't29', term: 'الصحابي', category: 'سيرة', short: 'من لقي النبي ﷺ مؤمناً به ومات على الإسلام', detail: 'أفضل هذه الأمة بعد أنبيائها. عدلوا جميعاً كما نص أهل السنة.' },
  { id: 't30', term: 'الأنصار', category: 'سيرة', short: 'أهل المدينة الذين نصروا النبي ﷺ', detail: 'من الأوس والخزرج. آووا النبي ﷺ والمهاجرين وقاسموهم أموالهم، فأثنى الله عليهم في القرآن.' },
  { id: 't31', term: 'المهاجرون', category: 'سيرة', short: 'الذين هاجروا من مكة إلى المدينة', detail: 'تركوا ديارهم وأموالهم في سبيل الله، فوصفهم الله بأنهم الصادقون.' },

  { id: 't32', term: 'الإخلاص', category: 'أخلاق', short: 'إفراد الله بالنية في العبادة', detail: 'شرط قبول العمل. قال تعالى: (وَمَا أُمِرُوا إِلَّا لِيَعْبُدُوا اللَّهَ مُخْلِصِينَ لَهُ الدِّينَ).' },
  { id: 't33', term: 'التوكل', category: 'أخلاق', short: 'اعتماد القلب على الله مع الأخذ بالأسباب', detail: 'ليس ترك الأسباب، بل الأخذ بها مع تعلق القلب بمسبب الأسباب. قال ﷺ: "لو أنكم تتوكلون على الله حق توكله لرزقكم كما يرزق الطير".' },
  { id: 't34', term: 'الصبر', category: 'أخلاق', short: 'حبس النفس على المكاره', detail: 'أنواعه: صبر على الطاعة، صبر عن المعصية، صبر على المصيبة. قرن الله الفلاح به.' },
  { id: 't35', term: 'الشكر', category: 'أخلاق', short: 'الاعتراف بالنعمة والقيام بحقها', detail: 'شكر بالقلب (اعتراف)، بالجوارح (طاعة)، وباللسان (حمد). سبب لدوام النعم وزيادتها.' },
  { id: 't36', term: 'الرياء', category: 'أخلاق', short: 'إظهار العمل للناس ليُحمد عليه', detail: 'الشرك الأصغر. يحبط العمل. علاجه: تذكّر أن الخلق لا يملكون ضراً ولا نفعاً.' },
];

const CATEGORIES = ['الكل', 'عقيدة', 'فقه', 'قرآن', 'حديث', 'سيرة', 'أخلاق'] as const;

const IslamicTermsPage: React.FC = () => {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>('الكل');
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = q.trim();
    return TERMS.filter((t) => {
      if (cat !== 'الكل' && t.category !== cat) return false;
      if (!query) return true;
      return t.term.includes(query) || t.short.includes(query) || t.detail.includes(query);
    });
  }, [q, cat]);

  return (
    <div className="page-container page-with-topbar" dir="rtl">
      <SEO title="مصطلحات إسلامية | قلب القرآن" description="معجم مصطلحات إسلامية في العقيدة والفقه والقرآن والحديث والسيرة والأخلاق." />
      <div className="max-w-lg mx-auto w-full px-4 pt-6">
        <PageHeader icon={Library} title="مصطلحات إسلامية" subtitle="معجم مبسّط للمفاهيم الشرعية" gradient="primary" showBack />

        <div className="mt-4 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث عن مصطلح..."
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

          <div className="text-xs text-muted-foreground text-center">{filtered.length} مصطلح</div>

          <div className="space-y-2">
            {filtered.map((t) => {
              const open = openId === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setOpenId(open ? null : t.id)}
                  className="w-full text-right rounded-2xl bg-card border border-border/50 p-3.5 transition hover:border-primary/40"
                  aria-expanded={open}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                        <Library className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-extrabold">{t.term}</div>
                        <div className="text-[10px] text-muted-foreground truncate">{t.short}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-secondary/70 text-muted-foreground px-2 py-0.5 rounded-full flex-shrink-0">{t.category}</span>
                  </div>
                  {open && (
                    <p className="mt-3 pt-3 border-t border-border/40 text-xs leading-6 text-foreground/85 text-right">
                      {t.detail}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IslamicTermsPage;
