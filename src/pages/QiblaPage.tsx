import React, { useEffect, useRef, useState } from 'react';
import { Compass, Navigation, MapPin, Search, AlertCircle, Crosshair, Ruler } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

function toRad(d: number) { return (d * Math.PI) / 180; }
function toDeg(r: number) { return (r * 180) / Math.PI; }

function calcQiblaBearing(lat: number, lng: number): number {
  const φ1 = toRad(lat);
  const φ2 = toRad(KAABA_LAT);
  const Δλ = toRad(KAABA_LNG - lng);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

// Haversine distance (km)
function distanceKm(lat: number, lng: number): number {
  const R = 6371;
  const dLat = toRad(KAABA_LAT - lat);
  const dLng = toRad(KAABA_LNG - lng);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat)) * Math.cos(toRad(KAABA_LAT)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface Loc { lat: number; lng: number; name?: string; }

const QiblaPage: React.FC = () => {
  const [loc, setLoc] = useState<Loc | null>(() => {
    try { const raw = localStorage.getItem('qibla_loc'); return raw ? JSON.parse(raw) : null; } catch { return null; }
  });
  const [heading, setHeading] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [compassActive, setCompassActive] = useState(false);
  const [error, setError] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ name: string; lat: number; lng: number }>>([]);
  const [searching, setSearching] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');

  const orientationListenerRef = useRef<((e: any) => void) | null>(null);

  // Auto detect on mount if no saved location
  useEffect(() => {
    if (loc) return;
    detectGps();
    // eslint-disable-next-line
  }, []);

  const saveLoc = (l: Loc) => {
    setLoc(l);
    try { localStorage.setItem('qibla_loc', JSON.stringify(l)); } catch {}
  };

  const detectGps = () => {
    setError('');
    if (!navigator.geolocation) { setError('الجهاز لا يدعم تحديد الموقع'); return; }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        let name = 'موقعك الحالي';
        try {
          const r = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&localityLanguage=ar`);
          const d = await r.json();
          name = d.city || d.locality || d.principalSubdivision || name;
        } catch {}
        saveLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude, name });
      },
      () => setError('تعذّر تحديد موقعك. فعّل إذن الموقع أو أدخل المدينة يدوياً.'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Search city via Nominatim
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

  // Compass listener with proper cleanup
  const enableCompass = async () => {
    setError('');
    const DOE: any = (window as any).DeviceOrientationEvent;
    if (DOE && typeof DOE.requestPermission === 'function') {
      try {
        const p = await DOE.requestPermission();
        if (p !== 'granted') { setError('تم رفض إذن البوصلة'); return; }
      } catch { setError('تعذّر طلب إذن البوصلة'); return; }
    }
    if (orientationListenerRef.current) {
      window.removeEventListener('deviceorientationabsolute' as any, orientationListenerRef.current as any, true);
      window.removeEventListener('deviceorientation', orientationListenerRef.current as any, true);
    }
    const handler = (e: DeviceOrientationEvent & { webkitCompassHeading?: number; webkitCompassAccuracy?: number; absolute?: boolean }) => {
      let h: number | null = null;
      if (typeof e.webkitCompassHeading === 'number') {
        h = e.webkitCompassHeading; // iOS already gives compass heading
        if (typeof e.webkitCompassAccuracy === 'number') setAccuracy(e.webkitCompassAccuracy);
      } else if (e.alpha != null) {
        h = 360 - e.alpha;
      }
      if (h != null && isFinite(h)) setHeading((h + 360) % 360);
    };
    orientationListenerRef.current = handler;
    window.addEventListener('deviceorientationabsolute' as any, handler as any, true);
    window.addEventListener('deviceorientation', handler, true);
    setCompassActive(true);
  };

  useEffect(() => () => {
    if (orientationListenerRef.current) {
      window.removeEventListener('deviceorientationabsolute' as any, orientationListenerRef.current as any, true);
      window.removeEventListener('deviceorientation', orientationListenerRef.current as any, true);
    }
  }, []);

  const qibla = loc ? calcQiblaBearing(loc.lat, loc.lng) : null;
  const distance = loc ? distanceKm(loc.lat, loc.lng) : null;
  const arrowRotation = qibla != null ? qibla - heading : 0;

  // Alignment indicator
  const diff = qibla != null ? Math.abs(((qibla - heading + 540) % 360) - 180) : 999;
  const aligned = diff < 5;
  const close = diff < 15;

  const handleManualSubmit = () => {
    const la = parseFloat(manualLat);
    const ln = parseFloat(manualLng);
    if (isNaN(la) || isNaN(ln) || la < -90 || la > 90 || ln < -180 || ln > 180) {
      setError('إحداثيات غير صالحة');
      return;
    }
    saveLoc({ lat: la, lng: ln, name: `${la.toFixed(3)}، ${ln.toFixed(3)}` });
    setManualMode(false);
    setError('');
  };

  return (
    <div className="page-container page-with-topbar" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <PageHeader icon={Compass} title="اتجاه القبلة" subtitle="بوصلة دقيقة نحو الكعبة المشرفة" showBack gradient="gold" />

        {/* Location pills */}
        <div className="card-surface p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span className="font-semibold text-foreground truncate max-w-[200px]">{loc?.name || 'لم يُحدد موقع'}</span>
            </div>
            <span className="text-[10px] text-muted-foreground">
              {loc ? `${loc.lat.toFixed(3)}, ${loc.lng.toFixed(3)}` : ''}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button onClick={detectGps} className="text-[11px] py-1.5 rounded-lg bg-secondary hover:bg-primary/10 text-foreground font-semibold inline-flex items-center justify-center gap-1">
              <Crosshair className="w-3 h-3" /> GPS
            </button>
            <button onClick={() => { setSearchOpen(true); setManualMode(false); }} className="text-[11px] py-1.5 rounded-lg bg-secondary hover:bg-primary/10 text-foreground font-semibold inline-flex items-center justify-center gap-1">
              <Search className="w-3 h-3" /> مدينة
            </button>
            <button onClick={() => { setManualMode(true); setSearchOpen(false); }} className="text-[11px] py-1.5 rounded-lg bg-secondary hover:bg-primary/10 text-foreground font-semibold inline-flex items-center justify-center gap-1">
              إحداثيات
            </button>
          </div>

          {searchOpen && (
            <div className="mt-3 space-y-2">
              <input
                autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن مدينة..."
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              {searching && <p className="text-xs text-muted-foreground text-center">جاري البحث...</p>}
              <div className="max-h-48 overflow-y-auto space-y-1">
                {searchResults.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => { saveLoc({ lat: r.lat, lng: r.lng, name: r.name }); setSearchOpen(false); setSearchQuery(''); }}
                    className="w-full text-right text-xs p-2 rounded-lg bg-background hover:bg-primary/10 text-foreground"
                  >
                    {r.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {manualMode && (
            <div className="mt-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={manualLat} onChange={(e) => setManualLat(e.target.value)}
                  placeholder="خط العرض (Lat)" type="number" step="0.0001"
                  className="px-3 py-2 rounded-xl bg-background border border-border text-foreground text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <input
                  value={manualLng} onChange={(e) => setManualLng(e.target.value)}
                  placeholder="خط الطول (Lng)" type="number" step="0.0001"
                  className="px-3 py-2 rounded-xl bg-background border border-border text-foreground text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <button onClick={handleManualSubmit} className="w-full py-2 rounded-xl gradient-primary text-primary-foreground font-bold text-sm">
                تطبيق الإحداثيات
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

        {/* Compass */}
        <div className="card-surface p-6 flex flex-col items-center text-center">
          <div className="relative w-72 h-72 my-2">
            {/* Outer ring rotates with device heading so cardinals stay true */}
            <div
              className="absolute inset-0 rounded-full border-4 transition-transform duration-300 ease-out"
              style={{
                transform: `rotate(${-heading}deg)`,
                borderColor: aligned ? 'hsl(var(--primary))' : close ? 'hsl(var(--accent))' : 'hsl(var(--border))',
              }}
            >
              <span className="absolute top-1 left-1/2 -translate-x-1/2 text-sm font-bold text-primary">N</span>
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs font-bold text-muted-foreground">S</span>
              <span className="absolute right-1 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">E</span>
              <span className="absolute left-1 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">W</span>
              {/* Tick marks every 30° */}
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 origin-bottom"
                  style={{
                    height: '50%', width: 1, backgroundColor: i % 3 === 0 ? 'hsl(var(--primary)/.4)' : 'hsl(var(--border))',
                    transform: `translate(-50%, -100%) rotate(${i * 30}deg)`,
                  }}
                />
              ))}
              {/* Qibla marker on the rim (rotates with the ring, stays at qibla bearing) */}
              {qibla != null && (
                <div
                  className="absolute top-1/2 left-1/2 origin-bottom"
                  style={{ height: '50%', width: 4, transform: `translate(-50%, -100%) rotate(${qibla}deg)` }}
                >
                  <div className="w-3 h-3 rounded-full gradient-gold shadow-emerald -mt-1 -ml-1 mx-auto" />
                </div>
              )}
            </div>

            {/* Inner face with arrow pointing toward qibla relative to heading */}
            <div className="absolute inset-6 rounded-full bg-gradient-to-br from-secondary/60 to-background flex items-center justify-center">
              <div
                className="transition-transform duration-300 ease-out"
                style={{ transform: `rotate(${arrowRotation}deg)` }}
              >
                <Navigation className={`w-24 h-24 drop-shadow-lg ${aligned ? 'text-primary fill-primary' : 'text-accent fill-accent'}`} />
              </div>
            </div>
          </div>

          {qibla != null ? (
            <>
              <div className="text-3xl font-bold text-gradient-primary">{Math.round(qibla)}°</div>
              <div className="text-[11px] text-muted-foreground mt-1">زاوية القبلة عن الشمال الجغرافي</div>

              {distance != null && (
                <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                  <Ruler className="w-3 h-3" />
                  <span>المسافة إلى الكعبة: {distance.toLocaleString('en-US', { maximumFractionDigits: 0 })} كم</span>
                </div>
              )}

              {compassActive && (
                <div className={`mt-3 text-xs font-bold px-3 py-1 rounded-full ${aligned ? 'bg-primary/15 text-primary' : close ? 'bg-accent/15 text-accent' : 'bg-secondary text-muted-foreground'}`}>
                  {aligned ? 'أنت متجه إلى القبلة' : close ? `قريب — دوّر ${Math.round(diff)}°` : `حرّك الجهاز ${Math.round(diff)}°`}
                </div>
              )}

              {accuracy != null && (
                <div className="mt-2 text-[10px] text-muted-foreground">دقة البوصلة: ±{Math.round(accuracy)}°</div>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">حدد موقعك لحساب اتجاه القبلة</p>
          )}

          {!compassActive && (
            <button onClick={enableCompass} className="mt-5 px-6 py-2.5 rounded-2xl gradient-primary text-primary-foreground font-bold">
              تفعيل البوصلة الحية
            </button>
          )}
        </div>

        <div className="card-surface p-4 mt-4 text-xs text-muted-foreground leading-relaxed space-y-1">
          <p>• ضع الجهاز بشكل أفقي وابتعد عن المعادن.</p>
          <p>• إذا كانت البوصلة غير دقيقة، حرّك الجهاز برسم رقم 8 لمعايرتها.</p>
          <p>• النقطة الذهبية على الإطار تشير إلى اتجاه القبلة الحقيقي.</p>
          <p>• عندما يصبح السهم أخضر فأنت متجه إلى القبلة.</p>
        </div>
      </div>
    </div>
  );
};

export default QiblaPage;
