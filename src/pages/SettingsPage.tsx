import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Settings, Type, Palette, Mic, RotateCcw, Repeat, Volume2,
  Moon, Sun, Check, Info, Save, BookOpen, Sparkles, ChevronsDown, ChevronsUp, Search, X, LayoutGrid
} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useSettings } from '@/hooks/useSettings';
import { useTheme } from '@/contexts/ThemeContext';
import PageHeader from '@/components/PageHeader';
import { NAV_CATALOG, DEFAULT_NAV_IDS, getNavIds, setNavIds } from '@/components/BottomNav';

const RECITERS = [
  { id: 'alafasy', name: 'مشاري العفاسي' },
  { id: 'husary', name: 'محمود خليل الحصري' },
  { id: 'minshawi', name: 'محمد صديق المنشاوي' },
  { id: 'abdulbasit', name: 'عبد الباسط عبد الصمد' },
  { id: 'sudais', name: 'عبد الرحمن السديس' },
];

const COLOR_SCHEMES = [
  { id: 'default' as const, name: 'الافتراضي', colors: ['hsl(162,72%,18%)', 'hsl(32,88%,37%)'] },
  { id: 'warm' as const, name: 'دافئ', colors: ['hsl(25,80%,45%)', 'hsl(45,90%,50%)'] },
  { id: 'cool' as const, name: 'بارد', colors: ['hsl(210,70%,40%)', 'hsl(190,80%,45%)'] },
  { id: 'highContrast' as const, name: 'تباين عالي', colors: ['hsl(0,0%,10%)', 'hsl(0,0%,90%)'] },
];

const ALL_SECTIONS = ['appearance', 'fonts', 'reciter', 'memorization', 'colors', 'navigation', 'about'];

const Hint: React.FC<{ text: string }> = ({ text }) => (
  <span className="inline-flex items-center" title={text} aria-label={text}>
    <Info className="w-3.5 h-3.5 text-muted-foreground/70 hover:text-primary transition-colors cursor-help" />
  </span>
);

const SettingsPage: React.FC = () => {
  const { settings, updateSetting, resetSettings } = useSettings();
  const { theme, toggleTheme } = useTheme();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [navIds, setNavIdsState] = useState<string[]>(getNavIds);
  const [openSections, setOpenSections] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('settings_open_sections');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.filter((v) => ALL_SECTIONS.includes(v));
      }
    } catch {}
    return ['appearance'];
  });

  useEffect(() => {
    try { localStorage.setItem('settings_open_sections', JSON.stringify(openSections)); } catch {}
  }, [openSections]);

  // Visual confirmation that settings auto-save
  useEffect(() => {
    setSavedFlash(true);
    const t = setTimeout(() => setSavedFlash(false), 1200);
    return () => clearTimeout(t);
  }, [settings]);

  // Search keywords map per section
  const sectionKeywords: Record<string, string> = {
    appearance: 'المظهر الوضع الليلي ضوء داكن فاتح ثيم',
    fonts: 'الخطوط حجم الخط القراءة المصحف نص آيات',
    reciter: 'القارئ التلاوة صوت العفاسي الحصري المنشاوي',
    memorization: 'الحفظ التكرار اختبار حفظ',
    colors: 'الألوان نمط ألوان لوحة',
    navigation: 'التنقل الشريط السفلي تخصيص أيقونات روابط سريعة',
    about: 'عن التطبيق إصدار حول معلومات',
  };

  const matchedSections = React.useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return ALL_SECTIONS;
    return ALL_SECTIONS.filter((id) => sectionKeywords[id]?.includes(q) || id.includes(q.toLowerCase()));
  }, [searchQuery]);

  // When searching, auto-open matched sections
  useEffect(() => {
    if (searchQuery.trim() && matchedSections.length) setOpenSections(matchedSections);
  }, [searchQuery, matchedSections]);

  return (
    <div className="page-container page-with-topbar" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <PageHeader
          icon={Settings}
          title="الإعدادات"
          subtitle="تخصيص التطبيق"
          showBack
        />

        {/* Auto-save indicator */}
        <div className="mb-4 flex items-center justify-between text-[11px] text-muted-foreground bg-secondary/40 border border-border/60 rounded-xl px-3 py-2">
          <span className="flex items-center gap-1.5">
            <Save className={`w-3.5 h-3.5 transition-colors ${savedFlash ? 'text-primary' : 'text-muted-foreground/70'}`} />
            <span>الحفظ التلقائي مفعّل — تُستعاد إعداداتك تلقائياً عند فتح التطبيق.</span>
          </span>
          {savedFlash && <span className="text-primary font-medium">تم الحفظ</span>}
        </div>

        {/* Search settings */}
        <div className="relative mb-3">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في الإعدادات (مثال: خط، مظهر، قارئ)..."
            className="w-full bg-secondary/60 border border-border/60 rounded-xl pr-10 pl-9 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full hover:bg-muted flex items-center justify-center"
              aria-label="مسح البحث"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Expand / Collapse all */}
        <div className="mb-3 flex items-center gap-2">
          <button
            onClick={() => setOpenSections(ALL_SECTIONS)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-secondary/60 hover:bg-secondary text-foreground text-xs font-medium transition-colors border border-border/60"
          >
            <ChevronsDown className="w-3.5 h-3.5 text-primary" />
            فتح جميع الأقسام
          </button>
          <button
            onClick={() => setOpenSections([])}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-secondary/60 hover:bg-secondary text-foreground text-xs font-medium transition-colors border border-border/60"
          >
            <ChevronsUp className="w-3.5 h-3.5 text-accent" />
            طي جميع الأقسام
          </button>
        </div>

        {searchQuery && matchedSections.length === 0 && (
          <div className="card-surface text-center text-sm text-muted-foreground py-6 mb-3">
            لا توجد نتائج تطابق "{searchQuery}"
          </div>
        )}

        <Accordion type="multiple" value={openSections} onValueChange={setOpenSections} className="space-y-3">
          {/* Appearance */}
          <AccordionItem value="appearance" className={`card-surface !border-0 !p-0 overflow-hidden ${matchedSections.includes("appearance") ? "" : "hidden"}`}>
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-accent" />
                <span className="text-sm font-semibold text-foreground">المظهر</span>
                <Hint text="تبديل بين الوضع الفاتح والداكن لراحة العين" />
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Moon className="w-5 h-5 text-accent" /> : <Sun className="w-5 h-5 text-accent" />}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">الوضع الليلي</p>
                  <p className="text-[11px] text-muted-foreground">يُريح العين أثناء القراءة الليلية</p>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`w-12 h-7 rounded-full transition-colors relative ${theme === 'dark' ? 'bg-primary' : 'bg-muted'}`}
                  aria-label="تبديل الوضع الليلي"
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-1 transition-all ${theme === 'dark' ? 'left-1' : 'left-6'}`} />
                </button>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Font Size */}
          <AccordionItem value="fonts" className={`card-surface !border-0 !p-0 overflow-hidden ${matchedSections.includes("fonts") ? "" : "hidden"}`}>
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">حجم الخطوط</span>
                <Hint text="تكبير أو تصغير الخط في الواجهة وفي صفحات المصحف" />
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Type className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">خط القراءة العام</span>
                    <Hint text="يطبَّق على نصوص الأدعية والأحاديث والتفسير" />
                  </div>
                  <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{settings.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min={14}
                  max={28}
                  value={settings.fontSize}
                  onChange={e => updateSetting('fontSize', Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <p className="font-amiri text-foreground mt-2 leading-relaxed" style={{ fontSize: settings.fontSize }}>
                  بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ
                </p>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium text-foreground">خط المصحف</span>
                    <Hint text="حجم خط الآيات داخل صفحات المصحف فقط" />
                  </div>
                  <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{settings.mushafFontSize}px</span>
                </div>
                <input
                  type="range"
                  min={18}
                  max={36}
                  value={settings.mushafFontSize}
                  onChange={e => updateSetting('mushafFontSize', Number(e.target.value))}
                  className="w-full accent-accent"
                />
                <p className="font-amiri text-foreground mt-2 leading-[2.4] text-center" style={{ fontSize: settings.mushafFontSize }}>
                  الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Default Reciter */}
          <AccordionItem value="reciter" className={`card-surface !border-0 !p-0 overflow-hidden ${matchedSections.includes("reciter") ? "" : "hidden"}`}>
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">القارئ الافتراضي</span>
                <Hint text="الصوت الذي يُستخدم تلقائياً عند تشغيل أي تلاوة" />
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4">
              <div className="space-y-1.5">
                {RECITERS.map(reciter => (
                  <button
                    key={reciter.id}
                    onClick={() => updateSetting('defaultReciter', reciter.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-right ${
                      settings.defaultReciter === reciter.id
                        ? 'bg-primary/10 border border-primary/20'
                        : 'bg-secondary/50 hover:bg-secondary border border-transparent'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      settings.defaultReciter === reciter.id ? 'bg-primary' : 'bg-muted'
                    }`}>
                      {settings.defaultReciter === reciter.id
                        ? <Check className="w-4 h-4 text-primary-foreground" />
                        : <Mic className="w-3.5 h-3.5 text-muted-foreground" />}
                    </div>
                    <span className={`text-sm ${settings.defaultReciter === reciter.id ? 'text-primary font-semibold' : 'text-foreground'}`}>
                      {reciter.name}
                    </span>
                  </button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Memorization */}
          <AccordionItem value="memorization" className={`card-surface !border-0 !p-0 overflow-hidden ${matchedSections.includes("memorization") ? "" : "hidden"}`}>
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">إعدادات الحفظ</span>
                <Hint text="ضبط عدد التكرار التلقائي للآية لتسهيل الحفظ" />
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">عدد التكرارات الافتراضي</span>
                  <Hint text="كم مرة تتكرر الآية الواحدة قبل الانتقال" />
                </div>
                <span className="text-xs text-primary font-bold bg-primary/10 px-2.5 py-0.5 rounded-full">{settings.repeatCount}×</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {[1, 2, 3, 5, 7, 10, 15, 20].map(n => (
                  <button
                    key={n}
                    onClick={() => updateSetting('repeatCount', n)}
                    className={`flex-1 min-w-[36px] py-2 rounded-xl text-xs font-medium transition-colors ${
                      settings.repeatCount === n
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-muted'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                <Volume2 className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-foreground flex-1">تشغيل تلقائي للآية التالية</span>
                <Hint text="ينتقل تلقائياً إلى الآية التالية بعد انتهاء التكرار" />
                <button
                  onClick={() => updateSetting('autoPlayNext', !settings.autoPlayNext)}
                  className={`w-12 h-7 rounded-full transition-colors relative ${settings.autoPlayNext ? 'bg-primary' : 'bg-muted'}`}
                  aria-label="تشغيل تلقائي"
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-1 transition-all ${settings.autoPlayNext ? 'left-1' : 'left-6'}`} />
                </button>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Color Scheme */}
          <AccordionItem value="colors" className={`card-surface !border-0 !p-0 overflow-hidden ${matchedSections.includes("colors") ? "" : "hidden"}`}>
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">نمط الألوان</span>
                <Hint text="اختر لوحة الألوان المفضلة لكامل التطبيق" />
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4">
              <div className="grid grid-cols-2 gap-2">
                {COLOR_SCHEMES.map(scheme => (
                  <button
                    key={scheme.id}
                    onClick={() => updateSetting('colorScheme', scheme.id)}
                    className={`p-3 rounded-xl border transition-all text-center ${
                      settings.colorScheme === scheme.id
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border bg-secondary/30 hover:bg-secondary'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5 mb-2">
                      {scheme.colors.map((c, i) => (
                        <div key={i} className="w-6 h-6 rounded-full border border-border" style={{ background: c }} />
                      ))}
                    </div>
                    <span className={`text-xs font-medium ${settings.colorScheme === scheme.id ? 'text-primary' : 'text-foreground'}`}>
                      {scheme.name}
                    </span>
                  </button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Bottom Navigation Customization */}
          <AccordionItem value="navigation" className={`card-surface !border-0 !p-0 overflow-hidden ${matchedSections.includes("navigation") ? "" : "hidden"}`}>
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">تخصيص الشريط السفلي</span>
                <Hint text="اختر 4 أيقونات لتظهر في شريط التنقل السفلي" />
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <p className="text-xs text-muted-foreground mb-3">اختر 4 اختصارات لتظهر بجانب زر "المزيد".</p>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {NAV_CATALOG.map((item) => {
                  const selected = navIds.includes(item.id);
                  const Icon = item.icon;
                  const disabled = !selected && navIds.length >= 4;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        let next: string[];
                        if (selected) next = navIds.filter((id) => id !== item.id);
                        else if (navIds.length < 4) next = [...navIds, item.id];
                        else return;
                        setNavIdsState(next);
                        setNavIds(next);
                      }}
                      disabled={disabled}
                      className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl border transition-all ${
                        selected
                          ? 'bg-primary/10 border-primary/40 text-primary'
                          : disabled
                          ? 'bg-secondary/30 border-transparent text-muted-foreground/50 opacity-60'
                          : 'bg-secondary border-transparent text-muted-foreground'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[11px] font-medium">{item.label}</span>
                      {selected && <Check className="w-3 h-3 absolute" style={{ position: 'static' }} />}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">المختار: {navIds.length}/4</span>
                <button
                  onClick={() => { setNavIdsState(DEFAULT_NAV_IDS); setNavIds(DEFAULT_NAV_IDS); }}
                  className="text-primary font-medium hover:underline"
                >
                  استعادة الافتراضي
                </button>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* About */}
          <AccordionItem value="about" className={`card-surface !border-0 !p-0 overflow-hidden ${matchedSections.includes("about") ? "" : "hidden"}`}>
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-sm font-semibold text-foreground">حول التطبيق</span>
                <Hint text="معلومات عن الإصدار وآلية الحفظ" />
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4">
              <ul className="text-xs text-muted-foreground space-y-2 leading-relaxed">
                <li className="flex gap-2"><Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" /> تُحفظ جميع إعداداتك محلياً على جهازك بشكل آمن.</li>
                <li className="flex gap-2"><Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" /> تُستعاد آخر حالة تلقائياً عند تحديث الصفحة أو إعادة فتح التطبيق.</li>
                <li className="flex gap-2"><Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" /> يمكنك في أي وقت إعادة كل شيء إلى القيم الافتراضية من الأسفل.</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Reset */}
        <div className="my-6">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full card-surface flex items-center gap-3 text-destructive"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm font-medium">إعادة الإعدادات الافتراضية</span>
          </button>
        </div>

        {/* Reset confirmation */}
        {showResetConfirm && createPortal(
          <>
            <div className="sheet-overlay" style={{ zIndex: 80 }} onClick={() => setShowResetConfirm(false)} />
            <div className="sheet-content" style={{ zIndex: 81 }} dir="rtl">
              <div className="sheet-handle" />
              <div className="px-5 pb-8 pt-2 text-center">
                <RotateCcw className="w-10 h-10 text-destructive mx-auto mb-3" />
                <h3 className="text-lg font-bold text-foreground mb-2">إعادة الإعدادات؟</h3>
                <p className="text-sm text-muted-foreground mb-5">سيتم إعادة جميع الإعدادات إلى القيم الافتراضية</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 py-3 rounded-xl bg-secondary text-secondary-foreground font-medium"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={() => { resetSettings(); setShowResetConfirm(false); }}
                    className="flex-1 py-3 rounded-xl bg-destructive text-destructive-foreground font-medium"
                  >
                    إعادة
                  </button>
                </div>
              </div>
            </div>
          </>,
          document.body
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
