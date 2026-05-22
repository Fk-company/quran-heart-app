import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Waves, Play, Pause, Volume2, Moon, CloudRain, Wind, TreePine, Flame, Heart, Bird, Coffee } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

type LayerKind = 'rain' | 'wind' | 'forest' | 'waves' | 'fire' | 'heartbeat' | 'birds' | 'cafe' | 'recitation';

interface Layer {
  id: LayerKind;
  label: string;
  icon: React.ElementType;
  defaultVol: number;
  url?: string; // optional real audio
}

const LAYERS: Layer[] = [
  { id: 'rain', label: 'مطر هادئ', icon: CloudRain, defaultVol: 0.45 },
  { id: 'waves', label: 'أمواج البحر', icon: Waves, defaultVol: 0.45 },
  { id: 'wind', label: 'نسيم الصحراء', icon: Wind, defaultVol: 0.35 },
  { id: 'forest', label: 'غابة', icon: TreePine, defaultVol: 0.40 },
  { id: 'birds', label: 'تغريد عصافير', icon: Bird, defaultVol: 0.30 },
  { id: 'fire', label: 'موقد دافئ', icon: Flame, defaultVol: 0.40 },
  { id: 'heartbeat', label: 'نبضات قلب', icon: Heart, defaultVol: 0.50 },
  { id: 'cafe', label: 'مقهى هادئ', icon: Coffee, defaultVol: 0.35 },
  { id: 'recitation', label: 'تلاوة خافتة (الفاتحة)', icon: Moon, defaultVol: 0.55, url: 'https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/1.mp3' },
];

// ===== Web Audio synthesizers =====
function createNoiseBuffer(ctx: AudioContext, seconds = 2): AudioBuffer {
  const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

function startNoiseSource(ctx: AudioContext, gain: GainNode, filterType: BiquadFilterType, freq: number, q = 1): { stop: () => void } {
  const src = ctx.createBufferSource();
  src.buffer = createNoiseBuffer(ctx, 3);
  src.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = filterType;
  filter.frequency.value = freq;
  filter.Q.value = q;
  src.connect(filter).connect(gain);
  src.start();
  return { stop: () => { try { src.stop(); } catch {} } };
}

function buildLayer(ctx: AudioContext, id: LayerKind, gain: GainNode): () => void {
  switch (id) {
    case 'rain': {
      const a = startNoiseSource(ctx, gain, 'highpass', 800, 0.7);
      const b = startNoiseSource(ctx, gain, 'lowpass', 2200, 1);
      return () => { a.stop(); b.stop(); };
    }
    case 'waves': {
      const src = ctx.createBufferSource();
      src.buffer = createNoiseBuffer(ctx, 4);
      src.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 600;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.12; // slow ebb/flow
      const lfoAmp = ctx.createGain();
      lfoAmp.gain.value = 0.5;
      lfo.connect(lfoAmp).connect(lfoGain.gain);
      const dc = ctx.createConstantSource();
      dc.offset.value = 0.5;
      dc.connect(lfoGain.gain);
      src.connect(filter).connect(lfoGain).connect(gain);
      src.start(); lfo.start(); dc.start();
      return () => { try { src.stop(); lfo.stop(); dc.stop(); } catch {} };
    }
    case 'wind': {
      const src = ctx.createBufferSource();
      src.buffer = createNoiseBuffer(ctx, 4);
      src.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 400;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.2;
      const lfoAmp = ctx.createGain();
      lfoAmp.gain.value = 250;
      lfo.connect(lfoAmp).connect(filter.frequency);
      src.connect(filter).connect(gain);
      src.start(); lfo.start();
      return () => { try { src.stop(); lfo.stop(); } catch {} };
    }
    case 'forest': {
      const a = startNoiseSource(ctx, gain, 'bandpass', 1200, 0.6);
      // intermittent chirps
      let stopped = false;
      const chirp = () => {
        if (stopped) return;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.frequency.value = 1800 + Math.random() * 1200;
        osc.type = 'sine';
        g.gain.setValueAtTime(0, ctx.currentTime);
        g.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
        osc.connect(g).connect(gain);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
        setTimeout(chirp, 1500 + Math.random() * 4000);
      };
      setTimeout(chirp, 1000);
      return () => { stopped = true; a.stop(); };
    }
    case 'birds': {
      let stopped = false;
      const chirp = () => {
        if (stopped) return;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        const base = 2000 + Math.random() * 1800;
        osc.frequency.setValueAtTime(base, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(base + 600, ctx.currentTime + 0.08);
        osc.frequency.linearRampToValueAtTime(base, ctx.currentTime + 0.16);
        osc.type = 'sine';
        g.gain.setValueAtTime(0, ctx.currentTime);
        g.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
        osc.connect(g).connect(gain);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
        setTimeout(chirp, 600 + Math.random() * 2200);
      };
      setTimeout(chirp, 200);
      return () => { stopped = true; };
    }
    case 'fire': {
      const a = startNoiseSource(ctx, gain, 'lowpass', 1200, 0.5);
      // crackles
      let stopped = false;
      const crackle = () => {
        if (stopped) return;
        const src = ctx.createBufferSource();
        src.buffer = createNoiseBuffer(ctx, 0.1);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
        const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2000;
        src.connect(hp).connect(g).connect(gain);
        src.start(); src.stop(ctx.currentTime + 0.1);
        setTimeout(crackle, 80 + Math.random() * 400);
      };
      setTimeout(crackle, 200);
      return () => { stopped = true; a.stop(); };
    }
    case 'heartbeat': {
      let stopped = false;
      // Boost via a dedicated post-gain so it stays audible even with low slider
      const post = ctx.createGain();
      post.gain.value = 2.2;
      post.connect(gain);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 220;
      lp.connect(post);
      const beat = () => {
        if (stopped) return;
        const now = ctx.currentTime;
        const thump = (t: number, freq: number, amp: number) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq * 2, now + t);
          osc.frequency.exponentialRampToValueAtTime(freq * 0.6, now + t + 0.22);
          g.gain.setValueAtTime(0.0001, now + t);
          g.gain.exponentialRampToValueAtTime(amp, now + t + 0.015);
          g.gain.exponentialRampToValueAtTime(0.0001, now + t + 0.28);
          osc.connect(g).connect(lp);
          osc.start(now + t);
          osc.stop(now + t + 0.35);
        };
        thump(0, 80, 0.9);     // lub
        thump(0.22, 70, 0.55); // dub
        setTimeout(beat, 880); // ~68 bpm
      };
      beat();
      return () => { stopped = true; try { post.disconnect(); lp.disconnect(); } catch {} };
    }
    case 'cafe': {
      const a = startNoiseSource(ctx, gain, 'bandpass', 900, 0.5);
      const b = startNoiseSource(ctx, gain, 'lowpass', 600, 1);
      return () => { a.stop(); b.stop(); };
    }
    default:
      return () => {};
  }
}

interface RuntimeLayer { gain: GainNode; stop: () => void; }
interface RecRuntime { audio: HTMLAudioElement; }

const HeartAmbientPage: React.FC = () => {
  const [state, setState] = useState<Record<LayerKind, { vol: number; playing: boolean }>>(() => {
    const init: any = {};
    LAYERS.forEach((l) => { init[l.id] = { vol: l.defaultVol, playing: false }; });
    return init;
  });
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const runtimeRef = useRef<Partial<Record<LayerKind, RuntimeLayer>>>({});
  const recRef = useRef<RecRuntime | null>(null);
  const [timerMin, setTimerMin] = useState<number | null>(null);
  const [timerEnd, setTimerEnd] = useState<number | null>(null);
  const [, force] = useState(0);

  // tick remaining
  useEffect(() => {
    if (!timerEnd) return;
    const id = setInterval(() => force(x => x + 1), 30000);
    return () => clearInterval(id);
  }, [timerEnd]);

  const ensureCtx = useCallback(() => {
    if (!ctxRef.current) {
      const AC: typeof AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx = new AC();
      const master = ctx.createGain();
      master.gain.value = 1;
      master.connect(ctx.destination);
      ctxRef.current = ctx;
      masterRef.current = master;
    }
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    return { ctx: ctxRef.current, master: masterRef.current! };
  }, []);

  useEffect(() => () => {
    Object.values(runtimeRef.current).forEach((r) => r?.stop());
    runtimeRef.current = {};
    if (recRef.current) { recRef.current.audio.pause(); recRef.current.audio.src = ''; }
    ctxRef.current?.close().catch(() => {});
  }, []);

  // sleep timer
  useEffect(() => {
    if (!timerEnd) return;
    const id = setInterval(() => {
      if (Date.now() >= timerEnd) {
        stopAll();
        setTimerEnd(null); setTimerMin(null);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [timerEnd]);

  const toggle = (id: LayerKind) => {
    const layer = LAYERS.find(l => l.id === id)!;
    const playing = !state[id].playing;

    if (id === 'recitation') {
      if (playing) {
        let a = recRef.current?.audio;
        if (!a) {
          a = new Audio();
          a.preload = 'auto';
          a.loop = true;
          a.src = layer.url!;
          recRef.current = { audio: a };
        }
        a.volume = state[id].vol;
        a.play().catch((err) => {
          console.warn('recitation play failed', err);
        });
      } else {
        recRef.current?.audio.pause();
      }
    } else {
      if (playing) {
        const { ctx, master } = ensureCtx();
        const g = ctx.createGain();
        g.gain.value = Math.max(0.05, state[id].vol);
        g.connect(master);
        const stop = buildLayer(ctx, id, g);
        runtimeRef.current[id] = { gain: g, stop };
      } else {
        const rt = runtimeRef.current[id];
        if (rt) {
          try { rt.gain.gain.linearRampToValueAtTime(0, ctxRef.current!.currentTime + 0.05); } catch {}
          setTimeout(() => { rt.stop(); try { rt.gain.disconnect(); } catch {} }, 80);
          delete runtimeRef.current[id];
        }
      }
    }
    setState(s => ({ ...s, [id]: { ...s[id], playing } }));
  };

  const setVol = (id: LayerKind, v: number) => {
    if (id === 'recitation') {
      if (recRef.current) recRef.current.audio.volume = v;
    } else {
      const rt = runtimeRef.current[id];
      if (rt && ctxRef.current) rt.gain.gain.setTargetAtTime(v, ctxRef.current.currentTime, 0.05);
    }
    setState(s => ({ ...s, [id]: { ...s[id], vol: v } }));
  };

  const stopAll = () => {
    Object.entries(runtimeRef.current).forEach(([k, rt]) => { rt?.stop(); rt?.gain.disconnect(); });
    runtimeRef.current = {};
    if (recRef.current) recRef.current.audio.pause();
    setState(s => Object.fromEntries(Object.entries(s).map(([k, v]) => [k, { ...v, playing: false }])) as any);
    setTimerEnd(null); setTimerMin(null);
  };

  const startTimer = (m: number) => { setTimerMin(m); setTimerEnd(Date.now() + m * 60000); };

  const remaining = timerEnd ? Math.max(0, Math.ceil((timerEnd - Date.now()) / 60000)) : null;
  const activeCount = Object.values(state).filter(s => s.playing).length;

  // Curated presets
  const presets: { id: string; label: string; icon: React.ElementType; layers: Partial<Record<LayerKind, number>> }[] = [
    { id: 'sleep', label: 'سكون النوم', icon: Moon, layers: { rain: 0.4, heartbeat: 0.3 } },
    { id: 'focus', label: 'تركيز عميق', icon: TreePine, layers: { forest: 0.35, wind: 0.25 } },
    { id: 'tilawah', label: 'تلاوة بمطر', icon: CloudRain, layers: { rain: 0.4, recitation: 0.55 } },
    { id: 'beach', label: 'شاطئ هادئ', icon: Waves, layers: { waves: 0.5, birds: 0.2 } },
  ];

  const applyPreset = (p: typeof presets[number]) => {
    // stop all first
    stopAll();
    setTimeout(() => {
      Object.entries(p.layers).forEach(([id, vol]) => {
        setState(s => ({ ...s, [id as LayerKind]: { ...s[id as LayerKind], vol: vol! } }));
        // start layer
        setTimeout(() => toggle(id as LayerKind), 30);
      });
    }, 120);
  };

  return (
    <div className="page-container page-with-topbar" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <PageHeader icon={Waves} title="خلفية قلبية" subtitle="مزج أصوات الطبيعة والتلاوة لراحة القلب" showBack />

        {/* Sleep timer */}
        <div className="gradient-hero rounded-3xl p-5 mb-4 text-primary-foreground shadow-emerald">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[11px] opacity-80 mb-1">مؤقّت النوم</div>
              <div className="text-2xl font-bold font-kufi">
                {remaining != null ? `يتبقى ${remaining} د` : 'بدون مؤقّت'}
              </div>
            </div>
            <div className="text-[11px] opacity-80">{activeCount} طبقة نشطة</div>
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

        {/* Presets */}
        <div className="mb-4">
          <h3 className="text-xs font-bold text-muted-foreground mb-2 px-1">مزجات جاهزة</h3>
          <div className="grid grid-cols-2 gap-2">
            {presets.map(p => {
              const Icon = p.icon;
              return (
                <button key={p.id} onClick={() => applyPreset(p)}
                  className="card-surface flex items-center gap-2 hover:border-primary/40 transition">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold font-kufi text-foreground">{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Layers */}
        <div className="space-y-2.5 mb-4">
          {LAYERS.map((l) => {
            const s = state[l.id];
            const Icon = l.icon;
            return (
              <div key={l.id} className={`card-surface ${s.playing ? 'border-primary/40 bg-primary/5' : ''}`}>
                <div className="flex items-center gap-3 mb-2">
                  <button onClick={() => toggle(l.id)}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${s.playing ? 'gradient-primary shadow-emerald' : 'bg-secondary'}`}>
                    {s.playing ? <Pause className="w-5 h-5 text-primary-foreground" /> : <Play className="w-5 h-5 text-foreground" />}
                  </button>
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${s.playing ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="text-sm font-bold font-kufi text-foreground truncate">{l.label}</span>
                  </div>
                  {s.playing && <span className="text-[10px] font-bold text-primary animate-pulse">يعمل</span>}
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

        <p className="text-center text-[10px] text-muted-foreground mt-3 mb-4">
          الأصوات الطبيعية مُولَّدة محلياً ولا تحتاج إنترنت
        </p>
      </div>
    </div>
  );
};

export default HeartAmbientPage;
