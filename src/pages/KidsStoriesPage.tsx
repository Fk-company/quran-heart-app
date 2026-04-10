import React, { useState } from 'react';
import { ArrowRight, BookOpen, Grid3X3, List, Heart, Star, ChevronDown, ChevronUp } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

interface KidsStory {
  id: number;
  title: string;
  category: string;
  summary: string;
  story: string;
  lesson: string;
  ageGroup: string;
}

const storyCategories = [
  { id: 'prophets', name: 'قصص الأنبياء للأطفال' },
  { id: 'quran', name: 'قصص قرآنية' },
  { id: 'morals', name: 'قصص أخلاقية' },
  { id: 'companions', name: 'قصص الصحابة' },
];

const kidsStories: KidsStory[] = [
  {
    id: 1, title: 'سفينة نوح عليه السلام', category: 'prophets', ageGroup: '4-8',
    summary: 'قصة نبي الله نوح وكيف بنى السفينة العظيمة بأمر من الله',
    story: 'في زمن بعيد، عاش نبي الله نوح عليه السلام بين قومه. كان نوح رجلاً صالحاً يدعو الناس إلى عبادة الله وحده. لكن قومه رفضوا الاستماع إليه وسخروا منه. فأمره الله أن يبني سفينة كبيرة جداً. عمل نوح بجد واجتهاد في بناء السفينة. ضحك منه الناس وقالوا: لماذا تبني سفينة في الصحراء؟ لكن نوح استمر في البناء لأنه يثق بالله. عندما اكتملت السفينة، أمر الله نوحاً أن يحمل فيها من كل نوع من الحيوانات زوجين اثنين، ومن آمن معه. ثم نزل المطر الشديد وخرج الماء من الأرض حتى غرق كل شيء. لكن السفينة ظلت تطفو بأمان بمن فيها.',
    lesson: 'الطاعة لله تحمينا دائماً، والصبر على أوامر الله يأتي بالخير'
  },
  {
    id: 2, title: 'يونس والحوت', category: 'prophets', ageGroup: '4-8',
    summary: 'قصة النبي يونس عليه السلام وكيف نجاه الله من بطن الحوت',
    story: 'كان يونس عليه السلام نبياً أرسله الله إلى قومه ليدعوهم إلى عبادة الله. لكنهم لم يستمعوا إليه فغضب وركب سفينة في البحر. هاج البحر واضطربت السفينة، فألقوه في الماء فابتلعه حوت كبير. في بطن الحوت المظلم، دعا يونس ربه قائلاً: لا إله إلا أنت سبحانك إني كنت من الظالمين. فاستجاب الله دعاءه وأمر الحوت أن يلفظه على الشاطئ.',
    lesson: 'الدعاء سلاح المؤمن، والله يستجيب لمن يدعوه بإخلاص'
  },
  {
    id: 3, title: 'إبراهيم والنار', category: 'prophets', ageGroup: '5-10',
    summary: 'قصة نبي الله إبراهيم الذي حطم الأصنام وكيف نجاه الله من النار',
    story: 'عاش إبراهيم عليه السلام في قوم يعبدون الأصنام. كان يتعجب كيف يعبدون حجارة لا تنفع ولا تضر. فقرر أن يُري قومه الحقيقة. عندما ذهب الناس إلى عيدهم، دخل إبراهيم إلى معبدهم وحطم جميع الأصنام إلا الكبير منها. عندما عادوا سألوه: أأنت فعلت هذا؟ قال: بل فعله كبيرهم هذا فاسألوه. غضبوا وقرروا حرقه. أشعلوا ناراً عظيمة وألقوه فيها. لكن الله أمر النار: يا نار كوني برداً وسلاماً على إبراهيم. فلم تحرقه النار!',
    lesson: 'الشجاعة في قول الحق، والله يحمي من يتوكل عليه'
  },
  {
    id: 4, title: 'أصحاب الكهف', category: 'quran', ageGroup: '6-12',
    summary: 'قصة الفتية المؤمنين الذين لجأوا إلى الكهف فراراً بدينهم',
    story: 'في زمن بعيد، كان هناك فتية آمنوا بالله في مدينة يحكمها ملك ظالم يعبد الأصنام. قرر هؤلاء الفتية الفرار بدينهم فلجأوا إلى كهف في الجبل. دعوا الله أن يحفظهم، فأنامهم الله في الكهف. ناموا سنوات طويلة جداً - ثلاثمئة وتسع سنين! وكلبهم باسط ذراعيه بالوصيد يحرسهم. عندما استيقظوا ظنوا أنهم ناموا يوماً أو بعض يوم.',
    lesson: 'الإيمان بالله والثبات عليه، وأن الله يحفظ عباده المؤمنين'
  },
  {
    id: 5, title: 'الصدق ينجي', category: 'morals', ageGroup: '4-8',
    summary: 'قصة عن فضل الصدق وأن المسلم يجب أن يكون صادقاً دائماً',
    story: 'كان هناك طفل اسمه أحمد، يحب اللعب كثيراً. ذات يوم كسر مزهرية أمه وهو يلعب في البيت. خاف أحمد وأراد أن يقول إن القطة هي التي كسرتها. لكنه تذكر قول النبي صلى الله عليه وسلم: إن الصدق يهدي إلى البر. فذهب إلى أمه وقال لها الحقيقة. ابتسمت أمه وقالت: أنا فخورة بك يا بني لأنك صادق. الصدق أهم من أي مزهرية في الدنيا.',
    lesson: 'الصدق فضيلة عظيمة، والمسلم يجب أن يكون صادقاً دائماً حتى لو كان خائفاً'
  },
  {
    id: 6, title: 'أبو بكر الصديق', category: 'companions', ageGroup: '6-12',
    summary: 'قصة أبي بكر الصديق رضي الله عنه أول من آمن من الرجال',
    story: 'كان أبو بكر رضي الله عنه صديقاً حميماً للنبي محمد صلى الله عليه وسلم. عندما أخبره النبي بأن الله أرسله نبياً، آمن به فوراً دون تردد. لهذا سُمي بالصديق. أنفق أبو بكر كل ماله في سبيل الله، واشترى العبيد المؤمنين ليحررهم من العذاب. وعندما هاجر النبي إلى المدينة، رافقه أبو بكر واختبأ معه في غار ثور.',
    lesson: 'الوفاء للأصدقاء والتضحية في سبيل الله من أعظم الأعمال'
  },
  {
    id: 7, title: 'موسى وفرعون', category: 'prophets', ageGroup: '5-10',
    summary: 'قصة نبي الله موسى وكيف أنجاه الله من فرعون',
    story: 'وُلد موسى عليه السلام في زمن فرعون الذي كان يقتل أبناء بني إسرائيل. ألهم الله أم موسى أن تضعه في صندوق وتلقيه في النهر. حمل النهر الصندوق إلى قصر فرعون، فالتقطته زوجة فرعون وأحبته وربّته. كبر موسى وأرسله الله إلى فرعون ليقول له: أرسل معنا بني إسرائيل. رفض فرعون، فشق الله لموسى البحر فمر هو وقومه بسلام، وأغرق فرعون وجنوده.',
    lesson: 'الله ينصر المظلومين ويهلك الظالمين مهما بلغت قوتهم'
  },
  {
    id: 8, title: 'الأمانة كنز', category: 'morals', ageGroup: '4-8',
    summary: 'قصة عن أهمية الأمانة وحفظ ما يُؤتمن عليه الإنسان',
    story: 'كان هناك تاجر أمين اسمه خالد. ذات يوم أعطاه جاره أمانة ليحفظها حتى يعود من سفره. مرت الأيام واحتاج خالد للمال، لكنه لم يمس الأمانة. عندما عاد جاره وجد أمانته كما هي. فرح الجار وقال: أنت أمين حقاً. وصار الناس يثقون بخالد ويعاملونه لأنه حافظ على الأمانة.',
    lesson: 'الأمانة صفة المؤمنين، والنبي صلى الله عليه وسلم كان يُلقب بالأمين'
  },
  {
    id: 9, title: 'يوسف الصديق', category: 'prophets', ageGroup: '6-12',
    summary: 'قصة نبي الله يوسف من البئر إلى عزيز مصر',
    story: 'كان يوسف عليه السلام أجمل إخوته وأحبهم إلى أبيه يعقوب. حسده إخوته وألقوه في بئر عميق. وجده مسافرون فأخذوه إلى مصر وباعوه. عمل يوسف بأمانة وصدق رغم كل المصاعب. سجن ظلماً لكنه صبر ودعا الله. ثم فسّر رؤيا الملك فأخرجه من السجن وجعله عزيز مصر على خزائنها. وفي النهاية التقى بأبيه وإخوته وسامحهم.',
    lesson: 'الصبر على البلاء والعفو عند المقدرة من أخلاق الأنبياء'
  },
  {
    id: 10, title: 'بلال بن رباح', category: 'companions', ageGroup: '6-12',
    summary: 'قصة بلال المؤذن الذي صبر على العذاب في سبيل إيمانه',
    story: 'كان بلال رضي الله عنه عبداً حبشياً أسلم وآمن بالله ورسوله. عذّبه سيده أمية بن خلف عذاباً شديداً ليرجع عن الإسلام. كان يضع الصخرة الكبيرة على صدره في حر الشمس. لكن بلال كان يردد: أحد.. أحد. اشتراه أبو بكر الصديق وأعتقه. وعندما فُتحت مكة، صعد بلال فوق الكعبة وأذّن أول أذان في الإسلام.',
    lesson: 'الثبات على الحق مهما كان الثمن، والله ينصر الصابرين'
  },
  {
    id: 11, title: 'سليمان والنملة', category: 'quran', ageGroup: '4-8',
    summary: 'قصة النبي سليمان الذي كان يفهم لغة الحيوانات والطيور',
    story: 'أعطى الله نبيه سليمان عليه السلام ملكاً عظيماً. كان يفهم لغة الطيور والحيوانات. ذات يوم كان سليمان يسير مع جنوده الكثيرين. فسمع نملة صغيرة تنادي رفيقاتها: يا أيها النمل ادخلوا مساكنكم لا يحطمنكم سليمان وجنوده وهم لا يشعرون. فتبسم سليمان من قولها وشكر الله على نعمه.',
    lesson: 'حتى أصغر المخلوقات لها قيمة عند الله، ويجب أن نشكر الله على كل نعمة'
  },
  {
    id: 12, title: 'الرحمة بالحيوان', category: 'morals', ageGroup: '4-8',
    summary: 'قصة عن رحمة الإسلام بالحيوانات وأن الرحمة تُدخل الجنة',
    story: 'أخبرنا النبي صلى الله عليه وسلم عن رجل كان يمشي في الصحراء فعطش عطشاً شديداً. نزل في بئر فشرب. عندما خرج وجد كلباً يلهث من شدة العطش ويأكل الثرى. قال الرجل: لقد بلغ هذا الكلب من العطش مثل الذي بلغ مني. فنزل البئر مرة أخرى وملأ خفه بالماء وسقى الكلب. فشكر الله له وغفر له.',
    lesson: 'الرحمة بالحيوانات من الإيمان، وكل عمل خير يُثاب عليه المسلم'
  },
];

const KidsStoriesPage: React.FC = () => {
  const [selected, setSelected] = useState<KidsStory | null>(null);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [favs, setFavs] = useState<number[]>([]);

  const filtered = selectedCat ? kidsStories.filter(s => s.category === selectedCat) : kidsStories;
  const toggleFav = (id: number) => setFavs(p => p.includes(id) ? p.filter(f => f !== id) : [...p, id]);

  if (selected) {
    return (
      <div className="page-container page-with-topbar" dir="rtl">
        <div className="px-4 pt-4 max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-5">
            <button onClick={() => setSelected(null)} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-foreground" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-foreground">{selected.title}</h1>
              <p className="text-xs text-muted-foreground">للأعمار {selected.ageGroup} سنوات</p>
            </div>
            <button onClick={() => toggleFav(selected.id)} className={`fav-btn ${favs.includes(selected.id) ? 'active' : ''}`}>
              <Heart className="w-5 h-5" fill={favs.includes(selected.id) ? 'currentColor' : 'none'} />
            </button>
          </div>

          <div className="gradient-hero islamic-pattern rounded-2xl p-5 mb-5 text-primary-foreground">
            <div className="w-12 h-12 rounded-full bg-primary-foreground/10 flex items-center justify-center mb-3">
              <BookOpen className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold mb-1">{selected.title}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs opacity-70 bg-primary-foreground/10 rounded-full px-2 py-0.5">
                {storyCategories.find(c => c.id === selected.category)?.name}
              </span>
              <span className="text-xs opacity-70 bg-primary-foreground/10 rounded-full px-2 py-0.5">
                {selected.ageGroup} سنوات
              </span>
            </div>
          </div>

          <div className="card-surface mb-3">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-foreground">القصة</span>
            </div>
            <p className="text-sm text-foreground leading-[2] font-amiri">{selected.story}</p>
          </div>

          <div className="card-surface mb-4 bg-accent/5 border-accent/15">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-accent" />
              <span className="text-sm font-bold text-foreground">الدرس المستفاد</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">{selected.lesson}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container page-with-topbar" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <PageHeader
          icon={BookOpen}
          title="قصص إسلامية للأطفال"
          subtitle={`${kidsStories.length} قصة ممتعة ومفيدة`}
          gradient="gold"
          actions={
            <div className="flex gap-1">
              <button onClick={() => setViewMode('list')} className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}><List className="w-4 h-4" /></button>
              <button onClick={() => setViewMode('grid')} className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}><Grid3X3 className="w-4 h-4" /></button>
            </div>
          }
        />

        <div className="flex flex-wrap gap-2 mb-5">
          <button onClick={() => setSelectedCat(null)} className={`filter-chip ${!selectedCat ? 'active' : ''}`}>الكل</button>
          {storyCategories.map(cat => (
            <button key={cat.id} onClick={() => setSelectedCat(cat.id)} className={`filter-chip ${selectedCat === cat.id ? 'active' : ''}`}>{cat.name}</button>
          ))}
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-2.5">
            {filtered.map(story => (
              <button key={story.id} onClick={() => setSelected(story)} className="card-surface-hover flex flex-col p-3 gap-2 text-right relative">
                <button onClick={(e) => { e.stopPropagation(); toggleFav(story.id); }} className={`fav-btn absolute top-2 left-2 w-6 h-6 ${favs.includes(story.id) ? 'active' : ''}`}>
                  <Heart className="w-3 h-3" fill={favs.includes(story.id) ? 'currentColor' : 'none'} />
                </button>
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-accent" />
                </div>
                <span className="font-bold text-foreground text-sm">{story.title}</span>
                <span className="text-[10px] text-muted-foreground line-clamp-2">{story.summary}</span>
                <div className="flex items-center gap-1.5 mt-auto">
                  <span className="text-[9px] text-primary bg-primary/10 rounded-full px-1.5 py-0.5">
                    {story.ageGroup} سنوات
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map(story => (
              <button key={story.id} onClick={() => setSelected(story)} className="card-surface-hover w-full flex items-center gap-3 text-right">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-foreground text-sm">{story.title}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1">{story.summary}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] text-primary bg-primary/10 rounded-full px-1.5 py-0.5">
                      {story.ageGroup} سنوات
                    </span>
                    <span className="text-[9px] text-accent bg-accent/10 rounded-full px-1.5 py-0.5">
                      {storyCategories.find(c => c.id === story.category)?.name}
                    </span>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); toggleFav(story.id); }} className={`fav-btn ${favs.includes(story.id) ? 'active' : ''}`}>
                  <Heart className="w-4 h-4" fill={favs.includes(story.id) ? 'currentColor' : 'none'} />
                </button>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KidsStoriesPage;
