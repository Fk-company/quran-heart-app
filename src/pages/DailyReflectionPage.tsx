import React, { useMemo, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { Lightbulb, BookOpen, Heart, RefreshCw, Share2, Copy, Check } from 'lucide-react';

interface DailyReflection {
  text: string;
  surah: string;
  ayah: number;
  reflection: string;
  action: string;
}

const reflections: DailyReflection[] = [
  { text: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا', surah: 'الشرح', ayah: 6, reflection: 'في كل ابتلاء يسر مخبأ لا تراه بعينك بل بإيمانك. ابحث عن اليسر في عسرك.', action: 'اكتب 3 أشياء صعبة مررت بها وتحولت لخير.' },
  { text: 'وَاصْبِرْ فَإِنَّ اللَّهَ لَا يُضِيعُ أَجْرَ الْمُحْسِنِينَ', surah: 'هود', ayah: 115, reflection: 'الصبر ليس ضعفاً بل قوة إيمانية. والله لا يضيع أجر من أحسن عملاً.', action: 'تحمّل موقفاً صعباً اليوم بصبر واحتسب الأجر.' },
  { text: 'وَلَا تَمْشِ فِي الْأَرْضِ مَرَحًا', surah: 'الإسراء', ayah: 37, reflection: 'التواضع خلق الأنبياء. كلما ارتفعت مكانتك تواضع أكثر.', action: 'ساعد شخصاً بحاجة اليوم دون أن يعلم أحد.' },
  { text: 'وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ', surah: 'المائدة', ayah: 2, reflection: 'التعاون على الخير يضاعف الأجر ويقوي المجتمع المسلم.', action: 'شارك في عمل خيري أو ساعد جارك اليوم.' },
  { text: 'خُذِ الْعَفْوَ وَأْمُرْ بِالْعُرْفِ وَأَعْرِضْ عَنِ الْجَاهِلِينَ', surah: 'الأعراف', ayah: 199, reflection: 'العفو يحرر قلبك من أثقال الغضب. سامح لأجل راحتك أنت قبل غيرك.', action: 'سامح شخصاً أساء إليك وادعُ له بالهداية.' },
  { text: 'وَقُولُوا لِلنَّاسِ حُسْنًا', surah: 'البقرة', ayah: 83, reflection: 'الكلمة الطيبة صدقة. كل كلمة تخرج من فمك إما ترفعك أو تخفضك.', action: 'قل كلمة طيبة لـ 3 أشخاص مختلفين اليوم.' },
  { text: 'وَمَا تُقَدِّمُوا لِأَنفُسِكُم مِّنْ خَيْرٍ تَجِدُوهُ عِندَ اللَّهِ', surah: 'البقرة', ayah: 110, reflection: 'كل خير تفعله محفوظ عند الله لن يضيع. استثمر في آخرتك.', action: 'تصدق بأي مبلغ اليوم ولو كان قليلاً.' },
  { text: 'إِنَّ اللَّهَ يُحِبُّ الْمُحْسِنِينَ', surah: 'البقرة', ayah: 195, reflection: 'الإحسان أن تعبد الله كأنك تراه. أتقن عملك واجعله خالصاً لله.', action: 'أتقن عملاً واحداً اليوم واجعله لوجه الله.' },
  { text: 'وَلَا تَنسَوُا الْفَضْلَ بَيْنَكُمْ', surah: 'البقرة', ayah: 237, reflection: 'تذكر فضل الناس عليك. الاعتراف بالجميل من شيم المؤمنين.', action: 'اشكر شخصاً أحسن إليك ولم تشكره من قبل.' },
  { text: 'وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ', surah: 'البقرة', ayah: 45, reflection: 'الصلاة ملجأ المؤمن في كل حال. إذا ضاق صدرك فافزع إلى الصلاة.', action: 'صلِّ ركعتين نافلة وادعُ الله بما في قلبك.' },
  { text: 'وَأَنفِقُوا فِي سَبِيلِ اللَّهِ وَلَا تُلْقُوا بِأَيْدِيكُمْ إِلَى التَّهْلُكَةِ', surah: 'البقرة', ayah: 195, reflection: 'الإنفاق في سبيل الله لا ينقص المال بل يزيده ويبارك فيه.', action: 'أنفق شيئاً في سبيل الله اليوم وراقب البركة.' },
  { text: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً', surah: 'البقرة', ayah: 201, reflection: 'هذا الدعاء الجامع يطلب خير الدنيا والآخرة معاً.', action: 'ردد هذا الدعاء 7 مرات وتأمل معناه.' },
  { text: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا', surah: 'الطلاق', ayah: 2, reflection: 'التقوى مفتاح الفرج. كلما زاد إيمانك اتسعت الأبواب أمامك.', action: 'راجع نيتك في أعمالك اليوم واجعلها لله.' },
  { text: 'ادْعُونِي أَسْتَجِبْ لَكُمْ', surah: 'غافر', ayah: 60, reflection: 'الله يحب أن تدعوه. الدعاء ليس عجزاً بل هو أعظم قوة يملكها المؤمن.', action: 'خصص 10 دقائق للدعاء بين يدي الله اليوم.' },
];

const DailyReflectionPage: React.FC = () => {
  const dayOfYear = useMemo(() => Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000), []);
  const todayReflection = useMemo(() => reflections[dayOfYear % reflections.length], [dayOfYear]);
  const [showAll, setShowAll] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `${todayReflection.text}\nسورة ${todayReflection.surah} - آية ${todayReflection.ayah}\n\nتدبر: ${todayReflection.reflection}\n\nتطبيق عملي: ${todayReflection.action}`;
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const handleShare = () => {
    const text = `${todayReflection.text}\nسورة ${todayReflection.surah} - آية ${todayReflection.ayah}\n\nتدبر: ${todayReflection.reflection}\n\nتطبيق عملي: ${todayReflection.action}`;
    if (navigator.share) navigator.share({ title: 'تأمل اليوم', text });
    else handleCopy();
  };

  return (
    <div className="page-container page-with-topbar" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <PageHeader icon={Lightbulb} title="تأملات يومية" subtitle="آية وتدبر وعمل" gradient="gold"
          actions={
            <div className="flex gap-1">
              <button onClick={handleShare} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <Share2 className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <button onClick={handleCopy} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
              </button>
            </div>
          }
        />

        {/* Today's reflection */}
        <div className="mb-6">
          <div className="text-center mb-3">
            <span className="text-[10px] bg-primary/10 text-primary font-bold rounded-full px-3 py-1">تأمل اليوم</span>
          </div>

          <div className="card-surface p-5 bg-primary/3 border-primary/10 mb-3">
            <p className="font-amiri text-xl leading-[2.4] text-center text-foreground mb-2">{todayReflection.text}</p>
            <p className="text-xs text-muted-foreground text-center">سورة {todayReflection.surah} - آية {todayReflection.ayah}</p>
          </div>

          <div className="card-surface p-4 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-primary">رسالة تدبر</span>
            </div>
            <p className="text-sm leading-[2] text-foreground">{todayReflection.reflection}</p>
          </div>

          <div className="card-surface p-4 bg-accent/5 border-accent/15">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-accent" />
              <span className="text-xs font-bold text-accent">تطبيق عملي</span>
            </div>
            <p className="text-sm leading-[1.8] text-foreground">{todayReflection.action}</p>
          </div>
        </div>

        {/* Show all */}
        <button onClick={() => setShowAll(!showAll)}
          className="w-full py-3 rounded-xl bg-secondary text-foreground font-bold text-sm mb-4">
          {showAll ? 'إخفاء التأملات السابقة' : 'عرض جميع التأملات'}
        </button>

        {showAll && (
          <div className="space-y-3">
            {reflections.filter((_, i) => i !== (dayOfYear % reflections.length)).map((r, i) => (
              <div key={i} className="card-surface p-4">
                <p className="font-amiri text-base leading-[2] text-center text-foreground mb-2">{r.text}</p>
                <p className="text-[10px] text-muted-foreground text-center mb-2">سورة {r.surah} - آية {r.ayah}</p>
                <p className="text-xs text-muted-foreground leading-[1.8]">{r.reflection}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyReflectionPage;
