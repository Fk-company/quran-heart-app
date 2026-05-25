import React, { useEffect, useMemo, useState } from 'react';
import { Brain, CheckCircle2, XCircle, Trophy, RefreshCw, Sparkles, ChevronLeft, Target } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

const MISSED_KEY = 'quiz_missed_registry';
const getMissed = (): Record<string, number> => {
  try { return JSON.parse(localStorage.getItem(MISSED_KEY) || '{}'); } catch { return {}; }
};
const bumpMissed = (qText: string) => {
  const m = getMissed();
  m[qText] = (m[qText] || 0) + 1;
  try { localStorage.setItem(MISSED_KEY, JSON.stringify(m)); } catch {}
};
const decrementMissed = (qText: string) => {
  const m = getMissed();
  if (m[qText]) {
    m[qText] = Math.max(0, m[qText] - 1);
    if (!m[qText]) delete m[qText];
    try { localStorage.setItem(MISSED_KEY, JSON.stringify(m)); } catch {}
  }
};

type Difficulty = 'easy' | 'medium' | 'hard';
type Category = 'quran' | 'hadith' | 'seerah' | 'fiqh' | 'aqeedah' | 'history' | 'general';

interface Q {
  q: string;
  options: string[];
  answer: number;
  difficulty: Difficulty;
  category: Category;
  explain?: string;
}

const CATEGORY_LABELS: Record<Category | 'all', string> = {
  all: 'الكل',
  quran: 'القرآن',
  hadith: 'الحديث',
  seerah: 'السيرة',
  fiqh: 'الفقه',
  aqeedah: 'العقيدة',
  history: 'التاريخ',
  general: 'عام',
};

const DIFFICULTY_LABELS: Record<Difficulty | 'all', string> = {
  all: 'جميع المستويات',
  easy: 'سهل',
  medium: 'متوسط',
  hard: 'صعب',
};

const BANK: Q[] = [
  // ==================== EASY - القرآن ====================
  { q: 'كم عدد سور القرآن الكريم؟', options: ['110', '114', '120', '116'], answer: 1, difficulty: 'easy', category: 'quran' },
  { q: 'ما أطول سورة في القرآن الكريم؟', options: ['آل عمران', 'النساء', 'البقرة', 'المائدة'], answer: 2, difficulty: 'easy', category: 'quran' },
  { q: 'ما أقصر سورة في القرآن؟', options: ['الفاتحة', 'الإخلاص', 'الكوثر', 'الناس'], answer: 2, difficulty: 'easy', category: 'quran' },
  { q: 'في أي سورة توجد آية الكرسي؟', options: ['البقرة', 'آل عمران', 'يس', 'الفاتحة'], answer: 0, difficulty: 'easy', category: 'quran' },
  { q: 'كم عدد أجزاء القرآن الكريم؟', options: ['20', '30', '40', '60'], answer: 1, difficulty: 'easy', category: 'quran' },
  { q: 'ما السورة التي تسمى قلب القرآن؟', options: ['الفاتحة', 'يس', 'الرحمن', 'الإخلاص'], answer: 1, difficulty: 'easy', category: 'quran' },
  { q: 'كم عدد آيات سورة الفاتحة؟', options: ['5', '6', '7', '8'], answer: 2, difficulty: 'easy', category: 'quran' },
  { q: 'بأي سورة يبدأ القرآن الكريم؟', options: ['البقرة', 'الفاتحة', 'العلق', 'يس'], answer: 1, difficulty: 'easy', category: 'quran' },
  { q: 'ما آخر سورة في المصحف؟', options: ['الفلق', 'الناس', 'الإخلاص', 'الكوثر'], answer: 1, difficulty: 'easy', category: 'quran' },
  { q: 'كم عدد أحزاب القرآن؟', options: ['30', '60', '120', '114'], answer: 1, difficulty: 'easy', category: 'quran' },
  { q: 'ما السورة المسماة بأم الكتاب؟', options: ['البقرة', 'الفاتحة', 'يس', 'الإخلاص'], answer: 1, difficulty: 'easy', category: 'quran' },
  { q: 'كم عدد آيات سورة الإخلاص؟', options: ['3', '4', '5', '6'], answer: 1, difficulty: 'easy', category: 'quran' },

  // ==================== EASY - أركان وعبادات ====================
  { q: 'كم عدد أركان الإسلام؟', options: ['4', '5', '6', '7'], answer: 1, difficulty: 'easy', category: 'fiqh' },
  { q: 'كم عدد أركان الإيمان؟', options: ['5', '6', '7', '4'], answer: 1, difficulty: 'easy', category: 'aqeedah' },
  { q: 'كم عدد الصلوات المفروضة في اليوم؟', options: ['3', '4', '5', '6'], answer: 2, difficulty: 'easy', category: 'fiqh' },
  { q: 'كم عدد ركعات صلاة الفجر؟', options: ['2', '3', '4', '5'], answer: 0, difficulty: 'easy', category: 'fiqh' },
  { q: 'كم عدد ركعات صلاة الظهر؟', options: ['2', '3', '4', '5'], answer: 2, difficulty: 'easy', category: 'fiqh' },
  { q: 'كم عدد ركعات صلاة المغرب؟', options: ['2', '3', '4', '5'], answer: 1, difficulty: 'easy', category: 'fiqh' },
  { q: 'في أي شهر فُرض صيام رمضان؟', options: ['شعبان', 'رمضان', 'محرم', 'ذو الحجة'], answer: 1, difficulty: 'easy', category: 'fiqh' },
  { q: 'كم مقدار زكاة المال؟', options: ['1%', '2.5%', '5%', '10%'], answer: 1, difficulty: 'easy', category: 'fiqh' },
  { q: 'إلى أين يتجه المسلم في صلاته؟', options: ['القدس', 'مكة المكرمة', 'المدينة', 'مكان مولده'], answer: 1, difficulty: 'easy', category: 'fiqh' },

  // ==================== EASY - السيرة ====================
  { q: 'من هو خاتم الأنبياء والمرسلين؟', options: ['عيسى', 'موسى', 'محمد ﷺ', 'إبراهيم'], answer: 2, difficulty: 'easy', category: 'seerah' },
  { q: 'في أي شهر وُلد النبي ﷺ؟', options: ['محرم', 'صفر', 'ربيع الأول', 'رجب'], answer: 2, difficulty: 'easy', category: 'seerah' },
  { q: 'من هو أبو النبي ﷺ؟', options: ['عبد الله', 'عبد المطلب', 'أبو طالب', 'حمزة'], answer: 0, difficulty: 'easy', category: 'seerah' },
  { q: 'من هي أم النبي ﷺ؟', options: ['خديجة', 'آمنة', 'فاطمة', 'حليمة'], answer: 1, difficulty: 'easy', category: 'seerah' },
  { q: 'من هي أول زوجات النبي ﷺ؟', options: ['عائشة', 'حفصة', 'خديجة', 'سودة'], answer: 2, difficulty: 'easy', category: 'seerah' },
  { q: 'في أي مدينة وُلد النبي ﷺ؟', options: ['المدينة', 'الطائف', 'مكة', 'صنعاء'], answer: 2, difficulty: 'easy', category: 'seerah' },
  { q: 'من هو أول الخلفاء الراشدين؟', options: ['عمر', 'أبو بكر', 'علي', 'عثمان'], answer: 1, difficulty: 'easy', category: 'history' },

  // ==================== MEDIUM - القرآن ====================
  { q: 'في أي شهر نزل القرآن الكريم؟', options: ['شعبان', 'رمضان', 'رجب', 'ذو الحجة'], answer: 1, difficulty: 'medium', category: 'quran' },
  { q: 'كم مرة ذكر اسم محمد ﷺ في القرآن؟', options: ['3', '4', '5', '7'], answer: 1, difficulty: 'medium', category: 'quran' },
  { q: 'ما السورة التي ليس فيها بسملة؟', options: ['التوبة', 'الفاتحة', 'البقرة', 'النمل'], answer: 0, difficulty: 'medium', category: 'quran' },
  { q: 'ما السورة التي ورد فيها لفظ الجلالة "الله" في كل آية تقريباً؟', options: ['الإخلاص', 'المجادلة', 'البقرة', 'الكهف'], answer: 1, difficulty: 'medium', category: 'quran' },
  { q: 'ما هي السورة المُسمّاة بـ"عروس القرآن"؟', options: ['يس', 'الرحمن', 'الواقعة', 'الملك'], answer: 1, difficulty: 'medium', category: 'quran' },
  { q: 'ما السورة التي تُسمّى "المنجية"؟', options: ['تبارك (الملك)', 'الكهف', 'يس', 'الفتح'], answer: 0, difficulty: 'medium', category: 'quran' },
  { q: 'ما أول ما نزل من القرآن الكريم؟', options: ['﴿يا أيها المدثر﴾', '﴿اقرأ باسم ربك﴾', '﴿الحمد لله﴾', '﴿ن والقلم﴾'], answer: 1, difficulty: 'medium', category: 'quran' },
  { q: 'في أي سورة قصة أصحاب الكهف؟', options: ['مريم', 'الكهف', 'طه', 'يس'], answer: 1, difficulty: 'medium', category: 'quran' },
  { q: 'كم عدد السور المكية تقريباً؟', options: ['86', '90', '100', '70'], answer: 0, difficulty: 'medium', category: 'quran' },
  { q: 'ما السورة التي يُسن قراءتها يوم الجمعة؟', options: ['يس', 'الكهف', 'الواقعة', 'الملك'], answer: 1, difficulty: 'medium', category: 'quran' },
  { q: 'كم سجدة تلاوة في القرآن (على الراجح)؟', options: ['10', '14', '15', '20'], answer: 2, difficulty: 'medium', category: 'quran' },

  // ==================== MEDIUM - السيرة والتاريخ ====================
  { q: 'في أي غزوة نزل قوله تعالى "اليوم أكملت لكم دينكم"؟', options: ['بدر', 'أحد', 'حجة الوداع', 'الخندق'], answer: 2, difficulty: 'medium', category: 'history' },
  { q: 'كم كان عمر النبي ﷺ عند بعثته؟', options: ['35', '40', '45', '50'], answer: 1, difficulty: 'medium', category: 'seerah' },
  { q: 'كم سنة استغرقت الدعوة المكية؟', options: ['10', '13', '15', '20'], answer: 1, difficulty: 'medium', category: 'seerah' },
  { q: 'في أي عام كانت غزوة بدر الكبرى؟', options: ['1 هـ', '2 هـ', '3 هـ', '5 هـ'], answer: 1, difficulty: 'medium', category: 'history' },
  { q: 'من هو الصحابي الملقب بـ"سيف الله المسلول"؟', options: ['عمر بن الخطاب', 'خالد بن الوليد', 'سعد بن أبي وقاص', 'علي بن أبي طالب'], answer: 1, difficulty: 'medium', category: 'history' },
  { q: 'من أول من أسلم من الرجال؟', options: ['عمر', 'أبو بكر', 'علي', 'عثمان'], answer: 1, difficulty: 'medium', category: 'seerah' },
  { q: 'من أول من أسلم من الصبيان؟', options: ['زيد بن حارثة', 'علي بن أبي طالب', 'الزبير', 'سعد'], answer: 1, difficulty: 'medium', category: 'seerah' },
  { q: 'في أي عام هاجر النبي ﷺ إلى المدينة؟', options: ['610م', '622م', '630م', '632م'], answer: 1, difficulty: 'medium', category: 'history' },
  { q: 'كم سنة عاش النبي ﷺ؟', options: ['60', '63', '65', '70'], answer: 1, difficulty: 'medium', category: 'seerah' },
  { q: 'من هو "أمين هذه الأمة"؟', options: ['أبو بكر', 'عمر', 'أبو عبيدة بن الجراح', 'عثمان'], answer: 2, difficulty: 'medium', category: 'history' },

  // ==================== MEDIUM - الفقه والعقيدة ====================
  { q: 'ما حكم صلاة الجماعة على الراجح؟', options: ['سنة', 'فرض كفاية', 'فرض عين', 'مستحبة'], answer: 2, difficulty: 'medium', category: 'fiqh' },
  { q: 'ما نصاب زكاة الذهب؟', options: ['50 غم', '85 غم', '100 غم', '200 غم'], answer: 1, difficulty: 'medium', category: 'fiqh' },
  { q: 'ما نصاب زكاة الفضة؟', options: ['200 غم', '300 غم', '595 غم', '700 غم'], answer: 2, difficulty: 'medium', category: 'fiqh' },
  { q: 'كم عدد الكتب السماوية المذكورة في القرآن؟', options: ['3', '4', '5', '6'], answer: 1, difficulty: 'medium', category: 'aqeedah' },
  { q: 'كم عدد الرسل أولي العزم؟', options: ['3', '4', '5', '6'], answer: 2, difficulty: 'medium', category: 'aqeedah' },
  { q: 'ما حكم صيام يوم عرفة لغير الحاج؟', options: ['واجب', 'سنة مؤكدة', 'مكروه', 'مباح'], answer: 1, difficulty: 'medium', category: 'fiqh' },
  { q: 'كم تكبيرة في صلاة العيد (الركعة الأولى) عند الجمهور؟', options: ['3', '5', '7', '9'], answer: 2, difficulty: 'medium', category: 'fiqh' },

  // ==================== MEDIUM - الحديث ====================
  { q: 'من هو صاحب أصح كتاب بعد القرآن؟', options: ['مسلم', 'البخاري', 'الترمذي', 'أبو داود'], answer: 1, difficulty: 'medium', category: 'hadith' },
  { q: 'ما اسم كتاب الإمام مالك المشهور؟', options: ['الموطأ', 'المسند', 'الصحيح', 'السنن'], answer: 0, difficulty: 'medium', category: 'hadith' },
  { q: 'من هو أكثر الصحابة رواية للحديث؟', options: ['أبو بكر', 'أبو هريرة', 'ابن عباس', 'عائشة'], answer: 1, difficulty: 'medium', category: 'hadith' },
  { q: 'كم عدد كتب السنة الستة (الصحاح)؟', options: ['4', '5', '6', '7'], answer: 2, difficulty: 'medium', category: 'hadith' },

  // ==================== HARD - القرآن ====================
  { q: 'ما السورة التي تحوي اسم الله الأعظم على الراجح؟', options: ['الفاتحة', 'البقرة وآل عمران', 'يس', 'الإخلاص'], answer: 1, difficulty: 'hard', category: 'quran' },
  { q: 'كم آية في القرآن الكريم على المشهور؟', options: ['6000', '6236', '6348', '6666'], answer: 1, difficulty: 'hard', category: 'quran' },
  { q: 'ما السورة الوحيدة التي تبدأ بـ"الحمد لله" أربع مرات في القرآن؟', options: ['الفاتحة', 'الأنعام والكهف وسبأ وفاطر', 'يس', 'الرحمن'], answer: 1, difficulty: 'hard', category: 'quran' },
  { q: 'كم مرة ذُكرت كلمة "الرحمن" في القرآن؟', options: ['57', '99', '114', '169'], answer: 0, difficulty: 'hard', category: 'quran' },
  { q: 'ما السورة التي ذُكر فيها لفظ "بسم الله" مرتين؟', options: ['الفاتحة', 'هود', 'النمل', 'يس'], answer: 2, difficulty: 'hard', category: 'quran' },
  { q: 'في أي سورة قصة ذي القرنين؟', options: ['الكهف', 'مريم', 'يس', 'الفتح'], answer: 0, difficulty: 'hard', category: 'quran' },
  { q: 'ما أكثر السور ذكراً للأنبياء؟', options: ['البقرة', 'الأنبياء', 'الأعراف', 'هود'], answer: 1, difficulty: 'hard', category: 'quran' },
  { q: 'ما السورة المسماة بـ"الفاضحة" لأنها فضحت المنافقين؟', options: ['التوبة', 'المنافقون', 'الأحزاب', 'الحشر'], answer: 0, difficulty: 'hard', category: 'quran' },

  // ==================== HARD - السيرة والتاريخ ====================
  { q: 'كم عدد غزوات النبي ﷺ؟', options: ['19', '27', '30', '40'], answer: 1, difficulty: 'hard', category: 'history' },
  { q: 'كم غزوة قاتل فيها النبي ﷺ بنفسه؟', options: ['5', '7', '9', '12'], answer: 2, difficulty: 'hard', category: 'history' },
  { q: 'في أي سنة فُتحت مكة؟', options: ['6 هـ', '7 هـ', '8 هـ', '10 هـ'], answer: 2, difficulty: 'hard', category: 'history' },
  { q: 'من هو أول من جمع القرآن في مصحف واحد؟', options: ['أبو بكر', 'عمر', 'عثمان', 'علي'], answer: 0, difficulty: 'hard', category: 'history' },
  { q: 'من هو الخليفة الذي وحّد المصاحف على قراءة واحدة؟', options: ['أبو بكر', 'عمر', 'عثمان', 'علي'], answer: 2, difficulty: 'hard', category: 'history' },
  { q: 'من قائد معركة القادسية؟', options: ['خالد بن الوليد', 'سعد بن أبي وقاص', 'أبو عبيدة', 'عمرو بن العاص'], answer: 1, difficulty: 'hard', category: 'history' },
  { q: 'من فاتح الأندلس؟', options: ['موسى بن نصير', 'طارق بن زياد', 'عقبة بن نافع', 'عبد الرحمن الداخل'], answer: 1, difficulty: 'hard', category: 'history' },

  // ==================== HARD - الفقه والعقيدة ====================
  { q: 'كم عدد واجبات الحج؟', options: ['4', '5', '7', '9'], answer: 2, difficulty: 'hard', category: 'fiqh' },
  { q: 'كم عدد أركان الحج؟', options: ['3', '4', '5', '6'], answer: 1, difficulty: 'hard', category: 'fiqh' },
  { q: 'كم نوع من أنواع المياه في الفقه؟', options: ['2', '3', '4', '5'], answer: 1, difficulty: 'hard', category: 'fiqh' },
  { q: 'كم نوعاً من التوحيد عند أهل السنة؟', options: ['2', '3', '4', '5'], answer: 1, difficulty: 'hard', category: 'aqeedah' },
  { q: 'كم عدد أسماء الله الحسنى الواردة في الحديث؟', options: ['99', '100', '114', 'لا حصر لها'], answer: 0, difficulty: 'hard', category: 'aqeedah' },

  // ==================== EXTRA - القرآن ====================
  { q: 'كم عدد السور المدنية تقريباً؟', options: ['28', '20', '36', '40'], answer: 0, difficulty: 'medium', category: 'quran' },
  { q: 'ما السورة التي تُعدل ثلث القرآن؟', options: ['الفاتحة', 'الإخلاص', 'يس', 'الكافرون'], answer: 1, difficulty: 'easy', category: 'quran' },
  { q: 'في أي سورة قصة هاروت وماروت؟', options: ['البقرة', 'النساء', 'المائدة', 'يونس'], answer: 0, difficulty: 'hard', category: 'quran' },
  { q: 'كم آية في سورة البقرة؟', options: ['200', '250', '286', '300'], answer: 2, difficulty: 'medium', category: 'quran' },
  { q: 'كم عدد الحروف المقطعة في فواتح السور؟', options: ['10', '14', '20', '28'], answer: 1, difficulty: 'hard', category: 'quran' },
  { q: 'ما السورة التي ذُكر فيها اسم "محمد" صراحة؟', options: ['القتال (محمد)', 'يس', 'الفتح', 'كل ما سبق'], answer: 3, difficulty: 'hard', category: 'quran' },
  { q: 'في أي سورة آية الدَّين (أطول آية)؟', options: ['البقرة', 'النساء', 'المائدة', 'النور'], answer: 0, difficulty: 'medium', category: 'quran' },
  { q: 'ما السورة المعروفة بـ"بني إسرائيل"؟', options: ['الكهف', 'الإسراء', 'مريم', 'طه'], answer: 1, difficulty: 'medium', category: 'quran' },
  { q: 'كم عدد السجدات في القرآن عند الشافعية؟', options: ['10', '14', '15', '17'], answer: 1, difficulty: 'hard', category: 'quran' },
  { q: 'ما السورة التي بها سجدتان؟', options: ['الحج', 'السجدة', 'الانشقاق', 'العلق'], answer: 0, difficulty: 'hard', category: 'quran' },
  { q: 'كم مرة ذُكر اسم مريم عليها السلام في القرآن؟', options: ['10', '20', '34', '50'], answer: 2, difficulty: 'hard', category: 'quran' },
  { q: 'ما السورة التي تبدأ بـ"تبارك الذي بيده الملك"؟', options: ['الفرقان', 'الملك', 'الذاريات', 'القلم'], answer: 1, difficulty: 'easy', category: 'quran' },
  { q: 'ما أول آية نزلت في تحريم الخمر بشكل قاطع؟', options: ['البقرة 219', 'النساء 43', 'المائدة 90', 'الأعراف 33'], answer: 2, difficulty: 'hard', category: 'quran' },
  { q: 'كم عدد آيات سورة الكوثر؟', options: ['3', '4', '5', '6'], answer: 0, difficulty: 'easy', category: 'quran' },
  { q: 'ما اسم السورة التي تسمى "الفسطاط"؟', options: ['البقرة', 'النور', 'الأنفال', 'الحجرات'], answer: 1, difficulty: 'hard', category: 'quran' },

  // ==================== EXTRA - السيرة والصحابة ====================
  { q: 'من هو "ذو النورين" من الصحابة؟', options: ['أبو بكر', 'عمر', 'عثمان', 'علي'], answer: 2, difficulty: 'medium', category: 'history' },
  { q: 'من هو "أسد الله"؟', options: ['علي', 'حمزة', 'خالد', 'سعد'], answer: 1, difficulty: 'medium', category: 'history' },
  { q: 'من أول من استشهد في الإسلام؟', options: ['سمية بنت خياط', 'بلال', 'ياسر', 'حمزة'], answer: 0, difficulty: 'medium', category: 'history' },
  { q: 'كم عدد المهاجرين إلى الحبشة في الهجرة الأولى؟', options: ['10', '12', '15', '20'], answer: 1, difficulty: 'hard', category: 'history' },
  { q: 'في أي غار اختبأ النبي ﷺ وأبو بكر عند الهجرة؟', options: ['حراء', 'ثور', 'الغار الأسود', 'الرحمة'], answer: 1, difficulty: 'easy', category: 'seerah' },
  { q: 'في أي غار كان النبي ﷺ يتعبد قبل البعثة؟', options: ['حراء', 'ثور', 'الفتح', 'النور'], answer: 0, difficulty: 'easy', category: 'seerah' },
  { q: 'كم عاماً مكث النبي ﷺ في المدينة؟', options: ['8', '10', '12', '13'], answer: 1, difficulty: 'medium', category: 'seerah' },
  { q: 'من هو خال النبي ﷺ من الرضاع؟', options: ['عبد الله', 'الحارث', 'حمزة', 'العباس'], answer: 1, difficulty: 'hard', category: 'seerah' },
  { q: 'في أي معركة استشهد حمزة رضي الله عنه؟', options: ['بدر', 'أحد', 'الخندق', 'حنين'], answer: 1, difficulty: 'medium', category: 'history' },
  { q: 'من قائد جيش مؤتة بعد استشهاد القادة الثلاثة؟', options: ['خالد بن الوليد', 'عمرو بن العاص', 'أبو عبيدة', 'المثنى'], answer: 0, difficulty: 'medium', category: 'history' },
  { q: 'كم عدد بيعات العقبة؟', options: ['1', '2', '3', '4'], answer: 1, difficulty: 'medium', category: 'seerah' },
  { q: 'في أي عام كانت غزوة الخندق؟', options: ['3 هـ', '4 هـ', '5 هـ', '6 هـ'], answer: 2, difficulty: 'medium', category: 'history' },
  { q: 'من أول من جهر بالقرآن في مكة؟', options: ['أبو بكر', 'عبد الله بن مسعود', 'علي', 'الزبير'], answer: 1, difficulty: 'hard', category: 'seerah' },
  { q: 'من هو "ترجمان القرآن"؟', options: ['ابن مسعود', 'ابن عباس', 'ابن عمر', 'أبي بن كعب'], answer: 1, difficulty: 'medium', category: 'history' },

  // ==================== EXTRA - الفقه ====================
  { q: 'كم عدد فروض الوضوء عند الجمهور؟', options: ['4', '5', '6', '7'], answer: 0, difficulty: 'easy', category: 'fiqh' },
  { q: 'كم عدد سنن الوضوء المؤكدة؟', options: ['5', '7', '10', '12'], answer: 2, difficulty: 'medium', category: 'fiqh' },
  { q: 'كم عدد نواقض الوضوء؟', options: ['4', '5', '6', '8'], answer: 2, difficulty: 'medium', category: 'fiqh' },
  { q: 'كم عدد ركعات صلاة العصر؟', options: ['2', '3', '4', '5'], answer: 2, difficulty: 'easy', category: 'fiqh' },
  { q: 'كم عدد ركعات صلاة العشاء؟', options: ['2', '3', '4', '5'], answer: 2, difficulty: 'easy', category: 'fiqh' },
  { q: 'ما حكم صلاة الوتر؟', options: ['فرض', 'سنة مؤكدة', 'مستحبة', 'مكروهة'], answer: 1, difficulty: 'medium', category: 'fiqh' },
  { q: 'كم يوماً يصوم المسلم في رمضان؟', options: ['28', '29', '29 أو 30', '31'], answer: 2, difficulty: 'easy', category: 'fiqh' },
  { q: 'ما حكم الاعتكاف في العشر الأواخر من رمضان؟', options: ['فرض', 'واجب', 'سنة مؤكدة', 'مباح'], answer: 2, difficulty: 'medium', category: 'fiqh' },
  { q: 'ما حكم زكاة الفطر؟', options: ['سنة', 'مستحبة', 'واجبة', 'مباحة'], answer: 2, difficulty: 'medium', category: 'fiqh' },
  { q: 'متى تجب زكاة الفطر؟', options: ['أول رمضان', 'منتصف رمضان', 'غروب آخر يوم من رمضان', 'يوم العيد'], answer: 2, difficulty: 'medium', category: 'fiqh' },
  { q: 'كم مقدار زكاة الفطر؟', options: ['نصف صاع', 'صاع', 'صاعان', 'رطل'], answer: 1, difficulty: 'medium', category: 'fiqh' },
  { q: 'ما هو شهر الحج الأكبر؟', options: ['رجب', 'شعبان', 'ذو القعدة', 'ذو الحجة'], answer: 3, difficulty: 'easy', category: 'fiqh' },
  { q: 'في أي يوم يقف الحاج بعرفة؟', options: ['8 ذو الحجة', '9 ذو الحجة', '10 ذو الحجة', '12 ذو الحجة'], answer: 1, difficulty: 'medium', category: 'fiqh' },
  { q: 'كم عدد أشواط الطواف؟', options: ['3', '5', '7', '9'], answer: 2, difficulty: 'easy', category: 'fiqh' },
  { q: 'كم عدد أشواط السعي بين الصفا والمروة؟', options: ['3', '5', '7', '9'], answer: 2, difficulty: 'easy', category: 'fiqh' },

  // ==================== EXTRA - العقيدة والحديث ====================
  { q: 'من هم أصحاب الكتب الستة؟', options: ['البخاري ومسلم فقط', 'البخاري ومسلم وأبو داود والترمذي والنسائي وابن ماجه', 'الأئمة الأربعة', 'لا أحد'], answer: 1, difficulty: 'medium', category: 'hadith' },
  { q: 'ما الفرق بين الحديث القدسي والقرآن؟', options: ['لا فرق', 'القدسي معناه من الله ولفظه من النبي ﷺ', 'القدسي يُتلى في الصلاة', 'القدسي محفوظ في اللوح'], answer: 1, difficulty: 'hard', category: 'hadith' },
  { q: 'ما أول واجب على المكلف؟', options: ['الصلاة', 'الشهادتان', 'معرفة الله', 'الزكاة'], answer: 2, difficulty: 'hard', category: 'aqeedah' },
  { q: 'كم عدد علامات الساعة الكبرى؟', options: ['5', '8', '10', '12'], answer: 2, difficulty: 'medium', category: 'aqeedah' },
  { q: 'من أول من يدخل الجنة من الأمم؟', options: ['أمة موسى', 'أمة عيسى', 'أمة محمد ﷺ', 'أمة إبراهيم'], answer: 2, difficulty: 'medium', category: 'aqeedah' },
  { q: 'ما اسم الملك الموكل بقبض الأرواح؟', options: ['جبريل', 'ميكائيل', 'إسرافيل', 'ملك الموت'], answer: 3, difficulty: 'easy', category: 'aqeedah' },
  { q: 'ما اسم الملك الموكل بالقطر والنبات؟', options: ['جبريل', 'ميكائيل', 'إسرافيل', 'مالك'], answer: 1, difficulty: 'medium', category: 'aqeedah' },
  { q: 'من خازن الجنة؟', options: ['رضوان', 'مالك', 'جبريل', 'ميكائيل'], answer: 0, difficulty: 'medium', category: 'aqeedah' },
  { q: 'كم عدد طبقات الجنة في الحديث؟', options: ['7', '8', '100', 'لا حد'], answer: 2, difficulty: 'hard', category: 'aqeedah' },
  { q: 'ما أعلى درجات الجنة؟', options: ['عدن', 'الفردوس الأعلى', 'النعيم', 'المأوى'], answer: 1, difficulty: 'medium', category: 'aqeedah' },

  // ==================== EXTRA - عام وقصص الأنبياء ====================
  { q: 'كم سنة دعا نوح عليه السلام قومه؟', options: ['500', '700', '950', '1000'], answer: 2, difficulty: 'medium', category: 'general' },
  { q: 'من هو "أبو الأنبياء"؟', options: ['نوح', 'إبراهيم', 'موسى', 'عيسى'], answer: 1, difficulty: 'easy', category: 'general' },
  { q: 'من هو النبي الذي علّمه الله صنعة الحديد؟', options: ['داود', 'سليمان', 'إدريس', 'موسى'], answer: 0, difficulty: 'medium', category: 'general' },
  { q: 'كم عدد المرسلين المذكورين بالاسم في القرآن؟', options: ['20', '25', '30', '124'], answer: 1, difficulty: 'medium', category: 'general' },
  { q: 'من هو النبي الذي رفعه الله إلى السماء؟', options: ['إدريس', 'إلياس', 'عيسى', 'إدريس وعيسى'], answer: 3, difficulty: 'hard', category: 'general' },
  { q: 'من هو نبي الله الذي ابتُلي في جسده؟', options: ['أيوب', 'يونس', 'يعقوب', 'موسى'], answer: 0, difficulty: 'easy', category: 'general' },
  { q: 'كم عاماً مكث يوسف في السجن؟', options: ['3', '5', '7', '9'], answer: 2, difficulty: 'hard', category: 'general' },
  { q: 'من النبي الذي قال "رب اشرح لي صدري"؟', options: ['موسى', 'هارون', 'محمد ﷺ', 'يونس'], answer: 0, difficulty: 'medium', category: 'quran' },
  { q: 'من النبي الذي علّمه الله منطق الطير؟', options: ['داود', 'سليمان', 'يحيى', 'زكريا'], answer: 1, difficulty: 'easy', category: 'general' },
  { q: 'في أي سورة قصة لقمان مع ابنه؟', options: ['سبأ', 'لقمان', 'فاطر', 'يس'], answer: 1, difficulty: 'easy', category: 'quran' },
  { q: 'كم سنة عاش لقمان الحكيم؟', options: ['300', '500', '700', '1000'], answer: 3, difficulty: 'hard', category: 'general' },
  { q: 'من هو زوج السيدة مريم على بعض الأقوال (المربي)؟', options: ['زكريا', 'يوسف النجار', 'يحيى', 'لم تتزوج'], answer: 1, difficulty: 'hard', category: 'general' },
  { q: 'من أول نبي في الأرض؟', options: ['آدم', 'نوح', 'إدريس', 'إبراهيم'], answer: 0, difficulty: 'easy', category: 'general' },
  { q: 'ما اسم أم النبي عيسى عليه السلام؟', options: ['آسيا', 'مريم', 'هاجر', 'سارة'], answer: 1, difficulty: 'easy', category: 'general' },
  { q: 'كم عدد أهل الكهف على المشهور؟', options: ['5', '7', '8', 'الله أعلم'], answer: 3, difficulty: 'medium', category: 'general' },
];

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

const IslamicQuizPage: React.FC = () => {
  const [started, setStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all');
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [round, setRound] = useState(0);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState<Q[]>([]);

  const questions = useMemo(() => {
    let pool = BANK;
    if (difficulty !== 'all') pool = pool.filter(q => q.difficulty === difficulty);
    if (category !== 'all') pool = pool.filter(q => q.category === category);
    return shuffle(pool).slice(0, Math.min(10, pool.length));
  }, [round, difficulty, category, started]);

  const current = questions[idx];

  const pick = (i: number) => {
    if (selected !== null || !current) return;
    setSelected(i);
    if (i === current.answer) setScore(s => s + 1);
    else setWrongAnswers(w => [...w, current]);
    setTimeout(() => {
      if (idx + 1 >= questions.length) setDone(true);
      else { setIdx(idx + 1); setSelected(null); }
    }, 1000);
  };

  const start = () => {
    setRound(r => r + 1); setIdx(0); setSelected(null); setScore(0); setDone(false); setWrongAnswers([]);
    setStarted(true);
  };

  const reset = () => { setStarted(false); setDone(false); };

  const difficultyBadge = (d: Difficulty) => {
    const map: Record<Difficulty, string> = {
      easy: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
      medium: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
      hard: 'bg-rose-500/15 text-rose-500 border-rose-500/30',
    };
    return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${map[d]}`}>{DIFFICULTY_LABELS[d]}</span>;
  };

  // ============ Setup Screen ============
  if (!started) {
    const count = (() => {
      let pool = BANK;
      if (difficulty !== 'all') pool = pool.filter(q => q.difficulty === difficulty);
      if (category !== 'all') pool = pool.filter(q => q.category === category);
      return pool.length;
    })();

    return (
      <div className="page-container page-with-topbar" dir="rtl">
        <div className="px-4 pt-6 max-w-lg mx-auto">
          <PageHeader icon={Brain} title="اختبار إسلامي" subtitle={`بنك من ${BANK.length} سؤال متنوع`} showBack gradient="primary" />

          <div className="card-surface p-5 mb-4">
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" /> اختر مستوى الصعوبة
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {(['all', 'easy', 'medium', 'hard'] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all border-2 ${
                    difficulty === d
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-secondary text-foreground border-transparent hover:border-primary/30'
                  }`}
                >
                  {DIFFICULTY_LABELS[d]}
                </button>
              ))}
            </div>
          </div>

          <div className="card-surface p-5 mb-4">
            <h3 className="text-sm font-bold text-foreground mb-3">التصنيف</h3>
            <div className="grid grid-cols-3 gap-2">
              {(['all', 'quran', 'hadith', 'seerah', 'fiqh', 'aqeedah', 'history', 'general'] as const).map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border-2 ${
                    category === c
                      ? 'bg-accent text-accent-foreground border-accent'
                      : 'bg-secondary text-foreground border-transparent hover:border-accent/30'
                  }`}
                >
                  {CATEGORY_LABELS[c]}
                </button>
              ))}
            </div>
          </div>

          <div className="card-surface p-5 mb-4 text-center">
            <div className="text-xs text-muted-foreground mb-1">سيتم اختيار</div>
            <div className="text-3xl font-bold text-gradient-primary">{Math.min(10, count)} <span className="text-base">سؤال</span></div>
            <div className="text-xs text-muted-foreground mt-1">من أصل {count} سؤالاً متاحاً</div>
          </div>

          <button
            onClick={start}
            disabled={count === 0}
            className="w-full gradient-primary text-primary-foreground py-4 rounded-2xl font-bold shadow-emerald inline-flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Brain className="w-5 h-5" /> ابدأ الاختبار
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container page-with-topbar" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <PageHeader icon={Brain} title="اختبار إسلامي" subtitle={`${CATEGORY_LABELS[category]} · ${DIFFICULTY_LABELS[difficulty]}`} showBack gradient="primary" />

        {!done && current ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground">سؤال {idx + 1} من {questions.length}</span>
              <span className="text-xs font-bold text-primary">النتيجة: {score}</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full mb-5 overflow-hidden">
              <div className="h-full gradient-primary transition-all" style={{ width: `${((idx) / questions.length) * 100}%` }} />
            </div>

            <div className="card-surface p-6 mb-4">
              <div className="flex items-center gap-2 mb-3">
                {difficultyBadge(current.difficulty)}
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30">
                  {CATEGORY_LABELS[current.category]}
                </span>
              </div>
              <h2 className="text-base font-bold text-foreground leading-relaxed">{current.q}</h2>
            </div>

            <div className="space-y-2">
              {current.options.map((opt, i) => {
                const isCorrect = i === current.answer;
                const isSelected = selected === i;
                const showState = selected !== null;
                return (
                  <button
                    key={i}
                    onClick={() => pick(i)}
                    disabled={selected !== null}
                    className={`w-full p-4 rounded-2xl text-right font-semibold transition-all border-2 ${
                      showState && isCorrect
                        ? 'bg-primary/15 border-primary text-primary'
                        : showState && isSelected
                          ? 'bg-destructive/15 border-destructive text-destructive'
                          : 'card-surface border-transparent hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{opt}</span>
                      {showState && isCorrect && <CheckCircle2 className="w-5 h-5" />}
                      {showState && isSelected && !isCorrect && <XCircle className="w-5 h-5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div>
            <div className="card-surface p-8 text-center mb-4">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full gradient-gold flex items-center justify-center shadow-emerald">
                <Trophy className="w-10 h-10 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-gradient-primary mb-2">انتهى الاختبار</h2>
              <p className="text-muted-foreground mb-1">حصلت على</p>
              <div className="text-5xl font-bold text-foreground my-3">{score} / {questions.length}</div>
              <p className="text-sm text-muted-foreground mb-6">
                {score === questions.length ? 'ممتاز! إجابات كاملة' : score >= questions.length * 0.7 ? 'جيد جداً، استمر' : 'حاول مرة أخرى لتحسين نتيجتك'}
              </p>
              <div className="flex gap-2">
                <button onClick={start} className="flex-1 gradient-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold shadow-emerald inline-flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4" /> إعادة
                </button>
                <button onClick={reset} className="flex-1 bg-secondary text-foreground px-6 py-3 rounded-2xl font-bold inline-flex items-center justify-center gap-2">
                  <ChevronLeft className="w-4 h-4" /> تغيير الإعدادات
                </button>
              </div>
            </div>

            {wrongAnswers.length > 0 && (
              <div className="card-surface p-5">
                <h3 className="text-sm font-bold text-foreground mb-3">مراجعة الإجابات الخاطئة</h3>
                <div className="space-y-3">
                  {wrongAnswers.map((q, i) => (
                    <div key={i} className="border-r-2 border-destructive/40 pr-3">
                      <p className="text-sm font-semibold text-foreground mb-1">{q.q}</p>
                      <p className="text-xs text-primary">الإجابة الصحيحة: {q.options[q.answer]}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default IslamicQuizPage;
