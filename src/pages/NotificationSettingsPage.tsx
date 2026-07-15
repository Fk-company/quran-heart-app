import React, { useEffect, useMemo, useState } from 'react';
import SEO from '@/components/SEO';
import { Bell, BellOff, Volume2, VolumeX, Clock, Moon, Mic, Repeat, Play, Square, CheckCircle2, AlertTriangle, Smartphone, Share2, PlusSquare, Info, ShieldCheck, XCircle, Apple } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useNotificationSettings, MUEZZINS, playAdhan, stopAdhan } from '@/hooks/useNotificationSettings';
import { useNotifications } from '@/hooks/useNotifications';

type DiagStatus = 'ok' | 'warn' | 'error' | 'info';

interface Diagnostics {
  isIOS: boolean;
  isSafari: boolean;
  isStandalone: boolean;
  iosVersion: number | null;
  swSupported: boolean;
  notifSupported: boolean;
  timestampTrigger: boolean;
  periodicSync: boolean;
  permission: NotificationPermission | 'unsupported';
}

function detectDiagnostics(): Diagnostics {
  if (typeof window === 'undefined') {
    return {
      isIOS: false, isSafari: false, isStandalone: false, iosVersion: null,
      swSupported: false, notifSupported: false, timestampTrigger: false,
      periodicSync: false, permission: 'unsupported',
    };
  }
  const ua = navigator.userAgent || '';
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && (navigator as any).maxTouchPoints > 1);
  const isSafari = /^((?!chrome|android|crios|fxios|edgios).)*safari/i.test(ua);
  const isStandalone = window.matchMedia?.('(display-mode: standalone)').matches || (navigator as any).standalone === true;
  const iosMatch = ua.match(/OS (\d+)_/);
  const iosVersion = iosMatch ? parseInt(iosMatch[1], 10) : null;
  const swSupported = 'serviceWorker' in navigator;
  const notifSupported = 'Notification' in window;
  const timestampTrigger = typeof window !== 'undefined' && 'TimestampTrigger' in window;
  const periodicSync = swSupported && 'periodicSync' in (ServiceWorkerRegistration.prototype || {});
  const permission = notifSupported ? Notification.permission : 'unsupported';
  return { isIOS, isSafari, isStandalone, iosVersion, swSupported, notifSupported, timestampTrigger, periodicSync, permission };
}

const StatusRow: React.FC<{ icon: React.ElementType; label: string; value: string; status: DiagStatus }> = ({ icon: Icon, label, value, status }) => {
  const colors: Record<DiagStatus, string> = {
    ok: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
    warn: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
    error: 'text-rose-500 bg-rose-500/10 border-rose-500/30',
    info: 'text-sky-500 bg-sky-500/10 border-sky-500/30',
  };
  return (
    <div className="flex items-center gap-3 py-2">
      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${colors[status]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-foreground truncate">{label}</p>
        <p className="text-[11px] text-muted-foreground truncate">{value}</p>
      </div>
    </div>
  );
};

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
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [diag, setDiag] = useState<Diagnostics>(() => detectDiagnostics());

  useEffect(() => {
    setDiag(detectDiagnostics());
  }, [granted]);

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
      <div className="page-inner">
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

        {/* Diagnostics: capabilities & background delivery status */}
        <div className="card-surface p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-bold text-foreground">حالة النظام</h3>
          </div>
          <p className="text-[11px] text-muted-foreground mb-2">
            فحص تلقائي لقدرة جهازك على استقبال إشعارات الأذان في الخلفية حتى بعد إغلاق الصفحة.
          </p>
          <div className="divide-y divide-border/60">
            <StatusRow
              icon={diag.notifSupported ? Bell : BellOff}
              label="دعم الإشعارات"
              value={diag.notifSupported ? 'متاح في هذا المتصفح' : 'غير متاح في هذا المتصفح'}
              status={diag.notifSupported ? 'ok' : 'error'}
            />
            <StatusRow
              icon={granted ? CheckCircle2 : AlertTriangle}
              label="إذن الإشعارات"
              value={diag.permission === 'granted' ? 'مسموح' : diag.permission === 'denied' ? 'مرفوض — فعّله من إعدادات المتصفح' : 'لم يُطلب بعد'}
              status={diag.permission === 'granted' ? 'ok' : diag.permission === 'denied' ? 'error' : 'warn'}
            />
            <StatusRow
              icon={ShieldCheck}
              label="خدمة الخلفية (Service Worker)"
              value={diag.swSupported ? 'مفعّلة — يمكن جدولة الإشعارات' : 'غير مدعومة'}
              status={diag.swSupported ? 'ok' : 'error'}
            />
            <StatusRow
              icon={Clock}
              label="جدولة دقيقة للأوقات (TimestampTrigger)"
              value={diag.timestampTrigger ? 'مدعومة — الأذان يعمل بدقة حتى مع إغلاق التطبيق' : 'غير مدعومة — نستخدم بديلاً محدوداً في الخلفية'}
              status={diag.timestampTrigger ? 'ok' : 'warn'}
            />
            {diag.isIOS && (
              <StatusRow
                icon={Smartphone}
                label="وضع التطبيق المثبّت"
                value={diag.isStandalone ? 'التطبيق مثبّت على الشاشة الرئيسية' : 'لم يُثبَّت بعد — الإشعارات لن تعمل في الخلفية على iOS'}
                status={diag.isStandalone ? 'ok' : 'warn'}
              />
            )}
          </div>
        </div>

        {/* iOS-specific guidance when TimestampTrigger is missing */}
        {diag.isIOS && !diag.timestampTrigger && (
          <div className="card-surface p-4 mb-4 border-2 border-amber-500/40 bg-amber-500/5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
                <Apple className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-foreground mb-1">جهازك يعمل بنظام iOS</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  متصفح Safari لا يدعم الجدولة الدقيقة للإشعارات في الخلفية. لكي يعمل الأذان والتنبيهات حتى بعد إغلاق الصفحة، يجب <span className="font-bold text-foreground">تثبيت التطبيق على الشاشة الرئيسية</span> ثم فتحه من الأيقونة والسماح بالإشعارات.
                </p>
                <button
                  onClick={() => setShowIosGuide(v => !v)}
                  className="mt-3 px-3 py-2 rounded-xl gradient-primary text-primary-foreground text-xs font-bold inline-flex items-center gap-2"
                >
                  <Info className="w-3.5 h-3.5" />
                  {showIosGuide ? 'إخفاء الخطوات' : 'خطوات التثبيت على iOS'}
                </button>
              </div>
            </div>

            {showIosGuide && (
              <ol className="mt-4 space-y-3 text-xs">
                {[
                  { icon: Smartphone, title: 'افتح التطبيق في Safari', desc: 'يجب أن يكون المتصفح Safari تحديداً — الإضافة للشاشة الرئيسية لا تعمل من Chrome على iOS.' },
                  { icon: Share2, title: 'اضغط زر المشاركة', desc: 'الزر في الأسفل بشكل مربع مع سهم متجه للأعلى.' },
                  { icon: PlusSquare, title: 'اختر «إضافة إلى الشاشة الرئيسية»', desc: 'مرّر في القائمة حتى تجد الخيار Add to Home Screen ثم أكّد بـ«إضافة».' },
                  { icon: Bell, title: 'افتح التطبيق من الأيقونة الجديدة', desc: 'ليس من Safari — يجب فتحه من أيقونة الشاشة الرئيسية.' },
                  { icon: CheckCircle2, title: 'اسمح بالإشعارات', desc: 'ارجع لهذه الصفحة واضغط «تفعيل» ليصلك الأذان والتذكيرات في الخلفية.' },
                ].map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 pt-0.5">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="w-4 h-4 text-primary" />
                          <p className="font-bold text-foreground text-[13px]">{step.title}</p>
                        </div>
                        <p className="text-muted-foreground text-[11px] leading-relaxed">{step.desc}</p>
                      </div>
                    </li>
                  );
                })}
                {diag.iosVersion !== null && diag.iosVersion < 16 && (
                  <li className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500">
                    <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <p className="text-[11px] leading-relaxed">
                      يتطلب الأمر iOS 16.4 أو أحدث لدعم إشعارات الويب. جهازك يعمل بنظام أقدم — يرجى التحديث أولاً.
                    </p>
                  </li>
                )}
              </ol>
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
