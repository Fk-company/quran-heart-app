import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Moon, Sun, Settings, Search, ChevronRight } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import AppLogo from '@/components/AppLogo';

const TopBar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 6);
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? Math.min(1, Math.max(0, y / h)) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [location.pathname]);


  if (location.pathname === '/') return null;

  const canGoBack = window.history.length > 1;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-40 safe-top transition-all duration-300"
      style={{
        background: scrolled
          ? 'linear-gradient(180deg, hsl(var(--background) / 0.92), hsl(var(--background) / 0.78))'
          : 'linear-gradient(180deg, hsl(var(--background) / 0.7), hsl(var(--background) / 0.45))',
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        boxShadow: scrolled ? '0 8px 24px -16px hsl(var(--foreground) / 0.18)' : 'none',
      }}
    >
      {/* Subtle aurora glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(120% 80% at 50% -20%, hsl(var(--primary)/0.18), transparent 60%), radial-gradient(80% 60% at 100% 0%, hsl(var(--accent)/0.14), transparent 60%)',
        }}
      />

      <div className="relative flex items-center justify-between h-14 px-3 max-w-lg mx-auto" dir="rtl">
        {/* Brand */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 group rounded-2xl px-1.5 py-1 -mx-1.5 active:scale-95 transition-transform"
          aria-label="الرئيسية"
        >
          <div className="relative">
            <div
              className="absolute -inset-1 rounded-2xl opacity-50 blur-md group-hover:opacity-80 transition-opacity"
              style={{ background: 'linear-gradient(135deg, hsl(var(--primary)/0.6), hsl(var(--accent)/0.5))' }}
            />
            <div className="app-logo-frame relative w-9 h-9 rounded-2xl flex items-center justify-center overflow-hidden shadow-sm">
              <AppLogo size={36} rounded="rounded-2xl" />
            </div>
          </div>
          <div className="text-right leading-tight">
            <div className="text-[13px] font-extrabold text-foreground tracking-tight font-kufi">
              قلب القرآن
            </div>
            <div
              className="text-[9px] font-semibold tracking-[0.18em] uppercase bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))' }}
            >
              Quran · Heart
            </div>
          </div>
        </button>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          {canGoBack && (
            <button
              onClick={() => navigate(-1)}
              className="hidden sm:inline-flex w-9 h-9 rounded-xl bg-secondary/60 items-center justify-center transition-all hover:bg-secondary border border-border/40 active:scale-95"
              aria-label="رجوع"
            >
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          <button
            onClick={() => navigate('/search')}
            className="w-9 h-9 rounded-xl bg-secondary/60 flex items-center justify-center transition-all hover:bg-secondary border border-border/40 active:scale-95"
            aria-label="بحث"
          >
            <Search className="w-4 h-4 text-foreground" />
          </button>
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl bg-secondary/60 flex items-center justify-center transition-all hover:bg-secondary border border-border/40 active:scale-95"
            aria-label="تبديل المظهر"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-accent" />
            ) : (
              <Moon className="w-4 h-4 text-foreground" />
            )}
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="w-9 h-9 rounded-xl bg-secondary/60 flex items-center justify-center transition-all hover:bg-secondary border border-border/40 active:scale-95"
            aria-label="الإعدادات"
          >
            <Settings className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Premium gradient divider + scroll progress */}
      <div className="relative h-[2px]">
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, hsl(var(--primary)/0.30) 30%, hsl(var(--accent)/0.50) 50%, hsl(var(--primary)/0.30) 70%, transparent 100%)',
          }}
        />
        <div
          className="absolute inset-y-0 right-0 origin-right transition-transform duration-150"
          style={{
            transform: `scaleX(${progress})`,
            background:
              'linear-gradient(90deg, hsl(var(--accent)), hsl(var(--primary)))',
            boxShadow: '0 0 8px hsl(var(--accent) / 0.6)',
          }}
        />
      </div>

    </div>
  );
};

export default TopBar;
