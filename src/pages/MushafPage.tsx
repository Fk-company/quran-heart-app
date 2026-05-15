import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronRight, ChevronLeft, BookOpen, ArrowRight, Moon, Sun, Mic, Play, Pause, X, SkipBack, SkipForward, Square, Volume2, Bookmark, BookmarkCheck, Repeat, Minus, Plus, Type, AlignJustify, Sparkles, Settings2, ChevronDown, ChevronUp } from 'lucide-react';
import { useAudioPlayer } from '@/contexts/AudioContext';
import { fetchReciters, type Reciter } from '@/lib/api';
import MushafSearch from '@/components/MushafSearch';
import AyahTafsirModal from '@/components/AyahTafsirModal';
import { useAyahByAyahPlayer } from '@/hooks/useAyahByAyahPlayer';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useSettings } from '@/hooks/useSettings';

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
  repeatCount: number;
  currentRepeat: number;
  isRepeating: boolean;
  onToggleRepeat: () => void;
  onSetRepeatCount: (n: number) => void;
}> = ({ player, nightMode, onStop, repeatCount, currentRepeat, isRepeating, onToggleRepeat, onSetRepeatCount }) => {
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
          {isRepeating && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${nightMode ? 'bg-amber-600/20 text-amber-200' : 'bg-accent/10 text-accent'}`}>
              🔁 {currentRepeat}/{repeatCount}
            </span>
          )}
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

      {/* Repeat controls */}
      <div className={`flex items-center justify-between mt-3 pt-3 border-t ${nightMode ? 'border-amber-700/20' : 'border-border'}`}>
        <button
          onClick={onToggleRepeat}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors ${
            isRepeating
              ? nightMode ? 'bg-amber-500/20 text-amber-300' : 'bg-primary/15 text-primary'
              : nightMode ? 'bg-amber-900/15 text-amber-400/50' : 'bg-secondary text-muted-foreground'
          }`}
        >
          <Repeat className="w-3 h-3" />
          {isRepeating ? 'تكرار مفعّل' : 'تكرار الآية'}
        </button>
        {isRepeating && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSetRepeatCount(Math.max(1, repeatCount - 1))}
              className={`w-7 h-7 rounded-full flex items-center justify-center ${nightMode ? 'bg-amber-900/20' : 'bg-secondary'}`}
            >
              <Minus className={`w-3 h-3 ${muted}`} />
            </button>
            <span className={`text-sm font-bold min-w-[2rem] text-center ${accent}`}>{repeatCount}×</span>
            <button
              onClick={() => onSetRepeatCount(Math.min(30, repeatCount + 1))}
              className={`w-7 h-7 rounded-full flex items-center justify-center ${nightMode ? 'bg-amber-900/20' : 'bg-secondary'}`}
            >
              <Plus className={`w-3 h-3 ${muted}`} />
            </button>
          </div>
        )}
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
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [repeatCount, setRepeatCount] = useState(3);
  const [currentRepeat, setCurrentRepeat] = useState(1);
  const { play, pause, currentTrack, isPlaying } = useAudioPlayer();
  const ayahPlayer = useAyahByAyahPlayer();
  const { bookmarks, isBookmarked, toggleBookmark } = useBookmarks();
  const { settings, updateSetting } = useSettings();

  // Toolbar + reading prefs (persisted locally)
  const [showToolbar, setShowToolbar] = useState(false);
  const [lineHeight, setLineHeight] = useState(() => Number(localStorage.getItem('mushaf_lh') || 2.8));
  const [smoothing, setSmoothing] = useState(() => localStorage.getItem('mushaf_smooth') !== 'false');
  const [inlineTafsir, setInlineTafsir] = useState(() => localStorage.getItem('mushaf_inline_tafsir') === 'true');
  const [expandedTafsir, setExpandedTafsir] = useState<Record<number, boolean>>({});
  const [tafsirMap, setTafsirMap] = useState<Record<number, string>>({});
  useEffect(() => { localStorage.setItem('mushaf_lh', String(lineHeight)); }, [lineHeight]);
  useEffect(() => { localStorage.setItem('mushaf_smooth', String(smoothing)); }, [smoothing]);
  useEffect(() => { localStorage.setItem('mushaf_inline_tafsir', String(inlineTafsir)); }, [inlineTafsir]);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const touchEndY = useRef(0);
  const isSwipeCandidate = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const repeatRef = useRef({ isRepeating: false, repeatCount: 3, currentRepeat: 1 });

  // Sync repeat state to ref
  useEffect(() => {
    repeatRef.current = { isRepeating, repeatCount, currentRepeat };
  }, [isRepeating, repeatCount, currentRepeat]);

  // Use settings for default repeat count
  useEffect(() => {
    setRepeatCount(settings.repeatCount);
  }, [settings.repeatCount]);

  // Handle repeat logic: override ayahPlayer's onEnded behavior
  useEffect(() => {
    if (!isRepeating || !ayahPlayer.isAyahPlaying) return;
    
    const checkRepeat = () => {
      const ref = repeatRef.current;
      if (ref.isRepeating && ref.currentRepeat < ref.repeatCount) {
        // Replay current ayah
        setCurrentRepeat(prev => prev + 1);
        ayahPlayer.replayCurrentAyah?.();
        return true;
      }
      // Reset repeat counter for next ayah
      setCurrentRepeat(1);
      return false;
    };

    // We'll use the player's onAyahEnd callback
    ayahPlayer.setOnAyahEnd?.(checkRepeat);
    return () => ayahPlayer.setOnAyahEnd?.(null);
  }, [isRepeating, ayahPlayer]);

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

  // Fetch tafsir for the page when inline mode is on
  useEffect(() => {
    if (!inlineTafsir || ayahs.length === 0) return;
    setExpandedTafsir({});
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`https://api.alquran.cloud/v1/page/${currentPage}/ar.muyassar`);
        const data = await res.json();
        if (cancelled) return;
        const map: Record<number, string> = {};
        (data.data?.ayahs || []).forEach((a: any) => { map[a.number] = a.text; });
        setTafsirMap(map);
      } catch (e) { console.error(e); }
    })();
    return () => { cancelled = true; };
  }, [inlineTafsir, currentPage, ayahs]);

  useEffect(() => {
    if (!searchParams.get('page')) {
      const saved = localStorage.getItem('mushaf_last_page');
      if (saved) setCurrentPage(Number(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('mushaf_night', String(nightMode));
  }, [nightMode]);

  useEffect(() => {
    ayahPlayer.stopPlayback();
    setSelectedAyah(null);
  }, [currentPage]);

  // Auto-close tafsir modal when any audio playback starts to avoid UI overlap
  useEffect(() => {
    if (ayahPlayer.playingAyahNumber !== null) {
      setSelectedAyah(null);
      setShowReciterPicker(false);
      setShowBookmarks(false);
      setShowJumpInput(false);
    }
  }, [ayahPlayer.playingAyahNumber]);

  useEffect(() => {
    if (currentTrack?.id?.startsWith('mushaf-') && isPlaying) {
      setSelectedAyah(null);
    }
  }, [currentTrack?.id, isPlaying]);

  // Sync inline tafsir + scroll with currently playing ayah
  useEffect(() => {
    const num = ayahPlayer.playingAyahNumber;
    if (num === null) return;
    if (inlineTafsir) {
      setExpandedTafsir(prev => (prev[num] ? prev : { ...prev, [num]: true }));
    }
    requestAnimationFrame(() => {
      const el = document.querySelector(`[data-ayah-num="${num}"]`) as HTMLElement | null;
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }, [ayahPlayer.playingAyahNumber, inlineTafsir]);

  const goToPage = (p: number) => { if (p >= 1 && p <= TOTAL_PAGES) setCurrentPage(p); };

  const handleJump = () => {
    const p = Number(pageInput);
    if (p >= 1 && p <= TOTAL_PAGES) { setCurrentPage(p); setShowJumpInput(false); setPageInput(''); }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only consider swipes that start outside the ayah text area
    const target = e.target as HTMLElement;
    const isOnAyah = target.closest('.mushaf-ayah-text, .verse-number, button, a, input, [role="button"]');
    isSwipeCandidate.current = !isOnAyah;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchEndX.current = touchStartX.current;
    touchEndY.current = touchStartY.current;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = () => {
    if (!isSwipeCandidate.current) return;
    const diffX = touchStartX.current - touchEndX.current;
    const diffY = touchStartY.current - touchEndY.current;
    // Require predominantly horizontal motion + minimum 80px to count as swipe
    if (Math.abs(diffX) < 80) return;
    if (Math.abs(diffY) > Math.abs(diffX) * 0.6) return; // mostly vertical = scroll
    if (diffX > 0) goToPage(currentPage - 1);
    else goToPage(currentPage + 1);
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
    if (currentTrack?.id?.startsWith('mushaf-') && isPlaying) pause();
    const queue = ayahs.map(a => ({
      number: a.number,
      numberInSurah: a.numberInSurah,
      surahNumber: a.surah.number,
      surahName: a.surah.name,
    }));
    setCurrentRepeat(1);
    ayahPlayer.startPlayback(queue, 0);
  };

  const handleAyahClick = (ayah: PageAyah) => {
    if (ayahPlayer.playingAyahNumber !== null) {
      const queue = ayahs.map(a => ({
        number: a.number,
        numberInSurah: a.numberInSurah,
        surahNumber: a.surah.number,
        surahName: a.surah.name,
      }));
      setCurrentRepeat(1);
      ayahPlayer.playFromAyah(queue, ayah.number);
    } else if (inlineTafsir) {
      setExpandedTafsir(prev => ({ ...prev, [ayah.number]: !prev[ayah.number] }));
    } else {
      setSelectedAyah(ayah);
    }
  };

  const handleToggleBookmark = () => {
    const surahName = ayahs.length > 0 ? ayahs[0].surah.name : '';
    const juz = ayahs.length > 0 ? ayahs[0].juz : 0;
    toggleBookmark(currentPage, surahName, juz);
  };

  const surahsOnPage = Array.from(new Set(ayahs.map(a => a.surah.number))).map(num => {
    const first = ayahs.find(a => a.surah.number === num)!;
    return { number: num, name: first.surah.name };
  });
  const juzNumber = ayahs.length > 0 ? ayahs[0].juz : 0;
  const nightClass = nightMode ? 'mushaf-night' : '';
  const isAyahPlayerActive = ayahPlayer.playingAyahNumber !== null;
  const pageIsBookmarked = isBookmarked(currentPage);

  return (
    <div className={`page-container page-with-topbar ${nightClass}`} dir="rtl"
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
          {/* Bookmark button */}
          <button onClick={handleToggleBookmark}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
              pageIsBookmarked
                ? nightMode ? 'bg-amber-500/20 text-amber-400' : 'bg-accent/15 text-accent'
                : nightMode ? 'bg-amber-900/15 text-amber-400/40' : 'bg-secondary text-muted-foreground'
            }`}
            title={pageIsBookmarked ? 'إزالة العلامة' : 'إضافة علامة مرجعية'}
          >
            {pageIsBookmarked
              ? <BookmarkCheck className="w-4 h-4" />
              : <Bookmark className="w-4 h-4" />}
          </button>
          {/* Bookmarks list */}
          <button onClick={() => setShowBookmarks(!showBookmarks)}
            className={`px-2.5 py-1.5 rounded-xl text-[10px] font-medium transition-colors ${
              nightMode ? 'bg-amber-900/20 text-amber-400/70' : 'bg-secondary text-muted-foreground'
            }`}
          >
            {bookmarks.length} 🔖
          </button>
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

        {/* Bookmarks panel */}
        {showBookmarks && bookmarks.length > 0 && (
          <>
            <div className="sheet-overlay" onClick={() => setShowBookmarks(false)} />
            <div className="sheet-content" dir="rtl">
              <div className="sheet-handle" />
              <div className="px-5 pb-6 pt-2 max-h-[60vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-foreground">العلامات المرجعية</h3>
                  <button onClick={() => setShowBookmarks(false)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <div className="space-y-2">
                  {bookmarks.sort((a, b) => b.createdAt - a.createdAt).map(bm => (
                    <button
                      key={bm.id}
                      onClick={() => { goToPage(bm.page); setShowBookmarks(false); }}
                      className="card-surface-hover w-full flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <BookmarkCheck className="w-4 h-4 text-accent" />
                      </div>
                      <div className="flex-1 text-right">
                        <div className="text-sm font-semibold text-foreground">صفحة {bm.page}</div>
                        <div className="text-[11px] text-muted-foreground">{bm.surahName} - الجزء {bm.juz}</div>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(bm.createdAt).toLocaleDateString('ar')}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

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

        {/* Ayah-by-ayah player controls with repeat */}
        {isAyahPlayerActive && (
          <AyahByAyahControls
            player={ayahPlayer}
            nightMode={nightMode}
            onStop={() => { ayahPlayer.stopPlayback(); setIsRepeating(false); setCurrentRepeat(1); }}
            repeatCount={repeatCount}
            currentRepeat={currentRepeat}
            isRepeating={isRepeating}
            onToggleRepeat={() => { setIsRepeating(!isRepeating); setCurrentRepeat(1); }}
            onSetRepeatCount={(n) => setRepeatCount(n)}
          />
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

        {/* Reading Toolbar */}
        <div className={`card-surface mb-3 ${nightMode ? 'bg-[hsl(220,18%,10%)] border-amber-700/30' : ''}`}>
          <button onClick={() => setShowToolbar(s => !s)}
            className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${nightMode ? 'bg-amber-500/15 text-amber-300' : 'bg-primary/10 text-primary'}`}>
                <Settings2 className="w-3.5 h-3.5" />
              </div>
              <span className={`text-xs font-bold ${nightMode ? 'text-amber-100' : 'text-foreground'}`}>أدوات القراءة</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${nightMode ? 'bg-amber-900/30 text-amber-400/70' : 'bg-secondary text-muted-foreground'}`}>
                {settings.mushafFontSize}px · ×{lineHeight.toFixed(1)}
              </span>
              {inlineTafsir && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${nightMode ? 'bg-amber-500/20 text-amber-300' : 'bg-primary/15 text-primary'}`}>
                  تفسير
                </span>
              )}
            </div>
            {showToolbar ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>

          {showToolbar && (
            <div className="mt-3 pt-3 border-t border-border space-y-3 animate-fade-in">
              {/* Font size */}
              <div className="flex items-center gap-2">
                <Type className={`w-3.5 h-3.5 ${nightMode ? 'text-amber-300' : 'text-primary'}`} />
                <span className={`text-[11px] font-semibold flex-1 ${nightMode ? 'text-amber-100' : 'text-foreground'}`}>حجم الخط</span>
                <button onClick={() => updateSetting('mushafFontSize', Math.max(16, settings.mushafFontSize - 2))}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${nightMode ? 'bg-amber-900/20 text-amber-300' : 'bg-secondary text-foreground'}`}>
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className={`text-xs font-bold min-w-[3rem] text-center ${nightMode ? 'text-amber-300' : 'text-primary'}`}>{settings.mushafFontSize}px</span>
                <button onClick={() => updateSetting('mushafFontSize', Math.min(40, settings.mushafFontSize + 2))}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${nightMode ? 'bg-amber-900/20 text-amber-300' : 'bg-secondary text-foreground'}`}>
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Line height */}
              <div className="flex items-center gap-2">
                <AlignJustify className={`w-3.5 h-3.5 ${nightMode ? 'text-amber-300' : 'text-primary'}`} />
                <span className={`text-[11px] font-semibold flex-1 ${nightMode ? 'text-amber-100' : 'text-foreground'}`}>تباعد الأسطر</span>
                <button onClick={() => setLineHeight(v => Math.max(2.0, +(v - 0.2).toFixed(1)))}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${nightMode ? 'bg-amber-900/20 text-amber-300' : 'bg-secondary text-foreground'}`}>
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className={`text-xs font-bold min-w-[3rem] text-center ${nightMode ? 'text-amber-300' : 'text-primary'}`}>×{lineHeight.toFixed(1)}</span>
                <button onClick={() => setLineHeight(v => Math.min(4.0, +(v + 0.2).toFixed(1)))}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${nightMode ? 'bg-amber-900/20 text-amber-300' : 'bg-secondary text-foreground'}`}>
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setInlineTafsir(v => !v)}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-semibold transition-colors ${
                    inlineTafsir
                      ? nightMode ? 'bg-amber-500/20 text-amber-300' : 'bg-primary/15 text-primary'
                      : nightMode ? 'bg-amber-900/15 text-amber-400/60' : 'bg-secondary text-muted-foreground'
                  }`}>
                  <BookOpen className="w-3.5 h-3.5" />
                  {inlineTafsir ? 'التفسير مفعّل' : 'إظهار التفسير'}
                </button>
                <button onClick={() => setSmoothing(v => !v)}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-semibold transition-colors ${
                    smoothing
                      ? nightMode ? 'bg-amber-500/20 text-amber-300' : 'bg-primary/15 text-primary'
                      : nightMode ? 'bg-amber-900/15 text-amber-400/60' : 'bg-secondary text-muted-foreground'
                  }`}>
                  <Sparkles className="w-3.5 h-3.5" />
                  {smoothing ? 'نعومة مفعّلة' : 'نعومة العرض'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Hint */}
        <p className="text-center text-[10px] text-muted-foreground mb-2">
          {isAyahPlayerActive
            ? 'اضغط على آية للانتقال إليها'
            : inlineTafsir
              ? 'اضغط على أي آية لإظهار/إخفاء التفسير تحتها'
              : 'اضغط على أي آية لعرض التفسير'}
        </p>

        {/* Page Content */}
        {loading && ayahs.length === 0 ? (
          <div className="mushaf-page-frame">
            <span className="mushaf-corner tl" /><span className="mushaf-corner tr" />
            <span className="mushaf-corner bl" /><span className="mushaf-corner br" />
            <div className="space-y-3 p-6">
              {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton-pulse h-6 w-full" />)}
            </div>
          </div>
        ) : (
          <div className={`mushaf-page-frame ${nightMode ? 'mushaf-night-frame' : ''} animate-fade-in`} key={currentPage}>
            <span className="mushaf-corner tl" /><span className="mushaf-corner tr" />
            <span className="mushaf-corner bl" /><span className="mushaf-corner br" />

            <div className="mushaf-page-head">
              <span className="h-side">{ayahs[0]?.surah.name || ''}</span>
              <span className="h-center">الجزء {juzNumber}</span>
              <span className="h-side">حزب {Math.ceil(currentPage / 10) || 1}</span>
            </div>

            <div className="px-4 sm:px-6 pb-2">
              {ayahs.length > 0 && ayahs[0].numberInSurah === 1 && (
                <div className="mushaf-surah-banner">
                  <span className="name">سورة {ayahs[0].surah.name}</span>
                  <span className="meta">{ayahs[0].surah.englishName} · رقم {ayahs[0].surah.number}</span>
                </div>
              )}
              {ayahs.length > 0 && ayahs[0].numberInSurah === 1 && ayahs[0].surah.number !== 1 && ayahs[0].surah.number !== 9 && (
                <div className="mushaf-bismillah">بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ</div>
              )}

              {inlineTafsir ? (
                /* ===== Inline Tafsir Mode — ayah-by-ayah with tafsir card under each ===== */
                <div className="space-y-3">
                  {ayahs.map((ayah, idx) => {
                    const showSurahHeader = ayah.numberInSurah === 1 && idx > 0;
                    const isHighlighted = ayahPlayer.playingAyahNumber === ayah.number;
                    const isExpanded = expandedTafsir[ayah.number];
                    const tafsirText = tafsirMap[ayah.number];
                    return (
                      <React.Fragment key={ayah.number}>
                        {showSurahHeader && (
                          <div className="my-3">
                            <div className="mushaf-surah-banner">
                              <span className="name">سورة {ayah.surah.name}</span>
                              <span className="meta">{ayah.surah.englishName} · رقم {ayah.surah.number}</span>
                            </div>
                            {ayah.surah.number !== 9 && (
                              <div className="mushaf-bismillah">بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ</div>
                            )}
                          </div>
                        )}
                        <div data-ayah-num={ayah.number} className={`rounded-xl p-3 transition-colors ${
                          isHighlighted
                            ? nightMode ? 'bg-amber-500/10 ring-1 ring-amber-400/40' : 'bg-primary/5 ring-1 ring-primary/20'
                            : 'hover:bg-secondary/40'
                        }`}>
                          <div className="flex items-start gap-2">
                            <span className={`verse-number flex-shrink-0 mt-1 ${nightMode ? 'mushaf-night-verse' : ''}`}>
                              {ayah.numberInSurah}
                            </span>
                            <p
                              onClick={() => handleAyahClick(ayah)}
                              className={`font-amiri flex-1 cursor-pointer ${nightMode ? 'mushaf-night-text' : 'text-foreground'}`}
                              style={{
                                fontSize: settings.mushafFontSize,
                                lineHeight,
                                WebkitFontSmoothing: smoothing ? 'antialiased' : 'auto',
                                MozOsxFontSmoothing: smoothing ? 'grayscale' : 'auto',
                                textRendering: smoothing ? 'optimizeLegibility' : 'auto',
                                wordSpacing: '0.05em',
                              }}
                            >
                              {ayah.text}
                            </p>
                          </div>
                          <button
                            onClick={() => setExpandedTafsir(p => ({ ...p, [ayah.number]: !p[ayah.number] }))}
                            className={`mt-2 flex items-center gap-1.5 text-[11px] font-semibold ${nightMode ? 'text-amber-300' : 'text-primary'}`}
                          >
                            <BookOpen className="w-3 h-3" />
                            {isExpanded ? 'إخفاء التفسير' : 'عرض التفسير'}
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                          {isExpanded && (
                            <div className={`mt-2 p-3 rounded-lg text-[13px] leading-relaxed animate-fade-in ${
                              nightMode
                                ? 'bg-amber-900/15 text-amber-100/90 border border-amber-700/20'
                                : 'bg-secondary/60 text-foreground border border-border'
                            }`}>
                              {tafsirText || 'جاري تحميل التفسير...'}
                            </div>
                          )}
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              ) : (
                /* ===== Classic Continuous Page Mode — flowing text like a real Mushaf ===== */
                <p className={`font-amiri text-center text-justify ${nightMode ? 'mushaf-night-text' : 'text-foreground'}`}
                  style={{
                    textAlignLast: 'center',
                    fontSize: settings.mushafFontSize,
                    lineHeight,
                    wordSpacing: '0.05em',
                    hyphens: 'none',
                    WebkitFontSmoothing: smoothing ? 'antialiased' : 'auto',
                    MozOsxFontSmoothing: smoothing ? 'grayscale' : 'auto',
                    textRendering: smoothing ? 'optimizeLegibility' : 'auto',
                  }}>
                  {ayahs.map((ayah, idx) => {
                    const showSurahHeader = ayah.numberInSurah === 1 && idx > 0;
                    const isHighlighted = ayahPlayer.playingAyahNumber === ayah.number;

                    return (
                      <React.Fragment key={ayah.number}>
                        {showSurahHeader && (
                          <>
                            <br />
                            <span className="block my-3">
                              <span className="mushaf-surah-banner inline-block w-full">
                                <span className="name">سورة {ayah.surah.name}</span>
                                <span className="meta">{ayah.surah.englishName} · رقم {ayah.surah.number}</span>
                              </span>
                            </span>
                            {ayah.surah.number !== 9 && (
                              <span className="mushaf-bismillah block">بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ</span>
                            )}
                          </>
                        )}
                        <span
                          data-ayah-num={ayah.number}
                          className={`mushaf-ayah-text cursor-pointer transition-all duration-300 ${
                            isHighlighted
                              ? nightMode ? 'ayah-highlighted-night' : 'ayah-highlighted'
                              : 'hover:underline decoration-primary/30 underline-offset-4'
                          }`}
                          style={{ whiteSpace: 'normal', wordBreak: 'keep-all' }}
                          onClick={(e) => { e.stopPropagation(); handleAyahClick(ayah); }}
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
              )}
            </div>

            <div className="mushaf-page-foot">
              <span className="mushaf-page-number">{currentPage}</span>
            </div>
          </div>
        )}

        {/* Navigation — clear prev/next with progress dots */}
        <div className="mt-5 mb-4 space-y-3">
          <div className="flex items-center gap-2">
            <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= TOTAL_PAGES}
              className={`flex-1 h-12 flex items-center justify-center gap-2 rounded-2xl text-sm font-bold shadow-sm transition-all active:scale-95 disabled:opacity-40 ${
                nightMode ? 'bg-amber-500/15 text-amber-200 border border-amber-700/30' : 'bg-secondary text-foreground border border-border'
              }`}>
              <ChevronRight className="w-5 h-5" />
              الصفحة التالية
            </button>
            <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}
              className={`flex-1 h-12 flex items-center justify-center gap-2 rounded-2xl text-sm font-bold shadow-md transition-all active:scale-95 disabled:opacity-40 ${
                nightMode ? 'bg-amber-500/25 text-amber-100 border border-amber-500/40' : 'gradient-primary text-primary-foreground'
              }`}>
              الصفحة السابقة
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5">
            {[currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2]
              .filter(p => p >= 1 && p <= TOTAL_PAGES).map(p => (
                <button key={p} onClick={() => goToPage(p)}
                  className={`min-w-[2.25rem] h-9 px-2 rounded-lg text-xs font-bold transition-all ${
                    p === currentPage
                      ? nightMode ? 'bg-amber-500/30 text-amber-100 scale-110 shadow' : 'bg-primary text-primary-foreground scale-110 shadow'
                      : nightMode ? 'bg-amber-900/20 text-amber-300/70 hover:bg-amber-900/30' : 'bg-secondary text-secondary-foreground hover:bg-muted'
                  }`}>
                  {p}
                </button>
              ))}
          </div>
        </div>

        <p className={`text-center text-[10px] mb-4 ${nightMode ? 'text-amber-400/50' : 'text-muted-foreground'}`}>
          اسحب يميناً أو يساراً للتنقل بين الصفحات
        </p>
      </div>

      {/* Tafsir Modal */}
      <AyahTafsirModal ayah={selectedAyah} nightMode={nightMode} onClose={() => setSelectedAyah(null)} />
    </div>
  );
};

export default MushafPage;
