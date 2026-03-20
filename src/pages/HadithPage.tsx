import React, { useState } from 'react';
import { hadiths, hadithCategories, type Hadith } from '@/data/hadiths';
import { BookOpen, Search, Heart, ChevronDown, ChevronUp, Quote, Users, Star, Home } from 'lucide-react';

const catIcons: Record<string, React.ElementType> = {
  heart: Heart, prayer: BookOpen, users: Users, star: Star, book: BookOpen, home: Home,
};

const HadithPage: React.FC = () => {
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filteredHadiths = selectedCat
    ? hadiths.filter((h) => h.category === selectedCat)
    : search.trim()
    ? hadiths.filter((h) => h.text.includes(search) || h.narrator.includes(search))
    : hadiths;

  return (
    <div className="page-container" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Quote className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">الأحاديث النبوية</h1>
            <p className="text-xs text-muted-foreground">{hadiths.length} حديث شريف</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSelectedCat(null); }}
            placeholder="ابحث في الأحاديث..."
            className="w-full h-10 pr-10 pl-4 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2 mb-5">
          <button
            onClick={() => { setSelectedCat(null); setSearch(''); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              !selectedCat ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
            }`}
          >
            الكل
          </button>
          {hadithCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setSelectedCat(cat.id); setSearch(''); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedCat === cat.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Hadith list */}
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
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : hadith.id)}
                    className="flex items-center gap-1 text-xs text-primary"
                  >
                    التفاصيل
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
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
      </div>
    </div>
  );
};

export default HadithPage;
