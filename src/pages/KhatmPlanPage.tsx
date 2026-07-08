import React, { useEffect, useMemo, useState } from 'react';
import SEO from '@/components/SEO';
import { useNavigate } from 'react-router-dom';
import { Target, Calendar, BookOpen, Check, ChevronLeft, RotateCcw, TrendingUp, Award } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

const TOTAL_PAGES = 604; // Madani Mushaf
const TOTAL_JUZ = 30;

interface KhatmPlan {
  startDate: string; // ISO
  durationDays: 30 | 60 | 90 | 120;
  unit: 'pages' | 'juz';
  completedPages: number[]; // by page number
}

const STORAGE_KEY = 'khatm_plan_v1';

const loadPlan = (): KhatmPlan | null => {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
};
const savePlan = (p: KhatmPlan) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch {} };
const clearPlan = () => { try { localStorage.removeItem(STORAGE_KEY); } catch {} };

// Map page → juz roughly (every ~20 pages = 1 juz)
const pageToJuz = (page: number) => Math.min(30, Math.max(1, Math.ceil(page / 20)));

const daysBetween = (a: Date, b: Date) => Math.floor((b.getTime() - a.getTime()) / 86400000);

const KhatmPlanPage: React.FC = () => {
  const navigate = useNavigate();
  const [plan, setPlan] = useState<KhatmPlan | null>(loadPlan());
  const [duration, setDuration] = useState<30 | 60 | 90 | 120>(60);
  const [unit, setUnit] = useState<'pages' | 'juz'>('pages');

  useEffect(() => {
    if (plan) savePlan(plan);
  }, [plan]);

  const startPlan = () => {
    setPlan({
      startDate: new Date().toISOString(),
      durationDays: duration,
      unit,
      completedPages: [],
    });
  };

  const resetPlan = () => {
    if (confirm('هل تريد إعادة تعيين الخطة الحالية؟')) {
      clearPlan();
      setPlan(null);
    }
  };

  const today = new Date();
  const stats = useMemo(() => {
    if (!plan) return null;
    const start = new Date(plan.startDate);
    const dayIndex = Math.max(0, daysBetween(start, today));
    const targetTotal = Math.min(TOTAL_PAGES, Math.round(((dayIndex + 1) / plan.durationDays) * TOTAL_PAGES));
    const dailyTarget = Math.ceil(TOTAL_PAGES / plan.durationDays);
    const completed = plan.completedPages.length;
    const progressPct = (completed / TOTAL_PAGES) * 100;
    const onTrack = completed >= targetTotal;
    const remaining = Math.max(0, plan.durationDays - dayIndex);
    const completedJuz = new Set(plan.completedPages.map(pageToJuz)).size;
    return { dayIndex, targetTotal, dailyTarget, completed, progressPct, onTrack, remaining, completedJuz };
  }, [plan, today]);

  // Today's page range
  const todayRange = useMemo(() => {
    if (!plan || !stats) return null;
    const startPage = stats.dayIndex * stats.dailyTarget + 1;
    const endPage = Math.min(TOTAL_PAGES, startPage + stats.dailyTarget - 1);
    return { startPage, endPage };
  }, [plan, stats]);

  const togglePage = (pg: number) => {
    if (!plan) return;
    const has = plan.completedPages.includes(pg);
    const next = has
      ? plan.completedPages.filter((p) => p !== pg)
      : [...plan.completedPages, pg];
    setPlan({ ...plan, completedPages: next });
  };

  // ============ NO PLAN — Setup screen ============
  if (!plan) {
    return (
      <>
      <SEO title="خطة ختم القرآن — 30 / 60 / 90 يوم" description="خطط لختمتك القادمة باختيار المدة المناسبة لك." />
      <div className="page-container page-with-topbar" dir="rtl">
        <div className="page-inner">
          <PageHeader icon={Target} title="خطة الختمة" subtitle="نظّم قراءتك للقرآن الكريم" gradient="primary" showBack />

          <div className="card-luxury mb-4">
            <div className="text-center mb-5">
              <div className="w-16 h-16 rounded-2xl gradient-primary mx-auto flex items-center justify-center shadow-emerald mb-3">
                <BookOpen className="w-7 h-7 text-primary-foreground" />
              </div>
              <h2 className="text-base font-bold text-foreground font-kufi mb-1">ابدأ خطة ختمة جديدة</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">حدد مدة الختمة وسنحسب لك ورد كل يوم تلقائياً مع تتبع التقدم</p>
            </div>

            <label className="text-xs font-semibold text-foreground mb-2 block">مدة الختمة</label>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[30, 60, 90, 120].map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d as 30 | 60 | 90 | 120)}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                    duration === d
                      ? 'gradient-primary text-primary-foreground shadow-emerald'
                      : 'bg-secondary text-foreground hover:bg-muted'
                  }`}
                >
                  {d} يوم
                </button>
              ))}
            </div>

            <label className="text-xs font-semibold text-foreground mb-2 block">وحدة القراءة</label>
            <div className="grid grid-cols-2 gap-2 mb-5">
              <button
                onClick={() => setUnit('pages')}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                  unit === 'pages' ? 'gradient-primary text-primary-foreground shadow-emerald' : 'bg-secondary text-foreground hover:bg-muted'
                }`}
              >
                صفحات
              </button>
              <button
                onClick={() => setUnit('juz')}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                  unit === 'juz' ? 'gradient-primary text-primary-foreground shadow-emerald' : 'bg-secondary text-foreground hover:bg-muted'
                }`}
              >
                أجزاء
              </button>
            </div>

            <div className="bg-primary/5 border border-primary/15 rounded-2xl p-3 mb-5 text-xs text-foreground leading-relaxed">
              <span className="font-bold text-primary">الورد اليومي المتوقع: </span>
              {unit === 'pages'
                ? `${Math.ceil(TOTAL_PAGES / duration)} صفحة يومياً`
                : `${(TOTAL_JUZ / duration).toFixed(2)} جزء يومياً`}
            </div>

            <button
              onClick={startPlan}
              className="w-full py-3 rounded-2xl gradient-primary text-primary-foreground text-sm font-bold shadow-emerald hover:scale-[1.01] active:scale-95 transition-transform"
            >
              ابدأ الخطة الآن
            </button>
          </div>
        </div>
      </div>
    </>
    );
  }

  // ============ ACTIVE PLAN ============
  const expectedEnd = new Date(new Date(plan.startDate).getTime() + plan.durationDays * 86400000);

  return (
    <div className="page-container page-with-topbar" dir="rtl">
      <div className="page-inner">
        <PageHeader
          icon={Target}
          title="خطة الختمة"
          subtitle={`${plan.durationDays} يوماً · ${plan.unit === 'pages' ? 'صفحات' : 'أجزاء'}`}
          gradient="primary"
          showBack
          actions={
            <button onClick={resetPlan} className="w-9 h-9 rounded-xl bg-secondary hover:bg-destructive/15 flex items-center justify-center transition-colors" aria-label="إعادة تعيين">
              <RotateCcw className="w-4 h-4 text-muted-foreground" />
            </button>
          }
        />

        {/* Progress hero */}
        <div className="gradient-hero islamic-pattern islamic-pattern-arabesque rounded-3xl p-5 mb-4 text-primary-foreground relative shadow-emerald">
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm rounded-full px-3 py-1.5 border border-primary-foreground/15">
              <TrendingUp className="w-3.5 h-3.5 opacity-90" />
              <span className="text-[11px] font-semibold opacity-95">التقدم</span>
            </div>
            <span className={`text-[10px] font-bold rounded-full px-2.5 py-1 border ${stats?.onTrack ? 'bg-accent/20 border-accent/40' : 'bg-destructive/20 border-destructive/40'}`}>
              {stats?.onTrack ? 'متقدم على الخطة' : 'متأخر عن الخطة'}
            </span>
          </div>
          <div className="text-3xl font-bold mb-1 font-kufi relative z-10">
            {stats?.completed} <span className="text-base opacity-70">/ {TOTAL_PAGES}</span>
          </div>
          <div className="text-[11px] opacity-80 mb-3 relative z-10">صفحة مقروءة · {Math.round(stats?.progressPct || 0)}%</div>
          <div className="h-2 rounded-full bg-primary-foreground/15 overflow-hidden relative z-10">
            <div
              className="h-full bg-accent transition-all duration-500"
              style={{ width: `${Math.min(100, stats?.progressPct || 0)}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-3 text-[11px] opacity-85 relative z-10">
            <span>{stats?.completedJuz}/30 جزء</span>
            <span>متبقي {stats?.remaining} يوم</span>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <div className="stat-card text-right">
            <div className="stat-card-icon bg-primary/10"><Calendar className="w-4 h-4 text-primary" /></div>
            <div className="stat-card-value">{(stats?.dayIndex || 0) + 1}</div>
            <div className="stat-card-label">اليوم</div>
          </div>
          <div className="stat-card text-right">
            <div className="stat-card-icon bg-gold-light"><BookOpen className="w-4 h-4 text-gold-deep" /></div>
            <div className="stat-card-value">{stats?.dailyTarget}</div>
            <div className="stat-card-label">صفحة/يوم</div>
          </div>
          <div className="stat-card text-right">
            <div className="stat-card-icon bg-accent/10"><Award className="w-4 h-4 text-accent" /></div>
            <div className="stat-card-value text-sm mt-1">{expectedEnd.toLocaleDateString('ar-EG', { day: '2-digit', month: '2-digit' })}</div>
            <div className="stat-card-label">تاريخ الختم</div>
          </div>
        </div>

        {/* Today's reading */}
        {todayRange && todayRange.startPage <= TOTAL_PAGES && (
          <div className="mb-5">
            <h2 className="section-title">ورد اليوم</h2>
            <div className="card-luxury">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">الصفحات</div>
                  <div className="text-base font-bold text-foreground font-kufi">
                    {todayRange.startPage} — {todayRange.endPage}
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/mushaf?page=${todayRange.startPage}`)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-xs font-bold shadow-emerald hover:scale-[1.02] active:scale-95 transition-transform"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  افتح المصحف
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {Array.from({ length: todayRange.endPage - todayRange.startPage + 1 }).map((_, i) => {
                  const pg = todayRange.startPage + i;
                  const done = plan.completedPages.includes(pg);
                  return (
                    <button
                      key={pg}
                      onClick={() => togglePage(pg)}
                      className={`aspect-square rounded-xl border text-xs font-bold transition-all ${
                        done
                          ? 'bg-primary text-primary-foreground border-primary shadow-emerald'
                          : 'bg-secondary/40 text-foreground border-border/40 hover:bg-secondary'
                      }`}
                    >
                      {done ? <Check className="w-4 h-4 mx-auto" /> : pg}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* All pages tracker */}
        <div className="mb-6">
          <h2 className="section-title">كل الصفحات</h2>
          <div className="card-luxury">
            <div className="grid grid-cols-10 gap-1">
              {Array.from({ length: TOTAL_PAGES }).map((_, i) => {
                const pg = i + 1;
                const done = plan.completedPages.includes(pg);
                return (
                  <button
                    key={pg}
                    onClick={() => togglePage(pg)}
                    title={`صفحة ${pg}`}
                    className={`aspect-square rounded-md text-[8px] font-semibold transition-all ${
                      done ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    {pg}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KhatmPlanPage;
