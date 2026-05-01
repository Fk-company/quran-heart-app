import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart, Radio, Users, Quote, Search, Star, BookOpen, BarChart3,
  X, Feather, Book, Grid3X3, List, ChevronLeft, TrendingUp, Baby, Sparkles, Mic,
  Brain, Smile, Lightbulb, Bot
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { MoreHorizontal } from 'lucide-react';

const moreCategories = [
  {
    title: 'القرآن والتلاوة',
    items: [
      { label: 'المصحف', icon: Book, path: '/quran', desc: 'قراءة القرآن الكريم', color: 'bg-primary/10 text-primary', gradient: 'gradient-primary' },
      { label: 'القراء', icon: Mic, path: '/reciters', desc: 'استمع لأشهر القراء', color: 'bg-accent/10 text-accent', gradient: 'gradient-gold' },
      { label: 'الراديو', icon: Radio, path: '/radio', desc: 'بث مباشر للقرآن', color: 'bg-primary/10 text-primary', gradient: 'gradient-primary' },
      { label: 'التفسير', icon: BookOpen, path: '/tafsir', desc: 'تفاسير متعددة', color: 'bg-accent/10 text-accent', gradient: 'gradient-gold' },
      { label: 'المساعد القرآني', icon: Bot, path: '/ai-tafsir', desc: 'اسأل عن معنى أو تفسير', color: 'bg-primary/10 text-primary', gradient: 'gradient-primary' },
    ]
  },
  {
    title: 'القلب والروح',
    items: [
      { label: 'كيف يشعر قلبك؟', icon: Smile, path: '/emotion-quran', desc: 'آيات حسب حالتك النفسية', color: 'bg-pink-500/10 text-pink-500', gradient: 'gradient-gold' },
      { label: 'قلب القرآن', icon: Heart, path: '/heart-quran', desc: 'سورة يس وآيات القلب', color: 'bg-red-500/10 text-red-500', gradient: 'gradient-primary' },
      { label: 'تأملات يومية', icon: Lightbulb, path: '/daily-reflection', desc: 'آية وتدبر وعمل', color: 'bg-amber-500/10 text-amber-500', gradient: 'gradient-gold' },
      { label: 'آيات السكينة', icon: Star, path: '/sakinah', desc: 'آيات الراحة والطمأنينة', color: 'bg-primary/10 text-primary', gradient: 'gradient-primary' },
    ]
  },
  {
    title: 'الأذكار والأدعية',
    items: [
      { label: 'الأذكار والتسبيح', icon: Heart, path: '/adhkar', desc: 'أذكار الصباح والمساء', color: 'bg-primary/10 text-primary', gradient: 'gradient-primary' },
      { label: 'الأدعية', icon: Feather, path: '/dua', desc: 'أدعية لكل مناسبة', color: 'bg-accent/10 text-accent', gradient: 'gradient-gold' },
    ]
  },
  {
    title: 'العلم والمعرفة',
    items: [
      { label: 'الأحاديث', icon: Quote, path: '/hadith', desc: 'أحاديث نبوية مختارة', color: 'bg-primary/10 text-primary', gradient: 'gradient-primary' },
      { label: 'قصص الأنبياء', icon: Users, path: '/prophets', desc: 'قصص الأنبياء والمرسلين', color: 'bg-accent/10 text-accent', gradient: 'gradient-gold' },
      { label: 'أسماء الله الحسنى', icon: Sparkles, path: '/asma-al-husna', desc: '99 اسماً لله تعالى', color: 'bg-primary/10 text-primary', gradient: 'gradient-primary' },
      { label: 'قصص الأطفال', icon: Baby, path: '/kids-stories', desc: 'قصص إسلامية للأطفال', color: 'bg-accent/10 text-accent', gradient: 'gradient-gold' },
      { label: 'اختبار الحفظ', icon: Brain, path: '/memorization-test', desc: 'اختبر حفظك للقرآن', color: 'bg-purple-500/10 text-purple-500', gradient: 'gradient-primary' },
    ]
  },
  {
    title: 'الإحصائيات والمفضلة',
    items: [
      { label: 'المفضلة', icon: Heart, path: '/favorites', desc: 'الآيات والأدعية المحفوظة', color: 'bg-destructive/10 text-destructive', gradient: 'gradient-primary' },
      { label: 'تقدم القراءة', icon: TrendingUp, path: '/reading-stats', desc: 'تتبع ختمتك اليومية', color: 'bg-primary/10 text-primary', gradient: 'gradient-gold' },
      { label: 'إحصائيات القرآن', icon: BarChart3, path: '/quran-stats', desc: 'أرقام وحقائق عن القرآن', color: 'bg-accent/10 text-accent', gradient: 'gradient-primary' },
      { label: 'البحث', icon: Search, path: '/search', desc: 'البحث في القرآن الكريم', color: 'bg-primary/10 text-primary', gradient: 'gradient-gold' },
    ]
  }
];

const allItems = moreCategories.flatMap(c => c.items);

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
        <div className="px-5 pb-6 pt-2 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-foreground">المزيد</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          {moreCategories.map((category) => (
            <div key={category.title} className="mb-5">
              <h3 className="section-title text-xs">{category.title}</h3>
              <div className="grid grid-cols-4 gap-2">
                {category.items.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => { navigate(item.path); onClose(); }}
                    className="flex flex-col items-center py-3 px-1 gap-1.5 text-center rounded-2xl transition-all duration-200 hover:bg-secondary active:scale-95"
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${item.color}`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-foreground text-[10px] leading-tight">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

const MorePage: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(() =>
    (localStorage.getItem('view-mode-more') as 'list' | 'grid') || 'grid'
  );

  return (
    <div className="page-container page-with-topbar" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <PageHeader
          icon={MoreHorizontal}
          title="جميع الأقسام"
          subtitle={`${allItems.length} خدمة وميزة`}
          actions={
            <div className="flex gap-1 p-1 bg-secondary rounded-2xl">
              <button onClick={() => { setViewMode('list'); localStorage.setItem('view-mode-more', 'list'); }} className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`} aria-label="قائمة"><List className="w-4 h-4" /></button>
              <button onClick={() => { setViewMode('grid'); localStorage.setItem('view-mode-more', 'grid'); }} className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`} aria-label="شبكة"><Grid3X3 className="w-4 h-4" /></button>
            </div>
          }
        />

        {/* Stats overview */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <div className="stat-card text-right">
            <div className="stat-card-icon bg-primary/10"><MoreHorizontal className="w-4 h-4 text-primary" /></div>
            <div className="stat-card-value">{moreCategories.length}</div>
            <div className="stat-card-label">قسم</div>
          </div>
          <div className="stat-card text-right">
            <div className="stat-card-icon bg-gold-light"><Sparkles className="w-4 h-4 text-gold-deep" /></div>
            <div className="stat-card-value">{allItems.length}</div>
            <div className="stat-card-label">خدمة</div>
          </div>
          <button onClick={() => navigate('/settings')} className="stat-card text-right">
            <div className="stat-card-icon bg-emerald-light"><Star className="w-4 h-4 text-primary" /></div>
            <div className="stat-card-value text-base mt-1">⚙</div>
            <div className="stat-card-label">الإعدادات</div>
          </button>
        </div>

        {moreCategories.map((category) => (
          <div key={category.title} className="mb-6">
            <h2 className="section-title">{category.title}</h2>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-3 gap-2.5">
                {category.items.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="card-surface-hover flex flex-col items-center py-4 px-2 gap-2 text-center"
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.gradient} shadow-emerald`}>
                      <item.icon className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <span className="font-bold text-foreground text-xs leading-tight font-kufi">{item.label}</span>
                    <span className="text-[10px] text-muted-foreground leading-tight line-clamp-2">{item.desc}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {category.items.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="card-surface-hover w-full flex items-center gap-3"
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${item.gradient} shadow-emerald`}>
                      <item.icon className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1 text-right min-w-0">
                      <div className="font-bold text-foreground text-sm font-kufi">{item.label}</div>
                      <div className="text-[11px] text-muted-foreground">{item.desc}</div>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MorePage;
