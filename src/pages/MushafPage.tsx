import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronRight, ChevronLeft, BookOpen, ArrowRight } from 'lucide-react';

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

  const fetchPage = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/page/${page}`);
      const data = await res.json();
      setAyahs(data.data.ayahs || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPage(currentPage);
    setSearchParams({ page: String(currentPage) });
    localStorage.setItem('mushaf_last_page', String(currentPage));
  }, [currentPage, fetchPage, setSearchParams]);

  // Load last page on mount
  useEffect(() => {
    if (!searchParams.get('page')) {
      const saved = localStorage.getItem('mushaf_last_page');
      if (saved) setCurrentPage(Number(saved));
    }
  }, []);

  const goToPage = (p: number) => {
    if (p >= 1 && p <= TOTAL_PAGES) setCurrentPage(p);
  };

  const handleJump = () => {
    const p = Number(pageInput);
    if (p >= 1 && p <= TOTAL_PAGES) {
      setCurrentPage(p);
      setShowJumpInput(false);
      setPageInput('');
    }
  };

  // Group ayahs by surah for header display
  const surahsOnPage = Array.from(new Set(ayahs.map(a => a.surah.number))).map(num => {
    const first = ayahs.find(a => a.surah.number === num)!;
    return { number: num, name: first.surah.name };
  });

  // Detect juz
  const juzNumber = ayahs.length > 0 ? ayahs[0].juz : 0;

  return (
    <div className="page-container" dir="rtl">
      <div className="px-4 pt-4 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('/quran')} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
            <ArrowRight className="w-4 h-4 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">المصحف الشريف</h1>
            <p className="text-xs text-muted-foreground">الجزء {juzNumber} - صفحة {currentPage} من {TOTAL_PAGES}</p>
          </div>
          <button
            onClick={() => setShowJumpInput(!showJumpInput)}
            className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-medium"
          >
            انتقال لصفحة
          </button>
        </div>

        {/* Jump to page */}
        {showJumpInput && (
          <div className="card-surface mb-4 flex items-center gap-2 animate-fade-in">
            <input
              type="number"
              value={pageInput}
              onChange={e => setPageInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleJump()}
              placeholder={`1 - ${TOTAL_PAGES}`}
              min={1}
              max={TOTAL_PAGES}
              className="search-input flex-1 text-center"
            />
            <button onClick={handleJump} className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
              انتقال
            </button>
          </div>
        )}

        {/* Surah headers on this page */}
        <div className="flex items-center justify-center gap-3 mb-3">
          {surahsOnPage.map(s => (
            <button
              key={s.number}
              onClick={() => navigate(`/quran/${s.number}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold"
            >
              <BookOpen className="w-3 h-3" />
              {s.name}
            </button>
          ))}
        </div>

        {/* Page Content */}
        {loading ? (
          <div className="mushaf-page-frame">
            <div className="space-y-3 p-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton-pulse h-6 w-full" />
              ))}
            </div>
          </div>
        ) : (
          <div className="mushaf-page-frame">
            {/* Decorative top border */}
            <div className="mushaf-ornament-top" />

            <div className="px-5 py-6 sm:px-8 sm:py-8">
              {/* Check for bismillah at start of surah */}
              {ayahs.length > 0 && ayahs[0].numberInSurah === 1 && ayahs[0].surah.number !== 1 && ayahs[0].surah.number !== 9 && (
                <div className="text-center mb-5 pb-4 border-b border-primary/10">
                  <span className="font-amiri text-xl text-primary leading-relaxed">
                    بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ
                  </span>
                </div>
              )}

              <p className="font-amiri text-[1.35rem] sm:text-2xl leading-[2.6] sm:leading-[2.8] text-foreground text-center text-justify" style={{ textAlignLast: 'center' }}>
                {ayahs.map((ayah, idx) => {
                  // Show surah separator if this is first ayah of a new surah (not first ayah on page)
                  const showSurahHeader = ayah.numberInSurah === 1 && idx > 0;
                  return (
                    <React.Fragment key={ayah.number}>
                      {showSurahHeader && (
                        <>
                          <br />
                          <span className="block text-center my-4 py-3 px-4 rounded-xl bg-primary/5 border border-primary/10">
                            <span className="font-amiri text-lg text-primary font-bold">{ayah.surah.name}</span>
                          </span>
                          {ayah.surah.number !== 9 && (
                            <span className="block text-center mb-4">
                              <span className="font-amiri text-lg text-primary">بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ</span>
                            </span>
                          )}
                        </>
                      )}
                      <span className="mushaf-ayah-text">{ayah.text}</span>
                      {' '}
                      <span className="verse-number inline-flex w-6 h-6 text-[10px] mx-0.5 align-middle">
                        {ayah.numberInSurah}
                      </span>
                      {' '}
                    </React.Fragment>
                  );
                })}
              </p>
            </div>

            {/* Decorative bottom border */}
            <div className="mushaf-ornament-bottom" />

            {/* Page number */}
            <div className="text-center py-2">
              <span className="text-xs text-muted-foreground font-medium">{currentPage}</span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-5 mb-4">
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= TOTAL_PAGES}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
            الصفحة التالية
          </button>

          <div className="flex items-center gap-1">
            {[currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2]
              .filter(p => p >= 1 && p <= TOTAL_PAGES)
              .map(p => (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                    p === currentPage ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-muted'
                  }`}
                >
                  {p}
                </button>
              ))}
          </div>

          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 transition-colors"
          >
            الصفحة السابقة
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MushafPage;
