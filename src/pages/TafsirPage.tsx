import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSurahs, type Surah } from '@/lib/api';
import { Search, BookOpen, ArrowRight } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

const TAFSIR_EDITIONS = [
  { id: 'ar.muyassar', name: 'التفسير الميسر' },
  { id: 'ar.jalalayn', name: 'تفسير الجلالين' },
];

const ALQURAN_BASE = 'https://api.alquran.cloud/v1';

const TafsirPage: React.FC = () => {
  const navigate = useNavigate();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [tafsirData, setTafsirData] = useState<Record<string, any[]>>({});
  const [tafsirLoading, setTafsirLoading] = useState(false);
  const [activeEditions, setActiveEditions] = useState<string[]>(['ar.muyassar']);

  useEffect(() => { fetchSurahs().then(d => { setSurahs(d); setLoading(false); }); }, []);

  const loadTafsir = async (surahNum: number) => {
    setSelectedSurah(surahNum);
    setTafsirLoading(true);
    const results: Record<string, any[]> = {};
    await Promise.all(activeEditions.map(async (ed) => {
      try {
        const res = await fetch(`${ALQURAN_BASE}/surah/${surahNum}/${ed}`);
        const data = await res.json();
        results[ed] = data.data?.ayahs || [];
      } catch { results[ed] = []; }
    }));
    setTafsirData(results);
    setTafsirLoading(false);
  };

  const toggleEdition = (id: string) => {
    setActiveEditions(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
  };

  const filtered = search.trim() ? surahs.filter(s => s.name.includes(search) || s.englishName.toLowerCase().includes(search.toLowerCase()) || String(s.number) === search) : surahs;

  if (selectedSurah) {
    const surah = surahs.find(s => s.number === selectedSurah);
    return (
      <div className="page-container page-with-topbar" dir="rtl">
        <div className="px-4 pt-4 max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => setSelectedSurah(null)} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-foreground" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-foreground">تفسير {surah?.name}</h1>
              <p className="text-xs text-muted-foreground">{surah?.numberOfAyahs} آية</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {TAFSIR_EDITIONS.map(ed => (
              <button key={ed.id} onClick={() => { toggleEdition(ed.id); if (selectedSurah) loadTafsir(selectedSurah); }}
                className={`filter-chip ${activeEditions.includes(ed.id) ? 'active' : ''}`}>{ed.name}</button>
            ))}
          </div>

          {tafsirLoading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton-pulse h-24 w-full" />)}</div>
          ) : (
            <div className="space-y-3">
              {(tafsirData[activeEditions[0]] || []).map((ayah: any, idx: number) => (
                <div key={idx} className="card-surface">
                  <div className="flex items-start gap-2 mb-3">
                    <span className="verse-number flex-shrink-0 mt-1">{ayah.numberInSurah}</span>
                    <p className="font-amiri text-lg leading-[2] text-foreground flex-1">{ayah.text}</p>
                  </div>
                  {activeEditions.length > 1 && tafsirData[activeEditions[1]] && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <span className="text-xs font-semibold text-accent mb-1 block">{TAFSIR_EDITIONS.find(e => e.id === activeEditions[1])?.name}</span>
                      <p className="text-sm text-foreground leading-relaxed">{tafsirData[activeEditions[1]][idx]?.text}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container page-with-topbar" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <PageHeader
          icon={BookOpen}
          title="التفسير"
          subtitle="تفاسير متعددة مع إمكانية المقارنة"
        />

        <div className="relative mb-4">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث عن سورة..." className="search-input pr-10" />
        </div>

        {loading ? (
          <div className="space-y-2">{Array.from({ length: 10 }).map((_, i) => <div key={i} className="skeleton-pulse h-16 w-full" />)}</div>
        ) : (
          <div className="space-y-2">
            {filtered.map(surah => (
              <button key={surah.number} onClick={() => loadTafsir(surah.number)} className="card-surface-hover w-full flex items-center gap-3 text-right">
                <div className="verse-number flex-shrink-0">{surah.number}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-foreground text-sm">{surah.name}</div>
                  <div className="text-[11px] text-muted-foreground">{surah.numberOfAyahs} آيات</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TafsirPage;
