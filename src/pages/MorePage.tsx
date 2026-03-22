import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Radio, Users, Quote, Search, Star, BookOpen, BarChart3, X, Feather, Book } from 'lucide-react';

const moreItems = [
  { label: 'الاذكار والتسبيح', icon: Heart, path: '/adhkar', desc: 'اذكار الصباح والمساء', color: 'bg-accent/10 text-accent' },
  { label: 'الراديو', icon: Radio, path: '/radio', desc: 'بث مباشر للقرآن', color: 'bg-primary/10 text-primary' },
  { label: 'قصص الأنبياء', icon: Users, path: '/prophets', desc: 'قصص الأنبياء والمرسلين', color: 'bg-accent/10 text-accent' },
  { label: 'الأحاديث', icon: Quote, path: '/hadith', desc: 'أحاديث نبوية مختارة', color: 'bg-primary/10 text-primary' },
  { label: 'التفسير', icon: BookOpen, path: '/tafsir', desc: 'تفاسير متعددة', color: 'bg-accent/10 text-accent' },
  { label: 'الأدعية', icon: Feather, path: '/dua', desc: 'أدعية لكل مناسبة', color: 'bg-primary/10 text-primary' },
  { label: 'أسماء الله', icon: Star, path: '/asma-al-husna', desc: '99 اسماً لله تعالى', color: 'bg-accent/10 text-accent' },
  { label: 'آيات السكينة', icon: Heart, path: '/sakinah', desc: 'آيات الراحة والطمأنينة', color: 'bg-primary/10 text-primary' },
  { label: 'إحصائيات', icon: BarChart3, path: '/quran-stats', desc: 'أرقام عن القرآن', color: 'bg-accent/10 text-accent' },
  { label: 'قصص الأطفال', icon: Book, path: '/kids-stories', desc: 'قصص إسلامية للأطفال', color: 'bg-primary/10 text-primary' },
  { label: 'البحث', icon: Search, path: '/search', desc: 'البحث في القرآن', color: 'bg-accent/10 text-accent' },
];

interface MoreSheetProps {
  open: boolean;
  onClose: () => void;
}

export const MoreSheet: React.FC<MoreSheetProps> = ({ open, onClose }) => {
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />
      <div className="sheet-content" dir="rtl">
        <div className="sheet-handle" />
        <div className="px-5 pb-6 pt-2 max-h-[75vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">المزيد</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {moreItems.map((item) => (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); onClose(); }}
                className="card-surface-hover flex flex-col items-center py-3 px-1 gap-1.5 text-center"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}>
                  <item.icon className="w-4.5 h-4.5" />
                </div>
                <span className="font-semibold text-foreground text-[11px] leading-tight">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

const MorePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="page-container" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-foreground mb-4">المزيد</h1>
        <div className="grid grid-cols-3 gap-2.5">
          {moreItems.map((item) => (
            <button key={item.path} onClick={() => navigate(item.path)}
              className="card-surface-hover flex flex-col items-center py-4 px-2 gap-2 text-center">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${item.color}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className="font-semibold text-foreground text-xs leading-tight">{item.label}</span>
              <span className="text-[10px] text-muted-foreground leading-tight line-clamp-2">{item.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MorePage;
