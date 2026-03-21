import React, { useState } from 'react';
import { Search, Heart, ChevronDown, ChevronUp, BookOpen, Share2 } from 'lucide-react';

interface Dua {
  id: number;
  text: string;
  category: string;
  reference: string;
  occasion?: string;
}

const duaCategories = [
  { id: 'morning', name: 'أدعية الصباح' },
  { id: 'evening', name: 'أدعية المساء' },
  { id: 'travel', name: 'أدعية السفر' },
  { id: 'food', name: 'أدعية الطعام' },
  { id: 'forgiveness', name: 'الاستغفار' },
  { id: 'protection', name: 'الحماية والحفظ' },
  { id: 'healing', name: 'الشفاء' },
  { id: 'quran', name: 'أدعية قرآنية' },
  { id: 'daily', name: 'أدعية يومية' },
];

const duas: Dua[] = [
  { id: 1, text: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ', category: 'morning', reference: 'رواه ابن ماجه' },
  { id: 2, text: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ', category: 'morning', reference: 'رواه أبو داود' },
  { id: 3, text: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ', category: 'evening', reference: 'رواه مسلم' },
  { id: 4, text: 'اللَّهُمَّ بِعِلْمِكَ الْغَيْبَ وَقُدْرَتِكَ عَلَى الْخَلْقِ أَحْيِنِي مَا عَلِمْتَ الْحَيَاةَ خَيْرًا لِي وَتَوَفَّنِي إِذَا عَلِمْتَ الْوَفَاةَ خَيْرًا لِي', category: 'daily', reference: 'رواه النسائي' },
  { id: 5, text: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنقَلِبُونَ', category: 'travel', reference: 'رواه مسلم', occasion: 'عند ركوب الدابة' },
  { id: 6, text: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ هَذَا السَّفَرِ وَخَيْرَ مَا فِيهِ', category: 'travel', reference: 'رواه مسلم' },
  { id: 7, text: 'بِسْمِ اللَّهِ وَعَلَى بَرَكَةِ اللَّهِ', category: 'food', reference: 'رواه أبو داود', occasion: 'قبل الطعام' },
  { id: 8, text: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا الطَّعَامَ وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ', category: 'food', reference: 'رواه الترمذي', occasion: 'بعد الطعام' },
  { id: 9, text: 'أَسْتَغْفِرُ اللَّهَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيَّ الْقَيُّومَ وَأَتُوبُ إِلَيْهِ', category: 'forgiveness', reference: 'رواه أبو داود' },
  { id: 10, text: 'رَبِّ اغْفِرْ لِي خَطِيئَتِي وَجَهْلِي وَإِسْرَافِي فِي أَمْرِي وَمَا أَنْتَ أَعْلَمُ بِهِ مِنِّي', category: 'forgiveness', reference: 'متفق عليه' },
  { id: 11, text: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ وَالْعَجْزِ وَالْكَسَلِ وَالْبُخْلِ وَالْجُبْنِ وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ', category: 'protection', reference: 'رواه البخاري' },
  { id: 12, text: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ زَوَالِ نِعْمَتِكَ وَتَحَوُّلِ عَافِيَتِكَ وَفُجَاءَةِ نِقْمَتِكَ وَجَمِيعِ سَخَطِكَ', category: 'protection', reference: 'رواه مسلم' },
  { id: 13, text: 'اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَأْسَ اشْفِ أَنْتَ الشَّافِي لَا شِفَاءَ إِلَّا شِفَاؤُكَ شِفَاءً لَا يُغَادِرُ سَقَمًا', category: 'healing', reference: 'متفق عليه' },
  { id: 14, text: 'أَسْأَلُ اللَّهَ الْعَظِيمَ رَبَّ الْعَرْشِ الْعَظِيمِ أَنْ يَشْفِيَكَ', category: 'healing', reference: 'رواه الترمذي' },
  { id: 15, text: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', category: 'quran', reference: 'البقرة: 201' },
  { id: 16, text: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي', category: 'quran', reference: 'طه: 25-26' },
  { id: 17, text: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا', category: 'quran', reference: 'الفرقان: 74' },
  { id: 18, text: 'اللَّهُمَّ اهْدِنِي وَسَدِّدْنِي', category: 'daily', reference: 'رواه مسلم' },
  { id: 19, text: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى', category: 'daily', reference: 'رواه مسلم' },
  { id: 20, text: 'يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ', category: 'daily', reference: 'رواه الترمذي' },
];

const DuaPage: React.FC = () => {
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [favs, setFavs] = useState<number[]>([]);

  const filtered = selectedCat
    ? duas.filter(d => d.category === selectedCat)
    : search.trim() ? duas.filter(d => d.text.includes(search)) : duas;

  const toggleFav = (id: number) => setFavs(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);

  const shareDua = (dua: Dua) => {
    const text = `${dua.text}\n\n${dua.reference}`;
    if (navigator.share) navigator.share({ text });
    else navigator.clipboard.writeText(text);
  };

  return (
    <div className="page-container" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">الأدعية</h1>
            <p className="text-xs text-muted-foreground">{duas.length} دعاء</p>
          </div>
        </div>

        <div className="relative mb-4">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setSelectedCat(null); }} placeholder="ابحث في الأدعية..." className="search-input pr-10" />
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          <button onClick={() => { setSelectedCat(null); setSearch(''); }} className={`filter-chip ${!selectedCat ? 'active' : ''}`}>الكل</button>
          {duaCategories.map(cat => (
            <button key={cat.id} onClick={() => { setSelectedCat(cat.id); setSearch(''); }} className={`filter-chip ${selectedCat === cat.id ? 'active' : ''}`}>{cat.name}</button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map(dua => (
            <div key={dua.id} className="card-surface">
              <p className="font-amiri text-lg leading-[2] text-foreground mb-3">{dua.text}</p>
              {dua.occasion && <div className="stat-badge mb-2">{dua.occasion}</div>}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-[11px] text-muted-foreground">{dua.reference}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => shareDua(dua)} className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary">
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => toggleFav(dua.id)} className={`fav-btn ${favs.includes(dua.id) ? 'active' : ''}`}>
                    <Heart className="w-3.5 h-3.5" fill={favs.includes(dua.id) ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DuaPage;
