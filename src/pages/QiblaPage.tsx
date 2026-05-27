import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Compass, Navigation, MapPin, Search, AlertCircle, Crosshair, Ruler,
  Smartphone, RotateCw, Wifi, Sparkles, CheckCircle2, X,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';

const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

const toRad = (d: number) => (d * Math.PI) / 180;
const toDeg = (r: number) => (r * 180) / Math.PI;

function calcQiblaBearing(lat: number, lng: number): number {
  const φ1 = toRad(lat);
  const φ2 = toRad(KAABA_LAT);
  const Δλ = toRad(KAABA_LNG - lng);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function distanceKm(lat: number, lng: number): number {
  const R = 6371;
  const dLat = toRad(KAABA_LAT - lat);
  const dLng = toRad(KAABA_LNG - lng);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat)) * Math.cos(toRad(KAABA_LAT)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface Loc { lat: number; lng: number; name?: string; gpsAccuracy?: number; }

type CompassQuality = 'unknown' | 'poor' | 'fair' | 'good';

interface CalibrationRecord {
  savedAt: number;
  quality: CompassQuality;
  samples: number;
  compassAccuracy: number | null;
  hasAbsolute: boolean;
  gpsAccuracy?: number;
  reason: string;
  recommendations: string[];
  device: string;
}

const CALIBRATION_KEY = 'qibla_calibration_result';

function readCalibration(): CalibrationRecord | null {
  try { const raw = localStorage.getItem(CALIBRATION_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}

function qualityLabel(q: CompassQuality) {
  return q === 'good' ? 'ممتازة' : q === 'fair' ? 'متوسطة' : q === 'poor' ? 'ضعيفة' : 'غير معروفة';
}

function buildCalibrationInsight(args: { loc: Loc | null; compassActive: boolean; hasAbsolute: boolean; compassAccuracy: number | null; samples: number }) {
  const recommendations: string[] = [];
  let quality: CompassQuality = 'good';
  if (!args.loc) { quality = 'poor'; recommendations.push('حدّد موقعك عبر GPS أو المدينة قبل الاعتماد على الاتجاه.'); }
  if (args.loc?.gpsAccuracy && args.loc.gpsAccuracy > 100) { quality = 'fair'; recommendations.push('دقة الموقع منخفضة؛ قف في مكان مفتوح ثم حدّث GPS.'); }
  if (!args.compassActive || args.samples < 18) { quality = 'poor'; recommendations.push('ابدأ المعايرة وحرّك الهاتف على شكل رقم 8 حتى تثبت القراءة.'); }
  if (!args.hasAbsolute) { quality = quality === 'good' ? 'fair' : quality; recommendations.push('الجهاز يستخدم مستشعراً نسبياً؛ أبعده عن المعادن والحقائب المغناطيسية.'); }
  if (args.compassAccuracy != null && args.compassAccuracy >= 25) { quality = 'poor'; recommendations.push('هامش البوصلة كبير؛ أعد المعايرة بعيداً عن الأجهزة الكهربائية.'); }
  else if (args.compassAccuracy != null && args.compassAccuracy >= 15 && quality === 'good') { quality = 'fair'; recommendations.push('الدقة مقبولة، لكن إعادة المعايرة قد تجعلها أفضل.'); }

  const reason = !args.compassActive ? 'البوصلة لم تبدأ بعد'
    : !args.hasAbsolute ? 'نوع المستشعر في هذا الجهاز لا يعطي شمالاً حقيقياً دائماً'
      : args.compassAccuracy != null && args.compassAccuracy >= 25 ? 'هامش خطأ البوصلة مرتفع'
        : args.loc?.gpsAccuracy && args.loc.gpsAccuracy > 100 ? 'موقعك الحالي غير دقيق بما يكفي'
          : 'المعايرة الأخيرة مستقرة ويمكن البدء';

  return { quality, reason, recommendations: recommendations.slice(0, 3) };
}

const KaabaIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    <path d="M14 23 32 13l18 10v30H14V23Z" fill="hsl(var(--foreground))" />
    <path d="M14 23h36v9H14z" fill="hsl(var(--primary))" />
    <path d="M19 27h8M31 27h14" stroke="hsl(var(--primary-foreground))" strokeWidth="2" strokeLinecap="round" />
    <path d="M20 36h24v12H20z" fill="hsl(var(--background))" opacity=".16" />
    <path d="M14 23 32 13l18 10" fill="none" stroke="hsl(var(--border))" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

const QiblaPage: React.FC = () => {
  const [loc, setLoc] = useState<Loc | null>(() => {
    try { const raw = localStorage.getItem('qibla_loc'); return raw ? JSON.parse(raw) : null; } catch { return null; }
  });
  const [heading, setHeading] = useState<number>(0);
  const [smoothHeading, setSmoothHeading] = useState<number>(0);
  const [compassAccuracy, setCompassAccuracy] = useState<number | null>(null);
  const [hasAbsolute, setHasAbsolute] = useState(false);
  const [compassActive, setCompassActive] = useState(false);
  const [error, setError] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ name: string; lat: number; lng: number }>>([]);
  const [searching, setSearching] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [showCalibration, setShowCalibration] = useState(false);
  const [calibSamples, setCalibSamples] = useState(0);
  const [lastCalibration, setLastCalibration] = useState<CalibrationRecord | null>(() => readCalibration());
  const lastVibrateAlignedRef = useRef(false);

  const orientationListenerRef = useRef<((e: any) => void) | null>(null);
  const rawHeadingRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  // Smooth heading via rAF (low-pass filter), keeps the dial responsive yet steady
  useEffect(() => {
    const tick = () => {
      setSmoothHeading(prev => {
        let target = rawHeadingRef.current;
        let diff = target - prev;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;
        const next = (prev + diff * 0.18 + 360) % 360;
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  // Auto detect on mount if no saved location
  useEffect(() => {
    if (!loc) detectGps();
    // eslint-disable-next-line
  }, []);

  const saveLoc = (l: Loc) => {
    setLoc(l);
    try { localStorage.setItem('qibla_loc', JSON.stringify(l)); } catch {}
  };

  const detectGps = () => {
    setError('');
    if (!navigator.geolocation) { setError('الجهاز لا يدعم تحديد الموقع.'); return; }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        let name = 'موقعك الحالي';
        try {
          const r = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&localityLanguage=ar`);
          const d = await r.json();
          name = d.city || d.locality || d.principalSubdivision || name;
        } catch {}
        saveLoc({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          name,
          gpsAccuracy: pos.coords.accuracy,
        });
      },
      () => setError('تعذّر تحديد موقعك. فعّل إذن الموقع أو أدخل المدينة يدوياً.'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // City search via Nominatim
  useEffect(() => {
    if (!searchOpen) return;
    const q = searchQuery.trim();
    if (q.length < 2) { setSearchResults([]); return; }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        setSearching(true);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=8&accept-language=ar,en`,
          { signal: ctrl.signal }
        );
        const data = await res.json();
        setSearchResults(
          (data || []).map((r: any) => ({
            name: r.display_name?.split(',').slice(0, 2).join('،') || r.display_name,
            lat: parseFloat(r.lat),
            lng: parseFloat(r.lon),
          }))
        );
      } catch {} finally { setSearching(false); }
    }, 350);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [searchQuery, searchOpen]);

  const enableCompass = async () => {
    setError('');
    setCalibSamples(0);
    setShowCalibration(true);
    const DOE: any = (window as any).DeviceOrientationEvent;
    if (DOE && typeof DOE.requestPermission === 'function') {
      try {
        const p = await DOE.requestPermission();
        if (p !== 'granted') { setError('تم رفض إذن البوصلة'); setShowCalibration(false); return; }
      } catch { setError('تعذّر طلب إذن البوصلة'); setShowCalibration(false); return; }
    }
    if (orientationListenerRef.current) {
      window.removeEventListener('deviceorientationabsolute' as any, orientationListenerRef.current as any, true);
      window.removeEventListener('deviceorientation', orientationListenerRef.current as any, true);
    }
    const handler = (e: DeviceOrientationEvent & { webkitCompassHeading?: number; webkitCompassAccuracy?: number; absolute?: boolean }) => {
      let h: number | null = null;
      if (typeof e.webkitCompassHeading === 'number') {
        h = e.webkitCompassHeading;
        if (typeof e.webkitCompassAccuracy === 'number') setCompassAccuracy(e.webkitCompassAccuracy);
        setHasAbsolute(true);
      } else if (e.alpha != null) {
        h = 360 - e.alpha;
        if (e.absolute) setHasAbsolute(true);
      }
      if (h != null && isFinite(h)) {
        rawHeadingRef.current = (h + 360) % 360;
        setHeading(rawHeadingRef.current);
        setCalibSamples(s => s + 1);
      }
    };
    orientationListenerRef.current = handler;
    window.addEventListener('deviceorientationabsolute' as any, handler as any, true);
    window.addEventListener('deviceorientation', handler, true);
    setCompassActive(true);
  };

  // Auto-dismiss calibration once we have enough samples & decent accuracy
  useEffect(() => {
    if (!showCalibration) return;
    const ok = calibSamples > 25 && (compassAccuracy == null || compassAccuracy < 25);
    if (ok) {
      const t = setTimeout(() => finishCalibration(), 600);
      return () => clearTimeout(t);
    }
  }, [calibSamples, compassAccuracy, showCalibration]);

  useEffect(() => () => {
    if (orientationListenerRef.current) {
      window.removeEventListener('deviceorientationabsolute' as any, orientationListenerRef.current as any, true);
      window.removeEventListener('deviceorientation', orientationListenerRef.current as any, true);
    }
  }, []);

  const qibla = loc ? calcQiblaBearing(loc.lat, loc.lng) : null;
  const distance = loc ? distanceKm(loc.lat, loc.lng) : null;
  const arrowRotation = qibla != null ? qibla - smoothHeading : 0;

  const diff = qibla != null ? Math.abs(((qibla - smoothHeading + 540) % 360) - 180) : 999;
  const aligned = diff < 4;
  const close = diff < 12;

  // Vibrate once when entering aligned state
  useEffect(() => {
    if (!compassActive) return;
    if (aligned && !lastVibrateAlignedRef.current) {
      lastVibrateAlignedRef.current = true;
      try { (navigator as any).vibrate?.([60, 40, 60]); } catch {}
    } else if (!aligned && lastVibrateAlignedRef.current) {
      lastVibrateAlignedRef.current = false;
    }
  }, [aligned, compassActive]);

  // Uncertainty reasons
  const uncertainty = useMemo(() => {
    const items: { label: string; ok: boolean; hint?: string }[] = [];
    items.push({
      ok: !!loc,
      label: loc ? `موقع محدد${loc.gpsAccuracy ? ` (±${Math.round(loc.gpsAccuracy)}م)` : ''}` : 'لا يوجد موقع',
      hint: loc?.gpsAccuracy && loc.gpsAccuracy > 100 ? 'دقة GPS منخفضة — اخرج إلى مكان مفتوح.' : undefined,
    });
    items.push({
      ok: compassActive,
      label: compassActive ? 'البوصلة مفعّلة' : 'البوصلة غير مفعّلة',
      hint: !compassActive ? 'اضغط زر التفعيل واسمح للإذن.' : undefined,
    });
    items.push({
      ok: hasAbsolute,
      label: hasAbsolute ? 'استشعار مطلق متاح' : 'استشعار مطلق غير متاح',
      hint: !hasAbsolute ? 'متصفحك أو جهازك لا يدعم البوصلة الحقيقية؛ القراءة قد تنحرف.' : undefined,
    });
    items.push({
      ok: compassAccuracy == null ? compassActive : compassAccuracy < 20,
      label: compassAccuracy != null ? `دقة البوصلة ±${Math.round(compassAccuracy)}°` : 'دقة البوصلة غير معروفة',
      hint: compassAccuracy != null && compassAccuracy >= 20 ? 'حرّك الهاتف بشكل رقم 8 للمعايرة.' : undefined,
    });
    return items;
  }, [loc, compassActive, hasAbsolute, compassAccuracy]);

  const calibrationInsight = useMemo(() => buildCalibrationInsight({
    loc, compassActive, hasAbsolute, compassAccuracy, samples: calibSamples,
  }), [loc, compassActive, hasAbsolute, compassAccuracy, calibSamples]);

  const finishCalibration = () => {
    const insight = buildCalibrationInsight({ loc, compassActive, hasAbsolute, compassAccuracy, samples: calibSamples });
    const record: CalibrationRecord = {
      savedAt: Date.now(),
      quality: insight.quality,
      samples: calibSamples,
      compassAccuracy,
      hasAbsolute,
      gpsAccuracy: loc?.gpsAccuracy,
      reason: insight.reason,
      recommendations: insight.recommendations.length ? insight.recommendations : ['استخدم الهاتف أفقياً وتحقق من خلو المكان من المعادن.'],
      device: navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad') ? 'iOS' : navigator.userAgent.includes('Android') ? 'Android' : 'متصفح سطح المكتب',
    };
    try { localStorage.setItem(CALIBRATION_KEY, JSON.stringify(record)); } catch {}
    setLastCalibration(record);
    setShowCalibration(false);
  };

  const handleManualSubmit = () => {
    const la = parseFloat(manualLat);
    const ln = parseFloat(manualLng);
    if (isNaN(la) || isNaN(ln) || la < -90 || la > 90 || ln < -180 || ln > 180) {
      setError('إحداثيات غير صالحة'); return;
    }
    saveLoc({ lat: la, lng: ln, name: `${la.toFixed(3)}، ${ln.toFixed(3)}` });
    setManualMode(false); setError('');
  };

  const ringColor = aligned ? 'hsl(var(--primary))' : close ? 'hsl(var(--accent))' : 'hsl(var(--border))';
  const qualityPercent = lastCalibration?.quality === 'good' ? 92 : lastCalibration?.quality === 'fair' ? 68 : lastCalibration?.quality === 'poor' ? 38 : 18;

  return (
    <div className="page-container page-with-topbar" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto pb-8">
        <PageHeader icon={Compass} title="اتجاه القبلة" subtitle="بوصلة احترافية نحو الكعبة المشرفة" showBack gradient="gold" />

        {/* ============ Location Bar ============ */}
        <div className="card-surface p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-foreground truncate">{loc?.name || 'لم يُحدد موقع'}</div>
                <div className="text-[10px] text-muted-foreground">
                  {loc ? `${loc.lat.toFixed(3)}, ${loc.lng.toFixed(3)}` : 'حدّد موقعك للبدء'}
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={detectGps} className="text-[11px] py-2 rounded-xl bg-secondary hover:bg-primary/10 text-foreground font-bold inline-flex items-center justify-center gap-1">
              <Crosshair className="w-3.5 h-3.5" /> GPS
            </button>
            <button onClick={() => { setSearchOpen(v => !v); setManualMode(false); }} className="text-[11px] py-2 rounded-xl bg-secondary hover:bg-primary/10 text-foreground font-bold inline-flex items-center justify-center gap-1">
              <Search className="w-3.5 h-3.5" /> مدينة
            </button>
            <button onClick={() => { setManualMode(v => !v); setSearchOpen(false); }} className="text-[11px] py-2 rounded-xl bg-secondary hover:bg-primary/10 text-foreground font-bold inline-flex items-center justify-center gap-1">
              إحداثيات
            </button>
          </div>

          {searchOpen && (
            <div className="mt-3 space-y-2">
              <input autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن مدينة..."
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
              {searching && <p className="text-xs text-muted-foreground text-center">جاري البحث...</p>}
              <div className="max-h-48 overflow-y-auto space-y-1">
                {searchResults.map((r, i) => (
                  <button key={i} onClick={() => { saveLoc({ lat: r.lat, lng: r.lng, name: r.name }); setSearchOpen(false); setSearchQuery(''); }}
                    className="w-full text-right text-xs p-2 rounded-lg bg-background hover:bg-primary/10 text-foreground">
                    {r.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {manualMode && (
            <div className="mt-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input value={manualLat} onChange={(e) => setManualLat(e.target.value)} placeholder="خط العرض" type="number" step="0.0001"
                  className="px-3 py-2 rounded-xl bg-background border border-border text-foreground text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/40" />
                <input value={manualLng} onChange={(e) => setManualLng(e.target.value)} placeholder="خط الطول" type="number" step="0.0001"
                  className="px-3 py-2 rounded-xl bg-background border border-border text-foreground text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
              <button onClick={handleManualSubmit} className="w-full py-2 rounded-xl gradient-primary text-primary-foreground font-bold text-sm">
                تطبيق
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="card-surface p-3 mb-4 border-amber-500/40 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-foreground">{error}</p>
          </div>
        )}

        {lastCalibration && (
          <div className="card-surface p-4 mb-4 border-primary/25">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <div className="text-[11px] text-muted-foreground">توصيات قبل الاستخدام من آخر معايرة</div>
                <div className="text-sm font-extrabold text-foreground">الدقة {qualityLabel(lastCalibration.quality)} · {lastCalibration.reason}</div>
              </div>
              <div className="w-12 h-12 rounded-2xl gradient-gold flex items-center justify-center shrink-0">
                <KaabaIcon className="w-7 h-7" />
              </div>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden mb-3">
              <div className="h-full gradient-primary transition-all" style={{ width: `${qualityPercent}%` }} />
            </div>
            <div className="space-y-1.5">
              {lastCalibration.recommendations.map((r, i) => (
                <div key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                  <span>{r}</span>
                </div>
              ))}
            </div>
            <div className="text-[10px] text-muted-foreground mt-3">
              آخر حفظ: {new Date(lastCalibration.savedAt).toLocaleString('ar')} · {lastCalibration.device}
            </div>
          </div>
        )}

        {/* ============ Compass Card ============ */}
        <div className="card-surface p-6 flex flex-col items-center text-center relative overflow-hidden border-primary/20">
          {/* glow background */}
          <div
            className="absolute inset-0 opacity-40 transition-opacity duration-500 pointer-events-none"
            style={{
              background: aligned
                ? 'radial-gradient(circle at center, hsl(var(--primary)/.25), transparent 60%)'
                : close
                  ? 'radial-gradient(circle at center, hsl(var(--accent)/.18), transparent 60%)'
                  : 'transparent',
            }}
          />

          <div className="relative w-72 h-72 my-2 z-10">
            <div className="absolute -inset-3 rounded-full opacity-70 pointer-events-none"
              style={{ background: 'conic-gradient(from 0deg, hsl(var(--primary)/.14), transparent 18%, hsl(var(--accent)/.12), transparent 46%, hsl(var(--primary)/.14))' }} />
            {/* Outer ring with cardinals — rotates with heading so N stays true */}
            <div
              className="absolute inset-0 rounded-full border-[3px] transition-[border-color] duration-300 overflow-hidden"
              style={{
                transform: `rotate(${-smoothHeading}deg)`,
                borderColor: ringColor,
                boxShadow: aligned ? '0 0 32px hsl(var(--primary)/.45)' : undefined,
                background:
                  'radial-gradient(circle at center, hsl(var(--background)) 48%, hsl(var(--secondary)) 72%, hsl(var(--primary)/.10) 100%)',
              }}
            >
              {/* Tick marks */}
              {Array.from({ length: 72 }).map((_, i) => {
                const isMajor = i % 9 === 0;
                const isMid = i % 3 === 0;
                return (
                  <div key={i} className="absolute top-1/2 left-1/2 origin-bottom"
                    style={{
                      height: '50%',
                      width: isMajor ? 2 : 1,
                      background: isMajor ? 'hsl(var(--primary)/.7)' : isMid ? 'hsl(var(--border))' : 'hsl(var(--border)/.5)',
                      transform: `translate(-50%, -100%) rotate(${i * 5}deg)`,
                    }} />
                );
              })}
              {/* Cardinals */}
              <span className="absolute top-2 left-1/2 -translate-x-1/2 text-sm font-extrabold text-primary">N</span>
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-bold text-muted-foreground">S</span>
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">E</span>
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">W</span>

              {/* Qibla marker on the rim */}
              {qibla != null && (
                <div className="absolute top-1/2 left-1/2 origin-bottom"
                  style={{ height: '50%', width: 28, transform: `translate(-50%, -100%) rotate(${qibla}deg)` }}>
                  <div className="w-10 h-10 -mt-5 -mr-1.5 mx-auto rounded-2xl gradient-gold flex items-center justify-center shadow-emerald border border-primary/40"
                    style={{ transform: `rotate(${smoothHeading - qibla}deg)` }}>
                    <KaabaIcon className="w-7 h-7" />
                  </div>
                </div>
              )}
            </div>

            {/* Inner face */}
            <div className="absolute inset-8 rounded-full flex items-center justify-center"
              style={{
                background: 'radial-gradient(circle at 30% 30%, hsl(var(--secondary)), hsl(var(--background)))',
                boxShadow: 'inset 0 0 24px hsl(var(--foreground)/.08)',
              }}>
              <div className="transition-transform duration-150 ease-out" style={{ transform: `rotate(${arrowRotation}deg)` }}>
                <Navigation
                  className={`w-24 h-24 drop-shadow-lg transition-colors ${
                    aligned ? 'text-primary fill-primary' : close ? 'text-accent fill-accent' : 'text-muted-foreground fill-muted-foreground/40'
                  }`}
                  strokeWidth={1.5}
                />
              </div>
            </div>

            {/* Center lock */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background border-2 border-primary/50 z-20 flex items-center justify-center shadow-emerald">
              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            </div>
          </div>

          {qibla != null ? (
            <>
              <div className="grid grid-cols-3 gap-3 w-full mt-2 mb-2">
                <div className="text-center">
                  <div className="text-[10px] text-muted-foreground">القبلة</div>
                  <div className="text-lg font-bold text-gradient-primary">{Math.round(qibla)}°</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-muted-foreground">اتجاهك</div>
                  <div className="text-lg font-bold text-foreground">{compassActive ? `${Math.round(smoothHeading)}°` : '—'}</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-1"><Ruler className="w-2.5 h-2.5" />المسافة</div>
                  <div className="text-lg font-bold text-foreground">{distance != null ? Math.round(distance).toLocaleString('en-US') : '—'}<span className="text-xs"> كم</span></div>
                </div>
              </div>

              {compassActive && (
                <div className={`mt-2 text-xs font-bold px-4 py-1.5 rounded-full inline-flex items-center gap-1.5 ${
                  aligned ? 'bg-primary/15 text-primary' : close ? 'bg-accent/15 text-accent' : 'bg-secondary text-muted-foreground'
                }`}>
                  {aligned ? <><CheckCircle2 className="w-3.5 h-3.5" /> أنت متجه إلى القبلة</>
                    : close ? <>قريب — دوّر {Math.round(diff)}°</>
                    : <>حرّك الجهاز {Math.round(diff)}°</>}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">حدّد موقعك لحساب اتجاه القبلة</p>
          )}

          {!compassActive && (
            <button onClick={enableCompass} className="mt-5 px-6 py-2.5 rounded-2xl gradient-primary text-primary-foreground font-bold inline-flex items-center gap-2">
              <Compass className="w-4 h-4" /> تفعيل البوصلة الحية
            </button>
          )}
          {compassActive && (
            <button onClick={() => { setShowCalibration(true); setCalibSamples(0); }} className="mt-4 text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 underline-offset-2 hover:underline">
              <RotateCw className="w-3 h-3" /> إعادة المعايرة
            </button>
          )}
        </div>

        {/* ============ Uncertainty / Diagnostics ============ */}
        <div className="card-surface p-4 mt-4">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" /> دقة التوجيه وأسباب عدم اليقين
          </h3>
          <div className="space-y-2">
            {uncertainty.map((u, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${u.ok ? 'bg-primary' : 'bg-amber-500'}`} />
                <div className="flex-1">
                  <div className={`font-semibold ${u.ok ? 'text-foreground' : 'text-amber-600 dark:text-amber-400'}`}>{u.label}</div>
                  {u.hint && <div className="text-muted-foreground text-[11px] mt-0.5">{u.hint}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-surface p-4 mt-4 text-xs text-muted-foreground leading-relaxed space-y-1">
          <div className="flex items-center gap-1.5 text-foreground font-bold text-xs mb-2">
            <Smartphone className="w-3.5 h-3.5 text-primary" /> نصائح لدقة أفضل
          </div>
          <p>• ضع الجهاز بشكل أفقي وابتعد عن المعادن والأجهزة الكهربائية.</p>
          <p>• إذا كانت البوصلة غير دقيقة، حرّك الجهاز بشكل رقم 8 لمعايرتها.</p>
          <p>• أيقونة الكعبة على الإطار تشير إلى اتجاه القبلة الحقيقي.</p>
          <p>• عندما يصبح السهم أخضر ويهتزّ الجهاز فأنت متجه إلى القبلة.</p>
        </div>
      </div>

      {/* ============ Calibration Overlay ============ */}
      {showCalibration && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex items-center justify-center p-6" dir="rtl">
          <div className="card-surface p-6 max-w-sm w-full text-center relative">
            <button onClick={finishCalibration} className="absolute top-3 left-3 w-8 h-8 rounded-full bg-secondary inline-flex items-center justify-center text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
            <div className="w-16 h-16 mx-auto rounded-full gradient-gold flex items-center justify-center shadow-emerald mb-4">
              <RotateCw className="w-8 h-8 text-primary-foreground animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">معايرة البوصلة</h3>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              حرّك جهازك في الهواء على شكل رقم 8 عدة مرات لتثبيت قراءة الاتجاه.
            </p>

            {/* Figure-8 animation */}
            <div className="relative w-44 h-32 mx-auto mb-4">
              <svg viewBox="0 0 200 120" className="w-full h-full">
                <path
                  d="M 50 60 C 50 20, 100 20, 100 60 C 100 100, 150 100, 150 60 C 150 20, 100 20, 100 60 C 100 100, 50 100, 50 60 Z"
                  fill="none"
                  stroke="hsl(var(--primary)/.25)"
                  strokeWidth="3"
                  strokeDasharray="6 4"
                />
                <circle r="6" fill="hsl(var(--primary))">
                  <animateMotion dur="3s" repeatCount="indefinite"
                    path="M 50 60 C 50 20, 100 20, 100 60 C 100 100, 150 100, 150 60 C 150 20, 100 20, 100 60 C 100 100, 50 100, 50 60 Z" />
                </circle>
              </svg>
            </div>

            {/* Progress */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                <span>تقدم المعايرة</span>
                <span className="font-bold text-foreground">{Math.min(100, Math.round((calibSamples / 25) * 100))}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full gradient-primary transition-all" style={{ width: `${Math.min(100, (calibSamples / 25) * 100)}%` }} />
              </div>
            </div>

            <div className="text-xs text-muted-foreground space-y-1 text-right bg-secondary/50 p-3 rounded-xl">
              <div className="flex items-center gap-1.5 text-foreground font-bold">
                <Wifi className="w-3 h-3" /> الحالة
              </div>
              <p>• الاستشعار: {hasAbsolute ? 'مطلق (دقيق)' : 'نسبي (قد ينحرف)'}</p>
              <p>• قراءات مستلمة: {calibSamples}</p>
              {compassAccuracy != null && <p>• هامش الخطأ: ±{Math.round(compassAccuracy)}°</p>}
              <p>• التقييم الحالي: {qualityLabel(calibrationInsight.quality)}</p>
              <p>• سبب عدم اليقين: {calibrationInsight.reason}</p>
            </div>

            <button onClick={finishCalibration} className="mt-4 w-full gradient-primary text-primary-foreground py-2.5 rounded-2xl font-bold text-sm">
              حفظ المعايرة والبدء
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QiblaPage;
