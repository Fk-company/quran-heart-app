import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Grid3X3, List, Star } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

interface Name {
  id: number;
  name: string;
  transliteration: string;
  meaning: string;
  details: string;
  verse?: string;
}

const asmaAlHusna: Name[] = [
  { id: 1, name: 'الرَّحْمَنُ', transliteration: 'Ar-Rahman', meaning: 'الرحمن', details: 'الذي وسعت رحمته كل شيء', verse: 'بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ' },
  { id: 2, name: 'الرَّحِيمُ', transliteration: 'Ar-Rahim', meaning: 'الرحيم', details: 'الذي يرحم عباده المؤمنين رحمة خاصة', verse: 'وَكَانَ بِالْمُؤْمِنِينَ رَحِيمًا' },
  { id: 3, name: 'المَلِكُ', transliteration: 'Al-Malik', meaning: 'الملك', details: 'المالك لكل شيء، المتصرف في ملكه كيف يشاء' },
  { id: 4, name: 'القُدُّوسُ', transliteration: 'Al-Quddus', meaning: 'القدوس', details: 'المنزه عن كل عيب ونقص' },
  { id: 5, name: 'السَّلَامُ', transliteration: 'As-Salam', meaning: 'السلام', details: 'الذي سلم من كل عيب ونقص' },
  { id: 6, name: 'المُؤْمِنُ', transliteration: 'Al-Mumin', meaning: 'المؤمن', details: 'الذي يؤمّن خلقه من الظلم' },
  { id: 7, name: 'المُهَيْمِنُ', transliteration: 'Al-Muhaymin', meaning: 'المهيمن', details: 'الرقيب الحافظ لكل شيء' },
  { id: 8, name: 'العَزِيزُ', transliteration: 'Al-Aziz', meaning: 'العزيز', details: 'الغالب الذي لا يُغلب' },
  { id: 9, name: 'الجَبَّارُ', transliteration: 'Al-Jabbar', meaning: 'الجبار', details: 'الذي يجبر كسر عباده ويصلح حالهم' },
  { id: 10, name: 'المُتَكَبِّرُ', transliteration: 'Al-Mutakabbir', meaning: 'المتكبر', details: 'الذي تكبر عن كل سوء وعيب' },
  { id: 11, name: 'الخَالِقُ', transliteration: 'Al-Khaliq', meaning: 'الخالق', details: 'الذي أوجد الأشياء من العدم' },
  { id: 12, name: 'البَارِئُ', transliteration: 'Al-Bari', meaning: 'البارئ', details: 'الذي خلق الخلق بلا مثال سابق' },
  { id: 13, name: 'المُصَوِّرُ', transliteration: 'Al-Musawwir', meaning: 'المصور', details: 'الذي صور جميع المخلوقات وميز بعضها عن بعض' },
  { id: 14, name: 'الغَفَّارُ', transliteration: 'Al-Ghaffar', meaning: 'الغفار', details: 'الذي يغفر الذنوب مهما عظمت' },
  { id: 15, name: 'القَهَّارُ', transliteration: 'Al-Qahhar', meaning: 'القهار', details: 'الذي قهر جميع المخلوقات' },
  { id: 16, name: 'الوَهَّابُ', transliteration: 'Al-Wahhab', meaning: 'الوهاب', details: 'كثير العطاء بلا عوض' },
  { id: 17, name: 'الرَّزَّاقُ', transliteration: 'Ar-Razzaq', meaning: 'الرزاق', details: 'الذي يرزق جميع المخلوقات' },
  { id: 18, name: 'الفَتَّاحُ', transliteration: 'Al-Fattah', meaning: 'الفتاح', details: 'الذي يفتح أبواب الرحمة والرزق' },
  { id: 19, name: 'العَلِيمُ', transliteration: 'Al-Alim', meaning: 'العليم', details: 'الذي يعلم كل شيء ظاهره وباطنه' },
  { id: 20, name: 'القَابِضُ', transliteration: 'Al-Qabid', meaning: 'القابض', details: 'الذي يقبض الأرزاق والأرواح' },
  { id: 21, name: 'البَاسِطُ', transliteration: 'Al-Basit', meaning: 'الباسط', details: 'الذي يبسط الرزق لمن يشاء' },
  { id: 22, name: 'الخَافِضُ', transliteration: 'Al-Khafid', meaning: 'الخافض', details: 'الذي يخفض من يستحق الخفض' },
  { id: 23, name: 'الرَّافِعُ', transliteration: 'Ar-Rafi', meaning: 'الرافع', details: 'الذي يرفع المؤمنين بالطاعة' },
  { id: 24, name: 'المُعِزُّ', transliteration: 'Al-Muizz', meaning: 'المعز', details: 'الذي يعز من يشاء من عباده' },
  { id: 25, name: 'المُذِلُّ', transliteration: 'Al-Mudhill', meaning: 'المذل', details: 'الذي يذل من يشاء من الكافرين والعاصين' },
  { id: 26, name: 'السَّمِيعُ', transliteration: 'As-Sami', meaning: 'السميع', details: 'الذي يسمع جميع الأصوات' },
  { id: 27, name: 'البَصِيرُ', transliteration: 'Al-Basir', meaning: 'البصير', details: 'الذي يبصر كل شيء' },
  { id: 28, name: 'الحَكَمُ', transliteration: 'Al-Hakam', meaning: 'الحكم', details: 'الذي يحكم بين عباده بالحق والعدل' },
  { id: 29, name: 'العَدْلُ', transliteration: 'Al-Adl', meaning: 'العدل', details: 'الذي لا يظلم أحداً' },
  { id: 30, name: 'اللَّطِيفُ', transliteration: 'Al-Latif', meaning: 'اللطيف', details: 'الذي يلطف بعباده من حيث لا يعلمون' },
  { id: 31, name: 'الخَبِيرُ', transliteration: 'Al-Khabir', meaning: 'الخبير', details: 'الذي لا يخفى عليه شيء' },
  { id: 32, name: 'الحَلِيمُ', transliteration: 'Al-Halim', meaning: 'الحليم', details: 'الذي لا يعاجل بالعقوبة' },
  { id: 33, name: 'العَظِيمُ', transliteration: 'Al-Azim', meaning: 'العظيم', details: 'الذي له العظمة في كل شيء' },
  { id: 34, name: 'الغَفُورُ', transliteration: 'Al-Ghafur', meaning: 'الغفور', details: 'الذي يغفر الذنوب ويستر العيوب' },
  { id: 35, name: 'الشَّكُورُ', transliteration: 'Ash-Shakur', meaning: 'الشكور', details: 'الذي يثيب على القليل من العمل' },
  { id: 36, name: 'العَلِيُّ', transliteration: 'Al-Aliyy', meaning: 'العلي', details: 'الذي علا فوق كل شيء' },
  { id: 37, name: 'الكَبِيرُ', transliteration: 'Al-Kabir', meaning: 'الكبير', details: 'الذي له الكبرياء في السماوات والأرض' },
  { id: 38, name: 'الحَفِيظُ', transliteration: 'Al-Hafiz', meaning: 'الحفيظ', details: 'الذي يحفظ كل شيء' },
  { id: 39, name: 'المُقِيتُ', transliteration: 'Al-Muqit', meaning: 'المقيت', details: 'الذي يوصل القوت والغذاء لكل مخلوق' },
  { id: 40, name: 'الحَسِيبُ', transliteration: 'Al-Hasib', meaning: 'الحسيب', details: 'الكافي الذي يحاسب عباده' },
  { id: 41, name: 'الجَلِيلُ', transliteration: 'Al-Jalil', meaning: 'الجليل', details: 'العظيم ذو الجلال والإكرام' },
  { id: 42, name: 'الكَرِيمُ', transliteration: 'Al-Karim', meaning: 'الكريم', details: 'الجواد المعطي الذي لا ينفد عطاؤه' },
  { id: 43, name: 'الرَّقِيبُ', transliteration: 'Ar-Raqib', meaning: 'الرقيب', details: 'الذي لا يغفل عن شيء' },
  { id: 44, name: 'المُجِيبُ', transliteration: 'Al-Mujib', meaning: 'المجيب', details: 'الذي يجيب دعوة الداعي إذا دعاه' },
  { id: 45, name: 'الوَاسِعُ', transliteration: 'Al-Wasi', meaning: 'الواسع', details: 'الذي وسع علمه ورحمته كل شيء' },
  { id: 46, name: 'الحَكِيمُ', transliteration: 'Al-Hakim', meaning: 'الحكيم', details: 'الذي يضع الأمور في مواضعها' },
  { id: 47, name: 'الوَدُودُ', transliteration: 'Al-Wadud', meaning: 'الودود', details: 'الذي يحب عباده المؤمنين ويحبونه' },
  { id: 48, name: 'المَجِيدُ', transliteration: 'Al-Majid', meaning: 'المجيد', details: 'العظيم ذو الكرم والجود' },
  { id: 49, name: 'البَاعِثُ', transliteration: 'Al-Baith', meaning: 'الباعث', details: 'الذي يبعث الخلق يوم القيامة' },
  { id: 50, name: 'الشَّهِيدُ', transliteration: 'Ash-Shahid', meaning: 'الشهيد', details: 'الذي لا يغيب عنه شيء' },
  { id: 51, name: 'الحَقُّ', transliteration: 'Al-Haqq', meaning: 'الحق', details: 'الثابت الذي لا يزول' },
  { id: 52, name: 'الوَكِيلُ', transliteration: 'Al-Wakil', meaning: 'الوكيل', details: 'الكافي المتوكَّل عليه' },
  { id: 53, name: 'القَوِيُّ', transliteration: 'Al-Qawiyy', meaning: 'القوي', details: 'الذي لا يعجزه شيء' },
  { id: 54, name: 'المَتِينُ', transliteration: 'Al-Matin', meaning: 'المتين', details: 'الشديد القوة الذي لا يلحقه ضعف' },
  { id: 55, name: 'الوَلِيُّ', transliteration: 'Al-Waliyy', meaning: 'الولي', details: 'الناصر المتولي لأمور عباده' },
  { id: 56, name: 'الحَمِيدُ', transliteration: 'Al-Hamid', meaning: 'الحميد', details: 'المستحق للحمد والثناء' },
  { id: 57, name: 'المُحْصِي', transliteration: 'Al-Muhsi', meaning: 'المحصي', details: 'الذي أحصى كل شيء عدداً' },
  { id: 58, name: 'المُبْدِئُ', transliteration: 'Al-Mubdi', meaning: 'المبدئ', details: 'الذي بدأ خلق كل شيء' },
  { id: 59, name: 'المُعِيدُ', transliteration: 'Al-Muid', meaning: 'المعيد', details: 'الذي يعيد الخلق بعد الموت' },
  { id: 60, name: 'المُحْيِي', transliteration: 'Al-Muhyi', meaning: 'المحيي', details: 'الذي يحيي الموتى' },
  { id: 61, name: 'المُمِيتُ', transliteration: 'Al-Mumit', meaning: 'المميت', details: 'الذي يميت من يشاء' },
  { id: 62, name: 'الحَيُّ', transliteration: 'Al-Hayy', meaning: 'الحي', details: 'الذي له حياة كاملة لم تسبق بعدم' },
  { id: 63, name: 'القَيُّومُ', transliteration: 'Al-Qayyum', meaning: 'القيوم', details: 'القائم بنفسه المقيم لغيره' },
  { id: 64, name: 'الوَاجِدُ', transliteration: 'Al-Wajid', meaning: 'الواجد', details: 'الغني الذي لا يحتاج إلى شيء' },
  { id: 65, name: 'المَاجِدُ', transliteration: 'Al-Majid', meaning: 'الماجد', details: 'ذو المجد والكرم والعطاء' },
  { id: 66, name: 'الوَاحِدُ', transliteration: 'Al-Wahid', meaning: 'الواحد', details: 'الفرد الذي لا شريك له' },
  { id: 67, name: 'الأَحَدُ', transliteration: 'Al-Ahad', meaning: 'الأحد', details: 'الذي لا نظير له' },
  { id: 68, name: 'الصَّمَدُ', transliteration: 'As-Samad', meaning: 'الصمد', details: 'الذي يصمد إليه في الحوائج' },
  { id: 69, name: 'القَادِرُ', transliteration: 'Al-Qadir', meaning: 'القادر', details: 'الذي له القدرة الكاملة' },
  { id: 70, name: 'المُقْتَدِرُ', transliteration: 'Al-Muqtadir', meaning: 'المقتدر', details: 'التام القدرة' },
  { id: 71, name: 'المُقَدِّمُ', transliteration: 'Al-Muqaddim', meaning: 'المقدم', details: 'الذي يقدم ما يشاء' },
  { id: 72, name: 'المُؤَخِّرُ', transliteration: 'Al-Muakhkhir', meaning: 'المؤخر', details: 'الذي يؤخر ما يشاء' },
  { id: 73, name: 'الأَوَّلُ', transliteration: 'Al-Awwal', meaning: 'الأول', details: 'الذي ليس قبله شيء' },
  { id: 74, name: 'الآخِرُ', transliteration: 'Al-Akhir', meaning: 'الآخر', details: 'الذي ليس بعده شيء' },
  { id: 75, name: 'الظَّاهِرُ', transliteration: 'Az-Zahir', meaning: 'الظاهر', details: 'الذي ظهر فوق كل شيء' },
  { id: 76, name: 'البَاطِنُ', transliteration: 'Al-Batin', meaning: 'الباطن', details: 'المحتجب عن الأبصار' },
  { id: 77, name: 'الوَالِي', transliteration: 'Al-Wali', meaning: 'الوالي', details: 'المالك المتصرف في خلقه' },
  { id: 78, name: 'المُتَعَالِي', transliteration: 'Al-Mutaali', meaning: 'المتعالي', details: 'المرتفع عن صفات المخلوقين' },
  { id: 79, name: 'البَرُّ', transliteration: 'Al-Barr', meaning: 'البر', details: 'العطوف على عباده بإحسانه' },
  { id: 80, name: 'التَّوَّابُ', transliteration: 'At-Tawwab', meaning: 'التواب', details: 'الذي يقبل توبة عباده' },
  { id: 81, name: 'المُنْتَقِمُ', transliteration: 'Al-Muntaqim', meaning: 'المنتقم', details: 'الذي ينتقم من العصاة بالعدل' },
  { id: 82, name: 'العَفُوُّ', transliteration: 'Al-Afuww', meaning: 'العفو', details: 'الذي يمحو السيئات ويتجاوز عنها' },
  { id: 83, name: 'الرَّؤُوفُ', transliteration: 'Ar-Rauf', meaning: 'الرؤوف', details: 'الرحيم بعباده ذو الرأفة' },
  { id: 84, name: 'مَالِكُ المُلْكِ', transliteration: 'Malik-ul-Mulk', meaning: 'مالك الملك', details: 'المتصرف في ملكه كيف يشاء' },
  { id: 85, name: 'ذُو الجَلَالِ وَالإِكْرَامِ', transliteration: 'Dhul-Jalali wal-Ikram', meaning: 'ذو الجلال والإكرام', details: 'المستحق أن يُجَلّ ويُكرَم' },
  { id: 86, name: 'المُقْسِطُ', transliteration: 'Al-Muqsit', meaning: 'المقسط', details: 'العادل في حكمه' },
  { id: 87, name: 'الجَامِعُ', transliteration: 'Al-Jami', meaning: 'الجامع', details: 'الذي يجمع الخلائق يوم القيامة' },
  { id: 88, name: 'الغَنِيُّ', transliteration: 'Al-Ghaniyy', meaning: 'الغني', details: 'الذي لا يحتاج إلى أحد' },
  { id: 89, name: 'المُغْنِي', transliteration: 'Al-Mughni', meaning: 'المغني', details: 'الذي يغني من يشاء' },
  { id: 90, name: 'المَانِعُ', transliteration: 'Al-Mani', meaning: 'المانع', details: 'الذي يمنع ما يشاء عمن يشاء' },
  { id: 91, name: 'الضَّارُّ', transliteration: 'Ad-Darr', meaning: 'الضار', details: 'الذي يُنزل الضر على من يشاء' },
  { id: 92, name: 'النَّافِعُ', transliteration: 'An-Nafi', meaning: 'النافع', details: 'الذي ينفع من يشاء' },
  { id: 93, name: 'النُّورُ', transliteration: 'An-Nur', meaning: 'النور', details: 'الذي نوّر السماوات والأرض' },
  { id: 94, name: 'الهَادِي', transliteration: 'Al-Hadi', meaning: 'الهادي', details: 'الذي يهدي من يشاء إلى الحق' },
  { id: 95, name: 'البَدِيعُ', transliteration: 'Al-Badi', meaning: 'البديع', details: 'المبدع الذي خلق على غير مثال سابق' },
  { id: 96, name: 'البَاقِي', transliteration: 'Al-Baqi', meaning: 'الباقي', details: 'الدائم الذي لا يفنى' },
  { id: 97, name: 'الوَارِثُ', transliteration: 'Al-Warith', meaning: 'الوارث', details: 'الباقي بعد فناء خلقه' },
  { id: 98, name: 'الرَّشِيدُ', transliteration: 'Ar-Rashid', meaning: 'الرشيد', details: 'الذي أرشد الخلق إلى مصالحهم' },
  { id: 99, name: 'الصَّبُورُ', transliteration: 'As-Sabur', meaning: 'الصبور', details: 'الذي لا يعاجل العصاة بالعقوبة' },
];

const AsmaAlHusnaPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  const filtered = search.trim()
    ? asmaAlHusna.filter((n) => n.name.includes(search) || n.meaning.includes(search) || n.transliteration.toLowerCase().includes(search.toLowerCase()))
    : asmaAlHusna;

  return (
    <div className="page-container" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <PageHeader
          icon={Star}
          title="أسماء الله الحسنى"
          subtitle="99 اسماً لله تعالى"
          gradient="gold"
          actions={
            <div className="flex gap-1">
              <button onClick={() => setViewMode('list')} className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}><List className="w-4 h-4" /></button>
              <button onClick={() => setViewMode('grid')} className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}><Grid3X3 className="w-4 h-4" /></button>
            </div>
          }
        />

        <div className="relative mb-4">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث عن اسم..." className="search-input pr-10" />
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-3 gap-2">
            {filtered.map((n) => (
              <button key={n.id} onClick={() => setExpandedId(expandedId === n.id ? null : n.id)}
                className={`card-surface flex flex-col items-center py-3 gap-1 transition-all ${expandedId === n.id ? 'border-primary/30 bg-primary/5' : ''}`}>
                <span className="verse-number text-xs">{n.id}</span>
                <span className="font-amiri text-base text-foreground font-bold mt-1">{n.name}</span>
                <span className="text-[10px] text-muted-foreground">{n.meaning}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((n) => {
              const isExp = expandedId === n.id;
              return (
                <div key={n.id} className="card-surface">
                  <button onClick={() => setExpandedId(isExp ? null : n.id)} className="w-full flex items-center gap-3">
                    <span className="verse-number flex-shrink-0">{n.id}</span>
                    <div className="flex-1 text-right">
                      <div className="font-amiri text-lg text-foreground font-bold">{n.name}</div>
                      <div className="text-xs text-muted-foreground">{n.meaning}</div>
                    </div>
                    {isExp ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </button>
                  {isExp && (
                    <div className="mt-3 pt-3 border-t border-border animate-fade-in space-y-2">
                      <p className="text-sm text-foreground leading-relaxed">{n.details}</p>
                      {n.verse && (
                        <div className="p-3 rounded-xl bg-primary/5">
                          <p className="font-amiri text-base text-primary text-center">{n.verse}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AsmaAlHusnaPage;
