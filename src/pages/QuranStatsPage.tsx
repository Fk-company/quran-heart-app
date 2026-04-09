import React, { useEffect, useState } from 'react';
import { fetchSurahs, type Surah } from '@/lib/api';
import { BarChart3, BookOpen, Hash, FileText, Type } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

const QuranStatsPage: React.FC = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSurahs().then(data => { setSurahs(data); setLoading(false); });
  }, []);

  const totalAyahs = surahs.reduce((a, s) => a + s.numberOfAyahs, 0);
  const meccan = surahs.filter(s => s.revelationType === 'Meccan').length;
  const medinan = surahs.filter(s => s.revelationType === 'Medinan').length;
  const longestSurah = surahs.reduce((a, s) => s.numberOfAyahs > (a?.numberOfAyahs || 0) ? s : a, surahs[0]);
  const shortestSurah = surahs.reduce((a, s) => s.numberOfAyahs < (a?.numberOfAyahs || 999) ? s : a, surahs[0]);

  const stats = [
    { label: 'عدد السور', value: '114', icon: BookOpen, color: 'bg-primary/10 text-primary' },
    { label: 'عدد الآيات', value: totalAyahs.toLocaleString('ar-EG'), icon: Hash, color: 'bg-accent/10 text-accent' },
    { label: 'عدد الأجزاء', value: '30', icon: FileText, color: 'bg-primary/10 text-primary' },
    { label: 'عدد الأحزاب', value: '60', icon: BarChart3, color: 'bg-accent/10 text-accent' },
    { label: 'عدد الكلمات', value: '77,845', icon: Type, color: 'bg-primary/10 text-primary' },
    { label: 'عدد الحروف', value: '323,671', icon: Type, color: 'bg-accent/10 text-accent' },
  ];

  const detailedStats = [
    { label: 'السور المكية', value: `${meccan} سورة` },
    { label: 'السور المدنية', value: `${medinan} سورة` },
    { label: 'أطول سورة', value: longestSurah ? `${longestSurah.name} (${longestSurah.numberOfAyahs} آية)` : '-' },
    { label: 'أقصر سورة', value: shortestSurah ? `${shortestSurah.name} (${shortestSurah.numberOfAyahs} آيات)` : '-' },
    { label: 'عدد السجدات', value: '15 سجدة' },
    { label: 'أول ما نزل', value: 'سورة العلق' },
    { label: 'آخر ما نزل', value: 'سورة النصر' },
    { label: 'أطول آية', value: 'آية الدَّين (البقرة: 282)' },
    { label: 'أقصر آية', value: 'يس (يس: 1)' },
    { label: 'عدد أسماء الله', value: '99 اسماً' },
  ];

  return (
    <div className="page-container" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <PageHeader
          icon={BarChart3}
          title="إحصائيات القرآن"
          subtitle="معلومات وأرقام شاملة"
        />

        {loading ? (
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton-pulse h-24 w-full" />)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 mb-5">
              {stats.map((s, i) => (
                <div key={i} className="card-surface flex flex-col items-center py-4 gap-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                    <s.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xl font-bold text-foreground">{s.value}</span>
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                </div>
              ))}
            </div>

            <div className="card-surface mb-4">
              <h2 className="text-base font-bold text-foreground mb-4">تفاصيل إضافية</h2>
              <div className="space-y-3">
                {detailedStats.map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-sm text-muted-foreground">{s.label}</span>
                    <span className="text-sm font-semibold text-foreground">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-surface mb-4">
              <h2 className="text-base font-bold text-foreground mb-3">توزيع الآيات حسب نوع السورة</h2>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">مكية ({meccan} سورة)</span>
                    <span className="text-primary font-semibold">{Math.round(meccan / 114 * 100)}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${meccan / 114 * 100}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">مدنية ({medinan} سورة)</span>
                    <span className="text-accent font-semibold">{Math.round(medinan / 114 * 100)}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: `${medinan / 114 * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QuranStatsPage;
