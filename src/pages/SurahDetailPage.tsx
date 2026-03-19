import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchSurahAyahs, fetchTafsir, fetchSurahs, fetchReciters, type Ayah, type Surah, type Reciter } from '@/lib/api';
import { useAudioPlayer } from '@/contexts/AudioContext';
import { ArrowRight, BookOpen, Play, Pause, Mic } from 'lucide-react';

const SurahDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [tafsir, setTafsir] = useState<Ayah[]>([]);
  const [surah, setSurah] = useState<Surah | null>(null);
  const [showTafsir, setShowTafsir] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [selectedReciter, setSelectedReciter] = useState<Reciter | null>(null);
  const [showReciterPicker, setShowReciterPicker] = useState(false);
  const { play, pause, currentTrack, isPlaying } = useAudioPlayer();

  const surahNum = Number(id);

  useEffect(() => {
    if (!surahNum) return;
    setLoading(true);
    Promise.all([
      fetchSurahAyahs(surahNum),
      fetchTafsir(surahNum),
      fetchSurahs(),
      fetchReciters(),
    ]).then(([ayahData, tafsirData, surahsData, recitersData]) => {
      setAyahs(ayahData);
      setTafsir(tafsirData);
      setSurah(surahsData.find((s) => s.number === surahNum) || null);
      setReciters(recitersData.slice(0, 30));
      if (recitersData.length > 0) setSelectedReciter(recitersData[0]);
      setLoading(false);
    });
  }, [surahNum]);

  const handlePlaySurah = () => {
    if (!selectedReciter) return;
    const moshaf = selectedReciter.moshaf?.[0];
    if (!moshaf) return;
    const paddedNum = String(surahNum).padStart(3, '0');
    const url = `${moshaf.server}${paddedNum}.mp3`;
    const trackId = `surah-${selectedReciter.id}-${surahNum}`;

    if (currentTrack?.id === trackId && isPlaying) {
      pause();
    } else {
      play({
        id: trackId,
        title: surah?.name || `سورة ${surahNum}`,
        reciter: selectedReciter.name,
        url,
      });
    }
  };

  const isCurrentlyPlaying = currentTrack?.id === `surah-${selectedReciter?.id}-${surahNum}` && isPlaying;

  return (
    <div className="page-container" dir="rtl">
      <div className="px-4 pt-4 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('/quran')} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
            <ArrowRight className="w-4 h-4 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">{surah?.name || ''}</h1>
            <p className="text-xs text-muted-foreground">
              {surah ? `${surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} - ${surah.numberOfAyahs} آيات` : ''}
            </p>
          </div>
        </div>

        {/* Audio Player Section */}
        {!loading && selectedReciter && (
          <div className="card-surface mb-4 bg-primary/5 border-primary/15">
            <div className="flex items-center gap-3">
              <button
                onClick={handlePlaySurah}
                className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${isCurrentlyPlaying ? 'bg-primary' : 'gradient-primary'}`}
              >
                {isCurrentlyPlaying ? (
                  <Pause className="w-5 h-5 text-primary-foreground" />
                ) : (
                  <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{isCurrentlyPlaying ? 'يتم التشغيل...' : 'استمع للسورة'}</p>
                <button
                  onClick={() => setShowReciterPicker(!showReciterPicker)}
                  className="flex items-center gap-1 text-xs text-primary"
                >
                  <Mic className="w-3 h-3" />
                  {selectedReciter.name}
                </button>
              </div>
            </div>
            {showReciterPicker && (
              <div className="mt-3 pt-3 border-t border-border max-h-40 overflow-y-auto animate-fade-in">
                <div className="grid grid-cols-2 gap-1.5">
                  {reciters.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => { setSelectedReciter(r); setShowReciterPicker(false); }}
                      className={`text-xs p-2 rounded-lg text-right transition-colors ${
                        selectedReciter?.id === r.id
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'bg-secondary/50 text-foreground hover:bg-secondary'
                      }`}
                    >
                      {r.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bismillah */}
        {surahNum !== 1 && surahNum !== 9 && (
          <div className="text-center py-4 mb-4">
            <span className="font-amiri text-2xl text-primary">بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ</span>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton-pulse h-20 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {ayahs.map((ayah) => {
              const ayahTafsir = tafsir.find((t) => t.numberInSurah === ayah.numberInSurah);
              return (
                <div key={ayah.numberInSurah} className="card-surface">
                  <div className="flex items-start gap-2 mb-2">
                    <span className="verse-number flex-shrink-0 mt-1">{ayah.numberInSurah}</span>
                    <p className="quran-text flex-1">{ayah.text}</p>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    <button
                      onClick={() => setShowTafsir(showTafsir === ayah.numberInSurah ? null : ayah.numberInSurah)}
                      className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      {showTafsir === ayah.numberInSurah ? 'اخفاء التفسير' : 'عرض التفسير'}
                    </button>
                  </div>
                  {showTafsir === ayah.numberInSurah && ayahTafsir && (
                    <div className="mt-3 p-3 rounded-lg bg-secondary/50 animate-fade-in">
                      <p className="text-sm text-foreground leading-relaxed">{ayahTafsir.text}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 mb-4">
          <button
            onClick={() => surahNum > 1 && navigate(`/quran/${surahNum - 1}`)}
            disabled={surahNum <= 1}
            className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium disabled:opacity-40"
          >
            السورة السابقة
          </button>
          <button
            onClick={() => surahNum < 114 && navigate(`/quran/${surahNum + 1}`)}
            disabled={surahNum >= 114}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40"
          >
            السورة التالية
          </button>
        </div>
      </div>
    </div>
  );
};

export default SurahDetailPage;
