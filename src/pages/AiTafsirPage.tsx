import React, { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { Bot, Send, Loader2, BookOpen, AlertCircle } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const suggestedQuestions = [
  'ما معنى كلمة "الصمد" في سورة الإخلاص؟',
  'ما سبب نزول سورة الكوثر؟',
  'ما الفرق بين الخشية والخوف في القرآن؟',
  'ما معنى "الرحمن" و"الرحيم"؟',
  'ما تفسير آية الكرسي؟',
  'لماذا سميت سورة البقرة بهذا الاسم؟',
];

const AiTafsirPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async (question?: string) => {
    const q = question || input.trim();
    if (!q || loading) return;
    setInput('');
    setError('');

    const userMsg: Message = { role: 'user', content: q };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      // Use alquran.cloud API to search for relevant content
      const searchRes = await fetch(`https://api.alquran.cloud/v1/search/${encodeURIComponent(q)}/all/ar`);
      const searchData = await searchRes.json();

      // Also fetch tafsir for any found results
      let tafsirContext = '';
      if (searchData.code === 200 && searchData.data?.matches?.length > 0) {
        const matches = searchData.data.matches.slice(0, 3);
        for (const match of matches) {
          try {
            const tafsirRes = await fetch(`https://api.alquran.cloud/v1/ayah/${match.number}/ar.muyassar`);
            const tafsirData = await tafsirRes.json();
            if (tafsirData.code === 200) {
              tafsirContext += `\n\n📖 ${match.surah.name} - آية ${match.numberInSurah}:\n${match.text}\n\nالتفسير الميسر:\n${tafsirData.data.text}`;
            }
          } catch {}
        }
      }

      let response = '';
      if (tafsirContext) {
        response = `بناءً على بحثي في القرآن الكريم والتفسير الميسر، وجدت ما يلي:\n${tafsirContext}\n\n💡 ملاحظة: هذا التفسير مأخوذ من التفسير الميسر. للمزيد من التفاصيل يُرجع إلى التفاسير المعتمدة كتفسير ابن كثير والسعدي.`;
      } else {
        // Provide contextual answers for common questions
        response = getLocalAnswer(q);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (e) {
      setError('حدث خطأ في البحث. حاول مرة أخرى.');
    }
    setLoading(false);
  };

  const getLocalAnswer = (q: string): string => {
    const lower = q.toLowerCase();
    if (lower.includes('الصمد')) return '📖 الصمد: هو الله الذي يصمد إليه الخلق في حوائجهم، أي يقصدونه ويلجأون إليه. وهو السيد الذي كمل في سؤدده، الذي لا جوف له ولا يأكل ولا يشرب.\n\nقال ابن عباس: هو السيد الذي قد كمل في سؤدده، والشريف الذي قد كمل في شرفه.\n\n💡 المصدر: تفسير ابن كثير وتفسير السعدي.';
    if (lower.includes('الكوثر')) return '📖 سبب نزول سورة الكوثر:\nنزلت في العاص بن وائل السهمي حين قال عن النبي ﷺ إنه أبتر (أي ليس له ذرية ذكور تبقى). فأنزل الله هذه السورة تبشيراً للنبي بالكوثر وهو نهر في الجنة، وأن شانئه هو الأبتر.\n\n💡 المصدر: تفسير ابن كثير.';
    if (lower.includes('الرحمن') && lower.includes('الرحيم')) return '📖 الفرق بين الرحمن والرحيم:\n- الرحمن: صفة ذاتية لله تعالى تدل على سعة الرحمة، وهي رحمة عامة تشمل جميع المخلوقات.\n- الرحيم: صفة فعلية تدل على إيصال الرحمة، وهي رحمة خاصة بالمؤمنين يوم القيامة.\n\nقال ابن القيم: الرحمن دال على الصفة القائمة به سبحانه، والرحيم دال على تعلقها بالمرحوم.\n\n💡 المصدر: تفسير ابن كثير وبدائع الفوائد لابن القيم.';
    if (lower.includes('آية الكرسي') || lower.includes('الكرسي')) return '📖 آية الكرسي (البقرة: 255):\nهي أعظم آية في القرآن كما أخبر النبي ﷺ. تتضمن توحيد الله في ربوبيته وألوهيته وأسمائه وصفاته.\n\nفيها 10 جمل كل جملة تحمل معنى عظيماً:\n1. الله لا إله إلا هو - التوحيد\n2. الحي القيوم - كمال الحياة والقيومية\n3. لا تأخذه سنة ولا نوم - كمال القوة\n\n💡 المصدر: تفسير ابن كثير والسعدي.';
    if (lower.includes('البقرة')) return '📖 سميت سورة البقرة بهذا الاسم نسبة إلى قصة البقرة التي أمر الله بني إسرائيل بذبحها لكشف قاتل مجهول. وهذه القصة مذكورة في الآيات 67-73.\n\nوفي تسميتها عبرة عن تعنت بني إسرائيل وكثرة أسئلتهم وتشددهم فيما لم يُشدد الله عليهم.\n\n💡 المصدر: تفسير ابن كثير.';
    return `🔍 لم أجد نتائج مباشرة لسؤالك. يمكنك:\n\n1. إعادة صياغة السؤال بكلمات مفتاحية من القرآن\n2. البحث عن كلمة محددة من الآية\n3. ذكر اسم السورة أو رقم الآية\n\n💡 أنصح بالرجوع إلى:\n- تفسير ابن كثير\n- تفسير السعدي\n- التفسير الميسر`;
  };

  return (
    <div className="page-container page-with-topbar" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto flex flex-col" style={{ height: 'calc(100vh - 10rem)' }}>
        <PageHeader icon={Bot} title="المساعد القرآني" subtitle="اسأل عن تفسير أو معنى كلمة" />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Bot className="w-12 h-12 mx-auto mb-3 text-primary/30" />
              <p className="text-sm text-muted-foreground mb-4">اسأل عن معنى كلمة، سبب نزول آية، أو أي سؤال قرآني</p>
              <div className="space-y-2">
                {suggestedQuestions.map((q, i) => (
                  <button key={i} onClick={() => handleSend(q)}
                    className="w-full text-right card-surface p-3 text-sm text-foreground hover:bg-primary/5 transition-colors">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-[2] ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-sm'
                  : 'bg-secondary text-foreground rounded-bl-sm'
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-end">
              <div className="bg-secondary rounded-2xl rounded-bl-sm p-3.5">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-destructive text-xs bg-destructive/10 rounded-xl p-3">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex gap-2 pb-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="اكتب سؤالك هنا..."
            className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            dir="rtl"
          />
          <button onClick={() => handleSend()} disabled={!input.trim() || loading}
            className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center disabled:opacity-50">
            <Send className="w-4 h-4 text-primary-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiTafsirPage;
