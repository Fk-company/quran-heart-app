import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronRight, ChevronLeft, BookOpen, ArrowRight, Moon, Sun, Mic, Play, Pause, X } from 'lucide-react';
import { useAudioPlayer } from '@/contexts/AudioContext';
import { fetchReciters, type Reciter } from '@/lib/api';
import MushafSearch from '@/components/MushafSearch';

interface PageAyah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  page: number;
  surah: { number: number; name: string; englishName: string };
}

const TOTAL_PAGES = 604;

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
  const { play, pause, currentTrack, isPlaying } = useAudioPlayer();

  // Swipe
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

  const goToPage = (p: number) => { if (p >= 1 && p <= TOTAL_PAGES) setCurrentPage(p); };

  const handleJump = () => {
    const p = Number(pageInput);
    if (p >= 1 && p <= TOTAL_PAGES) { setCurrentPage(p); setShowJumpInput(false); setPageInput(''); }
  };

  // Swipe handlers (RTL: swipe left = next page in Arabic = higher number)
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchMove = (e: React.TouchEvent) => { touchEndX.current = e.touches[0].clientX; };
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 60) {
      if (diff > 0) goToPage(currentPage - 1); // swipe left = previous (RTL)
      else goToPage(currentPage + 1); // swipe right = next (RTL)
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

  const surahsOnPage = Array.from(new Set(ayahs.map(a => a.surah.number))).map(num => {
    const first = ayahs.find(a => a.surah.number === num)!;
    return { number: num, name: first.surah.name };
  });
  const juzNumber = ayahs.length > 0 ? ayahs[0].juz : 0;
  const nightClass = nightMode ? 'mushaf-night' : '';

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

        {/* Jump */}
        {showJumpInput && (
          <div className="card-surface mb-4 flex items-center gap-2 animate-fade-in">
            <input type="number" value={pageInput} onChange={e => setPageInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleJump()} placeholder={`1 - ${TOTAL_PAGES}`}
              min={1} max={TOTAL_PAGES} className="search-input flex-1 text-center" />
            <button onClick={handleJump} className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium">انتقال</button>
          </div>
        )}

        {/* Reciter player */}
        <div className="card-surface mb-3 flex items-center gap-2">
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
        </div>

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
                      <span className="mushaf-ayah-text">{ayah.text}</span>{' '}
                      <span className={`verse-number inline-flex w-6 h-6 text-[10px] mx-0.5 align-middle ${nightMode ? 'mushaf-night-verse' : ''}`}>
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

        {/* Swipe hint */}
        <p className="text-center text-[10px] text-muted-foreground mb-4">اسحب يميناً أو يساراً للتنقل بين الصفحات</p>
      </div>
    </div>
  );
};

export default MushafPage;
