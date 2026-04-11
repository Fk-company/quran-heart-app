import React, { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { Heart, Frown, AlertTriangle, Smile, HelpCircle, Shield, BookOpen, RefreshCw, ChevronLeft } from 'lucide-react';

interface Emotion {
  key: string;
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}

interface AyahSuggestion {
  text: string;
  surah: string;
  ayah: number;
  tafsir: string;
  action: string;
}

const emotions: Emotion[] = [
  { key: 'sad', label: 'حزين', icon: Frown, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { key: 'anxious', label: 'قلق', icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { key: 'scared', label: 'خائف', icon: Shield, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { key: 'happy', label: 'سعيد', icon: Smile, color: 'text-green-500', bg: 'bg-green-500/10' },
  { key: 'lost', label: 'تائه', icon: HelpCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
];

const emotionAyahs: Record<string, AyahSuggestion[]> = {
  sad: [
    { text: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ﴿٥﴾ إِنَّ مَعَ الْعُسْرِ يُسْرًا', surah: 'الشرح', ayah: 5, tafsir: 'يبشر الله عباده أن مع كل صعوبة تيسيراً، وقد كرر ذلك تأكيداً لهذا الوعد الإلهي.', action: 'تذكر نعم الله عليك واكتب ثلاثاً منها الآن.' },
    { text: 'وَلَا تَيْأَسُوا مِن رَّوْحِ اللَّهِ ۖ إِنَّهُ لَا يَيْأَسُ مِن رَّوْحِ اللَّهِ إِلَّا الْقَوْمُ الْكَافِرُونَ', surah: 'يوسف', ayah: 87, tafsir: 'نهى الله عن اليأس من رحمته، فمهما اشتد الكرب فإن الفرج قريب.', action: 'ادعُ الله بما في قلبك الآن بصدق وإلحاح.' },
    { text: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ', surah: 'الرعد', ayah: 28, tafsir: 'ذكر الله هو الدواء الأعظم للقلب الحزين، يملأه سكينة وطمأنينة.', action: 'اجلس في مكان هادئ وسبّح الله 33 مرة.' },
  ],
  anxious: [
    { text: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ', surah: 'الطلاق', ayah: 3, tafsir: 'من فوّض أمره لله وتوكل عليه حق التوكل، كفاه الله كل ما أهمه.', action: 'ردد: حسبي الله ونعم الوكيل 7 مرات.' },
    { text: 'فَاللَّهُ خَيْرٌ حَافِظًا ۖ وَهُوَ أَرْحَمُ الرَّاحِمِينَ', surah: 'يوسف', ayah: 64, tafsir: 'حفظ الله أعظم من كل حفظ، وهو أرحم بعباده من أنفسهم.', action: 'اقرأ أذكار الصباح أو المساء كاملة.' },
    { text: 'قُل لَّن يُصِيبَنَا إِلَّا مَا كَتَبَ اللَّهُ لَنَا هُوَ مَوْلَانَا', surah: 'التوبة', ayah: 51, tafsir: 'ما يصيب الإنسان هو بقدر الله، وفي ذلك طمأنينة عظيمة.', action: 'اكتب ما يقلقك في ورقة ثم توكل على الله.' },
  ],
  scared: [
    { text: 'إِنَّ اللَّهَ مَعَ الَّذِينَ اتَّقَوا وَّالَّذِينَ هُم مُّحْسِنُونَ', surah: 'النحل', ayah: 128, tafsir: 'معية الله لعباده المتقين تعني نصره وحفظه وتأييده لهم.', action: 'اقرأ آية الكرسي والمعوذات.' },
    { text: 'وَلَا تَخَافُوا وَلَا تَحْزَنُوا وَأَبْشِرُوا بِالْجَنَّةِ الَّتِي كُنتُمْ تُوعَدُونَ', surah: 'فصلت', ayah: 30, tafsir: 'تتنزل الملائكة على المؤمنين عند موتهم تطمئنهم وتبشرهم.', action: 'استعذ بالله من الشيطان وأكثر من الدعاء.' },
    { text: 'أَلَيْسَ اللَّهُ بِكَافٍ عَبْدَهُ', surah: 'الزمر', ayah: 36, tafsir: 'الله يكفي عبده المؤمن كل شر ويحميه من كل مخوف.', action: 'ردد: لا إله إلا أنت سبحانك إني كنت من الظالمين.' },
  ],
  happy: [
    { text: 'وَإِذْ تَأَذَّنَ رَبُّكُمْ لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ', surah: 'إبراهيم', ayah: 7, tafsir: 'الشكر سبب لزيادة النعم، فمن شكر الله زاده من فضله.', action: 'اسجد شكراً لله على نعمه.' },
    { text: 'قُلْ بِفَضْلِ اللَّهِ وَبِرَحْمَتِهِ فَبِذَٰلِكَ فَلْيَفْرَحُوا', surah: 'يونس', ayah: 58, tafsir: 'الفرح الحقيقي هو الفرح بفضل الله ورحمته وهدايته.', action: 'شارك فرحتك مع غيرك وتصدق شكراً لله.' },
    { text: 'فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ', surah: 'البقرة', ayah: 152, tafsir: 'ذكر الله يزيد النعم ويحفظها ويبارك فيها.', action: 'قل: الحمد لله الذي بنعمته تتم الصالحات.' },
  ],
  lost: [
    { text: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا', surah: 'الطلاق', ayah: 2, tafsir: 'التقوى سبب لتفريج الكروب وإيجاد المخرج من كل ضيق.', action: 'صلِّ ركعتين استخارة وفوّض أمرك لله.' },
    { text: 'وَقُل رَّبِّ زِدْنِي عِلْمًا', surah: 'طه', ayah: 114, tafsir: 'طلب العلم والهداية من الله يضيء طريق الحائر.', action: 'اقرأ سورة الفاتحة بتدبر واسأل الله الهداية.' },
    { text: 'إِنَّ اللَّهَ لَا يُضِيعُ أَجْرَ الْمُحْسِنِينَ', surah: 'التوبة', ayah: 120, tafsir: 'كل عمل صالح محفوظ عند الله لا يضيع أبداً.', action: 'ابدأ خطوة صغيرة نحو ما تحب وتوكل على الله.' },
  ],
};

const EmotionQuranPage: React.FC = () => {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const suggestions = selectedEmotion ? emotionAyahs[selectedEmotion] || [] : [];
  const current = suggestions[currentIndex];

  const handleNext = () => {
    if (currentIndex < suggestions.length - 1) setCurrentIndex(prev => prev + 1);
    else setCurrentIndex(0);
  };

  return (
    <div className="page-container page-with-topbar" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <PageHeader icon={Heart} title="كيف يشعر قلبك؟" subtitle="آيات تواسي قلبك" gradient="gold" />

        {!selectedEmotion ? (
          <>
            <p className="text-center text-sm text-muted-foreground mb-6">اختر ما يصف شعورك الآن</p>
            <div className="grid grid-cols-2 gap-3">
              {emotions.map(e => (
                <button key={e.key} onClick={() => { setSelectedEmotion(e.key); setCurrentIndex(0); }}
                  className={`card-surface-hover flex flex-col items-center py-6 gap-3 ${e.bg}`}>
                  <e.icon className={`w-10 h-10 ${e.color}`} />
                  <span className="font-bold text-foreground">{e.label}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <button onClick={() => setSelectedEmotion(null)} className="flex items-center gap-1 text-sm text-primary mb-4">
              <ChevronLeft className="w-4 h-4 rotate-180" /> اختيار شعور آخر
            </button>

            {current && (
              <div className="space-y-4">
                {/* Ayah */}
                <div className="card-surface p-5 bg-primary/3 border-primary/10">
                  <p className="font-amiri text-xl leading-[2.4] text-center text-foreground mb-3">{current.text}</p>
                  <p className="text-xs text-muted-foreground text-center">سورة {current.surah} - آية {current.ayah}</p>
                </div>

                {/* Tafsir */}
                <div className="card-surface p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-primary">تفسير مبسط</span>
                  </div>
                  <p className="text-sm leading-[2] text-foreground">{current.tafsir}</p>
                </div>

                {/* Action */}
                <div className="card-surface p-4 bg-accent/5 border-accent/15">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-4 h-4 text-accent" />
                    <span className="text-xs font-bold text-accent">تطبيق عملي</span>
                  </div>
                  <p className="text-sm leading-[1.8] text-foreground">{current.action}</p>
                </div>

                <button onClick={handleNext}
                  className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4" /> آية أخرى
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EmotionQuranPage;
