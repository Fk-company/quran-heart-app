import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import appLogo from '@/assets/app-logo.png';

const DHIKR_POOL = [
  'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
  'سُبْحَانَ اللهِ وَبِحَمْدِهِ سُبْحَانَ اللهِ الْعَظِيمِ',
  'لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ',
  'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّد',
  'حَسْبُنَا اللهُ وَنِعْمَ الْوَكِيلُ',
  'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ',
];

// Locked design tokens from selected direction v1
const C = {
  bg: '#0B3B2E',
  gold: '#D4A24A',
  cream: '#F5E7C6',
};

interface Props {
  onDone: () => void;
  duration?: number;
}

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

  // Progress ring geometry (matches prototype: w-48 h-48, r=88, stroke 4)
  const R = 88;
  const CIRC = 2 * Math.PI * R;
  const dashOffset = CIRC - (progress / 100) * CIRC;

  return (
    <AnimatePresence>
      <motion.div
        key="splash"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, filter: 'blur(6px)' }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        dir="rtl"
        className="fixed inset-0 z-[100] flex flex-col items-center justify-between overflow-hidden px-10 py-20"
        style={{ backgroundColor: C.bg }}
      >
        {/* Subtle grid ornament */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 0.05,
            backgroundImage: `
              linear-gradient(${C.gold} 0.5px, transparent 0.5px),
              linear-gradient(90deg, ${C.gold} 0.5px, transparent 0.5px)
            `,
            backgroundSize: '20px 20px',
          }}
        />

        {/* Corner ornaments */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute top-0 right-0 w-24 h-24 pointer-events-none"
          style={{ opacity: 0.2, fill: C.gold }}
        >
          <path d="M0 0 L100 0 L0 100 Z" />
        </svg>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute bottom-0 left-0 w-24 h-24 pointer-events-none rotate-180"
          style={{ opacity: 0.2, fill: C.gold }}
        >
          <path d="M0 0 L100 0 L0 100 Z" />
        </svg>

        {/* Top — Bismillah */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.7 }}
          className="relative z-10 w-full text-center"
        >
          <h2
            className="text-2xl tracking-wide"
            style={{
              fontFamily: '"Amiri", serif',
              color: C.gold,
              opacity: 0.95,
            }}
          >
            بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
          </h2>
        </motion.div>

        {/* Center — Logo (with progress ring) + title */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full gap-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex items-center justify-center w-48 h-48"
          >
            {/* Progress ring */}
            <svg className="absolute inset-0 w-48 h-48 -rotate-90" viewBox="0 0 192 192">
              <circle
                cx="96"
                cy="96"
                r={R}
                fill="none"
                stroke={C.gold}
                strokeOpacity={0.15}
                strokeWidth={4}
              />
              <circle
                cx="96"
                cy="96"
                r={R}
                fill="none"
                stroke={C.gold}
                strokeWidth={4}
                strokeLinecap="round"
                strokeDasharray={CIRC}
                strokeDashoffset={dashOffset}
                style={{
                  transition: 'stroke-dashoffset 0.1s linear',
                  filter: `drop-shadow(0 0 6px ${C.gold}66)`,
                }}
              />
            </svg>

            {/* Logo */}
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <img
                src={appLogo}
                alt="قلب القرآن"
                className="w-full h-full object-contain"
                style={{ filter: `drop-shadow(0 6px 24px ${C.gold}55)` }}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="text-center space-y-2"
          >
            <h1
              className="text-4xl font-bold tracking-tight leading-none"
              style={{
                fontFamily: '"IBM Plex Sans Arabic", sans-serif',
                color: C.cream,
              }}
            >
              قلب القرآن
            </h1>
            <p
              className="text-[11px] font-semibold uppercase"
              style={{
                fontFamily: '"IBM Plex Sans Arabic", sans-serif',
                color: C.gold,
                letterSpacing: '0.2em',
                opacity: 0.8,
              }}
            >
              Quran · Heart
            </p>
          </motion.div>
        </div>

        {/* Bottom — Dhikr + loading */}
        <div className="relative z-10 w-full flex flex-col items-center gap-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.8 }}
            className="text-center max-w-xs"
          >
            <p
              className="text-xl leading-loose"
              style={{
                fontFamily: '"Amiri", serif',
                color: C.cream,
                fontStyle: 'italic',
              }}
            >
              «{dhikr}»
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1 h-1 rounded-full"
                  style={{ backgroundColor: C.gold }}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
            <p
              className="text-sm font-light"
              style={{
                fontFamily: '"IBM Plex Sans Arabic", sans-serif',
                color: C.gold,
              }}
            >
              جاري تحميل التطبيق...
            </p>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SplashScreen;
