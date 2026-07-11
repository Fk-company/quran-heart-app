import React, { useState, useEffect, useRef, useId } from 'react';
import { X, BookOpen, Loader2, Share2, Copy, Check, Image as ImageIcon } from 'lucide-react';
import { shareAyahAsImage } from '@/lib/shareAyahImage';

interface AyahTafsirModalProps {
  ayah: { number: number; text: string; numberInSurah: number; surah: { number: number; name: string } } | null;
  nightMode?: boolean;
  onClose: () => void;
}

const CLOSE_MS = 260;

const AyahTafsirModal: React.FC<AyahTafsirModalProps> = ({ ayah, nightMode, onClose }) => {
  const [tafsir, setTafsir] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [closing, setClosing] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const titleId = useId();

  // Sync open/close animation state
  useEffect(() => {
    if (ayah) setClosing(false);
  }, [ayah]);

  const requestClose = () => {
    if (closing) return;
    setClosing(true);
    window.setTimeout(() => onClose(), CLOSE_MS);
  };

  // Fetch tafsir
  useEffect(() => {
    if (!ayah) return;
    setLoading(true);
    setTafsir('');
    fetch(`https://api.alquran.cloud/v1/ayah/${ayah.number}/ar.muyassar`)
      .then((r) => r.json())
      .then((data) => {
        if (data.code === 200) setTafsir(data.data.text);
        else setTafsir('لم يتم العثور على التفسير');
      })
      .catch(() => setTafsir('حدث خطأ في تحميل التفسير'))
      .finally(() => setLoading(false));
  }, [ayah]);

  // Focus trap + keyboard: ESC to close, Tab cycle within sheet
  useEffect(() => {
    if (!ayah) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    // Focus close button on next frame
    const t = window.setTimeout(() => closeBtnRef.current?.focus(), 40);
    // Lock body scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        requestClose();
        return;
      }
      if (e.key === 'Tab' && sheetRef.current) {
        const focusables = sheetRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused.current?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ayah]);

  if (!ayah) return null;

  const handleCopy = () => {
    const text = `${ayah.text}\n\n${ayah.surah.name} - آية ${ayah.numberInSurah}\n\nالتفسير الميسر:\n${tafsir}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShare = () => {
    const text = `${ayah.text}\n\n${ayah.surah.name} - آية ${ayah.numberInSurah}`;
    if (navigator.share) {
      navigator.share({ title: `${ayah.surah.name} - آية ${ayah.numberInSurah}`, text });
    } else {
      handleCopy();
    }
  };

  const bg = nightMode ? 'bg-[hsl(220,18%,8%)]' : 'bg-card';
  const border = nightMode ? 'border-amber-700/30' : 'border-border';
  const textColor = nightMode ? 'text-amber-100' : 'text-foreground';
  const accentColor = nightMode ? 'text-amber-300' : 'text-primary';
  const accentBg = nightMode ? 'bg-amber-500/10' : 'bg-primary/5';

  return (
    <div
      className="fixed inset-0 z-[80]"
      dir="rtl"
      role="presentation"
      onClick={requestClose}
    >
      <div
        className="absolute inset-0 bg-foreground/50 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: closing ? 0 : 1 }}
      />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`absolute left-1/2 -translate-x-1/2 w-full max-w-lg ${bg} rounded-t-3xl border-t ${border} overflow-hidden flex flex-col shadow-2xl will-change-transform`}
        style={{
          bottom: 'calc(var(--nav-height) + env(safe-area-inset-bottom, 0px))',
          maxHeight: 'calc(90vh - var(--nav-height))',
          transform: closing ? 'translate(-50%, 100%)' : 'translate(-50%, 0)',
          opacity: closing ? 0 : 1,
          transition: `transform ${CLOSE_MS}ms cubic-bezier(0.32, 0.72, 0, 1), opacity ${CLOSE_MS}ms ease-out`,
          animation: closing ? undefined : 'sheet-up 0.32s cubic-bezier(0.32, 0.72, 0, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tappable drag handle */}
        <button
          onClick={requestClose}
          aria-label="إغلاق"
          tabIndex={-1}
          className="w-full flex justify-center pt-2 pb-1 active:opacity-70 flex-shrink-0"
        >
          <span className={`w-10 h-1.5 rounded-full ${nightMode ? 'bg-amber-500/50' : 'bg-border'}`} />
        </button>

        {/* Header row: close + title/location + actions */}
        <div className={`flex items-center gap-2 px-3 pt-1 pb-3 border-b ${border} flex-shrink-0`}>
          <button
            ref={closeBtnRef}
            onClick={requestClose}
            aria-label="إغلاق نافذة التفسير"
            title="إغلاق"
            className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md border transition-all active:scale-90 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 flex-shrink-0 ${
              nightMode
                ? 'bg-amber-500/25 border-amber-500/50 text-amber-100 hover:bg-amber-500/40'
                : 'bg-primary text-primary-foreground border-primary/40 hover:bg-primary/90'
            }`}
          >
            <X className="w-4 h-4" strokeWidth={2.5} />
          </button>

          <div className="flex-1 min-w-0 flex items-center gap-2">
            <BookOpen className={`w-4 h-4 flex-shrink-0 ${accentColor}`} aria-hidden="true" />
            <div className="min-w-0">
              <h2 id={titleId} className={`text-sm font-bold leading-tight truncate ${textColor}`}>
                التفسير الميسر
              </h2>
              <p className={`text-[11px] font-semibold truncate ${accentColor}`}>
                {ayah.surah.name} · آية {ayah.numberInSurah}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => shareAyahAsImage({ text: ayah.text, surahName: ayah.surah.name, ayahNumber: ayah.numberInSurah })}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${accentBg} focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/70`}
              aria-label="مشاركة كصورة"
              title="مشاركة كصورة"
            >
              <ImageIcon className={`w-3.5 h-3.5 ${accentColor}`} />
            </button>
            <button
              onClick={handleShare}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${accentBg} focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/70`}
              aria-label="مشاركة"
            >
              <Share2 className={`w-3.5 h-3.5 ${accentColor}`} />
            </button>
            <button
              onClick={handleCopy}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${accentBg} focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/70`}
              aria-label="نسخ"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className={`w-3.5 h-3.5 ${accentColor}`} />}
            </button>
          </div>
        </div>

        {/* Scrollable content — no forced bottom padding; sheet auto-sizes to content */}
        <div
          className="overflow-y-auto overscroll-contain px-5 py-4"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
        >
          {/* Ayah text */}
          <div
            className={`relative rounded-2xl p-4 mb-3 border ${
              nightMode ? 'bg-amber-900/10 border-amber-700/20' : 'bg-primary/[0.04] border-primary/15'
            }`}
          >
            <span
              className={`absolute -top-2 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                nightMode ? 'bg-amber-500/30 text-amber-100' : 'bg-primary text-primary-foreground'
              }`}
            >
              الآية
            </span>
            <p
              className={`font-amiri text-[22px] leading-[2.2] text-center ${
                nightMode ? 'text-amber-200' : 'text-foreground'
              }`}
            >
              {ayah.text}
            </p>
          </div>

          {/* Tafsir */}
          <div
            className={`relative rounded-2xl p-4 border ${
              nightMode ? 'bg-amber-500/5 border-amber-700/15' : 'bg-secondary/40 border-border/40'
            }`}
          >
            <span
              className={`absolute -top-2 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                nightMode ? 'bg-amber-500/30 text-amber-100' : 'bg-accent text-accent-foreground'
              }`}
            >
              التفسير
            </span>
            {loading ? (
              <div className="flex items-center justify-center py-6" aria-live="polite">
                <Loader2 className={`w-5 h-5 animate-spin ${accentColor}`} />
              </div>
            ) : (
              <p
                className={`text-[15px] leading-[2] whitespace-pre-line ${textColor}`}
                aria-live="polite"
              >
                {tafsir}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AyahTafsirModal;

              <p className={`text-[15px] leading-[2] whitespace-pre-line ${textColor}`} aria-live="polite">{tafsir}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AyahTafsirModal;
