import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adhkarCategories, adhkarData } from '@/data/adhkar';
import { ArrowRight, RotateCcw, Sunrise, Sunset, Moon, Circle } from 'lucide-react';

const categoryIcons: Record<string, React.ElementType> = {
  sunrise: Sunrise,
  sunset: Sunset,
  moon: Moon,
  prayer: Circle,
  circle: Circle,
};

const AdhkarPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [counters, setCounters] = useState<Record<number, number>>({});

  const handleCount = (id: number, maxCount: number) => {
    setCounters((prev) => {
      const current = prev[id] || 0;
      if (current >= maxCount) return prev;
      return { ...prev, [id]: current + 1 };
    });
  };

  const resetCounter = (id: number) => {
    setCounters((prev) => ({ ...prev, [id]: 0 }));
  };

  if (selectedCategory) {
    const category = adhkarCategories.find((c) => c.id === selectedCategory);
    const items = adhkarData[selectedCategory] || [];

    return (
      <div className="page-container" dir="rtl">
        <div className="px-4 pt-4 max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center"
            >
              <ArrowRight className="w-4 h-4 text-foreground" />
            </button>
            <h1 className="text-lg font-bold text-foreground">{category?.name}</h1>
          </div>

          <div className="space-y-3">
            {items.map((dhikr) => {
              const count = counters[dhikr.id] || 0;
              const completed = count >= dhikr.count;
              return (
                <div key={dhikr.id} className={`card-surface ${completed ? 'opacity-60' : ''}`}>
                  <p className="font-amiri text-xl leading-[2] text-foreground mb-3">{dhikr.text}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-xs text-muted-foreground">{dhikr.reference}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => resetCounter(dhikr.id)}
                        className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center"
                      >
                        <RotateCcw className="w-3 h-3 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => handleCount(dhikr.id, dhikr.count)}
                        disabled={completed}
                        className={`min-w-[4rem] h-8 rounded-full text-sm font-semibold transition-colors ${
                          completed
                            ? 'bg-primary/20 text-primary'
                            : 'bg-primary text-primary-foreground'
                        }`}
                      >
                        {count}/{dhikr.count}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-foreground mb-4">الاذكار والتسبيح</h1>

        <div className="space-y-3">
          {adhkarCategories.map((cat) => {
            const Icon = categoryIcons[cat.icon] || Circle;
            const count = adhkarData[cat.id]?.length || 0;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className="card-surface w-full flex items-center gap-3"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 text-right">
                  <div className="font-semibold text-foreground text-sm">{cat.name}</div>
                  <div className="text-xs text-muted-foreground">{count} ذكر</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdhkarPage;
