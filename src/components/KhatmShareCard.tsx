import React, { useRef, useState } from 'react';
import { Share2, Download, Copy, Check, Award, BookOpen, Flame } from 'lucide-react';

interface KhatmShareCardProps {
  khatmProgress: number;
  completedSurahs: number;
  totalAyahs: number;
  totalPages: number;
  khatmCount: number;
  streak: number;
}

const KhatmShareCard: React.FC<KhatmShareCardProps> = ({
  khatmProgress, completedSurahs, totalAyahs, totalPages, khatmCount, streak
}) => {
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const shareText = `📖 تقدمي في ختم القرآن الكريم\n\n✅ ${completedSurahs} من 114 سورة (${khatmProgress}%)\n📄 ${totalPages} صفحة مقروءة\n📖 ${totalAyahs} آية\n🏆 ${khatmCount} ختمة مكتملة\n🔥 ${streak} أيام متتالية\n\nانضم إلي في تطبيق القرآن الكريم 🌙`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'تقدم ختمة القرآن', text: shareText });
      } catch {}
    } else {
      handleCopy();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-3">
      {/* Visual Card */}
      <div ref={cardRef} className="gradient-hero islamic-pattern rounded-2xl p-5 text-primary-foreground">
        <div className="text-center mb-4">
          <span className="text-xs opacity-70">بسم الله الرحمن الرحيم</span>
          <h3 className="text-lg font-bold mt-1">تقدم ختمة القرآن</h3>
        </div>

        {/* Progress circle */}
        <div className="flex justify-center mb-4">
          <div className="relative w-28 h-28">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(0 0% 100% / 0.15)" strokeWidth="6" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(0 0% 100% / 0.9)" strokeWidth="6"
                strokeLinecap="round" strokeDasharray={`${khatmProgress * 2.64} 264`} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold">{khatmProgress}%</span>
              <span className="text-[10px] opacity-70">مكتمل</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-primary-foreground/10 rounded-xl p-2.5 text-center">
            <BookOpen className="w-4 h-4 mx-auto mb-1 opacity-80" />
            <span className="text-lg font-bold block">{completedSurahs}/114</span>
            <span className="text-[10px] opacity-60">سورة</span>
          </div>
          <div className="bg-primary-foreground/10 rounded-xl p-2.5 text-center">
            <Award className="w-4 h-4 mx-auto mb-1 opacity-80" />
            <span className="text-lg font-bold block">{khatmCount}</span>
            <span className="text-[10px] opacity-60">ختمة</span>
          </div>
          <div className="bg-primary-foreground/10 rounded-xl p-2.5 text-center">
            <span className="text-lg font-bold block">{totalPages}</span>
            <span className="text-[10px] opacity-60">صفحة</span>
          </div>
          <div className="bg-primary-foreground/10 rounded-xl p-2.5 text-center">
            <Flame className="w-4 h-4 mx-auto mb-1 opacity-80" />
            <span className="text-lg font-bold block">{streak}</span>
            <span className="text-[10px] opacity-60">يوم متتالي</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
          <Share2 className="w-4 h-4" />
          مشاركة
        </button>
        <button onClick={handleCopy}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium">
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          {copied ? 'تم النسخ' : 'نسخ'}
        </button>
      </div>
    </div>
  );
};

export default KhatmShareCard;
