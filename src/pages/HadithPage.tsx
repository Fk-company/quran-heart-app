import React, { useState } from 'react';
import { hadiths, hadithCategories } from '@/data/hadiths';
import { useFavorites } from '@/hooks/useFavorites';
import { Search, Heart, ChevronDown, ChevronUp, Quote, Grid3X3, List, Share2, X } from 'lucide-react';

const HadithPage: React.FC = () => {
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedHadith, setSelectedHadith] = useState<typeof hadiths[0] | null>(null);
  const { addItem, removeItem, isItemFav } = useFavorites();

  const filteredHadiths = selectedCat
    ? hadiths.filter((h) => h.category === selectedCat)
    : search.trim()
    ? hadiths.filter((h) => h.text.includes(search) || h.narrator.includes(search))
    : hadiths;

  const shareHadith = (hadith: typeof hadiths[0]) => {
    const text = `${hadith.text}\n\nالراوي: ${hadith.narrator}\n${hadith.source}`;
    if (navigator.share) navigator.share({ text });
    else navigator.clipboard.writeText(text);
  };

  const toggleFavHadith = (hadith: typeof hadiths[0]) => {
    const id = `hadith-${hadith.id}`;
    if (isItemFav(id)) removeItem(id);
    else addItem({ id, type: 'hadith', text: hadith.text, source: `${hadith.narrator} - ${hadith.source}` });
  };

  return (
    <div className="page-container" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Quote className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">الأحاديث النبوية</h1>
            <p className="text-xs text-muted-foreground">{hadiths.length} حديث شريف</p>
          </div>
          <div className="flex gap-1">
            <button onClick={() => setViewMode('list')} className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}><List className="w-4 h-4" /></button>
            <button onClick={() => setViewMode('grid')} className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}><Grid3X3 className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="relative mb-4">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setSelectedCat(null); }} placeholder="ابحث في الأحاديث..." className="search-input pr-10" />
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          <button onClick={() => { setSelectedCat(null); setSearch(''); }} className={`filter-chip ${!selectedCat ? 'active' : ''}`}>الكل</button>
          {hadithCategories.map((cat) => (
            <button key={cat.id} onClick={() => { setSelectedCat(cat.id); setSearch(''); }} className={`filter-chip ${selectedCat === cat.id ? 'active' : ''}`}>{cat.name}</button>
          ))}
        </div>

        {/* Detail sheet for grid mode */}
        {selectedHadith && (
          <>
            <div className="sheet-overlay" onClick={() => setSelectedHadith(null)} />
            <div className="sheet-content" dir="rtl">
              <div className="sheet-handle" />
              <div className="px-5 pb-6 pt-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-foreground">الحديث</h3>
                  <button onClick={() => setSelectedHadith(null)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <p className="font-amiri text-lg leading-[2] text-foreground mb-4">{selectedHadith.text}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">الراوي:</span>
                    <span className="text-xs text-foreground font-medium">{selectedHadith.narrator}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">المصدر:</span>
                    <span className="text-xs text-foreground font-medium">{selectedHadith.source}</span>
                  </div>
                  {selectedHadith.explanation && (
                    <div>
                      <span className="text-xs text-muted-foreground">الشرح:</span>
                      <p className="text-sm text-foreground mt-1 leading-relaxed">{selectedHadith.explanation}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => shareHadith(selectedHadith)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-secondary text-foreground text-sm font-medium">
                    <Share2 className="w-4 h-4" /> مشاركة
                  </button>
                  <button onClick={() => toggleFavHadith(selectedHadith)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium ${isItemFav(`hadith-${selectedHadith.id}`) ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                    <Heart className="w-4 h-4" fill={isItemFav(`hadith-${selectedHadith.id}`) ? 'currentColor' : 'none'} />
                    {isItemFav(`hadith-${selectedHadith.id}`) ? 'إزالة' : 'مفضلة'}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-2">
            {filteredHadiths.map((hadith) => {
              const cat = hadithCategories.find((c) => c.id === hadith.category);
              return (
                <div key={hadith.id} onClick={() => setSelectedHadith(hadith)} className="card-surface-hover cursor-pointer">
                  <p className="font-amiri text-sm leading-[1.8] text-foreground line-clamp-3 mb-2">{hadith.text}</p>
                  <div className="flex items-center justify-between">
                    <span className="stat-badge text-[10px]">{cat?.name}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => { e.stopPropagation(); toggleFavHadith(hadith); }} className={`fav-btn w-6 h-6 ${isItemFav(`hadith-${hadith.id}`) ? 'active' : ''}`}>
                        <Heart className="w-3 h-3" fill={isItemFav(`hadith-${hadith.id}`) ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHadiths.map((hadith) => {
              const isExpanded = expandedId === hadith.id;
              const cat = hadithCategories.find((c) => c.id === hadith.category);
              return (
                <div key={hadith.id} className="card-surface">
                  <div className="flex items-start gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <Quote className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <p className="font-amiri text-lg leading-[2] text-foreground flex-1">{hadith.text}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="stat-badge">{cat?.name}</span>
                      <span className="text-[11px] text-muted-foreground">{hadith.source}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => toggleFavHadith(hadith)} className={`fav-btn w-7 h-7 ${isItemFav(`hadith-${hadith.id}`) ? 'active' : ''}`}>
                        <Heart className="w-3.5 h-3.5" fill={isItemFav(`hadith-${hadith.id}`) ? 'currentColor' : 'none'} />
                      </button>
                      <button onClick={() => shareHadith(hadith)} className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary">
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setExpandedId(isExpanded ? null : hadith.id)} className="flex items-center gap-1 text-xs text-primary">
                        التفاصيل {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-border animate-fade-in space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">الراوي:</span>
                        <span className="text-xs text-foreground font-medium">{hadith.narrator}</span>
                      </div>
                      {hadith.explanation && (
                        <div>
                          <span className="text-xs text-muted-foreground">الشرح:</span>
                          <p className="text-sm text-foreground mt-1 leading-relaxed">{hadith.explanation}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HadithPage;
