import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, LayoutGroup, useReducedMotion } from 'framer-motion';
import {
  Book, Mic, Home, MoreHorizontal, Heart, Search, Radio, BookOpen,
  Sparkles, Target, CalendarDays, Quote, BarChart3,
} from 'lucide-react';
import { MoreSheet } from '@/pages/MorePage';

export interface NavItemDef {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
}

export const NAV_CATALOG: NavItemDef[] = [
  { id: 'home', label: 'الرئيسية', icon: Home, path: '/' },
  { id: 'quran', label: 'المصحف', icon: Book, path: '/quran' },
  { id: 'reciters', label: 'القراء', icon: Mic, path: '/reciters' },
  { id: 'favorites', label: 'المفضلة', icon: Heart, path: '/favorites' },
  { id: 'search', label: 'البحث', icon: Search, path: '/search' },
  { id: 'radio', label: 'الراديو', icon: Radio, path: '/radio' },
  { id: 'tafsir', label: 'التفسير', icon: BookOpen, path: '/tafsir' },
  { id: 'wird', label: 'وردي', icon: Sparkles, path: '/daily-wird' },
  { id: 'khatm', label: 'الختمة', icon: Target, path: '/khatm-plan' },
  { id: 'hijri', label: 'التقويم', icon: CalendarDays, path: '/hijri-calendar' },
  { id: 'hadith', label: 'الأحاديث', icon: Quote, path: '/hadith' },
  { id: 'stats', label: 'إحصائياتي', icon: BarChart3, path: '/reading-stats' },
  { id: 'tasbih-stats', label: 'إحصاء التسبيح', icon: Heart, path: '/tasbih-stats' },
];

export const DEFAULT_NAV_IDS = ['home', 'quran', 'reciters', 'favorites'];
const STORAGE_KEY = 'bottom_nav_ids_v1';

export const getNavIds = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length === 4) return parsed;
    }
  } catch {}
  return DEFAULT_NAV_IDS;
};

export const setNavIds = (ids: string[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.slice(0, 4)));
    window.dispatchEvent(new Event('bottom-nav-changed'));
  } catch {}
};

const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [moreOpen, setMoreOpen] = useState(false);
  const [navIds, setIds] = useState<string[]>(getNavIds);

  useEffect(() => {
    const update = () => setIds(getNavIds());
    window.addEventListener('bottom-nav-changed', update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener('bottom-nav-changed', update);
      window.removeEventListener('storage', update);
    };
  }, []);

  const items = navIds
    .map((id) => NAV_CATALOG.find((i) => i.id === id))
    .filter((x): x is NavItemDef => Boolean(x));

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const activeKey =
    items.find((i) => isActive(i.path))?.id ?? null;

  return (
    <>
      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
      <nav
        aria-label="التنقل السفلي"
        className="fixed bottom-0 left-0 right-0 z-40 safe-bottom dark:shadow-[0_-10px_36px_-10px_rgba(0,0,0,0.7)]"
        style={{
          background: 'hsl(var(--glass-strong))',
          backdropFilter: 'blur(28px) saturate(200%)',
          WebkitBackdropFilter: 'blur(28px) saturate(200%)',
          borderTop: '1px solid hsl(var(--border) / 0.6)',
          boxShadow: '0 -8px 28px -8px hsl(var(--primary) / 0.14)',
        }}
      >
        {/* dark-mode contrast overlay */}
        <div
          className="absolute inset-0 pointer-events-none hidden dark:block"
          style={{
            background:
              'linear-gradient(180deg, hsl(var(--primary) / 0.06) 0%, transparent 45%, hsl(0 0% 0% / 0.35) 100%)',
          }}
        />
        <div
          className="absolute top-0 left-0 right-0 h-[1.5px] pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, transparent, hsl(var(--primary) / 0.45) 30%, hsl(var(--accent) / 0.7) 50%, hsl(var(--primary) / 0.45) 70%, transparent)',
          }}
        />
        <LayoutGroup id="bottom-nav">
          <div className="flex items-stretch justify-around max-w-lg mx-auto h-[68px] px-1">
            {items.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`bottom-nav-item flex-1 pt-2 pb-1 relative ${active ? 'active' : ''}`}
                  aria-label={item.label}
                  aria-current={active ? 'page' : undefined}
                >
                  <div className="nav-icon-box relative">
                    {active && !reduce && (
                      <motion.span
                        layoutId="nav-active-pill"
                        className="absolute inset-0 rounded-[14px] -z-0"
                        style={{
                          background:
                            'linear-gradient(135deg, hsl(var(--primary) / 0.16), hsl(var(--accent) / 0.12))',
                          boxShadow:
                            '0 4px 14px -4px hsl(var(--primary) / 0.35), inset 0 0 0 1px hsl(var(--primary) / 0.22)',
                        }}
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      />
                    )}
                    <Icon
                      className={`relative w-5 h-5 transition-all duration-300 ${active ? 'text-primary scale-110' : 'text-muted-foreground'}`}
                      strokeWidth={active ? 2.4 : 1.8}
                    />
                  </div>
                  <span
                    className={`transition-colors duration-200 ${active ? 'text-primary font-bold' : 'text-muted-foreground font-medium'}`}
                  >
                    {item.label}
                  </span>
                  {active && !reduce && (
                    <motion.span
                      layoutId="nav-active-dot"
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{
                        background: 'hsl(var(--accent))',
                        boxShadow: '0 0 8px hsl(var(--accent) / 0.8)',
                      }}
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                </button>

              );
            })}
            <button
              onClick={() => setMoreOpen(true)}
              className="bottom-nav-item flex-1 pt-2 pb-1 relative"
              aria-label="المزيد"
            >
              <div className="nav-icon-box">
                <MoreHorizontal className="w-5 h-5 text-muted-foreground transition-colors duration-200" strokeWidth={1.8} />
              </div>
              <span className="text-muted-foreground font-medium">المزيد</span>
            </button>
          </div>
        </LayoutGroup>
      </nav>
    </>
  );
};

export default BottomNav;
