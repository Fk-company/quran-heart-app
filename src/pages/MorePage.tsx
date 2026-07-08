import React, { useEffect, useMemo, useRef, useState } from 'react';
import SEO from '@/components/SEO';
import { useNavigate } from 'react-router-dom';
import {
  Heart, Radio, Users, Quote, Search, Star, BookOpen, BarChart3,
  X, Feather, Book, Grid3X3, List, ChevronLeft, TrendingUp, Baby, Sparkles, Mic,
  Brain, Smile, Lightbulb, Bot, Settings, CalendarDays, Target, Send, Globe,
  Trophy, Mic2, Map as MapIcon, Layers, Waves, Sunrise, FileText, Compass, Coins, Moon, BookHeart, MapPin, Bell, Car, SearchX,
  Clock, Pin, PinOff, Zap, History
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import { MoreHorizontal } from 'lucide-react';
import { useMoreUsage } from '@/hooks/useMoreUsage';


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
      { label: 'وردي اليومي', icon: Sparkles, path: '/daily-wird', desc: 'تتبع وردك اليومي بسلاسة', color: 'bg-primary/10 text-primary', gradient: 'gradient-primary' },
      { label: 'كيف يشعر قلبك؟', icon: Smile, path: '/emotion-quran', desc: 'آيات حسب حالتك النفسية', color: 'bg-pink-500/10 text-pink-500', gradient: 'gradient-gold' },
      { label: 'قلب القرآن', icon: Heart, path: '/heart-quran', desc: 'سورة يس وآيات القلب', color: 'bg-red-500/10 text-red-500', gradient: 'gradient-primary' },
      { label: 'تأملات يومية', icon: Lightbulb, path: '/daily-reflection', desc: 'آية وتدبر وعمل', color: 'bg-amber-500/10 text-amber-500', gradient: 'gradient-gold' },
      { label: 'آيات السكينة', icon: Star, path: '/sakinah', desc: 'آيات الراحة والطمأنينة', color: 'bg-primary/10 text-primary', gradient: 'gradient-primary' },
      { label: 'الورد الذكي', icon: Target, path: '/smart-wird', desc: 'اقتراح يومي حسب وقتك', color: 'bg-accent/10 text-accent', gradient: 'gradient-gold' },
      { label: 'جلسة تدبر', icon: Lightbulb, path: '/guided-tadabbur', desc: 'تدبر موجه 5-10 دقائق', color: 'bg-amber-500/10 text-amber-500', gradient: 'gradient-primary' },
      { label: 'خلفية قلبية', icon: Waves, path: '/heart-ambient', desc: 'أصوات وتلاوة للتركيز', color: 'bg-sky-500/10 text-sky-500', gradient: 'gradient-gold' },
      { label: 'رسالة الصباح', icon: Sunrise, path: '/daily-iman', desc: 'آية وتفسير كل يوم', color: 'bg-amber-500/10 text-amber-500', gradient: 'gradient-primary' },
      { label: 'خاطرة اليوم', icon: Sparkles, path: '/daily-khatirah', desc: 'مختارات يومية متجددة', color: 'bg-primary/10 text-primary', gradient: 'gradient-gold' },
    ]
  },
  {
    title: 'الأذكار والأدعية',
    items: [
      { label: 'الأذكار والتسبيح', icon: Heart, path: '/adhkar', desc: 'أذكار الصباح والمساء', color: 'bg-primary/10 text-primary', gradient: 'gradient-primary' },
      { label: 'إحصاء التسبيح', icon: BarChart3, path: '/tasbih-stats', desc: 'تتبع ذكرك بالأرقام', color: 'bg-accent/10 text-accent', gradient: 'gradient-gold' },
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
      { label: 'المتشابهات', icon: Layers, path: '/mutashabihat', desc: 'تمييز الآيات المتشابهة', color: 'bg-accent/10 text-accent', gradient: 'gradient-gold' },
      { label: 'التحدي الأسبوعي', icon: Trophy, path: '/weekly-challenge', desc: 'تحديات وشارات إنجاز', color: 'bg-amber-500/10 text-amber-500', gradient: 'gradient-primary' },
      { label: 'اختبار إسلامي', icon: Brain, path: '/islamic-quiz', desc: 'اختبر معلوماتك الدينية', color: 'bg-purple-500/10 text-purple-500', gradient: 'gradient-gold' },
    ]
  },
  {
    title: 'أدوات إسلامية',
    items: [
      { label: 'اتجاه القبلة', icon: Compass, path: '/qibla', desc: 'بوصلة دقيقة نحو الكعبة', color: 'bg-accent/10 text-accent', gradient: 'gradient-gold' },
      { label: 'حاسبة الزكاة', icon: Coins, path: '/zakat', desc: 'احسب زكاة مالك بسهولة', color: 'bg-amber-500/10 text-amber-500', gradient: 'gradient-primary' },
      { label: 'متتبع الصيام', icon: Moon, path: '/fasting-tracker', desc: 'سجّل صيام النوافل', color: 'bg-primary/10 text-primary', gradient: 'gradient-gold' },
      { label: 'المساجد القريبة', icon: MapPin, path: '/nearby-mosques', desc: 'ابحث عن أقرب المساجد', color: 'bg-primary/10 text-primary', gradient: 'gradient-primary' },
      { label: 'يوميات إيمانية', icon: BookHeart, path: '/faith-journal', desc: 'دوّن لحظاتك الروحية', color: 'bg-accent/10 text-accent', gradient: 'gradient-gold' },
    ]
  },
  {
    title: 'الإحصائيات والمفضلة',
    items: [
      { label: 'لوحتي الشخصية', icon: TrendingUp, path: '/dashboard', desc: 'ملخص رحلتك مع اقتراحات ذكية', color: 'bg-primary/10 text-primary', gradient: 'gradient-primary' },
      { label: 'المفضلة', icon: Heart, path: '/favorites', desc: 'الآيات والأدعية المحفوظة', color: 'bg-destructive/10 text-destructive', gradient: 'gradient-primary' },
      { label: 'تقدم القراءة', icon: TrendingUp, path: '/reading-stats', desc: 'تتبع ختمتك اليومية', color: 'bg-primary/10 text-primary', gradient: 'gradient-gold' },
      { label: 'إحصائيات القرآن', icon: BarChart3, path: '/quran-stats', desc: 'أرقام وحقائق عن القرآن', color: 'bg-accent/10 text-accent', gradient: 'gradient-primary' },
      { label: 'خطة الختمة', icon: Target, path: '/khatm-plan', desc: 'خطّط لختمتك خلال 30/60/90 يوماً', color: 'bg-primary/10 text-primary', gradient: 'gradient-gold' },
      { label: 'التقويم الهجري', icon: CalendarDays, path: '/hijri-calendar', desc: 'الأشهر والمناسبات الإسلامية', color: 'bg-accent/10 text-accent', gradient: 'gradient-primary' },
      { label: 'البحث', icon: Search, path: '/search', desc: 'البحث في القرآن الكريم', color: 'bg-primary/10 text-primary', gradient: 'gradient-gold' },
    ]
  },
  {
    title: 'العلوم القرآنية',
    items: [
      { label: 'التجويد والتلاوة', icon: Mic2, path: '/tajweed', desc: 'أحكام التلاوة مع أمثلة', color: 'bg-primary/10 text-primary', gradient: 'gradient-primary' },
      { label: 'وضع المسجد/السيارة', icon: Car, path: '/focus-mode', desc: 'شاشة عرض كبيرة للمواقيت والقبلة', color: 'bg-accent/10 text-accent', gradient: 'gradient-gold' },
    ]
  },
  {
    title: 'عن التطبيق',
    items: [
      { label: 'إعدادات الإشعارات', icon: Bell, path: '/notification-settings', desc: 'الأذان والتذكيرات وأوقاتها', color: 'bg-primary/10 text-primary', gradient: 'gradient-primary' },
      { label: 'سياسة الخصوصية', icon: FileText, path: '/privacy', desc: 'كيف نتعامل مع بياناتك', color: 'bg-accent/10 text-accent', gradient: 'gradient-gold' },
      { label: 'سياسة الاستخدام', icon: FileText, path: '/terms', desc: 'الشروط والأحكام', color: 'bg-accent/10 text-accent', gradient: 'gradient-gold' },
      { label: 'تواصل مع المطور', icon: Globe, path: '/developer-social', desc: 'فخري عادل - تليجرام وانستغرام', color: 'bg-primary/10 text-primary', gradient: 'gradient-primary' },
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
      <SEO title="جميع الأقسام والميزات — قلب القرآن" description="استكشف كل ميزات التطبيق: القرآن، الأذكار، الأدعية، القبلة، الزكاة، القصص، والاختبارات." />
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
    </>
  );
};

const allItemsIndex: Record<string, typeof moreCategories[number]['items'][number] & { category: string }> = {};
moreCategories.forEach((c) => c.items.forEach((i) => { allItemsIndex[i.path] = { ...i, category: c.title }; }));

// Time-aware suggestions
function getTimeBucket(): { key: 'fajr' | 'duha' | 'asr' | 'night'; label: string; icon: React.ElementType; paths: string[] } {
  const h = new Date().getHours();
  if (h >= 4 && h < 10) {
    return { key: 'fajr', label: 'صباحك مبارك — للفجر والضحى', icon: Sunrise, paths: ['/adhkar', '/daily-iman', '/daily-wird', '/heart-quran'] };
  }
  if (h >= 10 && h < 15) {
    return { key: 'duha', label: 'وقت التدبر والقراءة', icon: BookOpen, paths: ['/quran', '/guided-tadabbur', '/tafsir', '/daily-reflection'] };
  }
  if (h >= 15 && h < 19) {
    return { key: 'asr', label: 'أذكار المساء والسكينة', icon: Star, paths: ['/adhkar', '/sakinah', '/dua', '/emotion-quran'] };
  }
  return { key: 'night', label: 'ليلة طيبة — تسبيح وسورة الملك', icon: Moon, paths: ['/tasbih-stats', '/heart-quran', '/heart-ambient', '/daily-khatirah'] };
}

const MorePage: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(() =>
    (localStorage.getItem('view-mode-more') as 'list' | 'grid') || 'grid'
  );
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { recents, pins, trackVisit, togglePin, isPinned, clearRecents } = useMoreUsage();
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const go = (path: string) => { trackVisit(path); navigate(path); };

  const suggestion = useMemo(() => getTimeBucket(), []);
  const suggestedItems = suggestion.paths.map((p) => allItemsIndex[p]).filter(Boolean);
  const recentItems = recents.map((p) => allItemsIndex[p]).filter(Boolean).slice(0, 6);
  const pinnedItems = pins.map((p) => allItemsIndex[p]).filter(Boolean);

  const filteredCategories = useMemo(() => {
    const q = query.trim();
    let cats = moreCategories;
    if (activeCategory) cats = cats.filter((c) => c.title === activeCategory);
    if (!q) return cats;
    return cats
      .map((c) => ({
        ...c,
        items: c.items.filter((i) => i.label.includes(q) || i.desc?.includes(q)),
      }))
      .filter((c) => c.items.length > 0);
  }, [query, activeCategory]);

  const totalMatches = filteredCategories.reduce((n, c) => n + c.items.length, 0);

  const scrollToCategory = (title: string) => {
    setActiveCategory(null);
    setQuery('');
    // wait next tick for filters to reset if any
    requestAnimationFrame(() => {
      const el = sectionRefs.current[title];
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <div className="page-container page-with-topbar" dir="rtl">
      <SEO title="جميع الأقسام والميزات — قلب القرآن" description="مركز تحكم ذكي: اقتراحات حسب وقت اليوم، المثبتات، آخر استخدام، وكل ميزات التطبيق." />
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <PageHeader
          icon={MoreHorizontal}
          title="مركز التحكم"
          subtitle={`${allItems.length} خدمة • ${moreCategories.length} قسم`}
          badge={<span className="badge-tone badge-tone-gold">ذكي</span>}
          actions={
            <div className="flex gap-1 p-1 bg-secondary rounded-2xl">
              <button onClick={() => { setViewMode('list'); localStorage.setItem('view-mode-more', 'list'); }} className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`} aria-label="قائمة"><List className="w-4 h-4" /></button>
              <button onClick={() => { setViewMode('grid'); localStorage.setItem('view-mode-more', 'grid'); }} className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`} aria-label="شبكة"><Grid3X3 className="w-4 h-4" /></button>
            </div>
          }
        />

        {/* Smart suggestion hero — time-aware */}
        {!query && !activeCategory && (
          <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-accent/10 to-transparent p-4 mb-4">
            <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="icon-tile icon-tile-emerald !w-9 !h-9 !rounded-xl">
                  <suggestion.icon className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold text-primary uppercase tracking-widest">اقتراحات ذكية</div>
                  <div className="text-sm font-extrabold text-foreground font-kufi truncate">{suggestion.label}</div>
                </div>
                <Zap className="w-4 h-4 text-accent" />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {suggestedItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => go(item.path)}
                    className="group flex flex-col items-center gap-1.5 py-2 rounded-2xl bg-background/60 hover:bg-background border border-border/40 press"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.gradient} shadow-emerald`}>
                      <item.icon className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <span className="text-[10px] font-bold text-foreground text-center leading-tight px-1 line-clamp-2">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search bar */}
        <div className="relative mb-3">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث في جميع الميزات..."
            className="search-input"
            aria-label="بحث في الأقسام"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center hover:bg-muted" aria-label="مسح">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Category chips — quick jump */}
        {!query && (
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-2 mb-3 -mx-1 px-1">
            <button
              onClick={() => setActiveCategory(null)}
              className={`shrink-0 text-[11px] font-bold px-3 py-1.5 rounded-full border transition ${activeCategory === null ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary/50 text-foreground border-border/40'}`}
            >
              الكل
            </button>
            {moreCategories.map((c) => (
              <button
                key={c.title}
                onClick={() => {
                  if (activeCategory === c.title) { setActiveCategory(null); return; }
                  setActiveCategory(c.title);
                  requestAnimationFrame(() => sectionRefs.current[c.title]?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
                }}
                className={`shrink-0 text-[11px] font-bold px-3 py-1.5 rounded-full border transition ${activeCategory === c.title ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary/50 text-foreground border-border/40'}`}
              >
                {c.title} <span className="opacity-60">· {c.items.length}</span>
              </button>
            ))}
          </div>
        )}

        {/* Pinned */}
        {!query && !activeCategory && pinnedItems.length > 0 && (
          <div className="mb-5">
            <div className="section-header-pro">
              <h2 className="st-title flex items-center gap-1.5"><Pin className="w-3.5 h-3.5 text-accent" /> المثبّتة</h2>
              <span className="badge-tone badge-tone-muted">{pinnedItems.length}</span>
            </div>
            <div className="grid grid-cols-4 gap-2 stagger-children">
              {pinnedItems.map((item) => (
                <div key={item.path} className="relative">
                  <button onClick={() => go(item.path)} className="w-full flex flex-col items-center py-3 px-1 gap-1.5 rounded-2xl border border-border/40 bg-card hover:bg-secondary/60 press">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.gradient} shadow-emerald`}>
                      <item.icon className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <span className="text-[10px] font-bold text-foreground text-center leading-tight line-clamp-2">{item.label}</span>
                  </button>
                  <button
                    onClick={() => togglePin(item.path)}
                    className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-background border border-border/60 flex items-center justify-center active:scale-90"
                    aria-label="إزالة التثبيت"
                  >
                    <PinOff className="w-3 h-3 text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recents */}
        {!query && !activeCategory && recentItems.length > 0 && (
          <div className="mb-5">
            <div className="section-header-pro">
              <h2 className="st-title flex items-center gap-1.5"><History className="w-3.5 h-3.5 text-primary" /> آخر استخدام</h2>
              <button onClick={clearRecents} className="text-[11px] font-bold text-muted-foreground hover:text-destructive">مسح</button>
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
              {recentItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => go(item.path)}
                  className="shrink-0 w-24 flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-2xl border border-border/40 bg-card press"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.gradient} shadow-emerald`}>
                    <item.icon className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="text-[10px] font-bold text-foreground text-center leading-tight line-clamp-2 px-1">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {query && (
          <div className="text-xs text-muted-foreground mb-3">
            {totalMatches > 0 ? `${totalMatches} نتيجة` : 'لا نتائج مطابقة'}
          </div>
        )}

        {totalMatches === 0 && query ? (
          <EmptyState
            icon={SearchX}
            title="لا توجد نتائج"
            description={`لم نجد ميزات تطابق "${query}"، جرّب كلمة أخرى.`}
            action={
              <button onClick={() => setQuery('')} className="chip">
                <X className="w-3 h-3" /> مسح البحث
              </button>
            }
          />
        ) : (
          filteredCategories.map((category) => (
            <div
              key={category.title}
              ref={(el) => { sectionRefs.current[category.title] = el; }}
              className="mb-6 scroll-mt-24"
            >
              <div className="section-header-pro">
                <h2 className="st-title">{category.title}</h2>
                <span className="badge-tone badge-tone-muted">{category.items.length}</span>
              </div>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-3 gap-2.5 stagger-children">
                  {category.items.map((item) => {
                    const pinned = isPinned(item.path);
                    return (
                      <div key={item.path} className="relative">
                        <button
                          onClick={() => go(item.path)}
                          className="action-tile !items-center !text-center press w-full"
                        >
                          <div className={`icon-tile icon-tile-lg mx-auto ${item.gradient} !border-transparent shadow-emerald`}>
                            <item.icon className="w-5 h-5 text-primary-foreground" />
                          </div>
                          <span className="font-bold text-foreground text-xs leading-tight font-kufi w-full">{item.label}</span>
                          <span className="text-[10px] text-muted-foreground leading-tight line-clamp-2 w-full">{item.desc}</span>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); togglePin(item.path); }}
                          className={`absolute top-1.5 left-1.5 w-6 h-6 rounded-full flex items-center justify-center active:scale-90 transition ${pinned ? 'bg-accent/20 text-accent' : 'bg-secondary/70 text-muted-foreground opacity-0 group-hover:opacity-100 hover:opacity-100'}`}
                          style={{ opacity: pinned ? 1 : undefined }}
                          aria-label={pinned ? 'إزالة التثبيت' : 'تثبيت'}
                          title={pinned ? 'إزالة التثبيت' : 'تثبيت'}
                        >
                          {pinned ? <Pin className="w-3 h-3 fill-current" /> : <Pin className="w-3 h-3" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2 stagger-children">
                  {category.items.map((item) => {
                    const pinned = isPinned(item.path);
                    return (
                      <button
                        key={item.path}
                        onClick={() => go(item.path)}
                        className="list-row press"
                      >
                        <div className={`icon-tile flex-shrink-0 ${item.gradient} !border-transparent shadow-emerald`}>
                          <item.icon className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div className="flex-1 text-right min-w-0">
                          <div className="list-row-title font-kufi">{item.label}</div>
                          <div className="list-row-sub">{item.desc}</div>
                        </div>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => { e.stopPropagation(); togglePin(item.path); }}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); togglePin(item.path); } }}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${pinned ? 'bg-accent/15 text-accent' : 'bg-secondary/60 text-muted-foreground'}`}
                          aria-label={pinned ? 'إزالة التثبيت' : 'تثبيت'}
                        >
                          {pinned ? <Pin className="w-4 h-4 fill-current" /> : <Pin className="w-4 h-4" />}
                        </span>
                        <ChevronLeft className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MorePage;

