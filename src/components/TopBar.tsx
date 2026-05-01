import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Moon, Sun, Settings, Search } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const TopBar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === '/') return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-40 safe-top"
      style={{
        background: 'hsl(var(--glass-strong))',
        backdropFilter: 'blur(24px) saturate(200%)',
        WebkitBackdropFilter: 'blur(24px) saturate(200%)',
      }}
    >
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto" dir="rtl">
        <button onClick={() => navigate('/')} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shadow-emerald relative overflow-hidden">
            <span className="font-amiri text-primary-foreground text-base font-bold leading-none">ﷺ</span>
            <span className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
          </div>
          <div className="text-right leading-tight">
            <div className="text-sm font-bold text-foreground tracking-tight font-kufi">قلب القرآن</div>
            <div className="text-[9px] text-muted-foreground font-medium">Quran Heart</div>
          </div>
        </button>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => navigate('/search')}
            className="w-9 h-9 rounded-xl bg-secondary/70 flex items-center justify-center transition-all hover:bg-muted border border-border/40"
            aria-label="بحث"
          >
            <Search className="w-4 h-4 text-foreground" />
          </button>
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl bg-secondary/70 flex items-center justify-center transition-all hover:bg-muted border border-border/40"
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
            className="w-9 h-9 rounded-xl bg-secondary/70 flex items-center justify-center transition-all hover:bg-muted border border-border/40"
            aria-label="الإعدادات"
          >
            <Settings className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
      <div className="h-[1px]" style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--accent)/0.35) 50%, transparent)' }} />
    </div>
  );
};

export default TopBar;
