import React, { useEffect, useState } from 'react';
import SEO from '@/components/SEO';
import { BookHeart, Plus, Trash2, Calendar, Heart, Brain, Sparkles } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  mood: number; // 1-5
  gratitude: string;
  reflection: string;
  ayah?: string;
  duaa?: string;
  createdAt: number;
}

const MOODS = ['😞', '😐', '🙂', '😊', '😍'];
const MOOD_LABELS = ['ضعيف', 'عادي', 'جيد', 'ممتاز', 'رائع'];

const KEY = 'faith_journal_v1';

const FaithJournalPage: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
  });
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<Partial<JournalEntry>>({
    mood: 3, gratitude: '', reflection: '', ayah: '', duaa: '',
  });

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(entries)); } catch {}
  }, [entries]);

  const save = () => {
    const today = new Date().toISOString().slice(0, 10);
    const entry: JournalEntry = {
      id: `${Date.now()}`,
      date: today,
      mood: draft.mood || 3,
      gratitude: (draft.gratitude || '').trim(),
      reflection: (draft.reflection || '').trim(),
      ayah: (draft.ayah || '').trim() || undefined,
      duaa: (draft.duaa || '').trim() || undefined,
      createdAt: Date.now(),
    };
    if (!entry.gratitude && !entry.reflection) return;
    setEntries([entry, ...entries]);
    setDraft({ mood: 3, gratitude: '', reflection: '', ayah: '', duaa: '' });
    setShowForm(false);
  };

  const remove = (id: string) => setEntries(entries.filter(e => e.id !== id));

  const avgMood = entries.length > 0
    ? (entries.reduce((s, e) => s + e.mood, 0) / entries.length).toFixed(1)
    : '—';
  const streak = (() => {
    if (entries.length === 0) return 0;
    let count = 1;
    const dates = [...new Set(entries.map(e => e.date))].sort().reverse();
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1]);
      const cur = new Date(dates[i]);
      const diff = (prev.getTime() - cur.getTime()) / 86400000;
      if (diff === 1) count++;
      else break;
    }
    return count;
  })();

  return (
    <>
      <SEO title="يوميات إيمانية — قلب القرآن" description="دوّن لحظاتك الروحية وتأملاتك الإيمانية اليومية." />
      <div className="page-container page-with-topbar" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <PageHeader icon={BookHeart} title="يوميات إيمانية" subtitle="دوّن لحظاتك الروحية" showBack gradient="gold" />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="card-surface p-3 text-center">
            <Calendar className="w-4 h-4 mx-auto mb-1 text-primary" />
            <div className="text-lg font-bold text-foreground">{entries.length}</div>
            <div className="text-[10px] text-muted-foreground">إدخالات</div>
          </div>
          <div className="card-surface p-3 text-center">
            <Sparkles className="w-4 h-4 mx-auto mb-1 text-accent" />
            <div className="text-lg font-bold text-foreground">{streak}</div>
            <div className="text-[10px] text-muted-foreground">يوم متتالي</div>
          </div>
          <div className="card-surface p-3 text-center">
            <Heart className="w-4 h-4 mx-auto mb-1 text-rose-400" />
            <div className="text-lg font-bold text-foreground">{avgMood}</div>
            <div className="text-[10px] text-muted-foreground">متوسط الحال</div>
          </div>
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full mb-4 py-3 rounded-2xl gradient-primary text-primary-foreground font-bold inline-flex items-center justify-center gap-2 shadow-emerald"
          >
            <Plus className="w-4 h-4" /> أضف إدخال جديد
          </button>
        )}

        {showForm && (
          <div className="card-surface p-5 mb-4 space-y-3">
            <div>
              <span className="text-xs font-bold text-foreground block mb-2">كيف حالك الإيماني اليوم؟</span>
              <div className="flex justify-between gap-2">
                {MOODS.map((m, i) => (
                  <button
                    key={i}
                    onClick={() => setDraft(d => ({ ...d, mood: i + 1 }))}
                    className={`flex-1 py-2 rounded-xl text-2xl transition-all ${
                      draft.mood === i + 1 ? 'bg-primary/15 scale-110 ring-2 ring-primary' : 'bg-secondary'
                    }`}
                    aria-label={MOOD_LABELS[i]}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-foreground block mb-1.5 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-rose-400" /> امتنان (نعمة شكرت الله عليها اليوم)
              </span>
              <textarea
                value={draft.gratitude} onChange={e => setDraft(d => ({ ...d, gratitude: e.target.value }))}
                rows={2} placeholder="الحمد لله على..."
                className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div>
              <span className="text-xs font-bold text-foreground block mb-1.5 flex items-center gap-1">
                <Brain className="w-3.5 h-3.5 text-primary" /> تأمل / درس مستفاد
              </span>
              <textarea
                value={draft.reflection} onChange={e => setDraft(d => ({ ...d, reflection: e.target.value }))}
                rows={3} placeholder="ما الذي تعلمته اليوم؟"
                className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div>
              <span className="text-xs font-bold text-foreground block mb-1.5">آية مرّت بقلبك (اختياري)</span>
              <input
                value={draft.ayah} onChange={e => setDraft(d => ({ ...d, ayah: e.target.value }))}
                placeholder="﴿...﴾"
                className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-amiri"
              />
            </div>

            <div>
              <span className="text-xs font-bold text-foreground block mb-1.5">دعاء (اختياري)</span>
              <input
                value={draft.duaa} onChange={e => setDraft(d => ({ ...d, duaa: e.target.value }))}
                placeholder="اللهم..."
                className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={save} className="flex-1 py-2.5 rounded-xl gradient-primary text-primary-foreground font-bold">حفظ</button>
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl bg-secondary text-foreground font-bold">إلغاء</button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {entries.map((e) => (
            <div key={e.id} className="card-surface p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{MOODS[e.mood - 1]}</span>
                  <div>
                    <div className="text-xs font-bold text-foreground">{e.date}</div>
                    <div className="text-[10px] text-muted-foreground">{MOOD_LABELS[e.mood - 1]}</div>
                  </div>
                </div>
                <button onClick={() => remove(e.id)} className="w-7 h-7 rounded-full hover:bg-destructive/10 flex items-center justify-center">
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </button>
              </div>
              {e.gratitude && (
                <div className="mb-2">
                  <p className="text-[10px] font-bold text-rose-400 mb-0.5">امتنان</p>
                  <p className="text-sm text-foreground leading-relaxed">{e.gratitude}</p>
                </div>
              )}
              {e.reflection && (
                <div className="mb-2">
                  <p className="text-[10px] font-bold text-primary mb-0.5">تأمل</p>
                  <p className="text-sm text-foreground leading-relaxed">{e.reflection}</p>
                </div>
              )}
              {e.ayah && (
                <p className="font-amiri text-sm text-accent leading-loose text-center my-2 py-2 border-y border-border">
                  {e.ayah}
                </p>
              )}
              {e.duaa && (
                <p className="text-xs text-muted-foreground italic">{e.duaa}</p>
              )}
            </div>
          ))}
          {entries.length === 0 && !showForm && (
            <div className="card-surface p-8 text-center text-sm text-muted-foreground">
              ابدأ بتدوين لحظاتك الإيمانية الأولى
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default FaithJournalPage;
