import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapPin, RefreshCw, Settings2, Clock, Sun, Sunrise, Sunset, Moon, CloudSun, Bell, BellOff, Calendar, AlertTriangle, X, Globe } from 'lucide-react';
import { usePrayerTimes, CALC_METHODS, PRAYER_NAMES_AR, PrayerTimings } from '@/hooks/usePrayerTimes';
import { usePrayerReminders } from '@/hooks/usePrayerReminders';
import { COUNTRIES, CITIES_AR } from '@/data/prayerCountries';
import { toast } from 'sonner';

const ICONS: Record<keyof PrayerTimings, React.ElementType> = {
  Fajr: Sunrise,
  Sunrise: Sun,
  Dhuhr: CloudSun,
  Asr: Sun,
  Maghrib: Sunset,
  Isha: Moon,
};

const fmtTime = (t: string) => {
  if (!t) return '--:--';
  const [hh, mm] = t.split(':').map(Number);
  const period = hh >= 12 ? 'م' : 'ص';
  const h12 = ((hh + 11) % 12) + 1;
  return `${h12}:${String(mm).padStart(2, '0')} ${period}`;
};

const fmtUntil = (m: number) => {
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (h <= 0) return `بعد ${min} د`;
  return `بعد ${h} س ${min} د`;
};

const cityLabel = (c?: string) => (c ? CITIES_AR[c] || c : '');

const PrayerTimesWidget: React.FC = () => {
  const { settings, setSettings, data, tomorrow, loading, error, refresh, nextPrayer, changes, dismissChanges } = usePrayerTimes();
  const [openSettings, setOpenSettings] = useState(false);
  const [openReminders, setOpenReminders] = useState(false);
  const [showTomorrow, setShowTomorrow] = useState(false);
  const reminders = usePrayerReminders(data?.timings || null);
  const toastedRef = useRef(false);

  const order: (keyof PrayerTimings)[] = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  const reminderKeys: (keyof PrayerTimings)[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  const selectedCountry = useMemo(
    () => COUNTRIES.find((c) => c.code === settings.countryCode) || COUNTRIES.find((c) => c.nameEn === settings.country),
    [settings.countryCode, settings.country]
  );

  useEffect(() => {
    if (changes.length && !toastedRef.current) {
      toastedRef.current = true;
      const first = changes[0];
      const sign = first.diffMin > 0 ? '+' : '';
      toast.warning('تغيّرت مواقيت الصلاة اليوم', {
        description: `${first.name}: ${first.before} ← ${first.after} (${sign}${first.diffMin} د)${changes.length > 1 ? ` و${changes.length - 1} أخرى` : ''}`,
        duration: 8000,
      });
    }
    if (!changes.length) toastedRef.current = false;
  }, [changes]);

  const showDisplay = cityLabel(settings.city) || selectedCountry?.nameAr || settings.country || (data ? data.meta.timezone : '—');

  return (
    <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <Clock className="w-4 h-4 text-primary shrink-0" />
          <div className="min-w-0">
            <div className="text-sm font-extrabold text-foreground">مواقيت الصلاة</div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3" />
              {showDisplay}
              {selectedCountry && settings.city ? ` • ${selectedCountry.nameAr}` : ''}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => refresh({ useGeo: true })}
            className="w-8 h-8 rounded-lg bg-secondary/60 flex items-center justify-center active:scale-95"
            aria-label="تحديد الموقع تلقائياً"
            title="تحديد الموقع تلقائياً"
          >
            <MapPin className="w-4 h-4 text-foreground" />
          </button>
          <button
            onClick={() => refresh()}
            className={`w-8 h-8 rounded-lg bg-secondary/60 flex items-center justify-center active:scale-95 ${loading ? 'animate-spin' : ''}`}
            aria-label="تحديث"
          >
            <RefreshCw className="w-4 h-4 text-foreground" />
          </button>
          <button
            onClick={() => setOpenReminders((v) => !v)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center active:scale-95 ${reminders.settings.enabled ? 'bg-primary/20 text-primary' : 'bg-secondary/60 text-foreground'}`}
            aria-label="التنبيهات"
          >
            {reminders.settings.enabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setOpenSettings((v) => !v)}
            className="w-8 h-8 rounded-lg bg-secondary/60 flex items-center justify-center active:scale-95"
            aria-label="إعدادات"
          >
            <Settings2 className="w-4 h-4 text-foreground" />
          </button>
        </div>
      </div>

      {changes.length > 0 && (
        <div className="mb-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-2.5 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400">تغيّرت مواقيت اليوم</div>
            <div className="text-[11px] text-foreground/80 space-y-0.5 mt-0.5">
              {changes.slice(0, 3).map((c) => (
                <div key={c.key} className="flex items-center gap-1">
                  <span className="font-bold">{c.name}:</span>
                  <span className="line-through opacity-60">{fmtTime(c.before)}</span>
                  <span>←</span>
                  <span className="font-bold">{fmtTime(c.after)}</span>
                  <span className="text-muted-foreground">({c.diffMin > 0 ? '+' : ''}{c.diffMin} د)</span>
                </div>
              ))}
            </div>
          </div>
          <button onClick={dismissChanges} className="p-1 -m-1 text-muted-foreground active:scale-95" aria-label="إغلاق">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {nextPrayer && (
        <div className="rounded-xl bg-primary/15 border border-primary/25 p-3 mb-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-primary uppercase tracking-widest">الصلاة القادمة</div>
            <div className="text-base font-extrabold text-foreground">{nextPrayer.name}</div>
          </div>
          <div className="text-left">
            <div className="text-base font-extrabold text-foreground">{fmtTime(nextPrayer.time)}</div>
            <div className="text-[11px] text-muted-foreground">{fmtUntil(nextPrayer.minutesUntil)}</div>
          </div>
        </div>
      )}

      {error && !data && (
        <div className="text-xs text-destructive text-center py-2">{error}</div>
      )}

      {!data && !error && !loading && !settings.city && settings.lat == null && (
        <div className="text-xs text-muted-foreground text-center py-3">
          اختر دولتك ومدينتك من الإعدادات، أو استخدم الموقع التلقائي.
        </div>
      )}

      {data && (
        <div className="grid grid-cols-3 gap-2">
          {order.map((k) => {
            const Icon = ICONS[k];
            const isNext = nextPrayer?.key === k;
            return (
              <div
                key={k}
                className={`rounded-xl p-2.5 text-center border ${isNext ? 'border-primary/40 bg-primary/10' : 'border-border/40 bg-card'}`}
              >
                <Icon className={`w-4 h-4 mx-auto mb-1 ${isNext ? 'text-primary' : 'text-muted-foreground'}`} />
                <div className="text-[10px] font-bold text-muted-foreground">{PRAYER_NAMES_AR[k]}</div>
                <div className="text-xs font-extrabold text-foreground mt-0.5">{fmtTime(data.timings[k])}</div>
              </div>
            );
          })}
        </div>
      )}

      {data?.date?.hijri && (
        <div className="mt-3 text-[11px] text-muted-foreground text-center">
          {data.date.hijri.date} {data.date.hijri.month?.ar} {data.date.hijri.year}هـ
        </div>
      )}

      {tomorrow && (
        <div className="mt-3">
          <button
            onClick={() => setShowTomorrow((v) => !v)}
            className="w-full flex items-center justify-between text-[11px] font-extrabold text-foreground bg-secondary/50 hover:bg-secondary/70 rounded-lg px-3 py-2 active:scale-[0.98] transition"
          >
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              مواقيت الغد
              {tomorrow.date?.hijri && (
                <span className="text-muted-foreground font-bold">
                  ({tomorrow.date.hijri.date} {tomorrow.date.hijri.month?.ar})
                </span>
              )}
            </span>
            <span className="text-muted-foreground">{showTomorrow ? '−' : '+'}</span>
          </button>
          {showTomorrow && (
            <div className="grid grid-cols-3 gap-2 mt-2">
              {order.map((k) => {
                const Icon = ICONS[k];
                return (
                  <div key={k} className="rounded-xl p-2 text-center border border-border/40 bg-card/60">
                    <Icon className="w-3.5 h-3.5 mx-auto mb-1 text-muted-foreground" />
                    <div className="text-[10px] font-bold text-muted-foreground">{PRAYER_NAMES_AR[k]}</div>
                    <div className="text-[11px] font-extrabold text-foreground mt-0.5">{fmtTime(tomorrow.timings[k])}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {openSettings && (
        <div className="mt-3 pt-3 border-t border-border/40 space-y-3">
          <div>
            <label className="text-[11px] font-bold text-muted-foreground mb-1 flex items-center gap-1">
              <Globe className="w-3 h-3" /> الدولة
            </label>
            <select
              value={settings.countryCode || ''}
              onChange={(e) => {
                const c = COUNTRIES.find((x) => x.code === e.target.value);
                if (!c) return;
                setSettings({
                  ...settings,
                  countryCode: c.code,
                  country: c.nameEn,
                  city: c.cities[0],
                  method: c.method,
                  lat: undefined,
                  lng: undefined,
                });
              }}
              className="w-full text-xs rounded-lg border border-border/50 bg-background px-2 py-2"
            >
              <option value="">— اختر الدولة —</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.nameAr}</option>
              ))}
            </select>
          </div>

          {selectedCountry && (
            <div>
              <label className="text-[11px] font-bold text-muted-foreground block mb-1">المدينة</label>
              <select
                value={settings.city || ''}
                onChange={(e) => setSettings({ ...settings, city: e.target.value, lat: undefined, lng: undefined })}
                className="w-full text-xs rounded-lg border border-border/50 bg-background px-2 py-2"
              >
                {selectedCountry.cities.map((city) => (
                  <option key={city} value={city}>{CITIES_AR[city] || city}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-muted-foreground block mb-1">طريقة الحساب</label>
            <select
              value={settings.method}
              onChange={(e) => setSettings({ ...settings, method: Number(e.target.value) })}
              className="w-full text-xs rounded-lg border border-border/50 bg-background px-2 py-2"
            >
              {CALC_METHODS.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <label className="flex items-center justify-between text-xs bg-secondary/40 rounded-lg px-2.5 py-2">
            <span className="font-bold text-foreground">تنبيهي عند تغيّر المواقيت</span>
            <input
              type="checkbox"
              checked={settings.changeAlerts !== false}
              onChange={(e) => setSettings({ ...settings, changeAlerts: e.target.checked })}
              className="w-4 h-4 accent-primary"
            />
          </label>

          <div>
            <div className="text-[11px] font-bold text-muted-foreground mb-1">تعديل دقائق (± لكل صلاة)</div>
            <div className="grid grid-cols-3 gap-1.5">
              {(Object.keys(PRAYER_NAMES_AR) as (keyof PrayerTimings)[]).map((k) => (
                <div key={k} className="flex flex-col items-center bg-secondary/40 rounded-lg p-1.5">
                  <span className="text-[10px] text-muted-foreground">{PRAYER_NAMES_AR[k]}</span>
                  <input
                    type="number"
                    value={settings.adjustments[k] || 0}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        adjustments: { ...settings.adjustments, [k]: Number(e.target.value) || 0 },
                      })
                    }
                    className="w-full text-center text-xs bg-background rounded mt-1 px-1 py-0.5"
                  />
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => refresh()}
            className="w-full text-xs font-bold py-2 rounded-lg bg-primary text-primary-foreground active:scale-95"
          >
            تطبيق
          </button>
        </div>
      )}

      {openReminders && (
        <div className="mt-3 pt-3 border-t border-border/40 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-extrabold text-foreground">تنبيهات قبل الأذان</div>
              <div className="text-[11px] text-muted-foreground">
                {reminders.permission === 'granted' ? 'الإشعارات مفعّلة' : reminders.permission === 'denied' ? 'الإشعارات محظورة من المتصفح' : 'بحاجة لإذن الإشعارات'}
              </div>
            </div>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={reminders.settings.enabled}
                onChange={async (e) => {
                  if (e.target.checked) {
                    if (typeof Notification === 'undefined') {
                      toast.error('متصفحك لا يدعم الإشعارات');
                      return;
                    }
                    if (reminders.permission !== 'granted') {
                      const p = await reminders.requestPermission();
                      if (p !== 'granted') {
                        toast.error('لم يتم منح إذن الإشعارات. فعّلها من إعدادات المتصفح.');
                        return;
                      }
                    }
                    reminders.setSettings({ ...reminders.settings, enabled: true });
                    toast.success('تم تفعيل التنبيهات قبل الأذان');
                  } else {
                    reminders.setSettings({ ...reminders.settings, enabled: false });
                    toast.message('تم إيقاف تنبيهات الأذان');
                  }
                }}
              />
              <div className="w-10 h-6 bg-secondary rounded-full peer peer-checked:bg-primary relative after:content-[''] after:absolute after:top-0.5 after:right-0.5 after:bg-background after:w-5 after:h-5 after:rounded-full after:transition-all peer-checked:after:-translate-x-4" />
            </label>
          </div>

          <div>
            <label className="text-[11px] font-bold text-muted-foreground block mb-1">
              تنبيه قبل الأذان: {reminders.settings.minutesBefore} دقيقة
            </label>
            <input
              type="range"
              min={0}
              max={45}
              step={5}
              value={reminders.settings.minutesBefore}
              onChange={(e) =>
                reminders.setSettings({ ...reminders.settings, minutesBefore: Number(e.target.value) })
              }
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>0</span><span>15</span><span>30</span><span>45</span>
            </div>
          </div>

          <label className="flex items-center justify-between text-xs">
            <span className="font-bold text-foreground">تنبيه عند دخول الوقت أيضاً</span>
            <input
              type="checkbox"
              checked={reminders.settings.alsoAtTime}
              onChange={(e) => reminders.setSettings({ ...reminders.settings, alsoAtTime: e.target.checked })}
              className="w-4 h-4 accent-primary"
            />
          </label>

          <div>
            <div className="text-[11px] font-bold text-muted-foreground mb-1.5">الصلوات المفعّلة</div>
            <div className="grid grid-cols-5 gap-1.5">
              {reminderKeys.map((k) => {
                const on = reminders.settings.perPrayer[k] !== false;
                return (
                  <button
                    key={k}
                    onClick={() =>
                      reminders.setSettings({
                        ...reminders.settings,
                        perPrayer: { ...reminders.settings.perPrayer, [k]: !on },
                      })
                    }
                    className={`text-[11px] font-bold py-1.5 rounded-lg border transition ${
                      on ? 'bg-primary/15 text-primary border-primary/30' : 'bg-secondary/40 text-muted-foreground border-border/40'
                    }`}
                  >
                    {PRAYER_NAMES_AR[k]}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={reminders.testNotification}
            className="w-full text-xs font-bold py-2 rounded-lg bg-secondary text-foreground active:scale-95"
          >
            إرسال تنبيه تجريبي
          </button>
        </div>
      )}
    </div>
  );
};

export default PrayerTimesWidget;
