import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronRight, ChevronLeft, BookOpen, ArrowRight, Moon, Sun, Mic, Play, Pause, X, SkipBack, SkipForward, Square, Volume2 } from 'lucide-react';
import { useAudioPlayer } from '@/contexts/AudioContext';
import { fetchReciters, type Reciter } from '@/lib/api';
import MushafSearch from '@/components/MushafSearch';
import AyahTafsirModal from '@/components/AyahTafsirModal';
import { useAyahByAyahPlayer } from '@/hooks/useAyahByAyahPlayer';

interface PageAyah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  page: number;
  surah: { number: number; name: string; englishName: string };
}

const TOTAL_PAGES = 604;

const AyahByAyahControls: React.FC<{
  player: ReturnType<typeof useAyahByAyahPlayer>;
  nightMode: boolean;
  onStop: () => void;
}> = ({ player, nightMode, onStop }) => {
  const progressPct = player.duration > 0 ? (player.progress / player.duration) * 100 : 0;
  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const bg = nightMode ? 'bg-[hsl(220,18%,10%)] border-amber-700/30' : 'bg-card border-border';
  const accent = nightMode ? 'text-amber-300' : 'text-primary';
  const muted = nightMode ? 'text-amber-400/50' : 'text-muted-foreground';
  const barBg = nightMode ? 'bg-amber-900/30' : 'bg-secondary';
  const barFill = nightMode ? 'bg-amber-400' : 'bg-primary';

  return (
    <div className={`card-surface mb-3 ${bg} border animate-fade-in`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Volume2 className={`w-3.5 h-3.5 ${accent}`} />
          <span className={`text-xs font-bold ${nightMode ? 'text-amber-100' : 'text-foreground'}`}>
            تلاوة آية بآية
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${nightMode ? 'bg-amber-500/15 text-amber-300' : 'bg-primary/10 text-primary'}`}>
            {player.currentIndex + 1}/{player.totalAyahs}
          </span>
        </div>
        <button onClick={onStop} className={`w-7 h-7 rounded-full flex items-center justify-center ${nightMode ? 'hover:bg-amber-900/30' : 'hover:bg-secondary'}`}>
          <X className={`w-3.5 h-3.5 ${muted}`} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-2">
        <div className={`h-1.5 rounded-full ${barBg} overflow-hidden`}>
          <div className={`h-full rounded-full ${barFill} transition-all duration-300`} style={{ width: `${progressPct}%` }} />
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className={`text-[10px] ${muted}`}>{formatTime(player.progress)}</span>
          <span className={`text-[10px] ${muted}`}>{formatTime(player.duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <button onClick={player.skipPrev} disabled={player.currentIndex <= 0}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors disabled:opacity-30 ${nightMode ? 'hover:bg-amber-900/30' : 'hover:bg-secondary'}`}>
          <SkipForward className={`w-4 h-4 ${accent}`} />
        </button>

        <button
          onClick={player.isAyahPlaying ? player.pausePlayback : player.resumePlayback}
          className={`w-12 h-12 rounded-full flex items-center justify-center ${nightMode ? 'bg-amber-500/20' : 'gradient-primary'}`}
        >
          {player.isAyahPlaying
            ? <Pause className={`w-5 h-5 ${nightMode ? 'text-amber-300' : 'text-primary-foreground'}`} />
            : <Play className={`w-5 h-5 ${nightMode ? 'text-amber-300' : 'text-primary-foreground'} ml-0.5`} />}
        </button>

        <button onClick={player.skipNext} disabled={player.currentIndex >= player.totalAyahs - 1}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors disabled:opacity-30 ${nightMode ? 'hover:bg-amber-900/30' : 'hover:bg-secondary'}`}>
          <SkipBack className={`w-4 h-4 ${accent}`} />
        </button>

        <button onClick={onStop}
          className={`w-9 h-9 rounded-full flex items-center justify-center ${nightMode ? 'hover:bg-amber-900/30' : 'hover:bg-secondary'}`}>
          <Square className={`w-3.5 h-3.5 ${muted}`} />
        </button>
      </div>

      {/* Reciter selector */}
      <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1">
        {player.availableReciters.map(r => (
          <button key={r.id} onClick={() => player.changeReciter(r.id)}
            className={`text-[10px] px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
              r.id === player.reciterId
                ? nightMode ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'bg-primary/10 text-primary font-semibold'
                : nightMode ? 'bg-amber-900/15 text-amber-400/60' : 'bg-secondary text-muted-foreground'
            }`}>
            {r.name}
          </button>
        ))}
      </div>
    </div>
  );
};

const MushafPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = Math.min(TOTAL_PAGES, Math.max(1, Number(searchParams.get('page')) || 1));
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [ayahs, setAyahs] = useState<PageAyah[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageInput, setPageInput] = useState('');
  const [showJumpInput, setShowJumpInput] = useState(false);
  const [nightMode, setNightMode] = useState(() => localStorage.getItem('mushaf_night') === 'true');
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [selectedReciter, setSelectedReciter] = useState<Reciter | null>(null);
  const [showReciterPicker, setShowReciterPicker] = useState(false);
  const [selectedAyah, setSelectedAyah] = useState<PageAyah | null>(null);
  const { play, pause, currentTrack, isPlaying } = useAudioPlayer();
  const ayahPlayer = useAyahByAyahPlayer();

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchPage = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/page/${page}`);
      const data = await res.json();
      setAyahs(data.data.ayahs || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReciters().then(r => { setReciters(r.slice(0, 20)); if (r.length) setSelectedReciter(r[0]); });
  }, []);

  useEffect(() => {
    fetchPage(currentPage);
    setSearchParams({ page: String(currentPage) });
    localStorage.setItem('mushaf_last_page', String(currentPage));
  }, [currentPage, fetchPage, setSearchParams]);

  useEffect(() => {
    if (!searchParams.get('page')) {
      const saved = localStorage.getItem('mushaf_last_page');
      if (saved) setCurrentPage(Number(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('mushaf_night', String(nightMode));
  }, [nightMode]);

  // Stop ayah player when page changes
  useEffect(() => {
    ayahPlayer.stopPlayback();
  }, [currentPage]);

  const goToPage = (p: number) => { if (p >= 1 && p <= TOTAL_PAGES) setCurrentPage(p); };

  const handleJump = () => {
    const p = Number(pageInput);
    if (p >= 1 && p <= TOTAL_PAGES) { setCurrentPage(p); setShowJumpInput(false); setPageInput(''); }
  };

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchMove = (e: React.TouchEvent) => { touchEndX.current = e.touches[0].clientX; };
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 60) {
      if (diff > 0) goToPage(currentPage - 1);
      else goToPage(currentPage + 1);
    }
  };

  const handlePlayPage = () => {
    if (!selectedReciter || ayahs.length === 0) return;
    const surahNum = ayahs[0].surah.number;
    const moshaf = selectedReciter.moshaf?.[0];
    if (!moshaf) return;
    const url = `${moshaf.server}${String(surahNum).padStart(3, '0')}.mp3`;
    const trackId = `mushaf-${selectedReciter.id}-${surahNum}`;
    if (currentTrack?.id === trackId && isPlaying) pause();
    else play({ id: trackId, title: ayahs[0].surah.name, reciter: selectedReciter.name, url });
  };

  const handleStartAyahByAyah = () => {
    if (ayahs.length === 0) return;
    // Stop any full-surah playback
    if (currentTrack?.id?.startsWith('mushaf-') && isPlaying) pause();
    
    const queue = ayahs.map(a => ({
      number: a.number,
      numberInSurah: a.numberInSurah,
      surahNumber: a.surah.number,
      surahName: a.surah.name,
    }));
    ayahPlayer.startPlayback(queue, 0);
  };

  const handleAyahClick = (ayah: PageAyah) => {
    // If ayah player is active, clicking an ayah starts from that ayah
    if (ayahPlayer.playingAyahNumber !== null) {
      const queue = ayahs.map(a => ({
        number: a.number,
        numberInSurah: a.numberInSurah,
        surahNumber: a.surah.number,
        surahName: a.surah.name,
      }));
      ayahPlayer.playFromAyah(queue, ayah.number);
    } else {
      // Show tafsir
      setSelectedAyah(ayah);
    }
  };

  const surahsOnPage = Array.from(new Set(ayahs.map(a => a.surah.number))).map(num => {
    const first = ayahs.find(a => a.surah.number === num)!;
    return { number: num, name: first.surah.name };
  });
  const juzNumber = ayahs.length > 0 ? ayahs[0].juz : 0;
  const nightClass = nightMode ? 'mushaf-night' : '';
  const isAyahPlayerActive = ayahPlayer.playingAyahNumber !== null;

  return (
    <div className={`page-container ${nightClass}`} dir="rtl"
      ref={containerRef} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      <div className="px-4 pt-4 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => navigate('/quran')} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
            <ArrowRight className="w-4 h-4 text-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-foreground">المصحف الشريف</h1>
            <p className="text-xs text-muted-foreground">الجزء {juzNumber} - صفحة {currentPage}/{TOTAL_PAGES}</p>
          </div>
          <MushafSearch onNavigateToPage={(p) => goToPage(p)} nightMode={nightMode} />
          <button onClick={() => setNightMode(!nightMode)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${nightMode ? 'bg-amber-500/20 text-amber-400' : 'bg-secondary text-foreground'}`}
            title="وضع القراءة الليلي">
            {nightMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button onClick={() => setShowJumpInput(!showJumpInput)}
            className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-medium">
            انتقال
          </button>
        </div>

        {showJumpInput && (
          <div className="card-surface mb-4 flex items-center gap-2 animate-fade-in">
            <input type="number" value={pageInput} onChange={e => setPageInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleJump()} placeholder={`1 - ${TOTAL_PAGES}`}
              min={1} max={TOTAL_PAGES} className="search-input flex-1 text-center" />
            <button onClick={handleJump} className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium">انتقال</button>
          </div>
        )}

        {/* Player controls */}
        <div className="card-surface mb-3 flex items-center gap-2">
          {/* Full surah play */}
          <button onClick={handlePlayPage}
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${currentTrack?.id?.startsWith('mushaf-') && isPlaying ? 'bg-primary' : 'gradient-primary'}`}>
            {currentTrack?.id?.startsWith('mushaf-') && isPlaying
              ? <Pause className="w-4 h-4 text-primary-foreground" />
              : <Play className="w-4 h-4 text-primary-foreground ml-0.5" />}
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">
              {currentTrack?.id?.startsWith('mushaf-') && isPlaying ? 'يتم التشغيل...' : 'استمع للصفحة'}
            </p>
            <button onClick={() => setShowReciterPicker(!showReciterPicker)}
              className="flex items-center gap-1 text-[11px] text-primary">
              <Mic className="w-3 h-3" />{selectedReciter?.name || 'اختر قارئ'}
            </button>
          </div>
          {/* Ayah by ayah play button */}
          <button onClick={handleStartAyahByAyah}
            className={`px-3 py-2 rounded-xl text-[11px] font-medium transition-colors flex items-center gap-1.5 ${
              isAyahPlayerActive
                ? nightMode ? 'bg-amber-500/20 text-amber-300' : 'bg-primary/15 text-primary'
                : nightMode ? 'bg-amber-900/20 text-amber-400/70' : 'bg-secondary text-muted-foreground'
            }`}>
            <Volume2 className="w-3 h-3" />
            آية بآية
          </button>
        </div>

        {/* Ayah-by-ayah player controls */}
        {isAyahPlayerActive && (
          <AyahByAyahControls player={ayahPlayer} nightMode={nightMode} onStop={ayahPlayer.stopPlayback} />
        )}

        {showReciterPicker && (
          <div className="card-surface mb-3 max-h-40 overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-foreground">اختر القارئ</span>
              <button onClick={() => setShowReciterPicker(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {reciters.map(r => (
                <button key={r.id} onClick={() => { setSelectedReciter(r); setShowReciterPicker(false); }}
                  className={`text-xs p-2 rounded-xl text-right transition-colors ${selectedReciter?.id === r.id ? 'bg-primary/10 text-primary font-semibold' : 'bg-secondary/50 text-foreground hover:bg-secondary'}`}>
                  {r.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Surah headers */}
        <div className="flex items-center justify-center gap-2 mb-3 flex-wrap">
          {surahsOnPage.map(s => (
            <button key={s.number} onClick={() => navigate(`/quran/${s.number}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              <BookOpen className="w-3 h-3" />{s.name}
            </button>
          ))}
        </div>

        {/* Hint */}
        <p className="text-center text-[10px] text-muted-foreground mb-2">
          {isAyahPlayerActive ? '🎧 اضغط على آية للانتقال إليها' : '💡 اضغط على أي آية لعرض التفسير'}
        </p>

        {/* Page Content */}
        {loading ? (
          <div className="mushaf-page-frame"><div className="space-y-3 p-6">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton-pulse h-6 w-full" />)}
          </div></div>
        ) : (
          <div className={`mushaf-page-frame ${nightMode ? 'mushaf-night-frame' : ''}`}>
            <div className="mushaf-ornament-top" />
            <div className="px-5 py-6 sm:px-8 sm:py-8">
              {ayahs.length > 0 && ayahs[0].numberInSurah === 1 && ayahs[0].surah.number !== 1 && ayahs[0].surah.number !== 9 && (
                <div className="text-center mb-5 pb-4 border-b border-primary/10">
                  <span className={`font-amiri text-xl leading-relaxed ${nightMode ? 'text-amber-300' : 'text-primary'}`}>
                    بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ
                  </span>
                </div>
              )}
              <p className={`font-amiri text-[1.35rem] sm:text-2xl leading-[2.6] sm:leading-[2.8] text-center text-justify ${nightMode ? 'mushaf-night-text' : 'text-foreground'}`}
                style={{ textAlignLast: 'center' }}>
                {ayahs.map((ayah, idx) => {
                  const showSurahHeader = ayah.numberInSurah === 1 && idx > 0;
                  const isHighlighted = ayahPlayer.playingAyahNumber === ayah.number;
                  
                  return (
                    <React.Fragment key={ayah.number}>
                      {showSurahHeader && (
                        <>
                          <br />
                          <span className={`block text-center my-4 py-3 px-4 rounded-xl ${nightMode ? 'bg-amber-900/20 border border-amber-700/20' : 'bg-primary/5 border border-primary/10'}`}>
                            <span className={`font-amiri text-lg font-bold ${nightMode ? 'text-amber-300' : 'text-primary'}`}>{ayah.surah.name}</span>
                          </span>
                          {ayah.surah.number !== 9 && (
                            <span className="block text-center mb-4">
                              <span className={`font-amiri text-lg ${nightMode ? 'text-amber-300' : 'text-primary'}`}>بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ</span>
                            </span>
                          )}
                        </>
                      )}
                      <span
                        className={`mushaf-ayah-text cursor-pointer transition-all duration-300 ${
                          isHighlighted
                            ? nightMode
                              ? 'ayah-highlighted-night'
                              : 'ayah-highlighted'
                            : 'hover:underline decoration-primary/30 underline-offset-4'
                        }`}
                        onClick={() => handleAyahClick(ayah)}
                      >{ayah.text}</span>{' '}
                      <span className={`verse-number inline-flex w-6 h-6 text-[10px] mx-0.5 align-middle transition-all duration-300 ${
                        isHighlighted
                          ? nightMode
                            ? 'bg-amber-500/30 text-amber-200 border-amber-400/50 scale-110'
                            : 'bg-primary/20 text-primary border-primary/40 scale-110'
                          : nightMode ? 'mushaf-night-verse' : ''
                      }`}>
                        {ayah.numberInSurah}
                      </span>{' '}
                    </React.Fragment>
                  );
                })}
              </p>
            </div>
            <div className="mushaf-ornament-bottom" />
            <div className="text-center py-2">
              <span className={`text-xs font-medium ${nightMode ? 'text-amber-400/60' : 'text-muted-foreground'}`}>{currentPage}</span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-5 mb-4">
          <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= TOTAL_PAGES}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium disabled:opacity-40 transition-colors">
            <ChevronRight className="w-4 h-4" />التالية
          </button>
          <div className="flex items-center gap-1">
            {[currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2]
              .filter(p => p >= 1 && p <= TOTAL_PAGES).map(p => (
                <button key={p} onClick={() => goToPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${p === currentPage ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-muted'}`}>
                  {p}
                </button>
              ))}
          </div>
          <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 transition-colors">
            السابقة<ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <p className="text-center text-[10px] text-muted-foreground mb-4">اسحب يميناً أو يساراً للتنقل بين الصفحات</p>
      </div>

      {/* Tafsir Modal */}
      <AyahTafsirModal ayah={selectedAyah} nightMode={nightMode} onClose={() => setSelectedAyah(null)} />
    </div>
  );
};

export default MushafPage;
