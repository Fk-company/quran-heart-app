import React, { useState } from 'react';
import { MapPin, RefreshCw, Settings2, Clock, Sun, Sunrise, Sunset, Moon, CloudSun, Bell, BellOff } from 'lucide-react';
import { usePrayerTimes, CALC_METHODS, PRAYER_NAMES_AR, PrayerTimings } from '@/hooks/usePrayerTimes';
import { usePrayerReminders } from '@/hooks/usePrayerReminders';

const ICONS: Record<keyof PrayerTimings, React.ElementType> = {
  Fajr: Sunrise,
  Sunrise: Sun,
  Dhuhr: CloudSun,
  Asr: Sun,
  Maghrib: Sunset,
  Isha: Moon,
};

const fmtTime = (t: string) => {
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

const PrayerTimesWidget: React.FC = () => {
  const { settings, setSettings, data, loading, error, refresh, nextPrayer } = usePrayerTimes();
  const [openSettings, setOpenSettings] = useState(false);
  const [openReminders, setOpenReminders] = useState(false);
  const reminders = usePrayerReminders(data?.timings || null);

  const order: (keyof PrayerTimings)[] = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  const reminderKeys: (keyof PrayerTimings)[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  return (
    <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <Clock className="w-4 h-4 text-primary shrink-0" />
          <div className="min-w-0">
            <div className="text-sm font-extrabold text-foreground">مواقيت الصلاة</div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3" />
              {settings.city || settings.country || (data ? data.meta.timezone : '—')}
              {settings.country && settings.city ? ` • ${settings.country}` : ''}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => refresh({ useGeo: true })}
            className="w-8 h-8 rounded-lg bg-secondary/60 flex items-center justify-center active:scale-95"
            aria-label="تحديد الموقع"
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
            title="إشعارات قبل الأذان"
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

      <div className="grid grid-cols-3 gap-2">
        {data && order.map((k) => {
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

      {data?.date?.hijri && (
        <div className="mt-3 text-[11px] text-muted-foreground text-center">
          {data.date.hijri.date} {data.date.hijri.month?.ar} {data.date.hijri.year}هـ
        </div>
      )}

      {openSettings && (
        <div className="mt-3 pt-3 border-t border-border/40 space-y-3">
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
    </div>
  );
};

export default PrayerTimesWidget;
