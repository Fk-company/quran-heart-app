import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, BookOpen, Flame, Heart, Target, Sparkles, Trophy,
  TrendingUp, Radio, Mic, Hand, ArrowLeft, Star, Calendar,
} from 'lucide-react';
import SEO from '@/components/SEO';
import PageHeader from '@/components/PageHeader';
import PrayerTimesWidget from '@/components/PrayerTimesWidget';
import { useReadingTracker } from '@/hooks/useReadingTracker';
import { useFavorites } from '@/hooks/useFavorites';
import { useAppStats, formatListenTime } from '@/hooks/useAppStats';
import { getStreak, getAllTimeTotal, getLastDays, getTopPhrases } from '@/lib/tasbihHistory';

interface Stat {
  label: string;
  value: string | number;
  icon: React.ElementType;
  hint?: string;
  tint: string;
}

const PersonalDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { tracker, todayStats, khatmProgress } = useReadingTracker();
  const { favorites } = useFavorites();
  const { stats } = useAppStats();

  const tasbihStreak = useMemo(() => getStreak(), []);
  const tasbihAll = useMemo(() => getAllTimeTotal(), []);
  const last7 = useMemo(() => getLastDays(7), []);
  const topPhrases = useMemo(() => getTopPhrases(30).slice(0, 4), []);

  const maxDay = Math.max(1, ...last7.map(d => d.total));

  const headline: Stat[] = [
    { label: 'سلسلة القراءة', value: `${tracker.streak} يوم`, icon: Flame, tint: 'from-orange-500/15 to-rose-500/10' },
    { label: 'سلسلة التسبيح', value: `${tasbihStreak} يوم`, icon: Activity, tint: 'from-emerald-500/15 to-teal-500/10' },
    { label: 'ختمات مكتملة', value: tracker.khatmCount, icon: Trophy, tint: 'from-amber-500/15 to-yellow-500/10' },
    { label: 'تقدم الختمة', value: `${khatmProgress}%`, icon: Target, tint: 'from-primary/15 to-accent/10' },
  ];

  const today = new Date().getHours();
  const recommendation = useMemo(() => {
    if (today < 6) return { title: 'قيام وتهجد', desc: 'وقت السحر بركة — اقرأ ورداً قصيراً وأكثر من الاستغفار.', path: '/daily-wird', icon: Sparkles };
    if (today < 11) return { title: 'أذكار الصباح', desc: 'حصّن يومك قبل أن ينطلق.', path: '/adhkar', icon: Sparkles };
    if (today < 15) return { title: 'تدبر آية', desc: 'خذ جلسة تدبر قصيرة وارتقِ بقلبك.', path: '/guided-tadabbur', icon: BookOpen };
    if (today < 18) return { title: 'ورد قرآني', desc: 'صفحة أو سورة قصيرة كافية لتشعل قلبك.', path: '/quran', icon: BookOpen };
    if (today < 20) return { title: 'أذكار المساء', desc: 'لا تنم إلا وقد ذكرت ربك.', path: '/adhkar', icon: Sparkles };
    return { title: 'دعاء قبل النوم', desc: 'اختم يومك بدعاء جامع واسترح بقلب مطمئن.', path: '/dua', icon: Hand };
  }, [today]);

  const totalFavorites = favorites.surahs.length + favorites.items.length;
  const RecIcon = recommendation.icon;

  return (
    <div className="page-container page-with-topbar" dir="rtl">
      <SEO
        title="لوحتي الشخصية | قلب القرآن"
        description="تابع تقدمك في القراءة والذكر والاستماع، واحصل على اقتراحات إيمانية ذكية حسب وقتك."
      />
      <div className="max-w-lg mx-auto w-full px-4 pt-6">
      <PageHeader
        icon={TrendingUp}
        title="لوحتي الشخصية"
        subtitle="رحلتك مع القرآن والذكر بنظرة واحدة"
        gradient="primary"
        showBack
      />

      {/* Prayer times */}
      <div className="px-4 mt-3">
        <PrayerTimesWidget />
      </div>

      {/* Headline stats */}
      <div className="grid grid-cols-2 gap-3 px-4 mt-3">
        {headline.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={i}
              className={`relative rounded-2xl p-3.5 border border-border/50 bg-gradient-to-br ${s.tint} overflow-hidden`}
            >
              <div className="flex items-start justify-between">
                <Icon className="w-5 h-5 text-foreground/80" />
                <div className="text-[10px] text-muted-foreground font-bold">{s.label}</div>
              </div>
              <div className="mt-2 text-2xl font-extrabold text-foreground tracking-tight">{s.value}</div>
            </div>
          );
        })}
      </div>

      {/* Smart recommendation */}
      <div className="px-4 mt-5">
        <button
          onClick={() => navigate(recommendation.path)}
          className="w-full text-right relative overflow-hidden rounded-2xl border border-primary/30 p-4 bg-gradient-to-l from-primary/15 via-accent/10 to-transparent active:scale-[0.99] transition-transform"
        >
          <div className="absolute inset-0 islamic-pattern-arabesque opacity-[0.05]" />
          <div className="relative flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary/20 flex items-center justify-center">
              <RecIcon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold text-primary tracking-widest uppercase mb-0.5">
                اقتراح ذكي لهذه الساعة
              </div>
              <div className="text-base font-extrabold text-foreground">{recommendation.title}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{recommendation.desc}</div>
            </div>
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </div>
        </button>
      </div>

      {/* Today summary */}
      <div className="px-4 mt-5">
        <div className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" /> اليوم
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-card border border-border/50 p-3 text-center">
            <div className="text-[10px] text-muted-foreground">آيات</div>
            <div className="text-lg font-extrabold text-foreground">{todayStats.ayahsRead}</div>
          </div>
          <div className="rounded-xl bg-card border border-border/50 p-3 text-center">
            <div className="text-[10px] text-muted-foreground">صفحات</div>
            <div className="text-lg font-extrabold text-foreground">{todayStats.pagesRead}</div>
          </div>
          <div className="rounded-xl bg-card border border-border/50 p-3 text-center">
            <div className="text-[10px] text-muted-foreground">سور قُرئت</div>
            <div className="text-lg font-extrabold text-foreground">{todayStats.surahs.length}</div>
          </div>
        </div>
      </div>

      {/* 7-day tasbih chart */}
      <div className="px-4 mt-5">
        <div className="rounded-2xl border border-border/50 bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-extrabold text-foreground">تسبيحك خلال 7 أيام</div>
            <div className="text-xs text-muted-foreground">المجموع: {tasbihAll.toLocaleString('ar-EG')}</div>
          </div>
          <div className="flex items-end justify-between gap-1.5 h-24">
            {last7.map((d, i) => {
              const h = Math.max(4, Math.round((d.total / maxDay) * 100));
              const date = new Date(d.date);
              const day = ['أحد','إثن','ثلا','أرب','خمي','جمع','سبت'][date.getDay()];
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end" style={{ height: '100%' }}>
                    <div
                      className="w-full rounded-t-md transition-all"
                      style={{
                        height: `${h}%`,
                        background: 'linear-gradient(180deg, hsl(var(--accent)), hsl(var(--primary)))',
                      }}
                      title={`${d.total}`}
                    />
                  </div>
                  <div className="text-[9px] text-muted-foreground font-bold">{day}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top dhikr */}
      {topPhrases.length > 0 && (
        <div className="px-4 mt-5">
          <div className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5" /> أكثر الأذكار خلال 30 يوماً
          </div>
          <div className="space-y-2">
            {topPhrases.map((p, i) => (
              <div key={i} className="rounded-xl bg-card border border-border/50 p-3 flex items-center justify-between gap-3">
                <div className="font-amiri text-sm text-foreground truncate flex-1">{p.phrase}</div>
                <div className="text-xs font-extrabold text-primary shrink-0">
                  {p.total.toLocaleString('ar-EG')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Listening + Favorites */}
      <div className="px-4 mt-5 grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/reciters')}
          className="rounded-2xl border border-border/50 bg-card p-3.5 text-right active:scale-95 transition-transform"
        >
          <Mic className="w-5 h-5 text-accent" />
          <div className="text-[10px] text-muted-foreground mt-1.5">استماع للقراء</div>
          <div className="text-base font-extrabold text-foreground">{formatListenTime(stats.reciterListenSeconds)}</div>
        </button>
        <button
          onClick={() => navigate('/radio')}
          className="rounded-2xl border border-border/50 bg-card p-3.5 text-right active:scale-95 transition-transform"
        >
          <Radio className="w-5 h-5 text-primary" />
          <div className="text-[10px] text-muted-foreground mt-1.5">إذاعة القرآن</div>
          <div className="text-base font-extrabold text-foreground">{formatListenTime(stats.radioListenSeconds)}</div>
        </button>
        <button
          onClick={() => navigate('/favorites')}
          className="rounded-2xl border border-border/50 bg-card p-3.5 text-right active:scale-95 transition-transform"
        >
          <Heart className="w-5 h-5 text-destructive" />
          <div className="text-[10px] text-muted-foreground mt-1.5">المفضلة</div>
          <div className="text-base font-extrabold text-foreground">{totalFavorites}</div>
        </button>
        <button
          onClick={() => navigate('/khatm-plan')}
          className="rounded-2xl border border-border/50 bg-card p-3.5 text-right active:scale-95 transition-transform"
        >
          <Target className="w-5 h-5 text-primary" />
          <div className="text-[10px] text-muted-foreground mt-1.5">خطة الختمة</div>
          <div className="text-base font-extrabold text-foreground">{khatmProgress}%</div>
        </button>
      </div>

      {/* Quick navigation */}
      <div className="px-4 mt-5">
        <div className="text-xs font-bold text-muted-foreground mb-2">اختصارات</div>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'وردي اليومي', path: '/daily-wird' },
            { label: 'التحدي الأسبوعي', path: '/weekly-challenge' },
            { label: 'يوميات إيمانية', path: '/faith-journal' },
            { label: 'تأملات اليوم', path: '/daily-reflection' },
            { label: 'إحصاء التسبيح', path: '/tasbih-stats' },
            { label: 'إحصاء القراءة', path: '/reading-stats' },
          ].map((q) => (
            <button
              key={q.path}
              onClick={() => navigate(q.path)}
              className="px-3 py-1.5 rounded-full bg-secondary/70 border border-border/40 text-xs font-bold text-foreground hover:bg-secondary active:scale-95 transition"
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
};

export default PersonalDashboardPage;
