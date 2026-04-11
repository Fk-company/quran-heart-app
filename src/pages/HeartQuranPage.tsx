import React, { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { Heart, BookOpen, Play, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeartSection {
  title: string;
  desc: string;
  ayahs: { text: string; surah: string; ayah: number; reflection: string }[];
}

const heartSections: HeartSection[] = [
  {
    title: 'سورة يس - قلب القرآن',
    desc: 'قال النبي ﷺ: إن لكل شيء قلباً وقلب القرآن يس',
    ayahs: [
      { text: 'يس ﴿١﴾ وَالْقُرْآنِ الْحَكِيمِ ﴿٢﴾ إِنَّكَ لَمِنَ الْمُرْسَلِينَ ﴿٣﴾ عَلَىٰ صِرَاطٍ مُّسْتَقِيمٍ', surah: 'يس', ayah: 1, reflection: 'افتتح الله سورة يس بالقسم بالقرآن الحكيم، تأكيداً لعظمة هذا الكتاب وحكمته في كل حرف.' },
      { text: 'سَلَامٌ قَوْلًا مِّن رَّبٍّ رَّحِيمٍ', surah: 'يس', ayah: 58, reflection: 'أعظم سلام يتلقاه المؤمن يوم القيامة، سلام من الله ذاته. تأمل في عظمة هذا الشرف.' },
      { text: 'أَوَلَيْسَ الَّذِي خَلَقَ السَّمَاوَاتِ وَالْأَرْضَ بِقَادِرٍ عَلَىٰ أَن يَخْلُقَ مِثْلَهُم', surah: 'يس', ayah: 81, reflection: 'من قدر على خلق السماوات والأرض قادر على إعادة خلقك وتغيير حالك إلى أفضل حال.' },
    ]
  },
  {
    title: 'آيات طمأنينة القلب',
    desc: 'آيات تملأ القلب سكينة وراحة',
    ayahs: [
      { text: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ', surah: 'الرعد', ayah: 28, reflection: 'الطمأنينة الحقيقية لا تأتي من المال أو المنصب، بل من ذكر الله. كلما ذكرت الله اطمأن قلبك.' },
      { text: 'هُوَ الَّذِي أَنزَلَ السَّكِينَةَ فِي قُلُوبِ الْمُؤْمِنِينَ لِيَزْدَادُوا إِيمَانًا مَّعَ إِيمَانِهِمْ', surah: 'الفتح', ayah: 4, reflection: 'السكينة هبة إلهية ينزلها الله على قلوب عباده المؤمنين، تزيد إيمانهم وتثبت أقدامهم.' },
      { text: 'يَا أَيَّتُهَا النَّفْسُ الْمُطْمَئِنَّةُ ﴿٢٧﴾ ارْجِعِي إِلَىٰ رَبِّكِ رَاضِيَةً مَّرْضِيَّةً', surah: 'الفجر', ayah: 27, reflection: 'النفس المطمئنة هي التي رضيت بقضاء الله ووثقت بحكمته. وهذا هو أسمى مقامات القلب.' },
    ]
  },
  {
    title: 'آيات شفاء القلب',
    desc: 'القرآن شفاء لما في الصدور',
    ayahs: [
      { text: 'وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ لِّلْمُؤْمِنِينَ', surah: 'الإسراء', ayah: 82, reflection: 'القرآن ليس كتاب قراءة فحسب، بل هو شفاء حقيقي للقلوب والأرواح والأجساد.' },
      { text: 'يَا أَيُّهَا النَّاسُ قَدْ جَاءَتْكُم مَّوْعِظَةٌ مِّن رَّبِّكُمْ وَشِفَاءٌ لِّمَا فِي الصُّدُورِ', surah: 'يونس', ayah: 57, reflection: 'ما في صدرك من هم وغم وحسد وحقد، كل ذلك يجد شفاءه في القرآن الكريم.' },
      { text: 'الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ اللَّهِ', surah: 'الرعد', ayah: 28, reflection: 'الإيمان والذكر هما الوصفة الربانية لعلاج كل أمراض القلب المعنوية.' },
    ]
  },
  {
    title: 'آيات الرجاء والأمل',
    desc: 'آيات تبعث الأمل في القلب',
    ayahs: [
      { text: 'وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ', surah: 'الضحى', ayah: 5, reflection: 'وعد إلهي بالعطاء حتى الرضا الكامل. ثق بأن الله سيعطيك ما يرضيك في الدنيا والآخرة.' },
      { text: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا', surah: 'الشرح', ayah: 6, reflection: 'اليسر ملازم للعسر، لا ينفك عنه. فكل محنة تحمل في طياتها منحة.' },
      { text: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا', surah: 'الشرح', ayah: 5, reflection: 'كرر الله البشارة مرتين ليؤكد أن الفرج آت لا محالة. لن يغلب عسر يسرين.' },
    ]
  },
];

const HeartQuranPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState<number | null>(null);

  const section = selectedSection !== null ? heartSections[selectedSection] : null;

  return (
    <div className="page-container page-with-topbar" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <PageHeader icon={Heart} title="قلب القرآن" subtitle="آيات تطمئن القلب وتشفي الصدر" gradient="gold" />

        {selectedSection === null ? (
          <div className="space-y-3">
            {heartSections.map((s, i) => (
              <button key={i} onClick={() => setSelectedSection(i)}
                className="card-surface-hover w-full text-right">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl gradient-gold flex items-center justify-center flex-shrink-0">
                    <Heart className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground text-sm">{s.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                    <p className="text-[10px] text-primary mt-1">{s.ayahs.length} آيات</p>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </div>
              </button>
            ))}

            {/* Quick link to Surah Yasin */}
            <button onClick={() => navigate('/quran/36')}
              className="w-full py-4 rounded-2xl gradient-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 mt-4">
              <Play className="w-4 h-4" /> اقرأ سورة يس كاملة
            </button>
          </div>
        ) : section ? (
          <>
            <button onClick={() => setSelectedSection(null)} className="flex items-center gap-1 text-sm text-primary mb-4">
              <ChevronLeft className="w-4 h-4 rotate-180" /> العودة
            </button>
            <h2 className="font-bold text-foreground mb-1">{section.title}</h2>
            <p className="text-xs text-muted-foreground mb-4">{section.desc}</p>

            <div className="space-y-4">
              {section.ayahs.map((a, i) => (
                <div key={i} className="card-surface p-5">
                  <p className="font-amiri text-xl leading-[2.4] text-center text-foreground mb-3">{a.text}</p>
                  <p className="text-xs text-muted-foreground text-center mb-3">سورة {a.surah} - آية {a.ayah}</p>
                  <div className="bg-accent/5 rounded-xl p-3 border border-accent/10">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-accent" />
                      <span className="text-[10px] font-bold text-accent">تأمل</span>
                    </div>
                    <p className="text-sm leading-[2] text-foreground">{a.reflection}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default HeartQuranPage;
