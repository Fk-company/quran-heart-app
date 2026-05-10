import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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

// All available items the user can pick for the bottom bar
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

  return (
    <>
      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 safe-bottom"
        style={{
          background: 'hsl(var(--glass-strong))',
          backdropFilter: 'blur(24px) saturate(200%)',
          WebkitBackdropFilter: 'blur(24px) saturate(200%)',
          borderTop: '1px solid hsl(var(--border) / 0.5)',
          boxShadow: '0 -4px 20px -4px hsl(var(--primary) / 0.08)',
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-[1px]"
          style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--accent) / 0.4) 50%, transparent)' }}
        />
        <div className="flex items-stretch justify-around max-w-lg mx-auto h-[68px]">
          {items.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`bottom-nav-item flex-1 pt-2 pb-1 ${active ? 'active' : ''}`}
                aria-label={item.label}
              >
                <div className="nav-icon-box">
                  <Icon
                    className={`w-5 h-5 transition-all duration-300 ${active ? 'text-primary' : 'text-muted-foreground'}`}
                    strokeWidth={active ? 2.5 : 1.8}
                  />
                </div>
                <span
                  className={`transition-all duration-300 ${active ? 'text-primary font-bold' : 'text-muted-foreground font-medium'}`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
          <button
            onClick={() => setMoreOpen(true)}
            className="bottom-nav-item flex-1 pt-2 pb-1"
            aria-label="المزيد"
          >
            <div className="nav-icon-box">
              <MoreHorizontal className="w-5 h-5 text-muted-foreground transition-all duration-300" strokeWidth={1.8} />
            </div>
            <span className="text-muted-foreground font-medium transition-all duration-300">المزيد</span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default BottomNav;
