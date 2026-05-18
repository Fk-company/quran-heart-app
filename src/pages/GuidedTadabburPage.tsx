import React, { useEffect, useRef, useState } from 'react';
import { Lightbulb, Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

interface Stage {
  title: string;
  duration: number; // seconds
  body: string;
}

interface Session {
  ayah: string;
  ref: string;
  stages: Stage[];
}

const SESSIONS: Session[] = [
  {
    ayah: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
    ref: 'الرعد 28',
    stages: [
      { title: 'تهيئة', duration: 60, body: 'اجلس في مكان هادئ. خذ ثلاثة أنفاس عميقة. أغمض عينيك قليلاً واستحضر القلب.' },
      { title: 'تلاوة وتأمل', duration: 120, body: 'كرّر الآية في نفسك ببطء ثلاث مرات. تأمّل كلمة "تطمئن" — ما الفرق بينها وبين السكون؟' },
      { title: 'تطبيق', duration: 90, body: 'اذكر الله الآن: سبحان الله، الحمد لله، لا إله إلا الله، الله أكبر. لاحظ أثر الذكر في صدرك.' },
      { title: 'دعاء', duration: 30, body: 'اللهم اجعل قلبي مطمئناً بذكرك، عامراً بحبّك، خاشعاً لعظمتك.' },
    ],
  },
  {
    ayah: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ',
    ref: 'الطلاق 3',
    stages: [
      { title: 'تهيئة', duration: 45, body: 'استرخِ، اطرح كل ما يشغلك جانباً. ضع يدك على صدرك واشعر بنبضك.' },
      { title: 'تأمل', duration: 120, body: '"حَسْبُهُ" أي كافيه. تأمّل: ما الذي يقلقك الآن؟ هل ترى أن الله كافيك فيه؟' },
      { title: 'تسليم', duration: 60, body: 'فوّض أمرك لله. قل: "حسبي الله ونعم الوكيل" سبعاً.' },
      { title: 'دعاء', duration: 30, body: 'اللهم إني أتوكل عليك في كل أمري، فاكفني هموم الدنيا وما بعدها.' },
    ],
  },
  {
    ayah: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا. إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    ref: 'الشرح 5-6',
    stages: [
      { title: 'تهيئة', duration: 45, body: 'تنفّس ببطء. استحضر صعوبةً تمر بها الآن.' },
      { title: 'تأمل', duration: 120, body: 'الله قال "مع" لا "بعد". اليُسر يصاحب العسر، ليس بعده. أين يسر في صعوبتك الآن؟' },
      { title: 'يقين', duration: 60, body: 'كرّر الآية مرتين، كما كرّرها الله. ثبّت اليقين أن الفرج قريب.' },
      { title: 'دعاء', duration: 45, body: 'اللهم اشرح صدري، ويسّر أمري، واحلل عقدةً من لساني.' },
    ],
  },
];

const GuidedTadabburPage: React.FC = () => {
  const [idx, setIdx] = useState(0);
  const [stage, setStage] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const timerRef = useRef<number | null>(null);

  const session = SESSIONS[idx];
  const cur = session.stages[stage];
  const total = session.stages.reduce((a, s) => a + s.duration, 0);
  const stagePct = Math.min(100, (elapsed / cur.duration) * 100);

  useEffect(() => {
    if (!running) return;
    timerRef.current = window.setInterval(() => {
      setElapsed((e) => {
        if (e + 1 >= cur.duration) {
          if (stage + 1 < session.stages.length) { setStage(stage + 1); return 0; }
          setRunning(false); return cur.duration;
        }
        return e + 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [running, stage, cur.duration, session.stages.length]);

  const reset = () => { setStage(0); setElapsed(0); setRunning(false); };
  const switchSession = (d: number) => {
    setIdx((i) => (i + d + SESSIONS.length) % SESSIONS.length);
    reset();
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="page-container page-with-topbar" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <PageHeader icon={Lightbulb} title="جلسة تدبر موجهة" subtitle={`جلسة ${idx + 1} من ${SESSIONS.length} • ${Math.round(total / 60)} دقائق`} showBack />

        <div className="ayah-card mb-4 text-center">
          <div className="quran-text text-2xl leading-[2.4] text-foreground mb-2">{session.ayah}</div>
          <div className="text-[11px] text-muted-foreground">{session.ref}</div>
        </div>

        <div className="card-surface mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold font-kufi text-foreground bg-primary/10 text-primary rounded-full px-3 py-1">
              المرحلة {stage + 1}/{session.stages.length}: {cur.title}
            </span>
            <span className="text-xs font-bold tabular-nums text-muted-foreground">{fmt(elapsed)} / {fmt(cur.duration)}</span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden mb-3">
            <div className="h-full gradient-primary transition-all" style={{ width: `${stagePct}%` }} />
          </div>
          <p className="text-sm leading-[2] text-foreground/90 font-kufi text-center min-h-[120px]">{cur.body}</p>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => switchSession(-1)} className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center"><ChevronRight className="w-4 h-4" /></button>
          <button onClick={() => setRunning((r) => !r)}
            className="flex-1 h-11 rounded-xl gradient-primary text-primary-foreground font-bold flex items-center justify-center gap-2 shadow-emerald">
            {running ? <><Pause className="w-4 h-4" /> إيقاف</> : <><Play className="w-4 h-4" /> {elapsed === 0 && stage === 0 ? 'ابدأ الجلسة' : 'استئناف'}</>}
          </button>
          <button onClick={reset} className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center"><RotateCcw className="w-4 h-4" /></button>
          <button onClick={() => switchSession(1)} className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center"><ChevronLeft className="w-4 h-4" /></button>
        </div>

        <div className="flex gap-1.5 justify-center">
          {session.stages.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${i === stage ? 'w-8 bg-primary' : i < stage ? 'w-4 bg-primary/40' : 'w-4 bg-border'}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GuidedTadabburPage;
