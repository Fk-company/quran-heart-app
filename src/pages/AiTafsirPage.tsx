import React, { useState, useRef, useEffect } from 'react';
import SEO from '@/components/SEO';
import PageHeader from '@/components/PageHeader';
import { Bot, Send, Loader2, AlertCircle, Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const suggestedQuestions = [
  'ما معنى كلمة "الصمد" في سورة الإخلاص؟',
  'ما سبب نزول سورة الكوثر؟',
  'ما الفرق بين الخشية والخوف في القرآن؟',
  'ما تفسير آية الكرسي؟',
  'لماذا سميت سورة البقرة بهذا الاسم؟',
  'ما فضل قراءة سورة الملك؟',
];

const ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/quran-assistant`;
const AUTH = `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`;

const AiTafsirPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (question?: string) => {
    const q = question || input.trim();
    if (!q || loading) return;
    setInput('');
    setError('');

    const nextMessages: Message[] = [...messages, { role: 'user', content: q }];
    setMessages(nextMessages);
    setLoading(true);

    // Placeholder assistant message we'll fill as tokens stream
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: AUTH,
        },
        body: JSON.stringify({
          question: q,
          messages: nextMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        let msg = 'حدث خطأ. حاول مرة أخرى.';
        try {
          const j = await res.json();
          if (j?.error) msg = j.error;
        } catch {}
        if (res.status === 429) msg = 'تم تجاوز الحد المسموح. حاول بعد قليل.';
        if (res.status === 402) msg = 'انتهى الرصيد. الرجاء إضافة رصيد للاستمرار.';
        throw new Error(msg);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let acc = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data:')) continue;
            const data = trimmed.slice(5).trim();
            if (!data || data === '[DONE]') continue;
            try {
              const json = JSON.parse(data);
              const delta = json?.choices?.[0]?.delta?.content ?? '';
              if (delta) {
                acc += delta;
                setMessages(prev => {
                  const copy = [...prev];
                  copy[copy.length - 1] = { role: 'assistant', content: acc };
                  return copy;
                });
              }
            } catch {}
          }
        }
      }

      if (!acc) {
        setMessages(prev => {
          const copy = [...prev];
          copy[copy.length - 1] = {
            role: 'assistant',
            content: 'لم أتمكن من توليد إجابة الآن. حاول إعادة صياغة السؤال.',
          };
          return copy;
        });
      }
    } catch (e: any) {
      setError(e?.message || 'حدث خطأ في الاتصال.');
      setMessages(prev => prev.slice(0, -1)); // remove empty assistant placeholder
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="المساعد القرآني — اسأل عن التفسير" description="مساعد ذكي بالذكاء الاصطناعي للإجابة عن معاني القرآن وتفسير الآيات وأسئلة الإسلام." />
      <div className="page-container page-with-topbar" dir="rtl">
        <div className="page-inner flex flex-col" style={{ height: 'calc(100vh - 10rem)' }}>
          <PageHeader icon={Bot} title="المساعد القرآني" subtitle="مدعوم بالذكاء الاصطناعي — اسأل عن أي شيء" />

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" />
                  <Bot className="w-16 h-16 relative text-primary/70 p-3" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">اسأل عن معنى كلمة، تفسير آية، سبب نزول، حكم شرعي، أو أي سؤال</p>
                <p className="text-xs text-muted-foreground/70 mb-4 flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3" /> يجيب على كل الأسئلة بالاستناد إلى القرآن والتفسير
                </p>
                <div className="space-y-2">
                  {suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(q)}
                      className="w-full text-right card-surface p-3 text-sm text-foreground hover:bg-primary/5 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-[2] ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-secondary text-foreground rounded-bl-sm'
                  }`}
                >
                  {msg.content ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  )}
                </div>
              </div>
            ))}

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
              disabled={loading}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 text-primary-foreground animate-spin" />
              ) : (
                <Send className="w-4 h-4 text-primary-foreground" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AiTafsirPage;
