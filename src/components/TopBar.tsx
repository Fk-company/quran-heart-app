import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Moon, Sun, Settings, BookOpen } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const TopBar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Hide on home page (it has its own header)
  if (location.pathname === '/') return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-40 safe-top"
      style={{
        background: 'hsl(var(--glass))',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      }}
    >
      <div className="flex items-center justify-between h-12 px-4 max-w-lg mx-auto" dir="rtl">
        <button onClick={() => navigate('/')} className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="text-sm font-bold text-foreground tracking-tight">القرآن الكريم</span>
        </button>
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-xl bg-secondary/80 flex items-center justify-center transition-colors hover:bg-muted"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-accent" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-foreground" />
            )}
          </button>
        </div>
      </div>
      <div className="h-[1px] bg-border/40" />
    </div>
  );
};

export default TopBar;
