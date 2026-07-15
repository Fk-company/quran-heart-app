import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "get_surah_info",
  title: "معلومات السورة",
  description:
    "Get metadata for a Quran surah: Arabic name, English name, revelation type (Meccan/Medinan), ayah count, and starting juz.",
  inputSchema: {
    surah: z.number().int().min(1).max(114).describe("Surah number (1–114)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ surah }) => {
    const res = await fetch(`https://api.alquran.cloud/v1/surah/${surah}`);
    if (!res.ok) {
      return {
        content: [{ type: "text", text: `تعذّر جلب معلومات السورة (${surah}).` }],
        isError: true,
      };
    }
    const json: any = await res.json();
    const d = json?.data ?? {};
    const info = {
      number: d.number,
      name: d.name,
      englishName: d.englishName,
      englishNameTranslation: d.englishNameTranslation,
      revelationType: d.revelationType,
      numberOfAyahs: d.numberOfAyahs,
    };
    return {
      content: [
        {
          type: "text",
          text: `${info.name} (${info.englishName} — ${info.englishNameTranslation})\nرقم السورة: ${info.number}\nعدد الآيات: ${info.numberOfAyahs}\nنوع النزول: ${info.revelationType === "Meccan" ? "مكية" : "مدنية"}`,
        },
      ],
      structuredContent: info,
    };
  },
});
