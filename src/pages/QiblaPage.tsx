import React, { useEffect, useState } from 'react';
import { Compass, Navigation, MapPin } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

// Kaaba coordinates
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

function calcQiblaBearing(lat: number, lng: number): number {
  const φ1 = (lat * Math.PI) / 180;
  const φ2 = (KAABA_LAT * Math.PI) / 180;
  const Δλ = ((KAABA_LNG - lng) * Math.PI) / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

const QiblaPage: React.FC = () => {
  const [qibla, setQibla] = useState<number | null>(null);
  const [heading, setHeading] = useState<number>(0);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState('');
  const [permissionAsked, setPermissionAsked] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) { setError('الجهاز لا يدعم تحديد الموقع'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        setQibla(calcQiblaBearing(latitude, longitude));
      },
      () => setError('تعذّر تحديد موقعك. تأكد من إذن الموقع.')
    );
  }, []);

  const enableCompass = async () => {
    setPermissionAsked(true);
    const DOE: any = (window as any).DeviceOrientationEvent;
    if (DOE && typeof DOE.requestPermission === 'function') {
      try { await DOE.requestPermission(); } catch {}
    }
    const handler = (e: DeviceOrientationEvent & { webkitCompassHeading?: number }) => {
      const h = e.webkitCompassHeading ?? (e.alpha != null ? 360 - e.alpha : null);
      if (h != null) setHeading(h);
    };
    window.addEventListener('deviceorientationabsolute' as any, handler as any, true);
    window.addEventListener('deviceorientation', handler, true);
  };

  const arrowRotation = qibla != null ? qibla - heading : 0;

  return (
    <div className="page-container page-with-topbar" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <PageHeader icon={Compass} title="اتجاه القبلة" subtitle="بوصلة دقيقة نحو الكعبة المشرفة" showBack gradient="gold" />

        <div className="card-surface p-6 flex flex-col items-center text-center">
          <div className="relative w-64 h-64 my-4">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
            <div className="absolute inset-3 rounded-full border border-border bg-gradient-to-br from-secondary/40 to-background flex items-center justify-center">
              {/* Cardinal directions */}
              <span className="absolute top-2 text-xs font-bold text-muted-foreground">ش</span>
              <span className="absolute bottom-2 text-xs font-bold text-muted-foreground">ج</span>
              <span className="absolute right-2 text-xs font-bold text-muted-foreground">ش‌ر</span>
              <span className="absolute left-2 text-xs font-bold text-muted-foreground">غ</span>
              {/* Arrow */}
              <div
                className="transition-transform duration-200 ease-out"
                style={{ transform: `rotate(${arrowRotation}deg)` }}
              >
                <Navigation className="w-24 h-24 text-accent fill-accent drop-shadow-lg" />
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-destructive mb-2">{error}</p>}

          {qibla != null && (
            <div className="text-center mt-2">
              <div className="text-3xl font-bold text-gradient-primary">{Math.round(qibla)}°</div>
              <div className="text-xs text-muted-foreground mt-1">زاوية القبلة عن الشمال الجغرافي</div>
            </div>
          )}

          {coords && (
            <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>{coords.lat.toFixed(3)}، {coords.lng.toFixed(3)}</span>
            </div>
          )}

          {!permissionAsked && (
            <button onClick={enableCompass} className="btn-primary mt-5 px-6 py-2.5 rounded-2xl">
              تفعيل البوصلة
            </button>
          )}
        </div>

        <div className="card-surface p-4 mt-4 text-xs text-muted-foreground leading-relaxed">
          <p>• قف بحيث يكون الجهاز بشكل أفقي.</p>
          <p>• ابتعد عن المعادن والأجهزة الإلكترونية للحصول على دقة أعلى.</p>
          <p>• وجّه السهم نحو الأعلى ليشير إلى القبلة.</p>
        </div>
      </div>
    </div>
  );
};

export default QiblaPage;
