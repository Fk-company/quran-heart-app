import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudioPlayer } from '@/contexts/AudioContext';
import { Play, Pause, Heart, BookOpen } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

interface SakinahVerse {
  id: number;
  text: string;
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
  topic: string;
}

const sakinahVerses: SakinahVerse[] = [
  { id: 1, text: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ', surahName: 'الرعد', surahNumber: 13, ayahNumber: 28, topic: 'الطمأنينة' },
  { id: 2, text: 'هُوَ الَّذِي أَنزَلَ السَّكِينَةَ فِي قُلُوبِ الْمُؤْمِنِينَ لِيَزْدَادُوا إِيمَانًا مَّعَ إِيمَانِهِمْ', surahName: 'الفتح', surahNumber: 48, ayahNumber: 4, topic: 'السكينة' },
  { id: 3, text: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا', surahName: 'الشرح', surahNumber: 94, ayahNumber: 6, topic: 'اليسر' },
  { id: 4, text: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ', surahName: 'الطلاق', surahNumber: 65, ayahNumber: 3, topic: 'التوكل' },
  { id: 5, text: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', surahName: 'آل عمران', surahNumber: 3, ayahNumber: 173, topic: 'التوكل' },
  { id: 6, text: 'رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا وَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ', surahName: 'البقرة', surahNumber: 2, ayahNumber: 250, topic: 'الصبر' },
  { id: 7, text: 'وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ لِّلْمُؤْمِنِينَ', surahName: 'الإسراء', surahNumber: 17, ayahNumber: 82, topic: 'الشفاء' },
  { id: 8, text: 'يَا أَيَّتُهَا النَّفْسُ الْمُطْمَئِنَّةُ ارْجِعِي إِلَى رَبِّكِ رَاضِيَةً مَّرْضِيَّةً', surahName: 'الفجر', surahNumber: 89, ayahNumber: 27, topic: 'الرضا' },
  { id: 9, text: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا', surahName: 'الشرح', surahNumber: 94, ayahNumber: 5, topic: 'اليسر' },
  { id: 10, text: 'وَلَنَبْلُوَنَّكُم بِشَيْءٍ مِّنَ الْخَوْفِ وَالْجُوعِ وَنَقْصٍ مِّنَ الْأَمْوَالِ وَالْأَنفُسِ وَالثَّمَرَاتِ وَبَشِّرِ الصَّابِرِينَ', surahName: 'البقرة', surahNumber: 2, ayahNumber: 155, topic: 'الصبر' },
  { id: 11, text: 'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ', surahName: 'البقرة', surahNumber: 2, ayahNumber: 153, topic: 'الصبر' },
  { id: 12, text: 'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا', surahName: 'البقرة', surahNumber: 2, ayahNumber: 286, topic: 'الرحمة' },
  { id: 13, text: 'وَبَشِّرِ الصَّابِرِينَ الَّذِينَ إِذَا أَصَابَتْهُم مُّصِيبَةٌ قَالُوا إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ', surahName: 'البقرة', surahNumber: 2, ayahNumber: 156, topic: 'الصبر' },
  { id: 14, text: 'وَاللَّهُ خَيْرُ الرَّازِقِينَ', surahName: 'الجمعة', surahNumber: 62, ayahNumber: 11, topic: 'الرزق' },
  { id: 15, text: 'سَيَجْعَلُ اللَّهُ بَعْدَ عُسْرٍ يُسْرًا', surahName: 'الطلاق', surahNumber: 65, ayahNumber: 7, topic: 'اليسر' },
];

const topics = [...new Set(sakinahVerses.map(v => v.topic))];

const SakinahPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [favs, setFavs] = useState<number[]>([]);

  const filtered = selectedTopic ? sakinahVerses.filter(v => v.topic === selectedTopic) : sakinahVerses;

  const toggleFav = (id: number) => setFavs(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);

  const shareVerse = (verse: SakinahVerse) => {
    const text = `${verse.text}\n\n- سورة ${verse.surahName} (${verse.ayahNumber})`;
    if (navigator.share) navigator.share({ text });
    else navigator.clipboard.writeText(text);
  };

  return (
    <div className="page-container" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <PageHeader
          icon={Heart}
          title="آيات السكينة"
          subtitle={`${sakinahVerses.length} آية للراحة والطمأنينة`}
        />

        <div className="flex flex-wrap gap-2 mb-5">
          <button onClick={() => setSelectedTopic(null)} className={`filter-chip ${!selectedTopic ? 'active' : ''}`}>الكل</button>
          {topics.map(t => (
            <button key={t} onClick={() => setSelectedTopic(t)} className={`filter-chip ${selectedTopic === t ? 'active' : ''}`}>{t}</button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((verse) => (
            <div key={verse.id} className="card-surface">
              <div className="flex items-start gap-2 mb-3">
                <span className="verse-number flex-shrink-0 mt-1">{verse.ayahNumber}</span>
                <p className="font-amiri text-xl leading-[2] text-foreground flex-1">{verse.text}</p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <span className="stat-badge">{verse.topic}</span>
                  <button onClick={() => navigate(`/quran/${verse.surahNumber}`)} className="text-xs text-primary font-medium">
                    سورة {verse.surahName}
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => shareVerse(verse)} className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary">
                    <BookOpen className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => toggleFav(verse.id)} className={`fav-btn ${favs.includes(verse.id) ? 'active' : ''}`}>
                    <Heart className="w-3.5 h-3.5" fill={favs.includes(verse.id) ? 'currentColor' : 'none'} />
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

export default SakinahPage;
