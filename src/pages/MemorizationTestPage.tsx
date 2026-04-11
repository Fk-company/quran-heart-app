import React, { useState, useEffect, useCallback } from 'react';
import { fetchSurahs, fetchSurahAyahs, type Surah, type Ayah } from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import { Brain, RefreshCw, Eye, EyeOff, ChevronLeft, ChevronRight, Check, X, Loader2, Trophy, RotateCcw } from 'lucide-react';

const MemorizationTestPage: React.FC = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const [hiddenIndices, setHiddenIndices] = useState<Set<number>>(new Set());
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
  const [userInputs, setUserInputs] = useState<Record<number, string>>({});
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingAyahs, setLoadingAyahs] = useState(false);

  useEffect(() => {
    fetchSurahs().then(s => { setSurahs(s); setLoading(false); });
  }, []);

  const getHideRatio = () => {
    switch (difficulty) {
      case 'easy': return 0.2;
      case 'medium': return 0.35;
      case 'hard': return 0.5;
    }
  };

  const generateHiddenWords = useCallback((text: string) => {
    const words = text.split(/\s+/);
    const ratio = getHideRatio();
    const count = Math.max(1, Math.floor(words.length * ratio));
    const indices = new Set<number>();
    while (indices.size < count && indices.size < words.length) {
      indices.add(Math.floor(Math.random() * words.length));
    }
    setHiddenIndices(indices);
    setRevealedIndices(new Set());
    setUserInputs({});
    setShowResults(false);
  }, [difficulty]);

  const handleSelectSurah = async (surahNum: number) => {
    setSelectedSurah(surahNum);
    setLoadingAyahs(true);
    setCurrentAyahIndex(0);
    try {
      const data = await fetchSurahAyahs(surahNum);
      setAyahs(data);
      if (data.length > 0) generateHiddenWords(data[0].text);
    } catch (e) { console.error(e); }
    setLoadingAyahs(false);
  };

  const currentAyah = ayahs[currentAyahIndex];
  const words = currentAyah?.text.split(/\s+/) || [];

  const handleNext = () => {
    if (currentAyahIndex < ayahs.length - 1) {
      const next = currentAyahIndex + 1;
      setCurrentAyahIndex(next);
      generateHiddenWords(ayahs[next].text);
    }
  };

  const handlePrev = () => {
    if (currentAyahIndex > 0) {
      const prev = currentAyahIndex - 1;
      setCurrentAyahIndex(prev);
      generateHiddenWords(ayahs[prev].text);
    }
  };

  const handleRevealWord = (idx: number) => {
    setRevealedIndices(prev => new Set([...prev, idx]));
  };

  const handleCheckAnswers = () => {
    let correct = 0;
    hiddenIndices.forEach(idx => {
      const input = (userInputs[idx] || '').trim();
      const original = words[idx]?.replace(/[^\u0621-\u064A]/g, '') || '';
      const cleaned = input.replace(/[^\u0621-\u064A]/g, '');
      if (cleaned === original) correct++;
    });
    setScore(correct);
    setShowResults(true);
    setRevealedIndices(new Set(hiddenIndices));
  };

  const handleRetry = () => {
    if (currentAyah) generateHiddenWords(currentAyah.text);
  };

  const difficultyOptions = [
    { key: 'easy' as const, label: 'سهل', color: 'bg-green-500/15 text-green-600 dark:text-green-400' },
    { key: 'medium' as const, label: 'متوسط', color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' },
    { key: 'hard' as const, label: 'صعب', color: 'bg-red-500/15 text-red-600 dark:text-red-400' },
  ];

  if (!selectedSurah) {
    return (
      <div className="page-container page-with-topbar" dir="rtl">
        <div className="px-4 pt-6 max-w-lg mx-auto">
          <PageHeader icon={Brain} title="اختبار الحفظ" subtitle="اختر السورة للبدء" />

          <div className="flex gap-2 mb-5">
            {difficultyOptions.map(d => (
              <button key={d.key} onClick={() => setDifficulty(d.key)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${difficulty === d.key ? d.color + ' ring-2 ring-current/20' : 'bg-secondary text-muted-foreground'}`}>
                {d.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : (
            <div className="space-y-2">
              {surahs.map(s => (
                <button key={s.number} onClick={() => handleSelectSurah(s.number)}
                  className="card-surface-hover w-full flex items-center gap-3 text-right">
                  <div className="verse-number flex-shrink-0">{s.number}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground text-sm">{s.name}</div>
                    <div className="text-[11px] text-muted-foreground">{s.numberOfAyahs} آيات</div>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                </button>
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
        <PageHeader icon={Brain} title="اختبار الحفظ" subtitle={surahs.find(s => s.number === selectedSurah)?.name || ''} showBack onBack={() => setSelectedSurah(null)} />

        {loadingAyahs ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : currentAyah ? (
          <>
            {/* Progress */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs text-muted-foreground">آية {currentAyah.numberInSurah} من {ayahs.length}</span>
              <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${((currentAyahIndex + 1) / ayahs.length) * 100}%` }} />
              </div>
            </div>

            {/* Ayah with hidden words */}
            <div className="card-surface p-5 mb-4">
              <div className="flex flex-wrap gap-2 justify-center leading-[2.8] font-amiri text-xl">
                {words.map((word, idx) => {
                  const isHidden = hiddenIndices.has(idx);
                  const isRevealed = revealedIndices.has(idx);

                  if (!isHidden) {
                    return <span key={idx} className="text-foreground">{word}</span>;
                  }

                  if (isRevealed) {
                    const isCorrect = showResults && (userInputs[idx]?.replace(/[^\u0621-\u064A]/g, '') === word.replace(/[^\u0621-\u064A]/g, ''));
                    const isWrong = showResults && !isCorrect && userInputs[idx];
                    return (
                      <span key={idx} className={`px-2 py-0.5 rounded-lg font-bold ${isCorrect ? 'bg-green-500/15 text-green-600 dark:text-green-400' : isWrong ? 'bg-red-500/15 text-red-500 line-through' : 'bg-primary/10 text-primary'}`}>
                        {word}
                      </span>
                    );
                  }

                  return (
                    <span key={idx} className="inline-flex items-center gap-1">
                      <input
                        value={userInputs[idx] || ''}
                        onChange={e => setUserInputs(prev => ({ ...prev, [idx]: e.target.value }))}
                        className="w-20 text-center border-b-2 border-primary/30 bg-transparent font-amiri text-lg text-foreground outline-none focus:border-primary py-0.5"
                        placeholder="..."
                        dir="rtl"
                      />
                      <button onClick={() => handleRevealWord(idx)} className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center">
                        <Eye className="w-3 h-3 text-accent" />
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Results */}
            {showResults && (
              <div className="card-surface p-4 mb-4 text-center">
                <Trophy className="w-8 h-8 mx-auto mb-2 text-accent" />
                <p className="text-lg font-bold text-foreground">{score} / {hiddenIndices.size}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {score === hiddenIndices.size ? 'ممتاز! أحسنت 🎉' : score >= hiddenIndices.size / 2 ? 'جيد، واصل المحاولة' : 'حاول مرة أخرى'}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 mb-4">
              {!showResults ? (
                <button onClick={handleCheckAnswers} className="flex-1 py-3 rounded-xl gradient-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" /> تحقق
                </button>
              ) : (
                <button onClick={handleRetry} className="flex-1 py-3 rounded-xl gradient-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2">
                  <RotateCcw className="w-4 h-4" /> إعادة
                </button>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button onClick={handlePrev} disabled={currentAyahIndex === 0}
                className="flex items-center gap-1 text-sm text-primary disabled:opacity-30">
                <ChevronRight className="w-4 h-4" /> السابقة
              </button>
              <button onClick={handleNext} disabled={currentAyahIndex === ayahs.length - 1}
                className="flex items-center gap-1 text-sm text-primary disabled:opacity-30">
                التالية <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default MemorizationTestPage;
