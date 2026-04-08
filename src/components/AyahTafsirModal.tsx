import React, { useState, useEffect } from 'react';
import { X, BookOpen, Loader2, Share2, Copy, Check } from 'lucide-react';

interface AyahTafsirModalProps {
  ayah: { number: number; text: string; numberInSurah: number; surah: { number: number; name: string } } | null;
  nightMode?: boolean;
  onClose: () => void;
}

const AyahTafsirModal: React.FC<AyahTafsirModalProps> = ({ ayah, nightMode, onClose }) => {
  const [tafsir, setTafsir] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!ayah) return;
    setLoading(true);
    setTafsir('');
    fetch(`https://api.alquran.cloud/v1/ayah/${ayah.number}/ar.muyassar`)
      .then(r => r.json())
      .then(data => {
        if (data.code === 200) setTafsir(data.data.text);
        else setTafsir('لم يتم العثور على التفسير');
      })
      .catch(() => setTafsir('حدث خطأ في تحميل التفسير'))
      .finally(() => setLoading(false));
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
  const mutedColor = nightMode ? 'text-amber-400/60' : 'text-muted-foreground';
  const accentColor = nightMode ? 'text-amber-300' : 'text-primary';
  const accentBg = nightMode ? 'bg-amber-500/10' : 'bg-primary/5';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" dir="rtl" onClick={onClose}>
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" />
      <div
        className={`relative w-full max-w-lg ${bg} rounded-t-3xl border-t ${border} max-h-[80vh] overflow-hidden animate-fade-in`}
        style={{ animation: 'sheet-up 0.3s cubic-bezier(0.32, 0.72, 0, 1)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className={`w-10 h-1 rounded-full mx-auto mt-3 mb-1 ${nightMode ? 'bg-amber-700/40' : 'bg-border'}`} />

        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-3 border-b ${border}`}>
          <div className="flex items-center gap-2">
            <BookOpen className={`w-4 h-4 ${accentColor}`} />
            <span className={`text-sm font-bold ${textColor}`}>التفسير الميسر</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={handleShare} className={`w-8 h-8 rounded-full flex items-center justify-center ${accentBg}`}>
              <Share2 className={`w-3.5 h-3.5 ${accentColor}`} />
            </button>
            <button onClick={handleCopy} className={`w-8 h-8 rounded-full flex items-center justify-center ${accentBg}`}>
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className={`w-3.5 h-3.5 ${accentColor}`} />}
            </button>
            <button onClick={onClose} className={`w-8 h-8 rounded-full flex items-center justify-center ${accentBg}`}>
              <X className={`w-3.5 h-3.5 ${mutedColor}`} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto px-5 py-4 max-h-[65vh]">
          {/* Ayah info */}
          <div className={`text-center mb-3 px-3 py-1.5 rounded-full ${accentBg} inline-flex items-center gap-2 mx-auto`}
            style={{ display: 'flex', justifyContent: 'center' }}>
            <span className={`text-xs font-semibold ${accentColor}`}>{ayah.surah.name} - آية {ayah.numberInSurah}</span>
          </div>

          {/* Ayah text */}
          <div className={`rounded-2xl p-4 mb-4 border ${nightMode ? 'bg-amber-900/10 border-amber-700/15' : 'bg-primary/3 border-primary/10'}`}>
            <p className={`font-amiri text-xl leading-[2.4] text-center ${nightMode ? 'text-amber-200' : 'text-foreground'}`}>
              {ayah.text}
            </p>
          </div>

          {/* Tafsir */}
          <div>
            <h3 className={`text-xs font-bold mb-2 ${accentColor}`}>التفسير الميسر</h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className={`w-5 h-5 animate-spin ${accentColor}`} />
              </div>
            ) : (
              <p className={`text-sm leading-[2] ${textColor}`}>{tafsir}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AyahTafsirModal;
