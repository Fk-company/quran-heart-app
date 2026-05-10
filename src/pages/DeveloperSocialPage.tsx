import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Share2, ArrowLeft, ExternalLink, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import appLogo from '@/assets/app-logo.png';

const TelegramIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.477-1.635z" />
  </svg>
);

const InstagramIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.85-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
  </svg>
);

const SocialButton: React.FC<{
  href: string;
  icon: React.ReactNode;
  label: string;
  sub: string;
  gradient: string;
  hoverShadow: string;
}> = ({ href, icon, label, sub, gradient, hoverShadow }) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    whileTap={{ scale: 0.96 }}
    className="group relative overflow-hidden rounded-2xl p-4 flex items-center gap-4 transition-all duration-300"
    style={{ background: gradient, boxShadow: '0 4px 14px -4px rgba(0,0,0,0.15)' }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLElement).style.boxShadow = hoverShadow;
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px -4px rgba(0,0,0,0.15)';
    }}
  >
    <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-white" />
    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div className="flex-1 text-right">
      <div className="font-bold text-white text-sm">{label}</div>
      <div className="text-white/70 text-[11px]">{sub}</div>
    </div>
    <ExternalLink className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
  </motion.a>
);

const DeveloperSocialPage: React.FC = () => {
  const navigate = useNavigate();

  const handleShareApp = async () => {
    const shareData = {
      title: 'قلب القرآن',
      text: 'تطبيق قلب القرآن - تجربة قرآنية هادئة وعصرية',
      url: window.location.origin,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        alert('تم نسخ رابط التطبيق!');
      }
    } catch {
      // User cancelled
    }
  };

  return (
    <div className="page-container page-with-topbar" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center transition-colors hover:bg-muted"
            aria-label="رجوع"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground font-kufi">تواصل مع المطور</h1>
            <p className="text-xs text-muted-foreground">فخري عادل</p>
          </div>
        </div>

        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card-luxury text-center mb-6 relative overflow-hidden"
        >
          {/* Decorative glow */}
          <div
            className="absolute top-[-50%] left-1/2 -translate-x-1/2 w-64 h-64 rounded-full opacity-40"
            style={{ background: 'radial-gradient(circle, hsl(var(--accent) / 0.25), transparent 70%)' }}
          />

          <div className="relative z-10 flex flex-col items-center py-4">
            <motion.img
              src={appLogo}
              alt="لوكو قلب القرآن"
              className="w-24 h-24 rounded-3xl mb-4 drop-shadow-lg"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
            />
            <h2 className="text-lg font-bold text-foreground font-kufi mb-1">قلب القرآن</h2>
            <p className="text-xs text-muted-foreground mb-3">QURAN HEART</p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
              <Heart className="w-3 h-3 fill-primary text-primary" />
              صنع هذا التطبيق صدقة جارية
            </div>
          </div>
        </motion.div>

        {/* Developer Info */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.45 }}
          className="card-surface mb-6"
        >
          <h3 className="text-sm font-bold text-foreground mb-3 font-kufi">عن المطور</h3>
          <p className="text-[13px] text-muted-foreground leading-relaxed mb-3">
            فخري عادل — مطور شغوف ببناء تجارب رقمية إسلامية هادفة. هدفي تعزيز الصلة بالقرآن
            والذكر في الحياة اليومية من خلال أدوات بسيطة وجميلة.
          </p>
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            إن كان لديك اقتراح أو ملاحظة أو رغبتَ في التعاون، لا تتردد بالتواصل معي عبر
            قنواتي أدناه.
          </p>
        </motion.div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.45 }}
          className="space-y-3 mb-8"
        >
          <h3 className="text-sm font-bold text-foreground mb-2 font-kufi px-1">حساباتي</h3>

          <SocialButton
            href="https://t.me/fakhri_adel"
            icon={<TelegramIcon className="w-6 h-6 text-white" />}
            label="تلغرام"
            sub="@fakhri_adel"
            gradient="linear-gradient(135deg, #229ED9 0%, #1A8BC7 100%)"
            hoverShadow="0 8px 24px -6px rgba(34,158,217,0.45)"
          />

          <SocialButton
            href="https://www.instagram.com/fakhri_adel/"
            icon={<InstagramIcon className="w-6 h-6 text-white" />}
            label="انستغرام"
            sub="@fakhri_adel"
            gradient="linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #F77737 100%)"
            hoverShadow="0 8px 24px -6px rgba(253,29,29,0.35)"
          />
        </motion.div>

        {/* Share App */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.45 }}
        >
          <button
            onClick={handleShareApp}
            className="w-full card-surface-hover flex items-center justify-center gap-2 py-4"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10">
              <Share2 className="w-5 h-5 text-primary" />
            </div>
            <div className="text-right">
              <div className="font-bold text-foreground text-sm">شارك التطبيق</div>
              <div className="text-[11px] text-muted-foreground">ساهم بنشر الخير واجعله صدقة جارية</div>
            </div>
          </button>
        </motion.div>

        {/* Footer dhikr */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-8 mb-4"
        >
          <p className="font-amiri text-sm text-muted-foreground/70 leading-relaxed">
            "مَنْ دَلَّ عَلَى خَيْرٍ فَلَهُ مِثْلُ أَجْرِ فَاعِلِهِ"
          </p>
          <p className="text-[11px] text-muted-foreground/50 mt-1">رواه مسلم</p>
        </motion.div>
      </div>
    </div>
  );
};

export default DeveloperSocialPage;