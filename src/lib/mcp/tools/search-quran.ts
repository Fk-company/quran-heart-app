import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "search_quran",
  title: "بحث في القرآن الكريم",
  description:
    "Search the Holy Quran for verses matching an Arabic keyword or phrase. Returns matching ayahs with their surah name, ayah number, and Arabic text.",
  inputSchema: {
    query: z.string().min(1).describe("Arabic keyword or phrase to search for (e.g. الرحمن، الصبر، الجنة)."),
    limit: z
      .number()
      .int()
      .min(1)
      .max(50)
      .optional()
      .describe("Maximum number of matches to return (default 20, max 50)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ query, limit }) => {
    const cap = limit ?? 20;
    const url = `https://api.alquran.cloud/v1/search/${encodeURIComponent(query)}/all/quran-uthmani`;
    const res = await fetch(url);
    if (!res.ok) {
      return {
        content: [{ type: "text", text: `تعذّر الاتصال بمصدر القرآن (HTTP ${res.status}).` }],
        isError: true,
      };
    }
    const json: any = await res.json();
    const matches = (json?.data?.matches ?? []).slice(0, cap).map((m: any) => ({
      surah: m.surah?.name,
      surahEnglish: m.surah?.englishName,
      surahNumber: m.surah?.number,
      ayah: m.numberInSurah,
      text: m.text,
    }));
    return {
      content: [
        {
          type: "text",
          text:
            matches.length === 0
              ? `لا توجد نتائج للبحث عن: ${query}`
              : matches
                  .map(
                    (m: any) =>
                      `${m.surah} (${m.surahNumber}:${m.ayah}) — ${m.text}`,
                  )
                  .join("\n\n"),
        },
      ],
      structuredContent: { query, count: matches.length, matches },
    };
  },
});
