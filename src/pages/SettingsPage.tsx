import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Settings, Type, Palette, Mic, RotateCcw, Repeat, Volume2,
  Moon, Sun, Check, Save, BookOpen, Sparkles, LayoutGrid,
  Bell, Download, Upload, Trash2, Share2, HardDrive,
  ChevronLeft, User2, Star, WifiOff, CloudDownload,
} from 'lucide-react';
import SEO from '@/components/SEO';
import PageHeader from '@/components/PageHeader';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useSettings } from '@/hooks/useSettings';
import { useTheme } from '@/contexts/ThemeContext';
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

// -- helpers -----------------------------------------------------------------

const SETTINGS_KEY = 'app_settings';

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function estimateLocalStorage() {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k) continue;
    total += (k.length + (localStorage.getItem(k)?.length ?? 0)) * 2; // UTF-16
  }
  return total;
}

// -- reusable UI -------------------------------------------------------------

const SectionCard: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  hint?: string;
  tone?: 'primary' | 'accent' | 'destructive';
  children: React.ReactNode;
}> = ({ icon: Icon, title, hint, tone = 'primary', children }) => (
  <motion.section
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25 }}
    className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm overflow-hidden"
  >
    <header className="flex items-center gap-2.5 px-4 py-3 border-b border-border/50 bg-gradient-to-l from-transparent via-transparent to-secondary/40">
      <span
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
          tone === 'accent'
            ? 'bg-accent/15 text-accent'
            : tone === 'destructive'
            ? 'bg-destructive/15 text-destructive'
            : 'bg-primary/15 text-primary'
        }`}
      >
        <Icon className="w-4 h-4" />
      </span>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-foreground leading-tight">{title}</h3>
        {hint && <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{hint}</p>}
      </div>
    </header>
    <div className="p-4">{children}</div>
  </motion.section>
);

const QuickAction: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  tone?: 'primary' | 'accent' | 'destructive';
}> = ({ icon: Icon, label, onClick, tone = 'primary' }) => (
  <button
    onClick={onClick}
    className="group flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl bg-secondary/50 hover:bg-secondary border border-border/50 transition-all active:scale-95"
  >
    <span
      className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${
        tone === 'accent'
          ? 'bg-accent/15 text-accent'
          : tone === 'destructive'
          ? 'bg-destructive/15 text-destructive'
          : 'bg-primary/15 text-primary'
      }`}
    >
      <Icon className="w-4 h-4" />
    </span>
    <span className="text-[11px] font-medium text-foreground">{label}</span>
  </button>
);

// -- page --------------------------------------------------------------------

const SettingsPage: React.FC = () => {
  const { settings, updateSetting, resetSettings } = useSettings();
  const { theme, toggleTheme } = useTheme();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [tab, setTab] = useState<string>(() => localStorage.getItem('settings_tab') || 'general');
  const [navIds, setNavIdsState] = useState<string[]>(getNavIds);
  const [storageBytes, setStorageBytes] = useState(0);
  const [offlineDownloading, setOfflineDownloading] = useState(false);
  const [offlineProgress, setOfflineProgress] = useState({ done: 0, total: 0 });
  const [tafsirDownloading, setTafsirDownloading] = useState(false);
  const [tafsirProgress, setTafsirProgress] = useState({ done: 0, total: 0 });
  const [tafsirEdition, setTafsirEdition] = useState<string>('ar.muyassar');
  const importRef = useRef<HTMLInputElement>(null);

  const currentReciter = useMemo(
    () => RECITERS.find((r) => r.id === settings.defaultReciter)?.name ?? '—',
    [settings.defaultReciter]
  );

  useEffect(() => {
    localStorage.setItem('settings_tab', tab);
  }, [tab]);

  useEffect(() => {
    setSavedFlash(true);
    const t = setTimeout(() => setSavedFlash(false), 1000);
    return () => clearTimeout(t);
  }, [settings]);

  useEffect(() => {
    setStorageBytes(estimateLocalStorage());
  }, [settings, tab]);

  // -- quick actions ---------------------------------------------------------

  const handleExport = () => {
    try {
      const payload = {
        version: 1,
        exportedAt: new Date().toISOString(),
        settings,
        navIds: getNavIds(),
        theme,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quran-heart-settings-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('تم تصدير الإعدادات');
    } catch {
      toast.error('تعذّر التصدير');
    }
  };

  const handleImportFile = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (parsed.settings && typeof parsed.settings === 'object') {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(parsed.settings));
      }
      if (Array.isArray(parsed.navIds)) {
        setNavIds(parsed.navIds);
        setNavIdsState(parsed.navIds);
      }
      toast.success('تم استيراد الإعدادات — يُعاد تحميل الصفحة');
      setTimeout(() => window.location.reload(), 700);
    } catch {
      toast.error('ملف غير صالح');
    }
  };

  const handleClearCache = () => {
    // Preserve user preferences; drop cached content
    const preserveKeys = new Set([
      SETTINGS_KEY,
      'bottom_nav_ids',
      'theme',
      'settings_open_sections',
      'settings_tab',
      'favorites',
      'bookmarks',
      'reading_progress',
      'khatm_progress',
      'tasbih_history',
    ]);
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && !preserveKeys.has(k)) keysToRemove.push(k);
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
    setStorageBytes(estimateLocalStorage());
    setShowClearConfirm(false);
    toast.success(`تم مسح ${keysToRemove.length} عنصر من الذاكرة المؤقتة`);
  };

  const handleShare = async () => {
    const shareData = {
      title: 'قلب القرآن',
      text: 'تطبيق قلب القرآن — القرآن الكريم، التفسير، الأذكار، ومواقيت الصلاة',
      url: window.location.origin,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success('تم نسخ الرابط');
      }
    } catch {
      /* user cancelled */
    }
  };

  const handleDownloadOffline = async () => {
    if (!('serviceWorker' in navigator)) {
      toast.error('المتصفح لا يدعم العمل بدون إنترنت');
      return;
    }
    const reg = await navigator.serviceWorker.ready.catch(() => null);
    const target = reg?.active || navigator.serviceWorker.controller;
    if (!target) {
      toast.error('لم يتم تفعيل العمل دون اتصال بعد — أعد فتح التطبيق ثم حاول');
      return;
    }
    // Full Quran text (114 surahs) via AlQuran Cloud + a light tafsir edition.
    const urls: string[] = [];
    for (let i = 1; i <= 114; i++) {
      urls.push(`https://api.alquran.cloud/v1/surah/${i}/quran-uthmani`);
    }
    const total = urls.length;
    setOfflineDownloading(true);
    setOfflineProgress({ done: 0, total });

    const onMsg = (event: MessageEvent) => {
      const msg = event.data || {};
      if (msg.type === 'PRECACHE_PROGRESS') {
        setOfflineProgress({ done: msg.done, total: msg.total });
      } else if (msg.type === 'PRECACHE_DONE') {
        setOfflineProgress({ done: msg.done, total: msg.total });
        setOfflineDownloading(false);
        toast.success(`تم تحميل ${msg.done} سورة للاستخدام دون إنترنت`);
        navigator.serviceWorker.removeEventListener('message', onMsg);
      }
    };
    navigator.serviceWorker.addEventListener('message', onMsg);
    target.postMessage({ type: 'PRECACHE_URLS', urls });
    toast('جاري التحميل…', { description: 'يمكنك متابعة استخدام التطبيق' });
  };

  const handleDownloadTafsir = async () => {
    if (!('serviceWorker' in navigator)) {
      toast.error('المتصفح لا يدعم العمل بدون إنترنت');
      return;
    }
    const reg = await navigator.serviceWorker.ready.catch(() => null);
    const target = reg?.active || navigator.serviceWorker.controller;
    if (!target) {
      toast.error('لم يتم تفعيل العمل دون اتصال بعد — أعد فتح التطبيق ثم حاول');
      return;
    }
    const urls: string[] = [];
    for (let i = 1; i <= 114; i++) {
      urls.push(`https://api.alquran.cloud/v1/surah/${i}/${tafsirEdition}`);
    }
    const total = urls.length;
    setTafsirDownloading(true);
    setTafsirProgress({ done: 0, total });

    const onMsg = (event: MessageEvent) => {
      const msg = event.data || {};
      if (msg.type === 'PRECACHE_PROGRESS') {
        setTafsirProgress({ done: msg.done, total: msg.total });
      } else if (msg.type === 'PRECACHE_DONE') {
        setTafsirProgress({ done: msg.done, total: msg.total });
        setTafsirDownloading(false);
        toast.success(`تم تحميل التفسير كاملاً (${msg.done} سورة)`);
        navigator.serviceWorker.removeEventListener('message', onMsg);
      }
    };
    navigator.serviceWorker.addEventListener('message', onMsg);
    target.postMessage({ type: 'PRECACHE_URLS', urls });
    toast('جاري تحميل التفسير…', { description: 'قد يستغرق دقيقة حسب سرعة الإنترنت' });
  };

  // -- render ----------------------------------------------------------------

  return (
    <>
      <SEO title="الإعدادات — قلب القرآن" description="تخصيص إعدادات التطبيق: الثيم، الخط، الإشعارات، الصوت، والنسخ الاحتياطي." />
      <div className="page-container page-with-topbar" dir="rtl">
        <div className="page-inner">
          <PageHeader icon={Settings} title="الإعدادات" subtitle="تخصيص كامل للتطبيق" showBack />

          {/* Hero summary card */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-bl from-primary/15 via-accent/5 to-transparent p-4 mb-4"
          >
            <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
            <div className="relative flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                <User2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-muted-foreground">تخصيصك الحالي</p>
                <p className="text-sm font-bold text-foreground truncate">{currentReciter}</p>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground bg-background/60 border border-border/60 rounded-full px-2.5 py-1">
                <Save className={`w-3 h-3 ${savedFlash ? 'text-primary' : 'text-muted-foreground/70'}`} />
                <span>{savedFlash ? 'تم الحفظ' : 'حفظ تلقائي'}</span>
              </div>
            </div>
            <div className="relative grid grid-cols-3 gap-2 mt-3">
              <div className="rounded-xl bg-background/60 border border-border/50 px-2.5 py-2 text-center">
                <p className="text-[10px] text-muted-foreground">المظهر</p>
                <p className="text-xs font-bold text-foreground">{theme === 'dark' ? 'ليلي' : 'نهاري'}</p>
              </div>
              <div className="rounded-xl bg-background/60 border border-border/50 px-2.5 py-2 text-center">
                <p className="text-[10px] text-muted-foreground">حجم الخط</p>
                <p className="text-xs font-bold text-foreground">{settings.fontSize}px</p>
              </div>
              <div className="rounded-xl bg-background/60 border border-border/50 px-2.5 py-2 text-center">
                <p className="text-[10px] text-muted-foreground">التكرار</p>
                <p className="text-xs font-bold text-foreground">{settings.repeatCount}×</p>
              </div>
            </div>
          </motion.div>

          {/* Quick actions */}
          <div className="grid grid-cols-4 gap-2 mb-5">
            <QuickAction icon={Download} label="تصدير" onClick={handleExport} />
            <QuickAction icon={Upload} label="استيراد" onClick={() => importRef.current?.click()} tone="accent" />
            <QuickAction icon={Share2} label="مشاركة" onClick={handleShare} />
            <QuickAction icon={Trash2} label="مسح الذاكرة" onClick={() => setShowClearConfirm(true)} tone="destructive" />
          </div>
          <input
            ref={importRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImportFile(f);
              e.target.value = '';
            }}
          />

          {/* Tabs */}
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="w-full grid grid-cols-4 bg-secondary/60 h-auto p-1 mb-4 rounded-2xl">
              <TabsTrigger value="general" className="rounded-xl text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm py-2">عام</TabsTrigger>
              <TabsTrigger value="reading" className="rounded-xl text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm py-2">القراءة</TabsTrigger>
              <TabsTrigger value="audio" className="rounded-xl text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm py-2">الصوت</TabsTrigger>
              <TabsTrigger value="more" className="rounded-xl text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm py-2">المزيد</TabsTrigger>
            </TabsList>

            {/* GENERAL --------------------------------------------------- */}
            <TabsContent value="general" className="space-y-3 mt-0">
              <SectionCard icon={Sun} title="المظهر" hint="الوضع الليلي وراحة العين" tone="accent">
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? <Moon className="w-5 h-5 text-accent" /> : <Sun className="w-5 h-5 text-accent" />}
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">الوضع الليلي</p>
                    <p className="text-[11px] text-muted-foreground">يُريح العين أثناء القراءة الليلية</p>
                  </div>
                  <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} aria-label="تبديل الوضع الليلي" />
                </div>
              </SectionCard>

              <SectionCard icon={Palette} title="نمط الألوان" hint="لوحة ألوان التطبيق">
                <div className="grid grid-cols-2 gap-2">
                  {COLOR_SCHEMES.map((scheme) => (
                    <button
                      key={scheme.id}
                      onClick={() => updateSetting('colorScheme', scheme.id)}
                      className={`p-3 rounded-xl border transition-all text-center ${
                        settings.colorScheme === scheme.id
                          ? 'border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20'
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
              </SectionCard>

              <SectionCard icon={Bell} title="الإشعارات والأذان" hint="مواقيت الصلاة والتنبيهات" tone="accent">
                <Link
                  to="/notification-settings"
                  className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40 hover:bg-secondary transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-sm font-semibold text-foreground">إعدادات الإشعارات</p>
                    <p className="text-[11px] text-muted-foreground">تفعيل الأذان، تشخيص iOS، والتنبيهات</p>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                </Link>
              </SectionCard>

              <SectionCard icon={LayoutGrid} title="تخصيص الشريط السفلي" hint="اختر 4 اختصارات">
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
              </SectionCard>
            </TabsContent>

            {/* READING --------------------------------------------------- */}
            <TabsContent value="reading" className="space-y-3 mt-0">
              <SectionCard icon={Type} title="خط القراءة العام" hint="نصوص الأدعية والأحاديث والتفسير">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">حجم الخط</span>
                  <span className="text-xs text-primary font-bold bg-primary/10 px-2.5 py-0.5 rounded-full">{settings.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min={14}
                  max={28}
                  value={settings.fontSize}
                  onChange={(e) => updateSetting('fontSize', Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <p className="font-amiri text-foreground mt-3 leading-relaxed text-center" style={{ fontSize: settings.fontSize }}>
                  بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ
                </p>
              </SectionCard>

              <SectionCard icon={BookOpen} title="خط المصحف" hint="حجم الآيات داخل صفحات المصحف" tone="accent">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">حجم الخط</span>
                  <span className="text-xs text-accent font-bold bg-accent/10 px-2.5 py-0.5 rounded-full">{settings.mushafFontSize}px</span>
                </div>
                <input
                  type="range"
                  min={18}
                  max={36}
                  value={settings.mushafFontSize}
                  onChange={(e) => updateSetting('mushafFontSize', Number(e.target.value))}
                  className="w-full accent-accent"
                />
                <p className="font-amiri text-foreground mt-3 leading-[2.4] text-center" style={{ fontSize: settings.mushafFontSize }}>
                  الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ
                </p>
              </SectionCard>

              <SectionCard icon={Repeat} title="إعدادات الحفظ" hint="التكرار التلقائي للآية">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-foreground">عدد التكرارات</span>
                  <span className="text-xs text-primary font-bold bg-primary/10 px-2.5 py-0.5 rounded-full">{settings.repeatCount}×</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 5, 7, 10, 15, 20].map((n) => (
                    <button
                      key={n}
                      onClick={() => updateSetting('repeatCount', n)}
                      className={`py-2 rounded-xl text-xs font-medium transition-colors ${
                        settings.repeatCount === n
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-secondary text-secondary-foreground hover:bg-muted'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                  <Volume2 className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium text-foreground flex-1">تشغيل تلقائي للآية التالية</span>
                  <Switch
                    checked={settings.autoPlayNext}
                    onCheckedChange={(v) => updateSetting('autoPlayNext', v)}
                    aria-label="تشغيل تلقائي"
                  />
                </div>
              </SectionCard>
            </TabsContent>

            {/* AUDIO ----------------------------------------------------- */}
            <TabsContent value="audio" className="space-y-3 mt-0">
              <SectionCard icon={Mic} title="القارئ الافتراضي" hint="الصوت المُستخدم تلقائياً">
                <div className="space-y-1.5">
                  {RECITERS.map((reciter) => (
                    <button
                      key={reciter.id}
                      onClick={() => updateSetting('defaultReciter', reciter.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-right ${
                        settings.defaultReciter === reciter.id
                          ? 'bg-primary/10 border border-primary/30'
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
              </SectionCard>
            </TabsContent>

            {/* MORE ------------------------------------------------------ */}
            <TabsContent value="more" className="space-y-3 mt-0">
              <SectionCard icon={WifiOff} title="العمل دون اتصال" hint="حمّل المحتوى للاستخدام بدون إنترنت" tone="accent">
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                  التطبيق يعمل دون اتصال تلقائياً بعد أول زيارة. لتخزين نصوص المصحف الكامل مسبقاً واستخدامه في أي وقت، اضغط زر التحميل أدناه.
                </p>
                {offlineDownloading && offlineProgress.total > 0 && (
                  <div className="mb-3">
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${(offlineProgress.done / offlineProgress.total) * 100}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center mt-1">
                      {offlineProgress.done} / {offlineProgress.total} سورة
                    </p>
                  </div>
                )}
                <button
                  onClick={handleDownloadOffline}
                  disabled={offlineDownloading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <CloudDownload className="w-4 h-4" />
                  {offlineDownloading ? 'جاري التحميل…' : 'تحميل المصحف كامل للاستخدام دون إنترنت'}
                </button>
                <p className="text-[10px] text-muted-foreground text-center mt-2">
                  الحجم التقريبي 5–8 ميجابايت • يُخزَّن على جهازك فقط
                </p>
              </SectionCard>

              <SectionCard icon={BookOpen} title="تنزيل التفسير كاملاً" hint="لقراءة التفسير دون إنترنت">
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                  اختر إصدار التفسير الذي تريد تخزينه على جهازك، وسيتم تحميل تفسير جميع سور القرآن الكريم للاستخدام لاحقاً بدون اتصال.
                </p>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[
                    { id: 'ar.muyassar', name: 'التفسير الميسر' },
                    { id: 'ar.jalalayn', name: 'تفسير الجلالين' },
                  ].map((ed) => (
                    <button
                      key={ed.id}
                      onClick={() => setTafsirEdition(ed.id)}
                      disabled={tafsirDownloading}
                      className={`p-2.5 rounded-xl border text-xs font-medium transition-all ${
                        tafsirEdition === ed.id
                          ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                          : 'border-border bg-secondary/30 text-foreground hover:bg-secondary'
                      } disabled:opacity-60`}
                    >
                      {ed.name}
                    </button>
                  ))}
                </div>
                {tafsirDownloading && tafsirProgress.total > 0 && (
                  <div className="mb-3">
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${(tafsirProgress.done / tafsirProgress.total) * 100}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center mt-1">
                      {tafsirProgress.done} / {tafsirProgress.total} سورة
                    </p>
                  </div>
                )}
                <button
                  onClick={handleDownloadTafsir}
                  disabled={tafsirDownloading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent/10 text-accent text-xs font-semibold hover:bg-accent/20 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <CloudDownload className="w-4 h-4" />
                  {tafsirDownloading ? 'جاري تحميل التفسير…' : 'تحميل التفسير كاملاً'}
                </button>
                <p className="text-[10px] text-muted-foreground text-center mt-2">
                  الحجم التقريبي 8–15 ميجابايت • يُخزَّن محلياً على جهازك
                </p>
              </SectionCard>


              <SectionCard icon={HardDrive} title="التخزين والبيانات" hint="النسخ الاحتياطي وذاكرة التطبيق">
                <div className="flex items-center gap-3 mb-3 p-3 rounded-xl bg-secondary/40">
                  <HardDrive className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">حجم البيانات المحفوظة محلياً</p>
                    <p className="text-sm font-bold text-foreground">{formatBytes(storageBytes)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleExport}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    تصدير JSON
                  </button>
                  <button
                    onClick={() => importRef.current?.click()}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-accent/10 text-accent text-xs font-medium hover:bg-accent/20 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    استيراد JSON
                  </button>
                </div>
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="mt-2 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-destructive/10 text-destructive text-xs font-medium hover:bg-destructive/20 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  مسح الذاكرة المؤقتة
                </button>
                <p className="text-[10px] text-muted-foreground text-center mt-2">
                  المسح يحافظ على تفضيلاتك والمفضلة والتقدم
                </p>
              </SectionCard>

              <SectionCard icon={Sparkles} title="حول التطبيق" hint="معلومات وتواصل" tone="accent">
                <ul className="text-xs text-muted-foreground space-y-2 leading-relaxed">
                  <li className="flex gap-2"><Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" /> تُحفظ جميع إعداداتك محلياً على جهازك بشكل آمن.</li>
                  <li className="flex gap-2"><Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" /> تُستعاد آخر حالة تلقائياً عند إعادة فتح التطبيق.</li>
                  <li className="flex gap-2"><Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" /> يمكنك استعادة القيم الافتراضية في أي وقت.</li>
                </ul>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-accent" />
                    صنع هذا التطبيق صدقة جارية — فخري عادل
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href="https://t.me/fakhri_adel"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-white"
                      style={{ background: 'linear-gradient(135deg, #229ED9 0%, #1A8BC7 100%)' }}
                    >
                      تلغرام
                    </a>
                    <a
                      href="https://www.instagram.com/fakhri_adel/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-white"
                      style={{ background: 'linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #F77737 100%)' }}
                    >
                      انستغرام
                    </a>
                    <button
                      onClick={handleShare}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-primary text-primary-foreground"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      مشاركة التطبيق
                    </button>
                  </div>
                </div>
              </SectionCard>

              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive font-medium text-sm hover:bg-destructive/15 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                إعادة كل الإعدادات إلى الافتراضي
              </button>
            </TabsContent>
          </Tabs>

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
                      onClick={() => { resetSettings(); setShowResetConfirm(false); toast.success('تمت إعادة الإعدادات'); }}
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

          {/* Clear cache confirmation */}
          {showClearConfirm && createPortal(
            <>
              <div className="sheet-overlay" style={{ zIndex: 80 }} onClick={() => setShowClearConfirm(false)} />
              <div className="sheet-content" style={{ zIndex: 81 }} dir="rtl">
                <div className="sheet-handle" />
                <div className="px-5 pb-8 pt-2 text-center">
                  <Trash2 className="w-10 h-10 text-destructive mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-foreground mb-2">مسح الذاكرة المؤقتة؟</h3>
                  <p className="text-sm text-muted-foreground mb-5">سيتم حذف البيانات المؤقتة (المخبأة) مع الحفاظ على إعداداتك ومفضلتك وتقدمك.</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="flex-1 py-3 rounded-xl bg-secondary text-secondary-foreground font-medium"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={handleClearCache}
                      className="flex-1 py-3 rounded-xl bg-destructive text-destructive-foreground font-medium"
                    >
                      مسح
                    </button>
                  </div>
                </div>
              </div>
            </>,
            document.body
          )}
        </div>
      </div>
    </>
  );
};

export default SettingsPage;
