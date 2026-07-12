import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpenCheck,
  Search,
  ChevronLeft,
  Quote,
  ScrollText,
  Sparkles,
  Landmark,
  BookMarked,
  X,
  Filter,
  MapPin,
  CalendarClock,
  Users,
} from 'lucide-react';
import SEO from '@/components/SEO';
import PageHeader from '@/components/PageHeader';

interface Asbab {
  id: string;
  surah: number;
  surahName: string;
  ayah: string;
  ayahText: string;
  translation?: string;
  place: 'مكية' | 'مدنية';
  category: 'عبادات' | 'أخلاق' | 'أحكام' | 'عقيدة' | 'سيرة' | 'اجتماع';
  narrator?: string;
  context: string;
  reason: string;
  benefits: string[];
  source: string;
}

const DATA: Asbab[] = [
  {
    id: '1', surah: 2, surahName: 'البقرة', ayah: '115', place: 'مدنية', category: 'عبادات',
    ayahText: 'وَلِلَّهِ الْمَشْرِقُ وَالْمَغْرِبُ ۚ فَأَيْنَمَا تُوَلُّوا فَثَمَّ وَجْهُ اللَّهِ ۚ إِنَّ اللَّهَ وَاسِعٌ عَلِيمٌ',
    narrator: 'عن عامر بن ربيعة رضي الله عنه',
    context: 'كان الصحابة في سفر في ليلة شديدة الظلمة، فأشكل عليهم تحديد جهة القبلة، فاجتهد كل واحد منهم وصلّى إلى الجهة التي غلب على ظنه أنها القبلة.',
    reason: 'لما أصبحوا تبيّن أن بعضهم صلّى إلى غير جهة القبلة، فذكروا ذلك للنبي ﷺ فسكت، حتى أنزل الله هذه الآية مقرّرًا أن من اجتهد في تحرّي القبلة فصلّى إلى غيرها ناسيًا أو جاهلًا فصلاته صحيحة، وأن الأرض كلها لله.',
    benefits: [
      'رفع الحرج عمّن اجتهد في العبادة ثم أخطأ.',
      'سعة رحمة الله وشمول علمه بأحوال عباده.',
      'أهمية الاجتهاد قبل العمل وتحرّي الصواب.',
    ],
    source: 'أخرجه الترمذي (٣٤٥) وحسّنه، وابن ماجه (١٠٢٠).',
  },
  {
    id: '2', surah: 2, surahName: 'البقرة', ayah: '187', place: 'مدنية', category: 'عبادات',
    ayahText: 'أُحِلَّ لَكُمْ لَيْلَةَ الصِّيَامِ الرَّفَثُ إِلَىٰ نِسَائِكُمْ ۚ هُنَّ لِبَاسٌ لَّكُمْ وَأَنْتُمْ لِبَاسٌ لَّهُنَّ',
    narrator: 'عن البراء بن عازب رضي الله عنه',
    context: 'كان الصائم في بداية فرض الصيام إذا نام قبل الإفطار حرم عليه الطعام والشراب والقربان إلى الليلة القادمة، فوقع في ذلك مشقة على بعض الصحابة.',
    reason: 'فرَّط بعضهم فأتى أهله بعد النوم، ومنهم عمر رضي الله عنه، فجاءوا إلى النبي ﷺ يعتذرون فأنزل الله الرخصة بإحلال الأكل والشرب والقربان طوال الليل حتى يتبيّن الفجر.',
    benefits: [
      'رحمة الله بعباده وتخفيفه عنهم.',
      'التدرّج في التشريع مراعاةً لطاقة الناس.',
      'الاعتراف بالخطأ والمسارعة إلى التوبة صفة الصالحين.',
    ],
    source: 'أخرجه البخاري (١٩١٥) وأبو داود (٢٣١٤).',
  },
  {
    id: '3', surah: 4, surahName: 'النساء', ayah: '43', place: 'مدنية', category: 'أحكام',
    ayahText: 'يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تَقْرَبُوا الصَّلَاةَ وَأَنْتُمْ سُكَارَىٰ حَتَّىٰ تَعْلَمُوا مَا تَقُولُونَ',
    narrator: 'عن علي بن أبي طالب رضي الله عنه',
    context: 'كانت الخمر مباحة في أول الإسلام، فصنع عبد الرحمن بن عوف طعامًا وشرابًا، فأكلوا وشربوا حتى ثملوا، ثم حضرت صلاة المغرب فقدّموا أحدهم يصلي بهم.',
    reason: 'خلط الإمام في قراءته فقرأ: "أعبد ما تعبدون" بدلًا من "لا أعبد"، فأنزل الله هذه الآية تحريمًا للصلاة حال السكر، وكانت مرحلة ثانية في التدرّج نحو تحريم الخمر كليًا.',
    benefits: [
      'التدرّج الحكيم في تشريع الأحكام.',
      'خطورة ما يذهب العقل ولو مؤقتًا.',
      'حرمة الصلاة وأنها لا تُؤدَّى إلا بحضور القلب والوعي.',
    ],
    source: 'أخرجه الترمذي (٣٠٢٦) وحسّنه، والنسائي (١١٥٠٦).',
  },
  {
    id: '4', surah: 5, surahName: 'المائدة', ayah: '3', place: 'مدنية', category: 'عقيدة',
    ayahText: 'الْيَوْمَ أَكْمَلْتُ لَكُمْ دِينَكُمْ وَأَتْمَمْتُ عَلَيْكُمْ نِعْمَتِي وَرَضِيتُ لَكُمُ الْإِسْلَامَ دِينًا',
    narrator: 'عن عمر بن الخطاب رضي الله عنه',
    context: 'كانت حجة الوداع سنة عشر من الهجرة، وقف فيها النبي ﷺ بعرفة يوم الجمعة على ناقته القصواء يخطب في الناس.',
    reason: 'نزلت الآية عصر يوم عرفة إعلانًا بإكمال الدين وإتمام النعمة ورضا الله بالإسلام دينًا، فبكى عمر رضي الله عنه وقال: "ما بعد الكمال إلا النقصان"، وقد توفي النبي ﷺ بعد نزولها بواحد وثمانين يومًا.',
    benefits: [
      'كمال الإسلام واستغناؤه عن أي إضافة.',
      'عظم نعمة الدين على المسلم.',
      'الفقه في فهم إشارات القرآن، كما فهم عمر رضي الله عنه.',
    ],
    source: 'أخرجه البخاري (٤٥) ومسلم (٣٠١٧).',
  },
  {
    id: '5', surah: 5, surahName: 'المائدة', ayah: '90-91', place: 'مدنية', category: 'أحكام',
    ayahText: 'يَا أَيُّهَا الَّذِينَ آمَنُوا إِنَّمَا الْخَمْرُ وَالْمَيْسِرُ وَالْأَنْصَابُ وَالْأَزْلَامُ رِجْسٌ مِّنْ عَمَلِ الشَّيْطَانِ فَاجْتَنِبُوهُ',
    narrator: 'عن أنس بن مالك رضي الله عنه',
    context: 'مرّ تحريم الخمر بأربع مراحل: بيان مفاسدها، ثم تحريم الصلاة حال السكر، ثم بيان أن إثمها أكبر من نفعها، ثم التحريم القاطع في هذه الآية.',
    reason: 'كنت أسقي أبا طلحة وأبا عبيدة وأُبيّ بن كعب شرابًا من فَضيخ (تمر)، فجاء آتٍ فقال: إن الخمر قد حُرِّمت، فقال أبو طلحة: قم يا أنس فأهرقها، فجرت في سكك المدينة، وقال الصحابة: انتهينا انتهينا.',
    benefits: [
      'سرعة استجابة الصحابة لأمر الله دون مراجعة.',
      'حكمة التدرّج في اقتلاع العادات المتأصلة.',
      'ربط المحرّمات بأنها من عمل الشيطان لتنفير النفوس.',
    ],
    source: 'أخرجه البخاري (٤٦٢٠) ومسلم (١٩٨٠).',
  },
  {
    id: '6', surah: 9, surahName: 'التوبة', ayah: '38-39', place: 'مدنية', category: 'سيرة',
    ayahText: 'يَا أَيُّهَا الَّذِينَ آمَنُوا مَا لَكُمْ إِذَا قِيلَ لَكُمُ انْفِرُوا فِي سَبِيلِ اللَّهِ اثَّاقَلْتُمْ إِلَى الْأَرْضِ',
    context: 'دُعي المسلمون إلى غزوة تبوك في السنة التاسعة للهجرة لملاقاة الروم، وكان الوقت شديد الحر، والثمار قد أينعت في المدينة، والسفر طويل شاق.',
    reason: 'تثاقل بعض المسلمين عن الخروج لهذه الأسباب، فأنزل الله عتابًا شديدًا يحذّرهم من إيثار متاع الدنيا على الجهاد، ويهدّدهم بالعذاب واستبدال قوم آخرين بهم إن تخلّفوا.',
    benefits: [
      'الجهاد وطاعة الرسول ﷺ مقدَّمان على متاع الدنيا.',
      'خطر الركون إلى الراحة والدَّعة عن نصرة الحق.',
      'سنة الاستبدال: من قصّر في نصرة الدين أبدل الله به غيره.',
    ],
    source: 'ذكره ابن كثير في التفسير (٢/٤٦٢) والطبري في جامع البيان.',
  },
  {
    id: '7', surah: 24, surahName: 'النور', ayah: '11-20', place: 'مدنية', category: 'أخلاق',
    ayahText: 'إِنَّ الَّذِينَ جَاءُوا بِالْإِفْكِ عُصْبَةٌ مِّنكُمْ ۚ لَا تَحْسَبُوهُ شَرًّا لَّكُم بَلْ هُوَ خَيْرٌ لَّكُمْ',
    narrator: 'عن عائشة أم المؤمنين رضي الله عنها',
    context: 'في غزوة بني المصطلق، تخلَّفت عائشة رضي الله عنها عن الجيش تبحث عن عقد لها انقطع، فوجدها صفوان بن المعطّل فأركبها راحلته وقادها حتى لحقت بالجيش.',
    reason: 'اغتنم المنافقون بقيادة عبد الله بن أبي هذه الحادثة فأشاعوا الإفك على أم المؤمنين، ومكثت عائشة شهرًا لا تعلم بما يُقال حتى مرضت. ثم نزلت هذه الآيات ببراءتها من فوق سبع سماوات تُتلى إلى يوم القيامة.',
    benefits: [
      'خطورة الخوض في أعراض الناس ونشر الشائعات.',
      'ثبات المؤمن حين الابتلاء وحسن الظن بالله.',
      'قد يأتي البلاء ظاهره شر وباطنه خير عظيم.',
      'وجوب التثبّت قبل نقل الأخبار.',
    ],
    source: 'أخرجه البخاري (٤١٤١) ومسلم (٢٧٧٠) بطوله.',
  },
  {
    id: '8', surah: 33, surahName: 'الأحزاب', ayah: '37', place: 'مدنية', category: 'اجتماع',
    ayahText: 'فَلَمَّا قَضَىٰ زَيْدٌ مِّنْهَا وَطَرًا زَوَّجْنَاكَهَا لِكَيْ لَا يَكُونَ عَلَى الْمُؤْمِنِينَ حَرَجٌ فِي أَزْوَاجِ أَدْعِيَائِهِمْ',
    context: 'كان زيد بن حارثة رضي الله عنه مولى النبي ﷺ ومتبنَّاه (قبل تحريم التبنّي)، وتزوّج زينب بنت جحش رضي الله عنها بنت عمة النبي ﷺ، فلم يستقم الزواج ووقع بينهما ما وقع.',
    reason: 'طلّق زيد زينب، فأمر الله نبيه ﷺ بالزواج منها لإبطال عادة الجاهلية في اعتبار زوجة المتبنّى كزوجة الابن الحقيقي، ولإرساء أن التبنّي لا يُحدث نسبًا شرعيًا.',
    benefits: [
      'إبطال أحكام الجاهلية المخالفة للفطرة.',
      'التشريع بالفعل قد يكون أبلغ من التشريع بالقول.',
      'التبنّي لا يُحرِّم ولا يُثبت نسبًا.',
    ],
    source: 'أخرجه البخاري (٧٤٢٠) وأحمد في المسند.',
  },
  {
    id: '9', surah: 58, surahName: 'المجادلة', ayah: '1-4', place: 'مدنية', category: 'اجتماع',
    ayahText: 'قَدْ سَمِعَ اللَّهُ قَوْلَ الَّتِي تُجَادِلُكَ فِي زَوْجِهَا وَتَشْتَكِي إِلَى اللَّهِ وَاللَّهُ يَسْمَعُ تَحَاوُرَكُمَا',
    narrator: 'عن عائشة وخولة بنت ثعلبة رضي الله عنهما',
    context: 'كان الظهار في الجاهلية طلاقًا بائنًا، وهو أن يقول الرجل لامرأته: "أنتِ عليّ كظهر أمي"، فأصبحت الزوجة محرّمة عليه للأبد بلا رجعة.',
    reason: 'ظاهر أوس بن الصامت من زوجته خولة بنت ثعلبة، فجاءت إلى النبي ﷺ تشتكي وتجادل، وتقول: يا رسول الله، أكل شبابي ونثرت له بطني، فلما كبرت سني وانقطع ولدي ظاهر مني! فأنزل الله السورة تشريعًا لكفارة الظهار وتخفيفًا عنها.',
    benefits: [
      'الله يسمع شكوى المظلوم ولو خفيت.',
      'إبطال أحكام الجاهلية الجائرة على المرأة.',
      'مكانة المرأة في الإسلام وأن حقها لا يضيع.',
      'مشروعية جدال الحاكم بالحكمة في طلب الحق.',
    ],
    source: 'أخرجه أبو داود (٢٢١٤) وابن ماجه (١٨٨) والحاكم وصححه.',
  },
  {
    id: '10', surah: 66, surahName: 'التحريم', ayah: '1-4', place: 'مدنية', category: 'أخلاق',
    ayahText: 'يَا أَيُّهَا النَّبِيُّ لِمَ تُحَرِّمُ مَا أَحَلَّ اللَّهُ لَكَ ۖ تَبْتَغِي مَرْضَاتَ أَزْوَاجِكَ',
    narrator: 'عن ابن عباس وعائشة رضي الله عنهم',
    context: 'كان النبي ﷺ يمكث عند زينب بنت جحش فيشرب عندها عسلًا، فتواطأت عائشة وحفصة أن تقول كل واحدة إذا دخل عليها: إني أجد منك ريح مغافير (نبات كريه الرائحة).',
    reason: 'قال النبي ﷺ: "لن أعود له" حرصًا على رضا نسائه، فعاتبه الله على تحريم ما أحل له، وأنزل هذه الآيات موجّهًا الحكم إليه ﷺ رغم علوّ مقامه، ومبيّنًا حق الله فوق كل رغبة.',
    benefits: [
      'حق الله مقدَّم على مرضاة الخلق.',
      'التحليل والتحريم لله وحده لا لأحد سواه.',
      'تربية القرآن للنبي ﷺ لتكون قدوة للأمة.',
      'الاعتذار عن الخطأ بالتوبة والكفارة لا بالإصرار.',
    ],
    source: 'أخرجه البخاري (٤٩١٢) ومسلم (١٤٧٤).',
  },
  {
    id: '11', surah: 80, surahName: 'عبس', ayah: '1-10', place: 'مكية', category: 'أخلاق',
    ayahText: 'عَبَسَ وَتَوَلَّىٰ * أَن جَاءَهُ الْأَعْمَىٰ * وَمَا يُدْرِيكَ لَعَلَّهُ يَزَّكَّىٰ',
    narrator: 'عن عائشة رضي الله عنها',
    context: 'كان النبي ﷺ في مكة يعرض الإسلام على صناديد قريش رجاءَ أن يُسلموا فيُسلم بإسلامهم قومهم، فجاءه عبد الله بن أم مكتوم الأعمى يسأله ويستقرئه القرآن.',
    reason: 'كره النبي ﷺ قطع حديثه مع القوم وعبس في وجه ابن أم مكتوم (وهو لا يراه) وأعرض عنه، فأنزل الله العتاب مبيّنًا أن طالب الهدى المخلص أولى بالعناية من المعرض ولو كان شريفًا.',
    benefits: [
      'لا اعتبار للأنساب والأحساب في ميزان الدعوة.',
      'الاعتناء بالمقبل الجاد ولو كان ضعيفًا.',
      'صدق القرآن حيث لم يُخفِ عتاب نبيه ﷺ.',
      'التواضع في تلقّي طلاب العلم والدعوة.',
    ],
    source: 'أخرجه الترمذي (٣٣٣١) وحسّنه، والحاكم وصححه.',
  },
  {
    id: '12', surah: 111, surahName: 'المسد', ayah: '١-٥', place: 'مكية', category: 'سيرة',
    ayahText: 'تَبَّتْ يَدَا أَبِي لَهَبٍ وَتَبَّ * مَا أَغْنَىٰ عَنْهُ مَالُهُ وَمَا كَسَبَ',
    narrator: 'عن ابن عباس رضي الله عنهما',
    context: 'لما أنزل الله: "وأنذر عشيرتك الأقربين"، صعد النبي ﷺ على جبل الصفا وجعل ينادي: "يا صباحاه"، فاجتمعت إليه قريش، فقال: أرأيتم لو أخبرتكم أن خيلًا بالوادي تريد أن تُغير عليكم، أكنتم مصدقيّ؟ قالوا: نعم، ما جرّبنا عليك إلا صدقًا. قال: فإني نذير لكم بين يدي عذاب شديد.',
    reason: 'قال أبو لهب (عم النبي ﷺ): تبًا لك سائر اليوم! ألهذا جمعتنا؟! فأنزل الله هذه السورة تُخلّد في القرآن هلاكه وامرأته حمّالة الحطب التي كانت تضع الشوك في طريق النبي ﷺ.',
    benefits: [
      'القرابة لا تنفع مع الكفر.',
      'من عادى الحق أهلكه الله ولو كان قريبًا للنبي ﷺ.',
      'حفظ القرآن لأحداث الدعوة الأولى.',
      'إعانة الظالم على ظلمه شراكة في العقوبة (امرأته).',
    ],
    source: 'أخرجه البخاري (٤٧٧٠) ومسلم (٢٠٨).',
  },
  {
    id: '13', surah: 96, surahName: 'العلق', ayah: '1-5', place: 'مكية', category: 'سيرة',
    ayahText: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ * خَلَقَ الْإِنسَانَ مِنْ عَلَقٍ * اقْرَأْ وَرَبُّكَ الْأَكْرَمُ',
    narrator: 'عن عائشة رضي الله عنها',
    context: 'كان النبي ﷺ يخلو بغار حراء الليالي ذوات العدد يتعبّد فيه قبل البعثة، فيتزوّد لذلك ثم يرجع إلى خديجة رضي الله عنها فيتزوّد لمثلها.',
    reason: 'جاءه المَلَك في الغار فقال: اقرأ. قال: ما أنا بقارئ. فغطّه ثلاث مرات ثم أنزل عليه أول القرآن "اقرأ باسم ربك الذي خلق". فرجع ﷺ يرجف فؤاده إلى خديجة، فطمأنته وذهبت به إلى ورقة بن نوفل.',
    benefits: [
      'أول ما نزل من القرآن أمر بالعلم والقراءة.',
      'شرف العلم ومكانته في الإسلام.',
      'دور المرأة الصالحة في تثبيت الرجل.',
      'ابتداء النبوة بالتعليم لا بالسيف.',
    ],
    source: 'أخرجه البخاري (٣) ومسلم (١٦٠).',
  },
  {
    id: '14', surah: 2, surahName: 'البقرة', ayah: '286', place: 'مدنية', category: 'عبادات',
    ayahText: 'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ',
    narrator: 'عن أبي هريرة وابن عباس رضي الله عنهم',
    context: 'لما نزل قوله تعالى: "وإن تُبدوا ما في أنفسكم أو تخفوه يحاسبكم به الله" (٢٨٤)، اشتدّ ذلك على الصحابة، وجاؤوا إلى النبي ﷺ يقولون: كُلِّفنا من الأعمال ما نطيق: الصلاة والصيام والجهاد والصدقة، وقد أُنزلت عليك هذه الآية ولا نطيقها.',
    reason: 'قال النبي ﷺ: أتريدون أن تقولوا كما قال أهل الكتابين من قبلكم: سمعنا وعصينا؟ بل قولوا: سمعنا وأطعنا. فقالوها، فأنزل الله بعدها: "لا يكلّف الله نفسًا إلا وسعها" فنسخت الأولى وقال الله: قد فعلت.',
    benefits: [
      'سماحة الشريعة ورفعها الحرج.',
      'حسن أدب المؤمن مع أحكام ربه: "سمعنا وأطعنا".',
      'استجابة الله لدعاء عباده المؤمنين.',
      'الله لا يحاسب على حديث النفس ما لم يُعمل به.',
    ],
    source: 'أخرجه مسلم (١٢٥).',
  },
  {
    id: '15', surah: 63, surahName: 'المنافقون', ayah: '1-8', place: 'مدنية', category: 'أخلاق',
    ayahText: 'إِذَا جَاءَكَ الْمُنَافِقُونَ قَالُوا نَشْهَدُ إِنَّكَ لَرَسُولُ اللَّهِ ۗ وَاللَّهُ يَعْلَمُ إِنَّكَ لَرَسُولُهُ',
    narrator: 'عن زيد بن أرقم رضي الله عنه',
    context: 'في غزوة بني المصطلق (المُريسيع) وقع نزاع بين رجل من المهاجرين وآخر من الأنصار على ماء، فسمع بذلك عبد الله بن أبي بن سلول رأس المنافقين.',
    reason: 'قال ابن أبي: "لئن رجعنا إلى المدينة ليُخرجنّ الأعزّ منها الأذل"، فأخبر زيد بن أرقم النبيَّ ﷺ، فأنكر ابن أبي، فأنزل الله سورة المنافقون تُصدّق زيدًا وتفضح المنافقين حتى ذلّ ابن أبي وبقي مطعونًا حتى مات.',
    benefits: [
      'خطر النفاق وأنه أشد من الكفر الصريح.',
      'الله ينصر من صدق ويكشف الكاذب.',
      'تنبيه الأمة إلى صفات المنافقين لتحذرهم.',
      'العزّة الحقيقية لله ولرسوله وللمؤمنين.',
    ],
    source: 'أخرجه البخاري (٤٩٠٠) ومسلم (٢٧٧٢).',
  },
];

const CATEGORIES = ['الكل', 'عبادات', 'أخلاق', 'أحكام', 'عقيدة', 'سيرة', 'اجتماع'] as const;
type Category = (typeof CATEGORIES)[number];

const highlight = (text: string, q: string) => {
  if (!q.trim()) return text;
  try {
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${safe})`, 'gi'));
    return parts.map((p, i) =>
      p.toLowerCase() === q.toLowerCase() ? (
        <mark key={i} className="bg-primary/25 text-foreground rounded px-0.5">{p}</mark>
      ) : (
        <React.Fragment key={i}>{p}</React.Fragment>
      ),
    );
  } catch {
    return text;
  }
};

const AsbabAlNuzulPage: React.FC = () => {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<Category>('الكل');
  const [active, setActive] = useState<Asbab | null>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return DATA.filter((d) => {
      const inCat = cat === 'الكل' || d.category === cat;
      if (!inCat) return false;
      if (!query) return true;
      const haystack = [
        d.surahName, d.ayah, String(d.surah), d.ayahText,
        d.context, d.reason, d.narrator || '', d.source, d.benefits.join(' '),
      ].join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [q, cat]);

  return (
    <div className="page-container page-with-topbar" dir="rtl">
      <SEO
        title="أسباب النزول | قلب القرآن"
        description="موسوعة أسباب نزول آيات القرآن الكريم مع النص، والرواية الصحيحة، والسياق، والفوائد، والمصدر."
      />
      <div className="max-w-lg mx-auto w-full px-4 pt-6 pb-24">
        <PageHeader
          icon={BookOpenCheck}
          title="أسباب النزول"
          subtitle="موسوعة الروايات الصحيحة وسياقها"
          gradient="primary"
          showBack
        />

        {/* Search */}
        <div className="mt-4 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث في السورة أو الآية أو نص السبب..."
              className="w-full text-sm rounded-xl bg-card border border-border/50 py-3 pr-9 pl-9 focus:outline-none focus:border-primary/60"
            />
            {q && (
              <button
                onClick={() => setQ('')}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full hover:bg-muted/50 flex items-center justify-center"
                aria-label="مسح"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Category chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-full border whitespace-nowrap transition ${
                  cat === c
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card border-border/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
            <span>{filtered.length} نتيجة من {DATA.length}</span>
            {q && <span className="text-primary">بحث: "{q}"</span>}
          </div>

          {/* Results */}
          {filtered.length === 0 ? (
            <div className="rounded-2xl bg-card border border-border/50 p-8 text-center space-y-2">
              <Search className="w-8 h-8 text-muted-foreground/50 mx-auto" />
              <p className="text-sm text-muted-foreground">لا توجد نتائج مطابقة</p>
              <button
                onClick={() => { setQ(''); setCat('الكل'); }}
                className="text-xs text-primary font-bold"
              >
                إعادة تعيين البحث
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((d) => (
                <article
                  key={d.id}
                  className="rounded-2xl bg-card border border-border/50 overflow-hidden hover:border-primary/40 transition"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between gap-2 p-3 border-b border-border/40 bg-gradient-to-l from-primary/5 to-transparent">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                        <BookOpenCheck className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <div>
                        <div className="text-sm font-extrabold">
                          سورة {highlight(d.surahName, q)}
                          <span className="mx-1 text-muted-foreground font-normal">·</span>
                          <span className="text-primary">آية {d.ayah}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary/60 border border-border/40 inline-flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5" />
                            {d.place}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                            {d.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/quran/${d.surah}`)}
                      className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-secondary/60 border border-border/50 inline-flex items-center gap-1 shrink-0"
                    >
                      السورة
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Ayah */}
                  <div className="p-3">
                    <div className="rounded-xl bg-gradient-to-br from-primary/8 via-primary/5 to-transparent border border-primary/20 p-4 relative">
                      <Quote className="w-4 h-4 text-primary/40 absolute top-2 right-2" />
                      <p className="text-base leading-[2.1] font-amiri text-center text-foreground">
                        {highlight(d.ayahText, q)}
                      </p>
                    </div>
                  </div>

                  {/* Sections */}
                  <div className="px-3 pb-3 space-y-3">
                    {d.narrator && (
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Users className="w-3 h-3" />
                        <span className="italic">{d.narrator}</span>
                      </div>
                    )}

                    <section>
                      <div className="text-[11px] font-extrabold text-primary mb-1 flex items-center gap-1">
                        <CalendarClock className="w-3 h-3" />
                        السياق التاريخي
                      </div>
                      <p className="text-xs leading-6 text-foreground/85">{highlight(d.context, q)}</p>
                    </section>

                    <section>
                      <div className="text-[11px] font-extrabold text-primary mb-1 flex items-center gap-1">
                        <ScrollText className="w-3 h-3" />
                        سبب النزول
                      </div>
                      <p className="text-xs leading-6 text-foreground/90">{highlight(d.reason, q)}</p>
                    </section>

                    <button
                      onClick={() => setActive(d)}
                      className="w-full text-[11px] font-bold py-2 rounded-lg bg-primary/10 text-primary border border-primary/20 inline-flex items-center justify-center gap-1.5 hover:bg-primary/15"
                    >
                      <Sparkles className="w-3 h-3" />
                      عرض الفوائد والمصدر ({d.benefits.length})
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail sheet */}
      {active && (
        <div
          className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          onClick={() => setActive(null)}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-card border border-border/60 shadow-2xl max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="sticky top-0 bg-card/95 backdrop-blur border-b border-border/50 p-4 flex items-center justify-between gap-2">
              <div>
                <div className="text-xs text-muted-foreground">سورة {active.surahName} · آية {active.ayah}</div>
                <div className="text-sm font-extrabold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-primary" />
                  الفوائد والمصدر
                </div>
              </div>
              <button
                onClick={() => setActive(null)}
                className="w-8 h-8 rounded-full hover:bg-muted/50 flex items-center justify-center"
                aria-label="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="rounded-xl bg-primary/5 border border-primary/20 p-3">
                <p className="text-sm leading-8 font-amiri text-center">{active.ayahText}</p>
              </div>

              <section>
                <div className="text-xs font-extrabold text-primary mb-2 flex items-center gap-1.5">
                  <BookMarked className="w-3.5 h-3.5" />
                  الفوائد المستنبطة
                </div>
                <ul className="space-y-2">
                  {active.benefits.map((b, i) => (
                    <li key={i} className="text-xs leading-6 flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-foreground/85">{b}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-xl bg-secondary/40 border border-border/40 p-3">
                <div className="text-[11px] font-extrabold text-muted-foreground mb-1 flex items-center gap-1.5">
                  <Landmark className="w-3 h-3" />
                  التخريج والمصدر
                </div>
                <p className="text-[11px] leading-6 text-foreground/80">{active.source}</p>
              </section>

              <button
                onClick={() => { navigate(`/quran/${active.surah}`); setActive(null); }}
                className="w-full text-xs font-bold py-2.5 rounded-xl gradient-primary text-primary-foreground inline-flex items-center justify-center gap-1.5"
              >
                <BookOpenCheck className="w-3.5 h-3.5" />
                قراءة السورة كاملة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AsbabAlNuzulPage;
