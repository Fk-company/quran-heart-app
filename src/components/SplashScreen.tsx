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

const SplashScreen: React.FC<Props> = ({ onDone, duration = 2600 }) => {
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
        setTimeout(onDone, 280);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [duration, onDone]);

  return (
    <AnimatePresence>
      <motion.div
        key="splash"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.04 }}
        transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
        style={{
          background:
            'radial-gradient(circle at 50% 30%, #0a6b53 0%, #064E3B 45%, #022c22 100%)',
        }}
        dir="rtl"
      >
        {/* Decorative geometric pattern */}
        <div
          className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(212,175,87,0.6) 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        {/* Glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(212,175,87,0.18) 0%, transparent 65%)',
          }}
        />

        {/* Logo */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10"
        >
          <motion.img
            src={appLogo}
            alt="قلب القرآن"
            width={160}
            height={160}
            className="w-40 h-40 object-contain drop-shadow-[0_10px_40px_rgba(212,175,87,0.35)]"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

        {/* App name */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="relative z-10 mt-6 text-center"
        >
          <h1
            className="text-3xl font-extrabold tracking-tight"
            style={{ color: '#FFF8E7', fontFamily: '"IBM Plex Sans Arabic", sans-serif' }}
          >
            قلب القرآن
          </h1>
          <p className="text-[11px] mt-1 tracking-[0.3em]" style={{ color: '#D4AF57' }}>
            QURAN HEART
          </p>
        </motion.div>

        {/* Dhikr */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.7 }}
          className="relative z-10 mt-10 px-8 max-w-md text-center"
        >
          <div
            className="text-xl leading-loose"
            style={{
              color: '#FFF8E7',
              fontFamily: '"Amiri", serif',
              textShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            {dhikr}
          </div>
        </motion.div>

        {/* Progress bar */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-48 h-[3px] rounded-full overflow-hidden bg-white/10">
          <motion.div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #D4AF57, #f0d78c, #D4AF57)',
            }}
          />
        </div>

        <div className="absolute bottom-6 text-[10px] tracking-widest" style={{ color: 'rgba(255,248,231,0.45)' }}>
          بسم الله الرحمن الرحيم
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SplashScreen;
