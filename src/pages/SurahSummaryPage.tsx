import React, { useEffect, useState } from 'react';
import SEO from '@/components/SEO';
import { FileText, Loader2, BookOpen, MapPin, ListOrdered } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import { fetchSurahs, type Surah } from '@/lib/api';
import { getCached, setCached } from '@/lib/dataCache';

interface Summary {
  themes: string[];
  highlights: string[];
  notes: string;
}

// Curated summaries for first surahs; fallback generic for the rest.
const CURATED: Record<number, Summary> = {
  1: { themes: ['الحمد', 'التوحيد', 'الهداية', 'الدعاء'], highlights: ['أم القرآن', 'السبع المثاني', 'تتضمن أركان الدعاء'], notes: 'أعظم سورة في القرآن، تُقرأ في كل ركعة. تجمع التوحيد والثناء والدعاء.' },
  2: { themes: ['التشريع', 'بني إسرائيل', 'الإيمان والكفر', 'الجهاد', 'المعاملات'], highlights: ['آية الكرسي (255)', 'خواتيم البقرة', 'قصة آدم والخلافة'], notes: 'أطول سور القرآن، تأسيس للمجتمع المسلم بالعقيدة والتشريع. سنام القرآن.' },
  3: { themes: ['أهل الكتاب', 'غزوة أحد', 'آل عمران ومريم', 'الثبات'], highlights: ['افتتاح بـ"الم"', 'قصة مريم ويحيى وعيسى', 'دروس أحد'], notes: 'مكمّلة للبقرة في الحوار مع أهل الكتاب وتربية الأمة على الثبات.' },
  12: { themes: ['قصة يوسف', 'الصبر', 'الابتلاء', 'تأويل الرؤى'], highlights: ['أحسن القصص', 'تكامل بناء القصة', 'الفرج بعد الشدة'], notes: 'نزلت لتسلية النبي ﷺ. قصة كاملة في سورة واحدة مليئة بدروس الصبر والتمكين.' },
  18: { themes: ['الفتن الأربع', 'العلم النافع', 'الزمن', 'العمل الصالح'], highlights: ['أصحاب الكهف', 'صاحب الجنتين', 'موسى والخضر', 'ذو القرنين'], notes: 'تُقرأ يوم الجمعة. تعالج فتن الدين والمال والعلم والسلطة.' },
  36: { themes: ['البعث والنشور', 'الرسالة', 'دلائل القدرة'], highlights: ['قلب القرآن', 'قصة أصحاب القرية', 'مشاهد القيامة'], notes: 'تُسمى قلب القرآن لاهتمامها بالعقيدة والبعث.' },
  55: { themes: ['نعم الله', 'الجن والإنس', 'الجنة والنار'], highlights: ['تكرار "فبأي آلاء ربكما تكذبان" 31 مرة', 'أوصاف الجنتين'], notes: 'عروس القرآن. تعداد لنعم الله المادية والروحية على الثقلين.' },
  67: { themes: ['الملك المطلق', 'البعث', 'الإيمان بالغيب'], highlights: ['المنجية من عذاب القبر', 'تأمل خلق السماوات'], notes: 'سورة تبارك، تشفع لصاحبها وتنجيه من عذاب القبر.' },
  112: { themes: ['التوحيد الخالص', 'صفات الله'], highlights: ['تعدل ثلث القرآن', 'نفي المثلية'], notes: 'تأسيس عقيدة التوحيد في أبسط صورة وأوضحها.' },
};

const SurahSummaryPage: React.FC = () => {
  const navigate = useNavigate();
  const cached = getCached<Surah[]>('surahs');
  const [surahs, setSurahs] = useState<Surah[]>(cached ?? []);
  const [loading, setLoading] = useState(!cached);
  const [selected, setSelected] = useState<number>(1);

  useEffect(() => {
    if (cached) return;
    fetchSurahs().then((s) => { setCached('surahs', s); setSurahs(s); }).finally(() => setLoading(false));
  }, [cached]);

  const surah = surahs.find((s) => s.number === selected);
  const summary = CURATED[selected];

  const fallback = surah ? {
    themes: surah.revelationType === 'Meccan' ? ['التوحيد', 'البعث', 'الرسالة', 'إنذار المشركين'] : ['التشريع', 'بناء المجتمع', 'الجهاد', 'أحكام المعاملات'],
    highlights: [`${surah.numberOfAyahs} آية`, surah.revelationType === 'Meccan' ? 'سورة مكية' : 'سورة مدنية', `الترتيب ${surah.number}`],
    notes: surah.revelationType === 'Meccan'
      ? 'السور المكية تُعنى في الغالب بترسيخ العقيدة والإيمان بالغيب وتذكير الناس بالآخرة.'
      : 'السور المدنية تتناول التشريع وبناء المجتمع المسلم والعلاقات مع الآخرين.',
  } : null;

  const data = summary ?? fallback;

  return (
    <>
      <SEO title="ملخص السور القرآنية — قلب القرآن" description="ملخصات موجزة لمواضيع وأهداف سور القرآن." />
      <div className="page-container page-with-topbar" dir="rtl">
      <div className="page-inner">
        <PageHeader icon={FileText} title="تلخيص السور" subtitle="محاور كل سورة بإيجاز" showBack />

        {loading ? (
          <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
        ) : (
          <>
            <div className="card-surface mb-4">
              <label className="text-[11px] font-bold text-muted-foreground">اختر السورة</label>
              <select value={selected} onChange={(e) => setSelected(Number(e.target.value))}
                className="w-full mt-1 rounded-lg border border-input bg-background px-3 py-2 text-sm font-bold">
                {surahs.map((s) => (
                  <option key={s.number} value={s.number}>{s.number}. {s.name} ({s.numberOfAyahs} آية)</option>
                ))}
              </select>
            </div>

            {surah && data && (
              <>
                <div className="gradient-hero rounded-3xl p-5 mb-4 text-primary-foreground shadow-emerald">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-primary-foreground/15 rounded-full px-3 py-1 text-[11px] font-bold">سورة {surah.number}</span>
                    <span className="bg-accent/20 rounded-full px-3 py-1 text-[11px] font-bold">
                      {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                    </span>
                  </div>
                  <div className="text-3xl font-bold font-kufi mb-1">{surah.name}</div>
                  <div className="text-[11px] opacity-80">{surah.englishName} • {surah.numberOfAyahs} آية</div>
                </div>

                <div className="card-surface mb-3">
                  <div className="flex items-center gap-2 mb-2"><ListOrdered className="w-4 h-4 text-primary" /><h3 className="text-sm font-bold font-kufi">المحاور الرئيسية</h3></div>
                  <div className="flex flex-wrap gap-2">
                    {data.themes.map((t, i) => (
                      <span key={i} className="text-[12px] font-bold bg-primary/10 text-primary rounded-full px-3 py-1">{t}</span>
                    ))}
                  </div>
                </div>

                <div className="card-surface mb-3">
                  <div className="flex items-center gap-2 mb-2"><MapPin className="w-4 h-4 text-accent" /><h3 className="text-sm font-bold font-kufi">أبرز ما فيها</h3></div>
                  <ul className="space-y-1.5">
                    {data.highlights.map((h, i) => (
                      <li key={i} className="text-[13px] text-foreground/90 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="card-luxury mb-4">
                  <p className="text-[13px] leading-[1.9] text-foreground/90 font-kufi">{data.notes}</p>
                  {!summary && <p className="text-[10px] text-muted-foreground mt-2">ملخص عام — التفاصيل الموسعة قيد الإضافة لهذه السورة.</p>}
                </div>

                <button onClick={() => navigate(`/quran/${surah.number}`)}
                  className="w-full rounded-xl gradient-primary text-primary-foreground py-3 text-sm font-bold flex items-center justify-center gap-2 shadow-emerald">
                  <BookOpen className="w-4 h-4" /> فتح السورة
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
    </>
  );
};

export default SurahSummaryPage;
