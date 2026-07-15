import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "get_ayah",
  title: "جلب آية مع التفسير",
  description:
    "Fetch a specific ayah from the Quran with its Arabic text, English translation, and Arabic tafsir (Al-Muyassar).",
  inputSchema: {
    surah: z.number().int().min(1).max(114).describe("Surah number (1–114)."),
    ayah: z.number().int().min(1).max(286).describe("Ayah number within the surah."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ surah, ayah }) => {
    const ref = `${surah}:${ayah}`;
    const [arabicRes, translationRes, tafsirRes] = await Promise.all([
      fetch(`https://api.alquran.cloud/v1/ayah/${ref}/quran-uthmani`),
      fetch(`https://api.alquran.cloud/v1/ayah/${ref}/en.sahih`),
      fetch(`https://api.alquran.cloud/v1/ayah/${ref}/ar.muyassar`),
    ]);
    if (!arabicRes.ok) {
      return {
        content: [{ type: "text", text: `تعذّر جلب الآية (${ref}).` }],
        isError: true,
      };
    }
    const arabic: any = await arabicRes.json();
    const translation: any = translationRes.ok ? await translationRes.json() : null;
    const tafsir: any = tafsirRes.ok ? await tafsirRes.json() : null;
    const data = {
      reference: ref,
      surah: arabic?.data?.surah?.name,
      surahEnglish: arabic?.data?.surah?.englishName,
      juz: arabic?.data?.juz,
      arabic: arabic?.data?.text,
      translation: translation?.data?.text ?? null,
      tafsir: tafsir?.data?.text ?? null,
    };
    return {
      content: [
        {
          type: "text",
          text: `${data.surah} (${ref})\n\n${data.arabic}\n\nTranslation: ${data.translation ?? "—"}\n\nالتفسير الميسر: ${data.tafsir ?? "—"}`,
        },
      ],
      structuredContent: data,
    };
  },
});
