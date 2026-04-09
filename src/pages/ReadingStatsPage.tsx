import React, { useState, useEffect } from 'react';
import { useReadingTracker } from '@/hooks/useReadingTracker';
import { useNotifications } from '@/hooks/useNotifications';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Flame, Award, Calendar, TrendingUp, BarChart3, Target, Bell, BellOff, CheckCircle2, Share2 } from 'lucide-react';
import KhatmShareCard from '@/components/KhatmShareCard';
import PageHeader from '@/components/PageHeader';

const GOAL_KEY = 'quran_daily_goal';

interface DailyGoal {
  pages: number;
  ayahs: number;
  reminderEnabled: boolean;
  reminderHour: number;
}

const defaultGoal: DailyGoal = { pages: 5, ayahs: 50, reminderEnabled: false, reminderHour: 8 };

const ReadingStatsPage: React.FC = () => {
  const { tracker, todayStats, khatmProgress } = useReadingTracker();
  const { requestPermission, sendNotification, isSupported } = useNotifications();
  const [showShareCard, setShowShareCard] = useState(false);

  const [goal, setGoal] = useState<DailyGoal>(() => {
    try { const raw = localStorage.getItem(GOAL_KEY); return raw ? { ...defaultGoal, ...JSON.parse(raw) } : defaultGoal; }
    catch { return defaultGoal; }
  });
  const [editingGoal, setEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(goal);

  useEffect(() => { localStorage.setItem(GOAL_KEY, JSON.stringify(goal)); }, [goal]);

  // Daily reminder
  useEffect(() => {
    if (!goal.reminderEnabled || !isSupported) return;
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(goal.reminderHour, 0, 0, 0);
    let diff = reminderTime.getTime() - now.getTime();
    if (diff < 0) diff += 86400000;
    const timer = setTimeout(() => {
      const pagesLeft = Math.max(0, goal.pages - todayStats.pagesRead);
      if (pagesLeft > 0) {
        sendNotification('تذكير بالقراءة اليومية', `لم تكمل هدفك بعد. تبقى ${pagesLeft} صفحات`);
      }
    }, diff);
    return () => clearTimeout(timer);
  }, [goal.reminderEnabled, goal.reminderHour, goal.pages, todayStats.pagesRead, sendNotification, isSupported]);

  const saveGoal = async () => {
    if (tempGoal.reminderEnabled && !goal.reminderEnabled) {
      await requestPermission();
    }
    setGoal(tempGoal);
    setEditingGoal(false);
  };

  const pagesProgress = Math.min(100, Math.round((todayStats.pagesRead / goal.pages) * 100));
  const ayahsProgress = Math.min(100, Math.round((todayStats.ayahsRead / goal.ayahs) * 100));
  const goalAchieved = pagesProgress >= 100 && ayahsProgress >= 100;

  const stats = [
    { icon: BookOpen, label: 'إجمالي الآيات', value: tracker.totalAyahsRead, color: 'text-primary' },
    { icon: BarChart3, label: 'الصفحات المقروءة', value: tracker.totalPagesRead, color: 'text-accent' },
    { icon: Award, label: 'عدد الختمات', value: tracker.khatmCount, color: 'text-primary' },
    { icon: Flame, label: 'أيام متتالية', value: tracker.streak, color: 'text-accent' },
  ];

  return (
    <div className="page-container" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto pb-28">
        <PageHeader
          icon={TrendingUp}
          title="إحصائيات القراءة"
          subtitle="تتبع تقدمك في ختم القرآن"
        />

        {/* Daily Goal Card */}
        <div className={`card-surface mb-4 border ${goalAchieved ? 'border-green-500/30 bg-green-500/5' : 'border-primary/15 bg-primary/5'}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className={`w-4 h-4 ${goalAchieved ? 'text-green-500' : 'text-primary'}`} />
              <span className="text-sm font-semibold text-foreground">الهدف اليومي</span>
              {goalAchieved && <CheckCircle2 className="w-4 h-4 text-green-500" />}
            </div>
            <button onClick={() => { setTempGoal(goal); setEditingGoal(!editingGoal); }}
              className="text-xs text-primary font-medium px-2 py-1 rounded-lg hover:bg-primary/10 transition-colors">
              {editingGoal ? 'إلغاء' : 'تعديل'}
            </button>
          </div>

          {editingGoal ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">عدد الصفحات يومياً</label>
                <input type="number" min={1} max={50} value={tempGoal.pages}
                  onChange={e => setTempGoal({ ...tempGoal, pages: Math.max(1, Number(e.target.value)) })}
                  className="w-full px-3 py-2 rounded-xl bg-secondary text-foreground text-sm border border-border outline-none" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">عدد الآيات يومياً</label>
                <input type="number" min={1} max={500} value={tempGoal.ayahs}
                  onChange={e => setTempGoal({ ...tempGoal, ayahs: Math.max(1, Number(e.target.value)) })}
                  className="w-full px-3 py-2 rounded-xl bg-secondary text-foreground text-sm border border-border outline-none" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {tempGoal.reminderEnabled ? <Bell className="w-4 h-4 text-primary" /> : <BellOff className="w-4 h-4 text-muted-foreground" />}
                  <span className="text-xs text-foreground">تذكير يومي</span>
                </div>
                <button onClick={() => setTempGoal({ ...tempGoal, reminderEnabled: !tempGoal.reminderEnabled })}
                  className={`w-10 h-5 rounded-full transition-colors relative ${tempGoal.reminderEnabled ? 'bg-primary' : 'bg-muted'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${tempGoal.reminderEnabled ? 'right-0.5' : 'right-[calc(100%-1.125rem)]'}`} />
                </button>
              </div>
              {tempGoal.reminderEnabled && (
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">ساعة التذكير</label>
                  <select value={tempGoal.reminderHour}
                    onChange={e => setTempGoal({ ...tempGoal, reminderHour: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-secondary text-foreground text-sm border border-border outline-none">
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>{i === 0 ? '12:00 ص' : i < 12 ? `${i}:00 ص` : i === 12 ? '12:00 م' : `${i - 12}:00 م`}</option>
                    ))}
                  </select>
                </div>
              )}
              <button onClick={saveGoal}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
                حفظ الهدف
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">الصفحات</span>
                  <span className="text-xs font-semibold text-foreground">{todayStats.pagesRead}/{goal.pages}</span>
                </div>
                <Progress value={pagesProgress} className="h-2.5" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">الآيات</span>
                  <span className="text-xs font-semibold text-foreground">{todayStats.ayahsRead}/{goal.ayahs}</span>
                </div>
                <Progress value={ayahsProgress} className="h-2.5" />
              </div>
              {goal.reminderEnabled && (
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Bell className="w-3 h-3" /> تذكير يومي الساعة {goal.reminderHour === 0 ? '12:00 ص' : goal.reminderHour < 12 ? `${goal.reminderHour}:00 ص` : goal.reminderHour === 12 ? '12:00 م' : `${goal.reminderHour - 12}:00 م`}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Khatm Progress */}
        <div className="card-surface mb-4 bg-primary/5 border-primary/15">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-foreground">تقدم الختمة</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowShareCard(!showShareCard)}
                className="flex items-center gap-1 text-xs text-primary font-medium px-2 py-1 rounded-lg hover:bg-primary/10 transition-colors">
                <Share2 className="w-3 h-3" />
                مشاركة
              </button>
              <span className="text-xs text-primary font-bold">{khatmProgress}%</span>
            </div>
          </div>
          <Progress value={khatmProgress} className="h-3 mb-2" />
          <p className="text-xs text-muted-foreground">{tracker.completedSurahs.length} من 114 سورة</p>
        </div>

        {showShareCard && (
          <div className="mb-4 animate-fade-in">
            <KhatmShareCard
              khatmProgress={khatmProgress}
              completedSurahs={tracker.completedSurahs.length}
              totalAyahs={tracker.totalAyahsRead}
              totalPages={tracker.totalPagesRead}
              khatmCount={tracker.khatmCount}
              streak={tracker.streak}
            />
          </div>
        )}

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
