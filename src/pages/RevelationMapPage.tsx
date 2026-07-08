import React, { useMemo, useState } from 'react';
import SEO from '@/components/SEO';
import { Map, MapPin } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { fetchSurahs, type Surah } from '@/lib/api';
import { getCached, setCached } from '@/lib/dataCache';

type Filter = 'all' | 'Meccan' | 'Medinan';

const RevelationMapPage: React.FC = () => {
  const cached = getCached<Surah[]>('surahs');
  const [surahs, setSurahs] = useState<Surah[]>(cached ?? []);
  const [loading, setLoading] = useState(!cached);
  const [filter, setFilter] = useState<Filter>('all');

  React.useEffect(() => {
    if (cached) return;
    fetchSurahs().then((s) => { setCached('surahs', s); setSurahs(s); }).finally(() => setLoading(false));
  }, [cached]);

  const filtered = useMemo(() => filter === 'all' ? surahs : surahs.filter((s) => s.revelationType === filter), [surahs, filter]);
  const meccanCount = useMemo(() => surahs.filter((s) => s.revelationType === 'Meccan').length, [surahs]);
  const medinanCount = surahs.length - meccanCount;

  return (
    <>
      <SEO title="خريطة نزول السور — قلب القرآن" description="تعرف على أماكن نزول السور المكية والمدنية." />
      <div className="page-container page-with-topbar" dir="rtl">
      <div className="page-inner">
        <PageHeader icon={Map} title="خريطة نزول السور" subtitle="مكية ومدنية" showBack />

        {/* Schematic map (CSS positions, not a real geo map) */}
        <div className="relative rounded-3xl overflow-hidden mb-4 h-48 bg-gradient-to-bl from-amber-100/20 via-emerald-100/15 to-sky-100/15 border border-border">
          <div className="absolute inset-0 islamic-pattern opacity-30" />
          <div className="absolute top-8 right-10 flex flex-col items-center">
            <div className="w-14 h-14 rounded-full gradient-gold flex items-center justify-center shadow-emerald">
              <MapPin className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="mt-2 text-xs font-bold font-kufi text-foreground bg-background/80 px-2 py-0.5 rounded-full">مكة المكرمة</span>
            <span className="text-[10px] text-muted-foreground">{meccanCount} سورة</span>
          </div>
          <div className="absolute bottom-6 left-10 flex flex-col items-center">
            <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center shadow-emerald">
              <MapPin className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="mt-2 text-xs font-bold font-kufi text-foreground bg-background/80 px-2 py-0.5 rounded-full">المدينة المنورة</span>
            <span className="text-[10px] text-muted-foreground">{medinanCount} سورة</span>
          </div>
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <line x1="78" y1="20" x2="22" y2="80" stroke="hsl(var(--primary))" strokeWidth="0.4" strokeDasharray="2 2" opacity="0.5" />
          </svg>
        </div>

        <div className="flex gap-2 mb-3">
          {(['all', 'Meccan', 'Medinan'] as Filter[]).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all ${filter === f ? 'gradient-primary text-primary-foreground shadow-emerald' : 'bg-secondary text-foreground'}`}>
              {f === 'all' ? `الكل (${surahs.length})` : f === 'Meccan' ? `مكية (${meccanCount})` : `مدنية (${medinanCount})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground text-sm py-8">جاري التحميل...</div>
        ) : (
          <div className="space-y-2 mb-6">
            {filtered.map((s) => (
              <div key={s.number} className="card-surface flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.revelationType === 'Meccan' ? 'gradient-gold' : 'gradient-primary'}`}>
                  <span className="text-xs font-bold text-primary-foreground">{s.number}</span>
                </div>
                <div className="flex-1 text-right min-w-0">
                  <div className="text-sm font-bold font-kufi text-foreground">سورة {s.name}</div>
                  <div className="text-[11px] text-muted-foreground">{s.numberOfAyahs} آية</div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${s.revelationType === 'Meccan' ? 'bg-accent/20 text-accent-foreground' : 'bg-primary/15 text-primary'}`}>
                  {s.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default RevelationMapPage;
