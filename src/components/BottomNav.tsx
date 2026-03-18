import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Book, Mic, Home, MoreHorizontal, Search } from 'lucide-react';

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
}

const navItems: NavItem[] = [
  { label: 'الرئيسية', icon: Home, path: '/' },
  { label: 'المصحف', icon: Book, path: '/quran' },
  { label: 'القراء', icon: Mic, path: '/reciters' },
  { label: 'بحث', icon: Search, path: '/search' },
  { label: 'المزيد', icon: MoreHorizontal, path: '/more' },
];

const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-bottom">
      <div className="flex items-stretch justify-around max-w-lg mx-auto h-16">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`bottom-nav-item flex-1 pt-2 pb-1 ${isActive(item.path) ? 'active' : ''}`}
          >
            <item.icon
              className={`w-5 h-5 transition-colors ${isActive(item.path) ? 'text-primary' : 'text-muted-foreground'}`}
              strokeWidth={isActive(item.path) ? 2.5 : 1.8}
            />
            <span className={`text-[10px] ${isActive(item.path) ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
