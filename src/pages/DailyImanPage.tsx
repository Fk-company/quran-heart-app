import React, { useEffect, useState } from 'react';
import { Sunrise, Bell, BellRing, RefreshCw, Loader2 } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useNotifications } from '@/hooks/useNotifications';

interface DailyAyah {
  text: string;
  tafsir: string;
  ref: string;
  surahNum: number;
  ayahNum: number;
}

const KEY = 'daily_iman_v1';

interface Prefs { enabled: boolean; hour: number; minute: number; }
const loadPrefs = (): Prefs => {
  try { return { enabled: false, hour: 6, minute: 30, ...JSON.parse(localStorage.getItem(KEY + '_prefs') || '{}') }; }
  catch { return { enabled: false, hour: 6, minute: 30 }; }
};

const DailyImanPage: React.FC = () => {
  const [ayah, setAyah] = useState<DailyAyah | null>(null);
  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs);
  const { permission, requestPermission, sendNotification, isSupported } = useNotifications();

  const dayOfYear = () => {
    const d = new Date();
    const start = new Date(d.getFullYear(), 0, 0);
    return Math.floor((d.getTime() - start.getTime()) / 86400000);
  };

  const load = async (force = false) => {
    const todayKey = new Date().toISOString().slice(0, 10);
    if (!force) {
      try {
        const cached = JSON.parse(localStorage.getItem(KEY) || 'null');
        if (cached && cached.date === todayKey) { setAyah(cached.ayah); setLoading(false); return; }
      } catch {}
    }
    setLoading(true);
    try {
      // Quran has 6236 ayahs. Pick deterministic per day, or random if forced.
      const num = force ? Math.floor(Math.random() * 6236) + 1 : ((dayOfYear() * 37) % 6236) + 1;
      const [a, t] = await Promise.all([
        fetch(`https://api.alquran.cloud/v1/ayah/${num}/ar`).then((r) => r.json()),
        fetch(`https://api.alquran.cloud/v1/ayah/${num}/ar.muyassar`).then((r) => r.json()),
      ]);
      if (a.code === 200 && t.code === 200) {
        const out: DailyAyah = {
          text: a.data.text,
          tafsir: t.data.text,
          ref: `${a.data.surah.name} - آية ${a.data.numberInSurah}`,
          surahNum: a.data.surah.number,
          ayahNum: a.data.numberInSurah,
        };
        setAyah(out);
        localStorage.setItem(KEY, JSON.stringify({ date: todayKey, ayah: out }));
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const savePrefs = (p: Prefs) => { setPrefs(p); localStorage.setItem(KEY + '_prefs', JSON.stringify(p)); };

  const toggleNotifications = async () => {
    if (!prefs.enabled) {
      const ok = await requestPermission();
      if (!ok) return;
      savePrefs({ ...prefs, enabled: true });
      sendNotification('رسائلك الإيمانية مفعّلة', 'سيصلك إشعار يومي بآية وتفسير.');
    } else {
      savePrefs({ ...prefs, enabled: false });
    }
  };

  // Schedule today's notification
  useEffect(() => {
    if (!prefs.enabled || permission !== 'granted' || !ayah) return;
    const now = new Date();
    const target = new Date();
    target.setHours(prefs.hour, prefs.minute, 0, 0);
    if (target.getTime() < now.getTime()) target.setDate(target.getDate() + 1);
    const diff = target.getTime() - now.getTime();
    if (diff > 0 && diff < 24 * 3600 * 1000) {
      const t = setTimeout(() => {
        sendNotification('رسالة إيمانية', `${ayah.text}\n— ${ayah.ref}`);
      }, diff);
      return () => clearTimeout(t);
    }
  }, [prefs, ayah, permission, sendNotification]);

  return (
    <div className="page-container page-with-topbar" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <PageHeader icon={Sunrise} title="رسائل إيمانية يومية" subtitle="آية وتفسير قصير كل صباح" showBack />

        {loading ? (
          <div className="card-surface text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
        ) : ayah && (
          <div className="ayah-card mb-4 text-center">
            <div className="quran-text text-xl leading-[2.6] text-foreground mb-3">{ayah.text}</div>
            <div className="text-[11px] text-muted-foreground mb-3">{ayah.ref}</div>
            <div className="ayah-tafsir-box text-right text-[13px] leading-[1.9] text-foreground/85">
              {ayah.tafsir}
            </div>
          </div>
        )}

        <button onClick={() => load(true)}
          className="w-full mb-4 rounded-xl bg-secondary hover:bg-primary/10 py-3 text-sm font-bold flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4" /> آية جديدة
        </button>

        <div className="card-surface mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {prefs.enabled ? <BellRing className="w-5 h-5 text-primary" /> : <Bell className="w-5 h-5 text-muted-foreground" />}
              <span className="text-sm font-bold font-kufi">إشعار يومي</span>
            </div>
            <button onClick={toggleNotifications} disabled={!isSupported}
              className={`w-12 h-7 rounded-full transition-all ${prefs.enabled ? 'bg-primary' : 'bg-secondary'} relative`}>
              <div className={`absolute top-1 ${prefs.enabled ? 'right-1' : 'right-6'} w-5 h-5 rounded-full bg-background transition-all`} />
            </button>
          </div>
          {!isSupported && <div className="text-[11px] text-destructive">الإشعارات غير مدعومة في هذا المتصفح.</div>}
          {prefs.enabled && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-muted-foreground">الوقت:</span>
              <input type="time" value={`${String(prefs.hour).padStart(2, '0')}:${String(prefs.minute).padStart(2, '0')}`}
                onChange={(e) => {
                  const [h, m] = e.target.value.split(':').map(Number);
                  savePrefs({ ...prefs, hour: h, minute: m });
                }}
                className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm" />
              <span className="text-[11px] text-muted-foreground">الإشعار يعمل عند فتح التطبيق فقط.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyImanPage;
