import React, { useEffect, useMemo, useState } from 'react';
import { MapPin, RefreshCw, Navigation, AlertCircle } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

interface Mosque {
  id: number;
  name: string;
  lat: number;
  lng: number;
  distance: number; // meters
  tags?: Record<string, string>;
}

function distMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const NearbyMosquesPage: React.FC = () => {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [radius, setRadius] = useState(2000); // meters

  const detect = () => {
    setError('');
    if (!navigator.geolocation) { setError('الجهاز لا يدعم تحديد الموقع'); return; }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => { setError('تعذّر تحديد موقعك. فعّل إذن الموقع.'); setLoading(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => { detect(); }, []);

  useEffect(() => {
    if (!coords) return;
    const fetchMosques = async () => {
      setLoading(true); setError('');
      try {
        // Overpass API (OpenStreetMap) - free, no key.
        const query = `[out:json][timeout:25];(node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${coords.lat},${coords.lng});way["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${coords.lat},${coords.lng}););out center 50;`;
        const res = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          body: query,
          headers: { 'Content-Type': 'text/plain' },
        });
        const data = await res.json();
        const list: Mosque[] = (data.elements || []).map((el: any) => {
          const lat = el.lat ?? el.center?.lat;
          const lng = el.lon ?? el.center?.lon;
          if (lat == null || lng == null) return null;
          return {
            id: el.id,
            name: el.tags?.['name:ar'] || el.tags?.name || el.tags?.['name:en'] || 'مسجد',
            lat, lng,
            distance: distMeters(coords.lat, coords.lng, lat, lng),
            tags: el.tags,
          };
        }).filter(Boolean);
        list.sort((a, b) => a.distance - b.distance);
        setMosques(list);
        if (list.length === 0) setError('لم يتم العثور على مساجد قريبة في نطاق البحث.');
      } catch {
        setError('تعذّر جلب المساجد. حاول لاحقاً.');
      } finally {
        setLoading(false);
      }
    };
    fetchMosques();
  }, [coords, radius]);

  const openMap = (m: Mosque) => {
    const url = `https://www.openstreetmap.org/?mlat=${m.lat}&mlon=${m.lng}#map=18/${m.lat}/${m.lng}`;
    window.open(url, '_blank');
  };

  const openDirections = (m: Mosque) => {
    if (!coords) return;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${coords.lat},${coords.lng}&destination=${m.lat},${m.lng}&travelmode=walking`;
    window.open(url, '_blank');
  };

  return (
    <div className="page-container page-with-topbar" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <PageHeader icon={MapPin} title="المساجد القريبة" subtitle="ابحث عن أقرب المساجد إليك" showBack gradient="primary" />

        <div className="card-surface p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-foreground">نطاق البحث: {(radius / 1000).toFixed(1)} كم</span>
            <button onClick={detect} disabled={loading} className="text-xs font-bold text-primary inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10">
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> تحديث
            </button>
          </div>
          <input
            type="range" min={500} max={10000} step={500} value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>0.5 كم</span><span>10 كم</span>
          </div>
        </div>

        {error && (
          <div className="card-surface p-3 mb-4 border-amber-500/40 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-foreground">{error}</p>
          </div>
        )}

        {loading && (
          <div className="card-surface p-8 text-center text-sm text-muted-foreground">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
            جاري البحث عن المساجد...
          </div>
        )}

        <div className="space-y-2">
          {mosques.map((m) => (
            <div key={m.id} className="card-surface p-4">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground text-sm truncate">{m.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {m.distance < 1000
                      ? `${Math.round(m.distance)} متر`
                      : `${(m.distance / 1000).toFixed(2)} كم`}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => openDirections(m)} className="text-[11px] font-bold py-1.5 px-3 rounded-lg gradient-primary text-primary-foreground inline-flex items-center gap-1">
                      <Navigation className="w-3 h-3" /> الاتجاهات
                    </button>
                    <button onClick={() => openMap(m)} className="text-[11px] font-bold py-1.5 px-3 rounded-lg bg-secondary text-foreground">
                      عرض على الخريطة
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!loading && mosques.length === 0 && !error && coords && (
          <div className="card-surface p-6 text-center text-sm text-muted-foreground">
            اضغط "تحديث" أو وسّع نطاق البحث.
          </div>
        )}

        <p className="text-[10px] text-muted-foreground text-center mt-4">البيانات من OpenStreetMap بمساهمة المجتمع</p>
      </div>
    </div>
  );
};

export default NearbyMosquesPage;
