export interface Dhikr {
  id: number;
  category: string;
  text: string;
  count: number;
  reference: string;
}

export const adhkarCategories = [
  { id: 'morning', name: 'اذكار الصباح', icon: 'sunrise' },
  { id: 'evening', name: 'اذكار المساء', icon: 'sunset' },
  { id: 'sleep', name: 'اذكار النوم', icon: 'moon' },
  { id: 'prayer', name: 'اذكار بعد الصلاة', icon: 'prayer' },
  { id: 'tasbih', name: 'التسبيح', icon: 'circle' },
];

export const adhkarData: Record<string, Dhikr[]> = {
  morning: [
    { id: 1, category: 'morning', text: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ', count: 1, reference: 'رواه الترمذي' },
    { id: 2, category: 'morning', text: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَـهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', count: 1, reference: 'رواه أبو داود' },
    { id: 3, category: 'morning', text: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ', count: 100, reference: 'متفق عليه' },
    { id: 4, category: 'morning', text: 'لَا إِلَـهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', count: 10, reference: 'متفق عليه' },
    { id: 5, category: 'morning', text: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ', count: 3, reference: 'رواه ابن ماجه' },
    { id: 6, category: 'morning', text: 'بِسْمِ اللهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ', count: 3, reference: 'رواه أبو داود والترمذي' },
  ],
  evening: [
    { id: 7, category: 'evening', text: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ', count: 1, reference: 'رواه الترمذي' },
    { id: 8, category: 'evening', text: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَـهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ', count: 1, reference: 'رواه أبو داود' },
    { id: 9, category: 'evening', text: 'أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ', count: 3, reference: 'رواه مسلم' },
    { id: 10, category: 'evening', text: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ', count: 100, reference: 'متفق عليه' },
    { id: 11, category: 'evening', text: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ', count: 3, reference: 'رواه ابن ماجه' },
  ],
  sleep: [
    { id: 12, category: 'sleep', text: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا', count: 1, reference: 'رواه البخاري' },
    { id: 13, category: 'sleep', text: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ', count: 3, reference: 'رواه أبو داود' },
    { id: 14, category: 'sleep', text: 'سُبْحَانَ اللهِ (33) وَالْحَمْدُ لِلَّهِ (33) وَاللهُ أَكْبَرُ (34)', count: 1, reference: 'متفق عليه' },
  ],
  prayer: [
    { id: 15, category: 'prayer', text: 'أَسْتَغْفِرُ اللهَ', count: 3, reference: 'رواه مسلم' },
    { id: 16, category: 'prayer', text: 'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ', count: 1, reference: 'رواه مسلم' },
    { id: 17, category: 'prayer', text: 'سُبْحَانَ اللهِ', count: 33, reference: 'رواه مسلم' },
    { id: 18, category: 'prayer', text: 'الْحَمْدُ لِلَّهِ', count: 33, reference: 'رواه مسلم' },
    { id: 19, category: 'prayer', text: 'اللهُ أَكْبَرُ', count: 33, reference: 'رواه مسلم' },
  ],
  tasbih: [
    { id: 20, category: 'tasbih', text: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ سُبْحَانَ اللهِ الْعَظِيمِ', count: 100, reference: 'متفق عليه' },
    { id: 21, category: 'tasbih', text: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ', count: 100, reference: 'متفق عليه' },
    { id: 22, category: 'tasbih', text: 'أَسْتَغْفِرُ اللهَ وَأَتُوبُ إِلَيْهِ', count: 100, reference: 'متفق عليه' },
    { id: 23, category: 'tasbih', text: 'لَا إِلَـهَ إِلَّا اللهُ', count: 100, reference: 'رواه البخاري' },
  ],
};
