import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Book, Mic, Home, MoreHorizontal, Search } from 'lucide-react';
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
  { label: 'بحث', icon: Search, path: '/search' },
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
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/30 safe-bottom"
        style={{
          background: 'hsl(var(--glass))',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        }}
      >
        <div className="flex items-stretch justify-around max-w-lg mx-auto h-16">
          {navItems.map((item) => {
            const active = isActive(item.path) && !item.isSheet;
            return (
              <button
                key={item.path}
                onClick={() => item.isSheet ? setMoreOpen(true) : navigate(item.path)}
                className={`bottom-nav-item flex-1 pt-2 pb-1 ${active ? 'active' : ''}`}
              >
                <div className="nav-icon-box">
                  <item.icon
                    className={`w-5 h-5 transition-all duration-300 ${active ? 'text-primary' : 'text-muted-foreground'}`}
                    strokeWidth={active ? 2.5 : 1.8}
                  />
                </div>
                <span className={`text-[10px] transition-all duration-300 ${active ? 'text-primary font-bold' : 'text-muted-foreground font-medium'}`}>
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
