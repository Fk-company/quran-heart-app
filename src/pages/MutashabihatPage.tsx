import React, { useState } from 'react';
import { Layers, ChevronDown, ChevronUp } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

interface Group {
  phrase: string;
  occurrences: Array<{ ref: string; context: string; key: string }>;
  tip: string;
}

const GROUPS: Group[] = [
  {
    phrase: 'فبأي آلاء ربكما تكذبان',
    occurrences: [
      { ref: 'الرحمن: متكررة', context: 'تتكرر 31 مرة بين الآيات', key: 'الرحمن' },
    ],
    tip: 'تكرّرت في سورة الرحمن 31 مرة لتأكيد التذكير بنعم الله على الثقلين.',
  },
  {
    phrase: 'ولقد يسرنا القرآن للذكر فهل من مدكر',
    occurrences: [
      { ref: 'القمر 17', context: 'بعد قصة قوم نوح', key: 'نوح' },
      { ref: 'القمر 22', context: 'بعد قصة عاد', key: 'عاد' },
      { ref: 'القمر 32', context: 'بعد قصة ثمود', key: 'ثمود' },
      { ref: 'القمر 40', context: 'بعد قصة قوم لوط', key: 'لوط' },
    ],
    tip: 'تكرّرت في القمر 4 مرات بعد كل قصة قوم مكذّب. ميّز كل موضع بالقصة التي تسبقه.',
  },
  {
    phrase: 'ادخلوا هذه القرية فكلوا منها حيث شئتم رغدا',
    occurrences: [
      { ref: 'البقرة 58', context: 'وادخلوا الباب سُجَّداً', key: 'سُجَّداً' },
      { ref: 'الأعراف 161', context: 'واسكنوا هذه القرية', key: 'اسكنوا' },
    ],
    tip: 'البقرة تبدأ بـ"وإذ قلنا ادخلوا"، والأعراف تبدأ بـ"وإذ قيل لهم اسكنوا".',
  },
  {
    phrase: 'وما يعلم جنود ربك إلا هو',
    occurrences: [
      { ref: 'المدثر 31', context: 'في سياق ذكر خزنة النار', key: 'النار' },
    ],
    tip: 'موضع منفرد في القرآن. تذكّره بسياق الحديث عن خزنة جهنم.',
  },
  {
    phrase: 'إن في ذلك لآية وما كان أكثرهم مؤمنين',
    occurrences: [
      { ref: 'الشعراء: متكررة 8 مرات', context: 'بعد كل قصة من قصص الأنبياء', key: 'الأنبياء' },
    ],
    tip: 'تتكرر في الشعراء بعد كل قصة (موسى، إبراهيم، نوح، هود، صالح، لوط، شعيب).',
  },
];

const MutashabihatPage: React.FC = () => {
  const [open, setOpen] = useState<Set<number>>(new Set([0]));

  const toggle = (i: number) => {
    setOpen((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; });
  };

  return (
    <div className="page-container page-with-topbar" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <PageHeader icon={Layers} title="الكلمات المتشابهة" subtitle="تمييز الآيات المتشابهات لتسهيل الحفظ" showBack />

        <div className="card-luxury mb-4 text-[12px] leading-relaxed text-muted-foreground">
          المتشابهات اللفظية: آيات أو عبارات قرآنية متشابهة الألفاظ في مواضع مختلفة. هنا نبيّن الفروق وكيف تتذكّر كل موضع.
        </div>

        <div className="space-y-2.5 mb-6">
          {GROUPS.map((g, i) => {
            const isOpen = open.has(i);
            return (
              <div key={i} className="card-surface">
                <button onClick={() => toggle(i)} className="w-full flex items-center gap-3 text-right">
                  <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                    <Layers className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="quran-text text-base text-foreground leading-relaxed line-clamp-2">{g.phrase}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{g.occurrences.length} موضع</div>
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>
                {isOpen && (
                  <div className="mt-3 pt-3 border-t border-dashed border-border space-y-2 animate-fade-in">
                    {g.occurrences.map((o, k) => (
                      <div key={k} className="flex items-start gap-2 bg-secondary/50 rounded-xl p-2.5">
                        <span className="text-[10px] font-bold text-primary bg-primary/10 rounded-full px-2 py-0.5 whitespace-nowrap">{o.ref}</span>
                        <div className="flex-1 text-[11px] text-foreground/80">
                          {o.context}
                          <span className="mr-1 font-bold text-accent-foreground bg-accent/20 rounded px-1.5 py-0.5">{o.key}</span>
                        </div>
                      </div>
                    ))}
                    <div className="text-[11px] text-primary bg-primary/5 rounded-xl p-2.5 border border-primary/15 font-medium">
                      💡 {g.tip.replace('💡 ', '')}
                    </div>
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

export default MutashabihatPage;
