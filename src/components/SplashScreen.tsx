import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import appLogo from '@/assets/app-logo.png';

const DHIKR_POOL = [
  'سُبْحَانَ اللهِ وَبِحَمْدِهِ، سُبْحَانَ اللهِ الْعَظِيمِ',
  'لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ',
  'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّد',
  'أَسْتَغْفِرُ اللهَ الَّذِي لَا إِلَهَ إِلَّا هُوَ وَأَتُوبُ إِلَيْهِ',
  'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ',
  'حَسْبُنَا اللهُ وَنِعْمَ الْوَكِيلُ',
  'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي',
  'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ',
];

interface Props {
  onDone: () => void;
  duration?: number;
}

// Islamic 8-point star ornament
const StarOrnament: React.FC<{ className?: string; size?: number }> = ({ className, size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" className={className} fill="none">
    <path
      d="M20 2 L24 16 L38 20 L24 24 L20 38 L16 24 L2 20 L16 16 Z"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinejoin="round"
    />
    <circle cx="20" cy="20" r="2.5" fill="currentColor" opacity="0.8" />
  </svg>
);

const SplashScreen: React.FC<Props> = ({ onDone, duration = 2800 }) => {
  const [progress, setProgress] = useState(0);
  const dhikr = useMemo(
    () => DHIKR_POOL[Math.floor(Math.random() * DHIKR_POOL.length)],
    [],
  );

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const p = Math.min(100, ((Date.now() - start) / duration) * 100);
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setTimeout(onDone, 320);
      }
    }, 40);
    return () => clearInterval(interval);
  }, [duration, onDone]);

  const circumference = 2 * Math.PI * 74;
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <AnimatePresence>
      <motion.div
        key="splash"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05, filter: 'blur(8px)' }}
        transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
        style={{
          background:
            'radial-gradient(ellipse at 50% 20%, hsl(162 70% 16%) 0%, hsl(162 78% 10%) 45%, hsl(162 85% 5%) 100%)',
        }}
        dir="rtl"
      >
        {/* Layered ambient orbs */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[560px] h-[560px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, hsl(38 80% 55% / 0.22) 0%, transparent 60%)',
            filter: 'blur(24px)',
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[380px] h-[380px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, hsl(162 55% 40% / 0.22) 0%, transparent 65%)',
            filter: 'blur(32px)',
          }}
        />

        {/* Geometric arabesque grid */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(30deg, hsl(38 80% 55%) 12%, transparent 12.5%, transparent 87%, hsl(38 80% 55%) 87.5%),
              linear-gradient(150deg, hsl(38 80% 55%) 12%, transparent 12.5%, transparent 87%, hsl(38 80% 55%) 87.5%),
              linear-gradient(270deg, hsl(38 80% 55%) 12%, transparent 12.5%, transparent 87%, hsl(38 80% 55%) 87.5%)
            `,
            backgroundSize: '48px 84px',
          }}
        />

        {/* Bismillah cartouche */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7 }}
          className="absolute top-14 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-10"
        >
          <div className="h-px w-8" style={{ background: 'linear-gradient(90deg, transparent, hsl(38 80% 55% / 0.7))' }} />
          <StarOrnament className="text-[hsl(38_80%_55%)]" size={14} />
          <p
            className="text-[13px] tracking-[0.15em] whitespace-nowrap"
            style={{
              color: 'hsl(42 85% 78%)',
              fontFamily: '"Amiri", serif',
              textShadow: '0 2px 10px hsl(38 80% 55% / 0.3)',
            }}
          >
            بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ
          </p>
          <StarOrnament className="text-[hsl(38_80%_55%)]" size={14} />
          <div className="h-px w-8" style={{ background: 'linear-gradient(270deg, transparent, hsl(38 80% 55% / 0.7))' }} />
        </motion.div>

        {/* Logo with rotating ornamental rings + circular progress */}
        <div className="relative z-10 flex items-center justify-center" style={{ width: 200, height: 200 }}>
          {/* Outer rotating ring — dashed */}
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 42, repeat: Infinity, ease: 'linear' }}
          >
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <circle
                cx="100" cy="100" r="94"
                fill="none"
                stroke="hsl(38 80% 55%)"
                strokeWidth="0.6"
                strokeDasharray="2 6"
                opacity="0.45"
              />
            </svg>
          </motion.div>

          {/* Counter-rotating star ring */}
          <motion.div
            className="absolute inset-2"
            animate={{ rotate: -360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          >
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <div
                key={deg}
                className="absolute top-1/2 left-1/2 text-[hsl(38_80%_60%)]"
                style={{
                  transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(-88px)`,
                }}
              >
                <StarOrnament size={10} />
              </div>
            ))}
          </motion.div>

          {/* Circular progress ring */}
          <svg viewBox="0 0 200 200" className="absolute inset-0 -rotate-90">
            <defs>
              <linearGradient id="progGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="hsl(42 90% 65%)" />
                <stop offset="50%" stopColor="hsl(38 85% 55%)" />
                <stop offset="100%" stopColor="hsl(32 80% 42%)" />
              </linearGradient>
            </defs>
            <circle cx="100" cy="100" r="74" fill="none" stroke="hsl(40 40% 96% / 0.08)" strokeWidth="2" />
            <circle
              cx="100" cy="100" r="74"
              fill="none"
              stroke="url(#progGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 0.1s linear', filter: 'drop-shadow(0 0 6px hsl(38 80% 55% / 0.6))' }}
            />
          </svg>

          {/* Logo */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <img
                src={appLogo}
                alt="قلب القرآن"
                width={124}
                height={124}
                className="w-[124px] h-[124px] object-contain"
                style={{ filter: 'drop-shadow(0 8px 32px hsl(38 80% 55% / 0.45))' }}
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Title with ornamental divider */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.7 }}
          className="relative z-10 mt-8 text-center px-6"
        >
          <h1
            className="text-[34px] font-extrabold tracking-tight leading-none"
            style={{
              fontFamily: '"IBM Plex Sans Arabic", sans-serif',
              background: 'linear-gradient(180deg, hsl(42 85% 92%) 0%, hsl(42 85% 78%) 60%, hsl(38 80% 55%) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 2px 20px hsl(38 80% 55% / 0.25)',
            }}
          >
            قلب القرآن
          </h1>

          {/* Ornamental divider */}
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="h-px w-16" style={{ background: 'linear-gradient(90deg, transparent, hsl(38 80% 55%))' }} />
            <div className="w-1.5 h-1.5 rotate-45 bg-[hsl(38_80%_55%)]" />
            <div className="h-px w-16" style={{ background: 'linear-gradient(270deg, transparent, hsl(38 80% 55%))' }} />
          </div>

          <p
            className="text-[10px] mt-2.5 tracking-[0.42em] font-medium"
            style={{ color: 'hsl(42 60% 75%)' }}
          >
            QURAN · HEART
          </p>
        </motion.div>

        {/* Dhikr */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05, duration: 0.8 }}
          className="relative z-10 mt-10 px-10 max-w-md"
        >
          <div
            className="text-[19px] leading-[2.1] text-center"
            style={{
              color: 'hsl(42 85% 92%)',
              fontFamily: '"Amiri", serif',
              textShadow: '0 2px 12px hsl(162 80% 5% / 0.5)',
            }}
          >
            {dhikr}
          </div>
        </motion.div>

        {/* Footer signature */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <div className="flex items-center gap-1.5">
            <div className="h-px w-6" style={{ background: 'hsl(38 60% 55% / 0.5)' }} />
            <StarOrnament className="text-[hsl(38_80%_55%)] opacity-70" size={9} />
            <div className="h-px w-6" style={{ background: 'hsl(38 60% 55% / 0.5)' }} />
          </div>
          <p
            className="text-[10px] tracking-[0.35em]"
            style={{ color: 'hsl(42 40% 70% / 0.7)', fontFamily: '"IBM Plex Sans Arabic", sans-serif' }}
          >
            تحميل التطبيق
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SplashScreen;
