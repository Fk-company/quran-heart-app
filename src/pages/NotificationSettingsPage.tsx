import React, { useState } from 'react';
import SEO from '@/components/SEO';
import { Bell, BellOff, Volume2, VolumeX, Clock, Moon, Mic, Repeat, Play, Square, CheckCircle2 } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useNotificationSettings, MUEZZINS, playAdhan, stopAdhan } from '@/hooks/useNotificationSettings';
import { useNotifications } from '@/hooks/useNotifications';

const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void }> = ({ checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    className={`w-12 h-7 rounded-full transition-colors relative shrink-0 ${checked ? 'bg-primary' : 'bg-muted'}`}
  >
    <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-1 transition-all ${checked ? 'left-1' : 'left-6'}`} />
  </button>
);

const NotificationSettingsPage: React.FC = () => {
  const { settings, update, reset } = useNotificationSettings();
  const { requestPermission, sendNotification, permission, isSupported } = useNotifications();
  const [previewing, setPreviewing] = useState(false);
  const [granted, setGranted] = useState(permission === 'granted');

  const askPerm = async () => {
    const ok = await requestPermission();
    setGranted(ok);
  };

  const previewAdhan = () => {
    if (previewing) { stopAdhan(); setPreviewing(false); return; }
    playAdhan();
    setPreviewing(true);
    setTimeout(() => setPreviewing(false), 8000);
  };

  const testNotify = () => {
    sendNotification('اختبار الإشعار', 'هذه معاينة كما ستظهر إشعاراتك');
  };

  return (
    <>
      <SEO title="إعدادات الإشعارات والأذان — قلب القرآن" description="تحكم بإشعارات الأذان والتذكيرات واختر صوت المؤذن وأوقات الهدوء." />
      <div className="page-container page-with-topbar" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <PageHeader icon={Bell} title="إعدادات الإشعارات" subtitle="تحكم كامل بالتذكيرات والأذان" showBack gradient="primary" />

        {/* Permission status */}
        {isSupported && (
          <div className={`card-surface p-4 mb-4 flex items-center gap-3 ${granted ? 'border-primary/30' : 'border-amber-500/30'}`}>
            {granted ? <CheckCircle2 className="w-6 h-6 text-primary" /> : <BellOff className="w-6 h-6 text-amber-500" />}
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">{granted ? 'الإشعارات مفعّلة' : 'الإشعارات غير مفعّلة'}</p>
              <p className="text-[11px] text-muted-foreground">{granted ? 'يمكنك استقبال التذكيرات' : 'فعّل الإذن من المتصفح'}</p>
            </div>
            {!granted && (
              <button onClick={askPerm} className="px-3 py-2 rounded-xl gradient-primary text-primary-foreground text-xs font-bold">تفعيل</button>
            )}
            {granted && (
              <button onClick={testNotify} className="px-3 py-2 rounded-xl bg-secondary text-foreground text-xs font-bold">اختبار</button>
            )}
          </div>
        )}

        {/* Master switch */}
        <div className="card-surface p-4 mb-4 flex items-center gap-3">
          <Bell className="w-5 h-5 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">تفعيل كل الإشعارات</p>
            <p className="text-[11px] text-muted-foreground">المفتاح الرئيسي لجميع التنبيهات</p>
          </div>
          <Toggle checked={settings.enabled} onChange={v => update('enabled', v)} />
        </div>

        {/* Prayer notifications */}
        <div className={`card-surface p-4 mb-4 space-y-3 ${!settings.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-accent" />
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">تنبيه مواقيت الصلاة</p>
              <p className="text-[11px] text-muted-foreground">إشعار عند دخول الوقت</p>
            </div>
            <Toggle checked={settings.prayerEnabled} onChange={v => update('prayerEnabled', v)} />
          </div>

          {settings.prayerEnabled && (
            <div className="pr-8">
              <label className="block">
                <span className="text-xs font-semibold text-muted-foreground mb-1.5 block">تنبيه مبكّر قبل الصلاة</span>
                <div className="flex flex-wrap gap-2">
                  {[0, 5, 10, 15, 30].map(n => (
                    <button
                      key={n}
                      onClick={() => update('prayerEarlyMinutes', n)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                        settings.prayerEarlyMinutes === n ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'
                      }`}
                    >{n === 0 ? 'بدون' : `${n} دقيقة`}</button>
                  ))}
                </div>
              </label>
            </div>
          )}
        </div>

        {/* Adhan audio */}
        <div className={`card-surface p-4 mb-4 space-y-3 ${!settings.enabled || !settings.prayerEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center gap-3">
            {settings.adhanAudio ? <Volume2 className="w-5 h-5 text-primary" /> : <VolumeX className="w-5 h-5 text-muted-foreground" />}
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">تشغيل صوت الأذان</p>
              <p className="text-[11px] text-muted-foreground">عند دخول وقت الصلاة</p>
            </div>
            <Toggle checked={settings.adhanAudio} onChange={v => update('adhanAudio', v)} />
          </div>

          {settings.adhanAudio && (
            <>
              <div className="pr-8 space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground block">اختر المؤذن</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {MUEZZINS.map(m => (
                    <button
                      key={m.id}
                      onClick={() => update('adhanMuezzin', m.id)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold border-2 transition-all text-right ${
                        settings.adhanMuezzin === m.id
                          ? 'bg-primary/10 border-primary text-primary'
                          : 'bg-secondary border-transparent text-foreground'
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{m.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={previewAdhan}
                className="w-full mt-2 py-2.5 rounded-xl bg-accent/15 text-accent border-2 border-accent/40 font-bold text-sm inline-flex items-center justify-center gap-2"
              >
                {previewing ? <><Square className="w-4 h-4" /> إيقاف المعاينة</> : <><Play className="w-4 h-4" /> معاينة الأذان</>}
              </button>
            </>
          )}
        </div>

        {/* Adhkar */}
        <div className={`card-surface p-4 mb-4 space-y-3 ${!settings.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center gap-3">
            <Repeat className="w-5 h-5 text-accent" />
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">تذكير الأذكار</p>
              <p className="text-[11px] text-muted-foreground">أذكار الصباح والمساء وغيرها</p>
            </div>
            <Toggle checked={settings.adhkarEnabled} onChange={v => update('adhkarEnabled', v)} />
          </div>
          {settings.adhkarEnabled && (
            <div className="pr-8">
              <span className="text-xs font-semibold text-muted-foreground mb-1.5 block">التكرار</span>
              <div className="flex flex-wrap gap-2">
                {[3, 6, 8, 12, 24].map(n => (
                  <button
                    key={n}
                    onClick={() => update('adhkarHours', n)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                      settings.adhkarHours === n ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'
                    }`}
                  >كل {n} ساعات</button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Wird reminder */}
        <div className={`card-surface p-4 mb-4 space-y-3 ${!settings.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">تذكير الورد اليومي</p>
              <p className="text-[11px] text-muted-foreground">وقت ثابت للقراءة اليومية</p>
            </div>
            <Toggle checked={settings.wirdReminder} onChange={v => update('wirdReminder', v)} />
          </div>
          {settings.wirdReminder && (
            <div className="pr-8 flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">الوقت:</span>
              <input
                type="time"
                value={settings.wirdTime}
                onChange={e => update('wirdTime', e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          )}
        </div>

        {/* Weekly challenge */}
        <div className={`card-surface p-4 mb-4 ${!settings.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-accent" />
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">تذكير التحدي الأسبوعي</p>
              <p className="text-[11px] text-muted-foreground">إشعار بداية ومتابعة التحدي</p>
            </div>
            <Toggle checked={settings.challengeReminder} onChange={v => update('challengeReminder', v)} />
          </div>
        </div>

        {/* Quiet hours */}
        <div className={`card-surface p-4 mb-4 space-y-3 ${!settings.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center gap-3">
            <Moon className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">ساعات الهدوء</p>
              <p className="text-[11px] text-muted-foreground">إيقاف الإشعارات الصوتية ليلاً</p>
            </div>
            <Toggle checked={settings.quietHoursEnabled} onChange={v => update('quietHoursEnabled', v)} />
          </div>
          {settings.quietHoursEnabled && (
            <div className="pr-8 grid grid-cols-2 gap-2">
              <label className="block">
                <span className="text-[11px] font-semibold text-muted-foreground block mb-1">من</span>
                <input type="time" value={settings.quietStart} onChange={e => update('quietStart', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-secondary border border-border text-foreground text-sm" />
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold text-muted-foreground block mb-1">إلى</span>
                <input type="time" value={settings.quietEnd} onChange={e => update('quietEnd', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-secondary border border-border text-foreground text-sm" />
              </label>
            </div>
          )}
        </div>

        <button onClick={reset} className="w-full mb-6 py-3 rounded-2xl bg-secondary text-foreground font-bold text-sm">
          استعادة الإعدادات الافتراضية
        </button>
      </div>
    </div>
    </>
  );
};

export default NotificationSettingsPage;
