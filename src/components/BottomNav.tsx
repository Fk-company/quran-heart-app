import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Book, Mic, Home, MoreHorizontal, Heart } from 'lucide-react';
import { MoreSheet } from '@/pages/MorePage';

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  isSheet?: boolean;
}

const navItems: NavItem[] = [
  { label: 'الرئيسية', icon: Home, path: '/' },
  { label: 'المصحف', icon: Book, path: '/quran' },
  { label: 'القراء', icon: Mic, path: '/reciters' },
  { label: 'المفضلة', icon: Heart, path: '/favorites' },
  { label: 'المزيد', icon: MoreHorizontal, path: '/more', isSheet: true },
];

const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

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
          {navItems.map((item) => {
            const active = isActive(item.path) && !item.isSheet;
            return (
              <button
                key={item.path}
                onClick={() => (item.isSheet ? setMoreOpen(true) : navigate(item.path))}
                className={`bottom-nav-item flex-1 pt-2 pb-1 ${active ? 'active' : ''}`}
                aria-label={item.label}
              >
                <div className="nav-icon-box">
                  <item.icon
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
        </div>
      </nav>
    </>
  );
};

export default BottomNav;
