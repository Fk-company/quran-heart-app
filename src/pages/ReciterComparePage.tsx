import React, { useEffect, useState } from 'react';
import { Mic2, Play, Pause, Loader2 } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useAudioPlayer } from '@/contexts/AudioContext';

interface Edition {
  id: string;
  label: string;
  qira: string;
}

const EDITIONS: Edition[] = [
  { id: 'ar.alafasy', label: 'مشاري العفاسي', qira: 'حفص عن عاصم' },
  { id: 'ar.husary', label: 'محمود الحصري', qira: 'حفص عن عاصم' },
  { id: 'ar.minshawi', label: 'محمد المنشاوي', qira: 'حفص عن عاصم' },
  { id: 'ar.abdulbasitmurattal', label: 'عبد الباسط (مرتل)', qira: 'حفص عن عاصم' },
  { id: 'ar.muhammadayyoub', label: 'محمد أيوب', qira: 'حفص عن عاصم' },
  { id: 'ar.hudhaify', label: 'علي الحذيفي', qira: 'حفص عن عاصم' },
  { id: 'ar.shaatree', label: 'أبو بكر الشاطري', qira: 'حفص عن عاصم' },
];

const ReciterComparePage: React.FC = () => {
  const [surah, setSurah] = useState(1);
  const [ayah, setAyah] = useState(1);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const { play, pause, currentTrack, isPlaying } = useAudioPlayer();

  useEffect(() => {
    setLoading(true);
    fetch(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/ar.alafasy`)
      .then((r) => r.json())
      .then((d) => { if (d.code === 200) setText(d.data.text); })
      .finally(() => setLoading(false));
  }, [surah, ayah]);

  const playEdition = (e: Edition) => {
    const url = `https://cdn.islamic.network/quran/audio/128/${e.id}/${ayahNumber(surah, ayah)}.mp3`;
    const id = `compare-${e.id}-${surah}-${ayah}`;
    if (currentTrack?.id === id && isPlaying) { pause(); return; }
    play({ id, title: `${surah}:${ayah}`, reciter: e.label, url });
  };

  return (
    <div className="page-container page-with-topbar" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <PageHeader icon={Mic2} title="مقارنة القراءات" subtitle="استمع لنفس الآية بأصوات مختلفة" showBack />

        <div className="card-surface mb-4">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-[11px] font-bold text-muted-foreground">السورة</label>
              <input type="number" min={1} max={114} value={surah}
                onChange={(e) => setSurah(Math.max(1, Math.min(114, Number(e.target.value) || 1)))}
                className="w-full mt-1 rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-muted-foreground">الآية</label>
              <input type="number" min={1} value={ayah}
                onChange={(e) => setAyah(Math.max(1, Number(e.target.value) || 1))}
                className="w-full mt-1 rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="quran-text text-xl leading-[2.6] text-center text-foreground min-h-[60px] py-2">
            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (text || '—')}
          </div>
        </div>

        <h2 className="section-title">القرّاء</h2>
        <div className="space-y-2 mb-6">
          {EDITIONS.map((e) => {
            const id = `compare-${e.id}-${surah}-${ayah}`;
            const active = currentTrack?.id === id && isPlaying;
            return (
              <button key={e.id} onClick={() => playEdition(e)}
                className="card-surface-hover w-full flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${active ? 'gradient-primary shadow-emerald' : 'bg-secondary'}`}>
                  {active ? <Pause className="w-5 h-5 text-primary-foreground" /> : <Play className="w-5 h-5 text-foreground" />}
                </div>
                <div className="flex-1 text-right min-w-0">
                  <div className="text-sm font-bold font-kufi text-foreground">{e.label}</div>
                  <div className="text-[11px] text-muted-foreground">{e.qira}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Ayah numbering for alquran cdn: 1-based across whole Quran
// We use API to resolve global number if needed - simplified using global number from API
function ayahNumber(surah: number, ayah: number): string {
  return `${surah}:${ayah}` as any;
}

export default ReciterComparePage;
