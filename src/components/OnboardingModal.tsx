import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Search, Sparkles, Heart, ChevronLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'qh_onboarding_seen_v1';

interface Slide {
  icon: React.ElementType;
  title: string;
  desc: string;
}

const SLIDES: Slide[] = [
  {
    icon: BookOpen,
    title: 'أهلاً بك في قلب القرآن',
    desc: 'رفيقك اليومي للتلاوة والتدبر والحفظ والذكر بواجهة أنيقة وتجربة سريعة.',
  },
  {
    icon: BookOpen,
    title: 'المصحف والقراءة',
    desc: 'تصفّح المصحف الشريف بصفحات احترافية، واستمع للتلاوات، واقرأ التفسير بسهولة.',
  },
  {
    icon: Search,
    title: 'البحث الذكي',
    desc: 'ابحث عن أي آية أو كلمة أو موضوع في القرآن الكريم من زر البحث في الأسفل.',
  },
  {
    icon: Sparkles,
    title: 'المساعد القرآني',
    desc: 'اسأل بالذكاء الاصطناعي عن معاني الآيات، أسباب النزول، والمواضيع القرآنية.',
  },
  {
    icon: Heart,
    title: 'أدوات القلب',
    desc: 'قرآن القلب، التدبر الموجّه، الخاطرة اليومية، الأذكار، والقبلة… كلها بين يديك.',
  },
];

interface Props {
  forceOpen?: boolean;
  onClose?: () => void;
}

export const OnboardingModal: React.FC<Props> = ({ forceOpen, onClose }) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (forceOpen) {
      setOpen(true);
      return;
    }
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        const t = setTimeout(() => setOpen(true), 400);
        return () => clearTimeout(t);
      }
    } catch {}
  }, [forceOpen]);

  const finish = () => {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch {}
    setOpen(false);
    onClose?.();
  };

  const next = () => {
    if (step < SLIDES.length - 1) setStep(step + 1);
    else finish();
  };

  const skip = () => finish();

  const slide = SLIDES[step];
  const Icon = slide.icon;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          dir="rtl"
        >
          <motion.div
            key={step}
            initial={{ scale: 0.94, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md rounded-3xl overflow-hidden border border-border/50 bg-card shadow-2xl"
          >
            <button
              onClick={skip}
              className="absolute top-3 left-3 z-10 w-8 h-8 rounded-full bg-background/70 border border-border/50 flex items-center justify-center press"
              aria-label="تخطي"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>

            <div
              className="h-40 flex items-center justify-center relative"
              style={{
                background:
                  'radial-gradient(circle at 50% 40%, #0a6b53 0%, #064E3B 55%, #022c22 100%)',
              }}
            >
              <div
                className="absolute inset-0 opacity-[0.1] pointer-events-none"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 1px 1px, rgba(212,175,87,0.6) 1px, transparent 0)',
                  backgroundSize: '28px 28px',
                }}
              />
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #D4AF57, #f0d78c, #D4AF57)',
                  boxShadow: '0 12px 40px rgba(212,175,87,0.35)',
                }}
              >
                <Icon className="w-9 h-9" style={{ color: '#064E3B' }} />
              </motion.div>
            </div>

            <div className="p-5 text-center">
              <h2 className="text-lg font-extrabold text-foreground">{slide.title}</h2>
              <p className="text-[13px] text-muted-foreground leading-7 mt-2">
                {slide.desc}
              </p>

              <div className="flex items-center justify-center gap-1.5 mt-5">
                {SLIDES.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i === step ? 'w-6 bg-primary' : 'w-1.5 bg-border'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2 mt-5">
                <button
                  onClick={skip}
                  className="flex-1 h-11 rounded-xl border border-border/50 text-[13px] font-bold text-muted-foreground press"
                >
                  تخطي
                </button>
                <button
                  onClick={next}
                  className="flex-1 h-11 rounded-xl gradient-primary text-primary-foreground text-[13px] font-bold press flex items-center justify-center gap-1"
                >
                  {step < SLIDES.length - 1 ? 'التالي' : 'ابدأ الآن'}
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              {step === SLIDES.length - 1 && (
                <button
                  onClick={() => {
                    finish();
                    navigate('/about');
                  }}
                  className="mt-3 text-[12px] text-primary font-bold press"
                >
                  اعرف المزيد عن التطبيق
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OnboardingModal;
