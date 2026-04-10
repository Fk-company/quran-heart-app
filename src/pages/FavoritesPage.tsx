import React from 'react';
import { useFavorites } from '@/hooks/useFavorites';
import { Heart, Download, Trash2, BookOpen, Quote, Feather } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

const typeIcons: Record<string, React.ElementType> = { ayah: BookOpen, hadith: Quote, dua: Feather };
const typeLabels: Record<string, string> = { ayah: 'آية', hadith: 'حديث', dua: 'دعاء' };

const FavoritesPage: React.FC = () => {
  const { favorites, removeItem, exportFavorites } = useFavorites();
  const items = favorites.items;

  return (
    <div className="page-container page-with-topbar" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <PageHeader
          icon={Heart}
          title="المفضلة"
          subtitle={`${items.length} عنصر محفوظ`}
          gradient="destructive"
          actions={
            items.length > 0 ? (
              <button onClick={exportFavorites} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-medium">
                <Download className="w-3.5 h-3.5" /> تصدير
              </button>
            ) : undefined
          }
        />

        {items.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">لم تقم بإضافة عناصر للمفضلة بعد</p>
            <p className="text-xs text-muted-foreground mt-1">اضغط على قلب بجانب أي آية أو دعاء أو حديث</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const Icon = typeIcons[item.type] || BookOpen;
              return (
                <div key={item.id} className="card-surface">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="stat-badge mb-2">{typeLabels[item.type]}</div>
                      <p className="font-amiri text-base leading-[1.9] text-foreground">{item.text}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">{item.source}</p>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="w-8 h-8 rounded-full flex items-center justify-center text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0">
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
  );
};

export default FavoritesPage;
