import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Type, Palette, Mic, RotateCcw, ChevronLeft, Repeat, Volume2, Moon, Sun, Monitor, Check } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { useTheme } from '@/contexts/ThemeContext';
import PageHeader from '@/components/PageHeader';

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

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { settings, updateSetting, resetSettings } = useSettings();
  const { theme, toggleTheme } = useTheme();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <div className="page-container page-with-topbar" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <PageHeader
          icon={Settings}
          title="الإعدادات"
          subtitle="تخصيص التطبيق"
          showBack
        />

        {/* Theme */}
        <div className="mb-6">
          <h2 className="section-title">المظهر</h2>
          <div className="card-surface">
            <div className="flex items-center gap-3 mb-3">
              {theme === 'dark' ? <Moon className="w-5 h-5 text-accent" /> : <Sun className="w-5 h-5 text-accent" />}
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">الوضع الليلي</p>
                <p className="text-[11px] text-muted-foreground">تبديل بين الوضع الفاتح والداكن</p>
              </div>
              <button
                onClick={toggleTheme}
                className={`w-12 h-7 rounded-full transition-colors relative ${theme === 'dark' ? 'bg-primary' : 'bg-muted'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-1 transition-all ${theme === 'dark' ? 'left-1' : 'left-6'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Font Size */}
        <div className="mb-6">
          <h2 className="section-title">حجم الخط</h2>
          <div className="card-surface space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">خط القراءة العام</span>
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
                  <Type className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium text-foreground">خط المصحف</span>
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
          </div>
        </div>

        {/* Default Reciter */}
        <div className="mb-6">
          <h2 className="section-title">القارئ الافتراضي</h2>
          <div className="card-surface">
            <div className="flex items-center gap-2 mb-3">
              <Mic className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">اختر القارئ المفضل</span>
            </div>
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
          </div>
        </div>

        {/* Ayah Repeat Settings */}
        <div className="mb-6">
          <h2 className="section-title">إعدادات الحفظ</h2>
          <div className="card-surface">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">عدد التكرارات الافتراضي</span>
              </div>
              <span className="text-xs text-primary font-bold bg-primary/10 px-2.5 py-0.5 rounded-full">{settings.repeatCount}×</span>
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 5, 7, 10, 15, 20].map(n => (
                <button
                  key={n}
                  onClick={() => updateSetting('repeatCount', n)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${
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
              <button
                onClick={() => updateSetting('autoPlayNext', !settings.autoPlayNext)}
                className={`w-12 h-7 rounded-full transition-colors relative ${settings.autoPlayNext ? 'bg-primary' : 'bg-muted'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-1 transition-all ${settings.autoPlayNext ? 'left-1' : 'left-6'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Color Scheme */}
        <div className="mb-6">
          <h2 className="section-title">نمط الألوان</h2>
          <div className="card-surface">
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">اختر نمط الألوان المفضل</span>
            </div>
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
          </div>
        </div>

        {/* Reset */}
        <div className="mb-8">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full card-surface flex items-center gap-3 text-destructive"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm font-medium">إعادة الإعدادات الافتراضية</span>
          </button>
        </div>

        {/* Reset confirmation */}
        {showResetConfirm && (
          <>
            <div className="sheet-overlay" onClick={() => setShowResetConfirm(false)} />
            <div className="sheet-content" dir="rtl">
              <div className="sheet-handle" />
              <div className="px-5 pb-6 pt-2 text-center">
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
          </>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
