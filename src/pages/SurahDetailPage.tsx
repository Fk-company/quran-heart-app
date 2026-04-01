import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchSurahAyahs, fetchTafsir, fetchSurahs, fetchReciters, type Ayah, type Surah, type Reciter } from '@/lib/api';
import { useAudioPlayer } from '@/contexts/AudioContext';
import { useLastRead } from '@/hooks/useLastRead';
import { useFavorites } from '@/hooks/useFavorites';
import { useReadingTracker } from '@/hooks/useReadingTracker';
import { ArrowRight, BookOpen, Play, Pause, Mic, Heart, Share2, Layers, Download } from 'lucide-react';

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
  const [viewMode, setViewMode] = useState<'ayah' | 'full'>('ayah');
  const { play, pause, currentTrack, isPlaying } = useAudioPlayer();
  const { savePosition } = useLastRead();
  const { toggleSurah, isSurahFav, addItem, removeItem, isItemFav } = useFavorites();
  const { recordReading } = useReadingTracker();

  const surahNum = Number(id);

  useEffect(() => {
    if (!surahNum) return;
    setLoading(true);
    Promise.all([fetchSurahAyahs(surahNum), fetchTafsir(surahNum), fetchSurahs(), fetchReciters()])
      .then(([ayahData, tafsirData, surahsData, recitersData]) => {
        setAyahs(ayahData);
        setTafsir(tafsirData);
        const s = surahsData.find((s) => s.number === surahNum) || null;
        setSurah(s);
        setReciters(recitersData.slice(0, 30));
        if (recitersData.length > 0) setSelectedReciter(recitersData[0]);
        setLoading(false);
        if (s) {
          savePosition(surahNum, s.name, 1);
          recordReading(surahNum, s.numberOfAyahs, Math.ceil(s.numberOfAyahs / 15));
        }
      });
  }, [surahNum]);

  const handleAyahVisible = useCallback((ayahNum: number) => {
    if (surah) savePosition(surahNum, surah.name, ayahNum);
  }, [surah, surahNum, savePosition]);

  const handlePlaySurah = () => {
    if (!selectedReciter) return;
    const moshaf = selectedReciter.moshaf?.[0];
    if (!moshaf) return;
    const url = `${moshaf.server}${String(surahNum).padStart(3, '0')}.mp3`;
    const trackId = `surah-${selectedReciter.id}-${surahNum}`;
    if (currentTrack?.id === trackId && isPlaying) pause();
    else play({ id: trackId, title: surah?.name || `سورة ${surahNum}`, reciter: selectedReciter.name, url });
  };

  const toggleAyahFav = (ayah: Ayah) => {
    const fid = `ayah-${surahNum}-${ayah.numberInSurah}`;
    if (isItemFav(fid)) removeItem(fid);
    else addItem({ id: fid, type: 'ayah', text: ayah.text, source: `${surah?.name || ''} - آية ${ayah.numberInSurah}` });
  };

  const isCurrentlyPlaying = currentTrack?.id === `surah-${selectedReciter?.id}-${surahNum}` && isPlaying;

  const handleDownloadSurah = async () => {
    if (!selectedReciter) return;
    const moshaf = selectedReciter.moshaf?.[0];
    if (!moshaf) return;
    const url = `${moshaf.server}${String(surahNum).padStart(3, '0')}.mp3`;
    try {
      const a = document.createElement('a');
      a.href = url;
      a.download = `${surah?.name || 'surah'}-${selectedReciter.name}.mp3`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      window.open(url, '_blank');
    }
  };

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
          <button onClick={() => setViewMode(viewMode === 'ayah' ? 'full' : 'ayah')} className={`w-9 h-9 rounded-full flex items-center justify-center ${viewMode === 'full' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'}`} title={viewMode === 'ayah' ? 'عرض كامل' : 'عرض آية آية'}>
            <Layers className="w-4 h-4" />
          </button>
          <button onClick={() => surah && toggleSurah(surah.number)} className={`fav-btn ${surah && isSurahFav(surah.number) ? 'active' : ''}`}>
            <Heart className="w-5 h-5" fill={surah && isSurahFav(surah.number) ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Audio Player */}
        {!loading && selectedReciter && (
          <div className="card-surface mb-4 bg-primary/5 border-primary/15">
            <div className="flex items-center gap-3">
              <button onClick={handlePlaySurah} className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${isCurrentlyPlaying ? 'bg-primary' : 'gradient-primary'}`}>
                {isCurrentlyPlaying ? <Pause className="w-5 h-5 text-primary-foreground" /> : <Play className="w-5 h-5 text-primary-foreground ml-0.5" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{isCurrentlyPlaying ? 'يتم التشغيل...' : 'استمع للسورة'}</p>
                <button onClick={() => setShowReciterPicker(!showReciterPicker)} className="flex items-center gap-1 text-xs text-primary">
                  <Mic className="w-3 h-3" />{selectedReciter.name}
                </button>
              </div>
            </div>
            {showReciterPicker && (
              <div className="mt-3 pt-3 border-t border-border max-h-40 overflow-y-auto animate-fade-in">
                <div className="grid grid-cols-2 gap-1.5">
                  {reciters.map((r) => (
                    <button key={r.id} onClick={() => { setSelectedReciter(r); setShowReciterPicker(false); }}
                      className={`text-xs p-2 rounded-xl text-right transition-colors ${selectedReciter?.id === r.id ? 'bg-primary/10 text-primary font-semibold' : 'bg-secondary/50 text-foreground hover:bg-secondary'}`}>
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
          <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton-pulse h-20 w-full" />)}</div>
        ) : viewMode === 'full' ? (
          /* Full continuous view */
          <div className="card-surface mb-4">
            <p className="quran-text text-center leading-[2.8]">
              {ayahs.map((ayah) => (
                <span key={ayah.numberInSurah}>
                  {ayah.text} <span className="verse-number inline-flex w-6 h-6 text-[10px] mx-1 align-middle">{ayah.numberInSurah}</span>{' '}
                </span>
              ))}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {ayahs.map((ayah) => {
              const ayahTafsir = tafsir.find((t) => t.numberInSurah === ayah.numberInSurah);
              const favId = `ayah-${surahNum}-${ayah.numberInSurah}`;
              return (
                <div key={ayah.numberInSurah} className="card-surface" onClick={() => handleAyahVisible(ayah.numberInSurah)}>
                  <div className="flex items-start gap-2 mb-2">
                    <span className="verse-number flex-shrink-0 mt-1">{ayah.numberInSurah}</span>
                    <p className="quran-text flex-1">{ayah.text}</p>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    <button onClick={() => setShowTafsir(showTafsir === ayah.numberInSurah ? null : ayah.numberInSurah)} className="flex items-center gap-1 text-xs text-primary font-medium hover:underline">
                      <BookOpen className="w-3.5 h-3.5" />
                      {showTafsir === ayah.numberInSurah ? 'اخفاء التفسير' : 'عرض التفسير'}
                    </button>
                    <button onClick={() => {
                      const text = `${ayah.text}\n\n${surah?.name || ''} - آية ${ayah.numberInSurah}`;
                      if (navigator.share) navigator.share({ text });
                      else navigator.clipboard.writeText(text);
                    }} className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                      <Share2 className="w-3 h-3" /> مشاركة
                    </button>
                    <button onClick={() => toggleAyahFav(ayah)} className={`flex items-center gap-1 text-xs font-medium mr-auto ${isItemFav(favId) ? 'text-destructive' : 'text-muted-foreground'}`}>
                      <Heart className="w-3 h-3" fill={isItemFav(favId) ? 'currentColor' : 'none'} />
                      {isItemFav(favId) ? 'محفوظة' : 'مفضلة'}
                    </button>
                  </div>
                  {showTafsir === ayah.numberInSurah && ayahTafsir && (
                    <div className="mt-3 p-3 rounded-xl bg-secondary/50 animate-fade-in">
                      <p className="text-sm text-foreground leading-relaxed">{ayahTafsir.text}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between mt-6 mb-4">
          <button onClick={() => surahNum > 1 && navigate(`/quran/${surahNum - 1}`)} disabled={surahNum <= 1}
            className="px-4 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium disabled:opacity-40 transition-colors">
            السورة السابقة
          </button>
          <button onClick={() => surahNum < 114 && navigate(`/quran/${surahNum + 1}`)} disabled={surahNum >= 114}
            className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 transition-colors">
            السورة التالية
          </button>
        </div>
      </div>
    </div>
  );
};

export default SurahDetailPage;
