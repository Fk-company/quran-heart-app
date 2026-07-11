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
          top: 'max(10vh, 3rem)',
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
          className="w-full flex justify-center pt-2.5 pb-1.5 active:opacity-70"
        >
          <span className={`w-12 h-1.5 rounded-full ${nightMode ? 'bg-amber-500/50' : 'bg-border'}`} />
        </button>

        {/* Prominent floating close button */}
        <button
          ref={closeBtnRef}
          onClick={requestClose}
          aria-label="إغلاق نافذة التفسير"
          title="إغلاق"
          className={`absolute top-3 left-3 z-10 w-10 h-10 rounded-full flex items-center justify-center shadow-lg border transition-all active:scale-90 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 ${
            nightMode
              ? 'bg-amber-500/25 border-amber-500/50 text-amber-100 hover:bg-amber-500/40'
              : 'bg-primary text-primary-foreground border-primary/40 hover:bg-primary/90'
          }`}
        >
          <X className="w-5 h-5" strokeWidth={2.5} />
        </button>

        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-3 border-b ${border}`}>
          <div className="flex items-center gap-2 pl-12">
            <BookOpen className={`w-4 h-4 ${accentColor}`} aria-hidden="true" />
            <h2 id={titleId} className={`text-sm font-bold ${textColor}`}>التفسير الميسر</h2>
          </div>
          <div className="flex items-center gap-1">
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

        <div className="overflow-y-auto px-5 py-4 flex-1" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 32px)' }}>
          <div
            className={`text-center mb-3 px-3 py-1.5 rounded-full ${accentBg} inline-flex items-center gap-2 mx-auto`}
            style={{ display: 'flex', justifyContent: 'center' }}
          >
            <span className={`text-xs font-semibold ${accentColor}`}>{ayah.surah.name} - آية {ayah.numberInSurah}</span>
          </div>

          <div className={`rounded-2xl p-4 mb-4 border ${nightMode ? 'bg-amber-900/10 border-amber-700/15' : 'bg-primary/3 border-primary/10'}`}>
            <p className={`font-amiri text-xl leading-[2.4] text-center ${nightMode ? 'text-amber-200' : 'text-foreground'}`}>
              {ayah.text}
            </p>
          </div>

          <div>
            <h3 className={`text-xs font-bold mb-2 ${accentColor}`}>التفسير الميسر</h3>
            {loading ? (
              <div className="flex items-center justify-center py-8" aria-live="polite">
                <Loader2 className={`w-5 h-5 animate-spin ${accentColor}`} />
              </div>
            ) : (
              <p className={`text-[15px] leading-[2] whitespace-pre-line ${textColor}`} aria-live="polite">{tafsir}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AyahTafsirModal;
