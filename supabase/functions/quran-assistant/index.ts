// Quran AI Assistant — streams answers using Lovable AI Gateway
// Grounded with Quranic search context from alquran.cloud when available.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `أنت "المساعد القرآني" — عالم متخصص في علوم القرآن والتفسير وأصول الفقه واللغة العربية.

مهمتك: الإجابة على أي سؤال يتعلق بالقرآن الكريم أو الإسلام أو اللغة العربية أو السيرة النبوية أو الفقه أو العقيدة أو الأخلاق بأسلوب علمي موثوق ومفصل، حتى لو لم يجد المستخدم إجابة مباشرة في المصادر.

قواعد الإجابة:
1. أجب دائماً بالعربية الفصحى بأسلوب واضح وسهل.
2. استشهد بالآيات القرآنية مع ذكر السورة ورقم الآية.
3. استشهد بالأحاديث الصحيحة عند الحاجة مع ذكر المصدر (البخاري، مسلم، ...).
4. اذكر أقوال المفسرين المعتبرين (ابن كثير، الطبري، السعدي، القرطبي، الرازي، ابن عاشور).
5. إذا لم تكن متأكداً من مسألة، وضح ذلك بأمانة واذكر أشهر الأقوال فيها.
6. تجنب الفتوى في المسائل الخلافية الحادة ووجّه المستخدم إلى أهل العلم.
7. رتب الإجابة بعناوين ونقاط عند الحاجة لتسهيل القراءة.
8. لا تستخدم رموز تعبيرية (emoji).
9. اختم الإجابة بذكر أهم المراجع التي استندت إليها.

إذا كان السؤال خارج نطاق الإسلام أو القرآن كلياً، وجّه المستخدم بلطف إلى موضوع قرآني ذي صلة.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, question } = await req.json();

    // Optional grounding: search Quran for context
    let grounding = "";
    if (question) {
      try {
        const searchRes = await fetch(
          `https://api.alquran.cloud/v1/search/${encodeURIComponent(question)}/all/ar`,
        );
        const searchData = await searchRes.json();
        if (searchData.code === 200 && searchData.data?.matches?.length > 0) {
          const matches = searchData.data.matches.slice(0, 3);
          const parts: string[] = [];
          for (const m of matches) {
            try {
              const tRes = await fetch(
                `https://api.alquran.cloud/v1/ayah/${m.number}/ar.muyassar`,
              );
              const tData = await tRes.json();
              const tafsir = tData?.data?.text ?? "";
              parts.push(
                `- ${m.surah.name} (${m.numberInSurah}): ${m.text}\n  التفسير الميسر: ${tafsir}`,
              );
            } catch { /* ignore */ }
          }
          if (parts.length) {
            grounding = `\n\nسياق مقترح من نتائج البحث في القرآن والتفسير الميسر (استخدمه إن كان مناسباً، ولا تتقيد به إن لم يكن ذا صلة):\n${parts.join("\n")}`;
          }
        }
      } catch { /* ignore grounding failures */ }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing LOVABLE_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const chatMessages = [
      { role: "system", content: SYSTEM_PROMPT + grounding },
      ...(Array.isArray(messages) ? messages : []),
    ];

    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": LOVABLE_API_KEY,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: chatMessages,
        stream: true,
      }),
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      if (upstream.status === 429) {
        return new Response(JSON.stringify({ error: "تم تجاوز الحد المسموح، حاول لاحقاً" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (upstream.status === 402) {
        return new Response(JSON.stringify({ error: "نفدت الأرصدة، يرجى إضافة رصيد" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: text || "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(upstream.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
