import React, { useEffect, useMemo, useState } from 'react';
import SEO from '@/components/SEO';
import { useNavigate } from 'react-router-dom';
import { fetchSurahs, type Surah } from '@/lib/api';
import { Search, BookOpen, ArrowRight, Layers, Library, Sparkles, SearchX, X } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import { getCached, setCached } from '@/lib/dataCache';

const TAFSIR_EDITIONS = [
  { id: 'ar.muyassar', name: 'التفسير الميسر' },
  { id: 'ar.jalalayn', name: 'تفسير الجلالين' },
];

const ALQURAN_BASE = 'https://api.alquran.cloud/v1';

const TafsirPage: React.FC = () => {
  const navigate = useNavigate();
  const cachedSurahs = getCached<Surah[]>('surahs');
  const [surahs, setSurahs] = useState<Surah[]>(cachedSurahs ?? []);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(!cachedSurahs);
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [tafsirData, setTafsirData] = useState<Record<string, any[]>>({});
  const [tafsirLoading, setTafsirLoading] = useState(false);
  const [activeEditions, setActiveEditions] = useState<string[]>(['ar.muyassar']);

  useEffect(() => { fetchSurahs().then(d => { setCached('surahs', d); setSurahs(d); setLoading(false); }); }, []);

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
      <>
      <SEO title="تفسير القرآن الكريم — قلب القرآن" description="تفاسير القرآن الكريم من أكثر من مصدر مع البحث حسب السورة والآية." />
      <div className="page-container page-with-topbar" dir="rtl">
        <div className="page-inner pt-4">
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
    </>
    );
  }

  const meccanCount = useMemo(() => surahs.filter(s => s.revelationType === 'Meccan').length, [surahs]);
  const medinanCount = surahs.length - meccanCount;

  return (
    <>
    <SEO title="التفسير — قلب القرآن" description="تفاسير القرآن الكريم بمصادر متعددة مع إمكانية المقارنة والبحث." />
    <div className="page-container page-with-topbar" dir="rtl">
      <div className="page-inner">
        <PageHeader
          icon={BookOpen}
          title="التفسير"
          subtitle="تفاسير متعددة مع إمكانية المقارنة"
          badge={<span className="stat-badge">{TAFSIR_EDITIONS.length} تفسير</span>}
        />

        {/* Stats overview */}
        <div className="grid grid-cols-3 gap-2 mb-4 stagger-children">
          <div className="card-elevated flex flex-col items-center py-3">
            <div className="icon-tile icon-tile-primary mb-1.5"><Library className="w-4 h-4" /></div>
            <span className="text-lg font-bold text-foreground">{surahs.length || 114}</span>
            <span className="text-[10px] text-muted-foreground">سورة</span>
          </div>
          <div className="card-elevated flex flex-col items-center py-3">
            <div className="icon-tile icon-tile-accent mb-1.5"><Sparkles className="w-4 h-4" /></div>
            <span className="text-lg font-bold text-foreground">{meccanCount || '-'}</span>
            <span className="text-[10px] text-muted-foreground">مكية</span>
          </div>
          <div className="card-elevated flex flex-col items-center py-3">
            <div className="icon-tile icon-tile-primary mb-1.5"><Layers className="w-4 h-4" /></div>
            <span className="text-lg font-bold text-foreground">{medinanCount || '-'}</span>
            <span className="text-[10px] text-muted-foreground">مدنية</span>
          </div>
        </div>

        <div className="relative mb-4">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث عن سورة بالاسم أو الرقم..." className="search-input pr-10 pl-9" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full hover:bg-secondary flex items-center justify-center" aria-label="مسح">
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-2">{Array.from({ length: 10 }).map((_, i) => <div key={i} className="skeleton-pulse h-16 w-full" />)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="لا توجد نتائج"
            description={`لم نجد سورة تطابق "${search}"`}
            action={<button onClick={() => setSearch('')} className="btn-primary text-xs px-4 py-2 rounded-full">مسح البحث</button>}
          />
        ) : (
          <div className="space-y-2 stagger-children">
            {filtered.map(surah => (
              <button key={surah.number} onClick={() => loadTafsir(surah.number)} className="card-surface-hover w-full flex items-center gap-3 text-right press">
                <div className="verse-number flex-shrink-0">{surah.number}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-foreground text-sm font-kufi">{surah.name}</div>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                    <span className={surah.revelationType === 'Meccan' ? 'text-primary' : 'text-accent'}>
                      {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span>{surah.numberOfAyahs} آيات</span>
                  </div>
                </div>
                <BookOpen className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default TafsirPage;
