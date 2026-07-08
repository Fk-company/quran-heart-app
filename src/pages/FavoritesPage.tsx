import React, { useMemo, useState } from 'react';
import SEO from '@/components/SEO';
import { useFavorites } from '@/hooks/useFavorites';
import { Heart, Download, Trash2, BookOpen, Quote, Feather, Search, X, HeartOff } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import { useNavigate } from 'react-router-dom';

const typeIcons: Record<string, React.ElementType> = { ayah: BookOpen, hadith: Quote, dua: Feather };
const typeLabels: Record<string, string> = { ayah: 'آية', hadith: 'حديث', dua: 'دعاء' };
const typeToneClass: Record<string, string> = {
  ayah: 'icon-tile icon-tile-emerald',
  hadith: 'icon-tile icon-tile-gold',
  dua: 'icon-tile',
};

type FilterKey = 'all' | 'ayah' | 'hadith' | 'dua';

const FavoritesPage: React.FC = () => {
  const { favorites, removeItem, exportFavorites } = useFavorites();
  const navigate = useNavigate();
  const items = favorites.items;
  const [filter, setFilter] = useState<FilterKey>('all');
  const [query, setQuery] = useState('');

  const counts = useMemo(() => {
    const c = { ayah: 0, hadith: 0, dua: 0 } as Record<string, number>;
    items.forEach((i) => { c[i.type] = (c[i.type] || 0) + 1; });
    return c;
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim();
    return items.filter((i) => {
      if (filter !== 'all' && i.type !== filter) return false;
      if (q && !(`${i.text} ${i.source ?? ''}`.includes(q))) return false;
      return true;
    });
  }, [items, filter, query]);

  const filters: { key: FilterKey; label: string; count: number }[] = [
    { key: 'all', label: 'الكل', count: items.length },
    { key: 'ayah', label: 'آيات', count: counts.ayah || 0 },
    { key: 'hadith', label: 'أحاديث', count: counts.hadith || 0 },
    { key: 'dua', label: 'أدعية', count: counts.dua || 0 },
  ];

  return (
    <>
      <SEO title="المفضلة — الآيات والأدعية المحفوظة" description="استعرض جميع الآيات والأدعية التي حفظتها في المفضلة." />
      <div className="page-container page-with-topbar" dir="rtl">
        <div className="page-inner">
          <PageHeader
            icon={Heart}
            title="المفضلة"
            subtitle={`${items.length} عنصر محفوظ`}
            gradient="destructive"
            badge={items.length > 0 ? <span className="badge-tone badge-tone-danger">{items.length}</span> : undefined}
            actions={
              items.length > 0 ? (
                <button
                  onClick={exportFavorites}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold press"
                  aria-label="تصدير المفضلة"
                >
                  <Download className="w-3.5 h-3.5" /> تصدير
                </button>
              ) : undefined
            }
          />

          {items.length > 0 && (
            <>
              {/* Filter chips */}
              <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
                {filters.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`filter-chip whitespace-nowrap ${filter === f.key ? 'active' : ''}`}
                  >
                    {f.label}
                    <span className={`ms-1.5 text-[10px] ${filter === f.key ? 'opacity-90' : 'opacity-70'}`}>({f.count})</span>
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ابحث في المفضلة..."
                  className="search-input"
                  aria-label="بحث في المفضلة"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center hover:bg-muted"
                    aria-label="مسح"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
              </div>
            </>
          )}

          {items.length === 0 ? (
            <EmptyState
              icon={HeartOff}
              title="لا توجد عناصر في المفضلة بعد"
              description="اضغط على أيقونة القلب بجانب أي آية أو دعاء أو حديث لإضافته إلى المفضلة."
              action={
                <button onClick={() => navigate('/quran')} className="chip">
                  <BookOpen className="w-3 h-3" /> تصفح المصحف
                </button>
              }
              secondaryAction={
                <button onClick={() => navigate('/dua')} className="chip">
                  <Feather className="w-3 h-3" /> الأدعية
                </button>
              }
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Search}
              title="لا نتائج مطابقة"
              description="جرّب تغيير كلمة البحث أو التبويب."
              variant="compact"
            />
          ) : (
            <div className="space-y-3 stagger-children">
              {filtered.map((item) => {
                const Icon = typeIcons[item.type] || BookOpen;
                return (
                  <div key={item.id} className="card-elevated">
                    <div className="flex items-start gap-3">
                      <div className={`${typeToneClass[item.type] || 'icon-tile'} mt-0.5`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="badge-tone badge-tone-primary mb-2">{typeLabels[item.type]}</div>
                        <p className="font-amiri text-base leading-[1.95] text-foreground">{item.text}</p>
                        {item.source && (
                          <p className="text-[11px] text-muted-foreground mt-1.5">{item.source}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
                        aria-label="إزالة من المفضلة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FavoritesPage;
