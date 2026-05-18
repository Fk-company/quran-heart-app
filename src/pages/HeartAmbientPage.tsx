import React, { useEffect, useRef, useState } from 'react';
import { Waves, Play, Pause, Volume2, Moon, CloudRain, Wind, TreePine } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

interface Layer {
  id: string;
  label: string;
  icon: React.ElementType;
  url: string;
  defaultVol: number;
}

// Public ambient sounds (CC) + soft recitation
const LAYERS: Layer[] = [
  { id: 'rain', label: 'مطر هادئ', icon: CloudRain, url: 'https://cdn.pixabay.com/audio/2022/03/15/audio_6c2e5b2e0e.mp3', defaultVol: 0.4 },
  { id: 'wind', label: 'نسيم', icon: Wind, url: 'https://cdn.pixabay.com/audio/2022/10/16/audio_4adfc1a47e.mp3', defaultVol: 0.3 },
  { id: 'forest', label: 'غابة', icon: TreePine, url: 'https://cdn.pixabay.com/audio/2022/03/10/audio_d4f7e8d4f4.mp3', defaultVol: 0.4 },
  { id: 'recitation', label: 'تلاوة خافتة (الفاتحة)', icon: Moon, url: 'https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/1.mp3', defaultVol: 0.6 },
];

interface AudioCtl { audio: HTMLAudioElement; vol: number; playing: boolean; }

const HeartAmbientPage: React.FC = () => {
  const [state, setState] = useState<Record<string, { vol: number; playing: boolean }>>(() => {
    const init: any = {};
    LAYERS.forEach((l) => { init[l.id] = { vol: l.defaultVol, playing: false }; });
    return init;
  });
  const refs = useRef<Record<string, HTMLAudioElement>>({});
  const [timerMin, setTimerMin] = useState<number | null>(null);
  const [timerEnd, setTimerEnd] = useState<number | null>(null);

  useEffect(() => {
    LAYERS.forEach((l) => {
      const a = new Audio(l.url);
      a.loop = true;
      a.volume = l.defaultVol;
      refs.current[l.id] = a;
    });
    return () => { Object.values(refs.current).forEach((a) => { a.pause(); a.src = ''; }); };
  }, []);

  useEffect(() => {
    if (!timerEnd) return;
    const id = setInterval(() => {
      if (Date.now() >= timerEnd) {
        Object.values(refs.current).forEach((a) => a.pause());
        setState((s) => Object.fromEntries(Object.entries(s).map(([k, v]) => [k, { ...v, playing: false }])));
        setTimerEnd(null); setTimerMin(null);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [timerEnd]);

  const toggle = (id: string) => {
    const a = refs.current[id]; if (!a) return;
    setState((s) => {
      const playing = !s[id].playing;
      if (playing) a.play().catch(() => {}); else a.pause();
      return { ...s, [id]: { ...s[id], playing } };
    });
  };

  const setVol = (id: string, v: number) => {
    const a = refs.current[id]; if (!a) return;
    a.volume = v;
    setState((s) => ({ ...s, [id]: { ...s[id], vol: v } }));
  };

  const stopAll = () => {
    Object.values(refs.current).forEach((a) => a.pause());
    setState((s) => Object.fromEntries(Object.entries(s).map(([k, v]) => [k, { ...v, playing: false }])));
    setTimerEnd(null); setTimerMin(null);
  };

  const startTimer = (m: number) => { setTimerMin(m); setTimerEnd(Date.now() + m * 60000); };

  const remaining = timerEnd ? Math.max(0, Math.ceil((timerEnd - Date.now()) / 60000)) : null;

  return (
    <div className="page-container page-with-topbar" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <PageHeader icon={Waves} title="خلفية قلبية" subtitle="أصوات الطبيعة وتلاوة خافتة للتركيز والنوم" showBack />

        <div className="gradient-hero rounded-3xl p-5 mb-4 text-primary-foreground shadow-emerald">
          <div className="text-[11px] opacity-80 mb-1">مؤقّت النوم</div>
          <div className="text-2xl font-bold font-kufi mb-3">
            {remaining != null ? `يتبقى ${remaining} د` : 'بدون مؤقّت'}
          </div>
          <div className="flex gap-2">
            {[10, 20, 30, 60].map((m) => (
              <button key={m} onClick={() => startTimer(m)}
                className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${timerMin === m ? 'bg-accent text-accent-foreground' : 'bg-primary-foreground/15 hover:bg-primary-foreground/25'}`}>
                {m}د
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2.5 mb-4">
          {LAYERS.map((l) => {
            const s = state[l.id];
            const Icon = l.icon;
            return (
              <div key={l.id} className={`card-surface ${s.playing ? 'border-primary/30 bg-primary/5' : ''}`}>
                <div className="flex items-center gap-3 mb-2">
                  <button onClick={() => toggle(l.id)}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${s.playing ? 'gradient-primary shadow-emerald' : 'bg-secondary'}`}>
                    {s.playing ? <Pause className="w-5 h-5 text-primary-foreground" /> : <Play className="w-5 h-5 text-foreground" />}
                  </button>
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm font-bold font-kufi text-foreground truncate">{l.label}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Volume2 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <input type="range" min={0} max={1} step={0.05} value={s.vol}
                    onChange={(e) => setVol(l.id, Number(e.target.value))}
                    className="flex-1 accent-primary" />
                  <span className="text-[10px] font-bold tabular-nums text-muted-foreground w-8 text-left">{Math.round(s.vol * 100)}%</span>
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={stopAll} className="w-full rounded-xl bg-secondary hover:bg-destructive/15 py-3 text-sm font-bold text-foreground transition">
          إيقاف كل الأصوات
        </button>
      </div>
    </div>
  );
};

export default HeartAmbientPage;
