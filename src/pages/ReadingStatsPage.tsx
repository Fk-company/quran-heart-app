import React from 'react';
import { useReadingTracker } from '@/hooks/useReadingTracker';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Flame, Award, Calendar, TrendingUp, BarChart3 } from 'lucide-react';

const ReadingStatsPage: React.FC = () => {
  const { tracker, todayStats, khatmProgress } = useReadingTracker();

  const stats = [
    { icon: BookOpen, label: 'إجمالي الآيات', value: tracker.totalAyahsRead, color: 'text-primary' },
    { icon: BarChart3, label: 'الصفحات المقروءة', value: tracker.totalPagesRead, color: 'text-accent' },
    { icon: Award, label: 'عدد الختمات', value: tracker.khatmCount, color: 'text-primary' },
    { icon: Flame, label: 'أيام متتالية', value: tracker.streak, color: 'text-accent' },
  ];

  return (
    <div className="page-container" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">إحصائيات القراءة</h1>
            <p className="text-xs text-muted-foreground">تتبع تقدمك في ختم القرآن</p>
          </div>
        </div>

        {/* Khatm Progress */}
        <div className="card-surface mb-4 bg-primary/5 border-primary/15">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-foreground">تقدم الختمة</span>
            <span className="text-xs text-primary font-bold">{khatmProgress}%</span>
          </div>
          <Progress value={khatmProgress} className="h-3 mb-2" />
          <p className="text-xs text-muted-foreground">{tracker.completedSurahs.length} من 114 سورة</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {stats.map((s, i) => (
            <div key={i} className="card-surface flex flex-col items-center py-4 gap-2">
              <s.icon className={`w-6 h-6 ${s.color}`} />
              <span className="text-2xl font-bold text-foreground">{s.value}</span>
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Today */}
        <div className="card-surface mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">إحصائيات اليوم</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <span className="text-lg font-bold text-foreground">{todayStats.ayahsRead}</span>
              <p className="text-[10px] text-muted-foreground">آية</p>
            </div>
            <div className="text-center">
              <span className="text-lg font-bold text-foreground">{todayStats.pagesRead}</span>
              <p className="text-[10px] text-muted-foreground">صفحة</p>
            </div>
            <div className="text-center">
              <span className="text-lg font-bold text-foreground">{todayStats.surahs.length}</span>
              <p className="text-[10px] text-muted-foreground">سورة</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        {tracker.dailyRecords.length > 0 && (
          <div className="card-surface">
            <h3 className="text-sm font-semibold text-foreground mb-3">النشاط الأخير</h3>
            <div className="space-y-2">
              {tracker.dailyRecords.slice(-7).reverse().map((r, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-xs text-muted-foreground">{r.date}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-foreground">{r.ayahsRead} آية</span>
                    <span className="text-xs text-muted-foreground">{r.surahs.length} سورة</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadingStatsPage;
