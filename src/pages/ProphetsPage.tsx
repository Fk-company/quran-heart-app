import React, { useState } from 'react';
import { prophets, type Prophet } from '@/data/prophets';
import { ArrowRight, BookOpen, MapPin, Lightbulb, ChevronDown, ChevronUp, Users } from 'lucide-react';

const ProphetsPage: React.FC = () => {
  const [selected, setSelected] = useState<Prophet | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (selected) {
    return (
      <div className="page-container" dir="rtl">
        <div className="px-4 pt-4 max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-5">
            <button onClick={() => setSelected(null)} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-foreground" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-foreground">{selected.arabicName} عليه السلام</h1>
              <p className="text-xs text-muted-foreground">{selected.title}</p>
            </div>
          </div>

          {/* Hero card */}
          <div className="gradient-hero islamic-pattern rounded-2xl p-5 mb-5 text-primary-foreground">
            <div className="text-3xl mb-2">{selected.icon}</div>
            <h2 className="text-xl font-bold mb-1">{selected.arabicName}</h2>
            <p className="text-sm opacity-80">{selected.title}</p>
            <div className="flex items-center gap-1 mt-3 text-xs opacity-70">
              <MapPin className="w-3 h-3" />
              <span>{selected.era}</span>
            </div>
          </div>

          {/* Summary */}
          <div className="card-surface mb-3">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-foreground">نبذة مختصرة</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{selected.summary}</p>
          </div>

          {/* Full story */}
          <div className="card-surface mb-3">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-accent" />
              <span className="text-sm font-bold text-foreground">القصة</span>
            </div>
            <p className="text-sm text-foreground leading-[1.9] font-amiri">{selected.story}</p>
          </div>

          {/* Lessons */}
          <div className="card-surface mb-3">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-accent" />
              <span className="text-sm font-bold text-foreground">الدروس والعبر</span>
            </div>
            <div className="space-y-2">
              {selected.lessons.map((lesson, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                  </span>
                  <span className="text-sm text-foreground">{lesson}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quran mentions */}
          <div className="card-surface mb-4">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-foreground">ذُكر في سور</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {selected.mentionedIn.map((s) => (
                <span key={s} className="stat-badge">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center">
            <Users className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">قصص الأنبياء</h1>
            <p className="text-xs text-muted-foreground">{prophets.length} قصة</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {prophets.map((p) => {
            const isExpanded = expandedId === p.id;
            return (
              <div key={p.id} className="card-surface-hover">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : p.id)}
                  className="w-full flex items-center gap-3"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-xl">
                    {p.icon}
                  </div>
                  <div className="flex-1 text-right min-w-0">
                    <div className="font-bold text-foreground text-sm">{p.arabicName} <span className="text-xs text-muted-foreground font-normal">عليه السلام</span></div>
                    <div className="text-xs text-muted-foreground">{p.title}</div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-border animate-fade-in">
                    <p className="text-sm text-muted-foreground mb-3">{p.summary}</p>
                    <button
                      onClick={() => setSelected(p)}
                      className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
                    >
                      اقرأ القصة كاملة
                    </button>
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

export default ProphetsPage;
