import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpenCheck, Search, ChevronLeft } from 'lucide-react';
import SEO from '@/components/SEO';
import PageHeader from '@/components/PageHeader';

interface Asbab {
  id: string;
  surah: number;
  surahName: string;
  ayah: string;
  ayahText: string;
  reason: string;
  source: string;
}

const DATA: Asbab[] = [
  { id: '1', surah: 2, surahName: 'البقرة', ayah: '115', ayahText: 'وَلِلَّهِ الْمَشْرِقُ وَالْمَغْرِبُ ۚ فَأَيْنَمَا تُوَلُّوا فَثَمَّ وَجْهُ اللَّهِ', reason: 'نزلت في قوم صلّوا في سفر في ليلة مظلمة فلم يعرفوا القبلة، فصلّى كل واحد إلى جهة، فلما أصبحوا سألوا النبي ﷺ فنزلت الآية تبيّن أن من اجتهد وصلّى إلى غير القبلة عن جهل فصلاته صحيحة.', source: 'أخرجه الترمذي وحسّنه' },
  { id: '2', surah: 2, surahName: 'البقرة', ayah: '187', ayahText: 'أُحِلَّ لَكُمْ لَيْلَةَ الصِّيَامِ الرَّفَثُ إِلَىٰ نِسَائِكُمْ', reason: 'كان الصائم في أول الأمر إذا نام قبل الإفطار حرم عليه الطعام والشراب والنساء إلى الليلة القادمة، فوقع بعض الصحابة في المشقة، فنزلت الرخصة بجواز الأكل والشرب والقربان طوال الليل.', source: 'أخرجه البخاري' },
  { id: '3', surah: 4, surahName: 'النساء', ayah: '43', ayahText: 'يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تَقْرَبُوا الصَّلَاةَ وَأَنْتُمْ سُكَارَىٰ', reason: 'صنع عبد الرحمن بن عوف طعاماً وشراباً فيه خمر (قبل تحريمها كلياً)، فصلى أحدهم بهم المغرب فخلط في قراءته، فنزلت هذه الآية بتحريم الصلاة حال السكر، ثم نزل التحريم الكلي للخمر بعد ذلك.', source: 'أخرجه الترمذي والنسائي' },
  { id: '4', surah: 5, surahName: 'المائدة', ayah: '3', ayahText: 'الْيَوْمَ أَكْمَلْتُ لَكُمْ دِينَكُمْ وَأَتْمَمْتُ عَلَيْكُمْ نِعْمَتِي', reason: 'نزلت يوم عرفة في حجة الوداع على النبي ﷺ وهو واقف بعرفة، إعلاناً بإكمال الدين وإتمام النعمة، فبكى عمر رضي الله عنه لعلمه أنه ما بعد الكمال إلا النقصان، وقد توفي النبي ﷺ بعدها بأيام.', source: 'أخرجه البخاري ومسلم' },
  { id: '5', surah: 5, surahName: 'المائدة', ayah: '90-91', ayahText: 'إِنَّمَا الْخَمْرُ وَالْمَيْسِرُ وَالْأَنْصَابُ وَالْأَزْلَامُ رِجْسٌ', reason: 'التحريم النهائي للخمر بعد تدرّج ثلاث مراحل. وقد كان الصحابة يشربون فلما نزلت قال بعضهم "انتهينا انتهينا" وأراقوا ما عندهم حتى جرت بها سكك المدينة.', source: 'أخرجه مسلم' },
  { id: '6', surah: 9, surahName: 'التوبة', ayah: '38', ayahText: 'يَا أَيُّهَا الَّذِينَ آمَنُوا مَا لَكُمْ إِذَا قِيلَ لَكُمُ انْفِرُوا فِي سَبِيلِ اللَّهِ اثَّاقَلْتُمْ إِلَى الْأَرْضِ', reason: 'نزلت في تحذير المتخلفين عن غزوة تبوك، حين تثاقل بعضهم بسبب الحر الشديد وثمار المدينة الناضجة، فعاتبهم الله وحثّهم على النفير في سبيله.', source: 'ذكره ابن كثير والطبري' },
  { id: '7', surah: 24, surahName: 'النور', ayah: '11-20', ayahText: 'إِنَّ الَّذِينَ جَاءُوا بِالْإِفْكِ عُصْبَةٌ مِنْكُمْ', reason: 'نزلت في براءة أم المؤمنين عائشة رضي الله عنها مما رماها به المنافقون في حادثة الإفك المشهورة، بعد أن تخلّفت عن الجيش لطلب عقد لها، وأشيع عليها البهتان شهراً كاملاً.', source: 'أخرجه البخاري ومسلم' },
  { id: '8', surah: 33, surahName: 'الأحزاب', ayah: '37', ayahText: 'فَلَمَّا قَضَىٰ زَيْدٌ مِنْهَا وَطَرًا زَوَّجْنَاكَهَا', reason: 'نزلت في زواج النبي ﷺ من زينب بنت جحش بعد طلاق زيد بن حارثة (مولى النبي ﷺ) لها، لإبطال عادة الجاهلية في التبنّي وأن زوجة المتبنّى لا تحل للأب بالتبنّي.', source: 'أخرجه البخاري' },
  { id: '9', surah: 58, surahName: 'المجادلة', ayah: '1', ayahText: 'قَدْ سَمِعَ اللَّهُ قَوْلَ الَّتِي تُجَادِلُكَ فِي زَوْجِهَا', reason: 'نزلت في خولة بنت ثعلبة التي جاءت تشتكي زوجها أوس بن الصامت الذي ظاهر منها (قال لها أنتِ عليّ كظهر أمي)، فأنزل الله كفارة الظهار وأنقذها.', source: 'أخرجه أبو داود وابن ماجه' },
  { id: '10', surah: 66, surahName: 'التحريم', ayah: '1', ayahText: 'يَا أَيُّهَا النَّبِيُّ لِمَ تُحَرِّمُ مَا أَحَلَّ اللَّهُ لَكَ', reason: 'نزلت لما حرّم النبي ﷺ على نفسه شيئاً كان يحبه (العسل أو مارية) إرضاءً لبعض أزواجه، فعاتبه الله وبيّن أن التحريم لله وحده وأمر بالتكفير عن اليمين.', source: 'أخرجه البخاري ومسلم' },
  { id: '11', surah: 80, surahName: 'عبس', ayah: '1-10', ayahText: 'عَبَسَ وَتَوَلَّىٰ * أَنْ جَاءَهُ الْأَعْمَىٰ', reason: 'نزلت في عبد الله بن أم مكتوم الأعمى، حين جاء يسأل النبي ﷺ عن أمر دينه وهو مشغول بكبار قريش رجاء إسلامهم، فأعرض عنه، فنزل العتاب بأن الأولى تعليم من يريد الخير.', source: 'ذكره أهل السير والتفسير' },
  { id: '12', surah: 111, surahName: 'المسد', ayah: 'كاملة', ayahText: 'تَبَّتْ يَدَا أَبِي لَهَبٍ وَتَبَّ', reason: 'لما دعا النبي ﷺ قومه على الصفا وأنذرهم، قال أبو لهب "تباً لك سائر اليوم ألهذا جمعتنا؟" فأنزل الله السورة تُخلّده في الشقاء واللعن.', source: 'أخرجه البخاري' },
];

const AsbabAlNuzulPage: React.FC = () => {
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const query = q.trim();
    if (!query) return DATA;
    return DATA.filter((d) =>
      d.surahName.includes(query) || d.ayahText.includes(query) || d.reason.includes(query),
    );
  }, [q]);

  return (
    <div className="page-container page-with-topbar" dir="rtl">
      <SEO title="أسباب النزول | قلب القرآن" description="أسباب نزول آيات القرآن الكريم مع النص القرآني والحادثة والمصدر." />
      <div className="max-w-lg mx-auto w-full px-4 pt-6">
        <PageHeader icon={BookOpenCheck} title="أسباب النزول" subtitle="مواقف نزلت فيها الآيات" gradient="primary" showBack />

        <div className="mt-4 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث في السور أو الأسباب..."
              className="w-full text-sm rounded-xl bg-card border border-border/50 py-2.5 pr-9 pl-3"
            />
          </div>

          <div className="text-xs text-muted-foreground text-center">{filtered.length} آية</div>

          <div className="space-y-3">
            {filtered.map((d) => (
              <article key={d.id} className="rounded-2xl bg-card border border-border/50 p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                      <BookOpenCheck className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="text-sm font-extrabold">{d.surahName}</div>
                      <div className="text-[10px] text-muted-foreground">آية {d.ayah}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/quran/${d.surah}`)}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-secondary/60 border border-border/50 inline-flex items-center gap-1"
                  >
                    <ChevronLeft className="w-3 h-3" />
                    قراءة السورة
                  </button>
                </div>

                <div className="rounded-xl bg-primary/5 border border-primary/20 p-3">
                  <p className="text-sm leading-8 font-amiri text-center">{d.ayahText}</p>
                </div>

                <div>
                  <div className="text-xs font-bold text-primary mb-1">سبب النزول</div>
                  <p className="text-xs leading-6 text-foreground/85">{d.reason}</p>
                </div>

                <div className="text-[10px] text-muted-foreground border-t border-border/40 pt-2">
                  المصدر: {d.source}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AsbabAlNuzulPage;
