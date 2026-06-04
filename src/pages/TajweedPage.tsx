import React, { useMemo, useState } from 'react';
import { BookOpen, Mic, Search } from 'lucide-react';
import SEO from '@/components/SEO';
import PageHeader from '@/components/PageHeader';

interface Rule {
  id: string;
  category: 'النون الساكنة والتنوين' | 'الميم الساكنة' | 'المدود' | 'القلقلة' | 'اللام' | 'الراء';
  name: string;
  short: string;
  detail: string;
  example: string;
  color: string;
}

const RULES: Rule[] = [
  { id: 'idhhar', category: 'النون الساكنة والتنوين', name: 'الإظهار الحلقي', short: 'النون قبل: ء هـ ع ح غ خ', detail: 'إخراج النون الساكنة أو التنوين من مخرجها دون غنة كاملة عند ملاقاة أحد حروف الحلق الستة.', example: 'مَنْ آمَنَ — يَنْهَوْنَ', color: 'from-emerald-500/15 to-emerald-500/5' },
  { id: 'idgham', category: 'النون الساكنة والتنوين', name: 'الإدغام', short: 'يرملون — بغنة وبغير غنة', detail: 'إدخال النون أو التنوين في الحرف التالي بحيث يصيران حرفاً واحداً مشدداً. حروفه: ي ر م ل و ن.', example: 'مِنْ رَبِّهِمْ — مِنْ يَعْمَلْ', color: 'from-amber-500/15 to-amber-500/5' },
  { id: 'iqlab', category: 'النون الساكنة والتنوين', name: 'الإقلاب', short: 'النون قبل الباء تُقلب ميماً', detail: 'قلب النون الساكنة أو التنوين ميماً مخفاة بغنة عند ملاقاة حرف الباء.', example: 'مِنْ بَعْدِ — أَنْبِئْهُمْ', color: 'from-sky-500/15 to-sky-500/5' },
  { id: 'ikhfa', category: 'النون الساكنة والتنوين', name: 'الإخفاء الحقيقي', short: '15 حرفاً بين الإظهار والإدغام', detail: 'النطق بالنون بصفة بين الإظهار والإدغام مع بقاء الغنة عند 15 حرفاً.', example: 'مِنْ قَبْلُ — أَنْتُمْ', color: 'from-violet-500/15 to-violet-500/5' },
  { id: 'mim-idgham', category: 'الميم الساكنة', name: 'إدغام شفوي', short: 'الميم الساكنة قبل الميم', detail: 'إدغام الميم الساكنة في ميم متحركة بعدها مع الغنة.', example: 'لَهُمْ مَا', color: 'from-rose-500/15 to-rose-500/5' },
  { id: 'mim-ikhfa', category: 'الميم الساكنة', name: 'إخفاء شفوي', short: 'الميم الساكنة قبل الباء', detail: 'إخفاء الميم الساكنة عند ملاقاة الباء مع الغنة.', example: 'تَرْمِيهِمْ بِحِجَارَةٍ', color: 'from-fuchsia-500/15 to-fuchsia-500/5' },
  { id: 'mim-idhhar', category: 'الميم الساكنة', name: 'إظهار شفوي', short: 'بقية الحروف', detail: 'إظهار الميم الساكنة عند ملاقاة بقية الحروف.', example: 'أَلَمْ تَرَ', color: 'from-teal-500/15 to-teal-500/5' },
  { id: 'madd-tabii', category: 'المدود', name: 'المد الطبيعي', short: 'حركتان', detail: 'لا تقوم ذات الحرف إلا به، ويُمد بمقدار حركتين.', example: 'قَالَ — يَقُولُ', color: 'from-blue-500/15 to-blue-500/5' },
  { id: 'madd-muttasil', category: 'المدود', name: 'المد المتصل', short: '4 أو 5 حركات', detail: 'أن يأتي بعد حرف المد همزة في نفس الكلمة. واجب المد.', example: 'جَاءَ — السَّمَاءِ', color: 'from-cyan-500/15 to-cyan-500/5' },
  { id: 'madd-munfasil', category: 'المدود', name: 'المد المنفصل', short: '4 أو 5 حركات', detail: 'حرف المد آخر الكلمة والهمزة أول الكلمة التي تليها. جائز.', example: 'بِمَا أُنْزِلَ', color: 'from-indigo-500/15 to-indigo-500/5' },
  { id: 'madd-lazim', category: 'المدود', name: 'المد اللازم', short: '6 حركات', detail: 'سكون أصلي بعد حرف المد. أقواها وأوجبها.', example: 'الْحَاقَّةُ — الضَّالِّينَ', color: 'from-purple-500/15 to-purple-500/5' },
  { id: 'qalqala', category: 'القلقلة', name: 'القلقلة', short: 'قطب جد', detail: 'اضطراب الصوت عند النطق بالحرف ساكناً. صغرى في وسط الكلمة، كبرى عند الوقف.', example: 'يَدْخُلُونَ — أَحَدٌ', color: 'from-orange-500/15 to-orange-500/5' },
  { id: 'lam-shamsi', category: 'اللام', name: 'اللام الشمسية', short: 'تُدغم في الحرف بعدها', detail: 'لام «أل» التعريف لا تُنطق عند 14 حرفاً، ويُشدد الحرف التالي.', example: 'الشَّمْسُ — النَّاسُ', color: 'from-yellow-500/15 to-yellow-500/5' },
  { id: 'lam-qamari', category: 'اللام', name: 'اللام القمرية', short: 'تُنطق ظاهرة', detail: 'لام «أل» التعريف تُنطق ظاهرة عند 14 حرفاً.', example: 'الْقَمَرُ — الْكِتَابُ', color: 'from-lime-500/15 to-lime-500/5' },
  { id: 'ra-tafkhim', category: 'الراء', name: 'تفخيم الراء', short: 'مع الفتح والضم', detail: 'تُفخم الراء إذا كانت مفتوحة أو مضمومة أو ساكنة بعد فتح/ضم.', example: 'رَبِّ — رُسُلٌ', color: 'from-red-500/15 to-red-500/5' },
  { id: 'ra-tarqiq', category: 'الراء', name: 'ترقيق الراء', short: 'مع الكسر', detail: 'تُرقق الراء إذا كانت مكسورة أو ساكنة بعد كسر أصلي.', example: 'رِجَالٌ — فِرْعَوْنَ', color: 'from-pink-500/15 to-pink-500/5' },
];

const CATEGORIES = ['الكل', ...Array.from(new Set(RULES.map((r) => r.category)))] as const;

const TajweedPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<typeof CATEGORIES[number]>('الكل');

  const filtered = useMemo(() => {
    const q = query.trim();
    return RULES.filter((r) => {
      if (cat !== 'الكل' && r.category !== cat) return false;
      if (!q) return true;
      return r.name.includes(q) || r.short.includes(q) || r.detail.includes(q) || r.example.includes(q);
    });
  }, [query, cat]);

  return (
    <div className="page-content pb-24" dir="rtl">
      <SEO title="أحكام التجويد والتلاوة | قلب القرآن" description="مرجع احترافي لأحكام التجويد: النون الساكنة، الميم، المدود، القلقلة، اللام والراء مع أمثلة." />
      <PageHeader icon={Mic} title="التجويد والتلاوة" subtitle="مرجع موجز لأحكام التلاوة" gradient="primary" showBack />

      <div className="px-4 mt-3 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن حكم..."
            className="w-full text-sm rounded-xl bg-card border border-border/50 py-2.5 pr-9 pl-3"
          />
        </div>

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
            <li>السجود عند آيات السجدة، والإكثار من الدعاء.</li>
          </ul>
        </div>

        <div className="space-y-2.5">
          {filtered.map((r) => (
            <article key={r.id} className={`rounded-2xl border border-border/50 bg-gradient-to-br ${r.color} p-4`}>
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <h3 className="text-base font-extrabold text-foreground">{r.name}</h3>
                <span className="text-[10px] font-bold text-muted-foreground bg-background/60 rounded-full px-2 py-0.5">
                  {r.category}
                </span>
              </div>
              <p className="text-xs font-bold text-foreground/80 mb-1.5">{r.short}</p>
              <p className="text-[13px] leading-7 text-muted-foreground mb-2">{r.detail}</p>
              <div className="rounded-xl bg-background/70 border border-border/40 p-2.5 text-center">
                <div className="text-[10px] text-muted-foreground mb-1">مثال</div>
                <div className="font-amiri text-lg text-foreground" dir="rtl">{r.example}</div>
              </div>
            </article>
          ))}
          {filtered.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-8">لا توجد نتائج مطابقة.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TajweedPage;
