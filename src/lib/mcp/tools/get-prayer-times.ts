import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "get_prayer_times",
  title: "مواقيت الصلاة",
  description:
    "Get today's Islamic prayer times (Fajr, Dhuhr, Asr, Maghrib, Isha) for a given city and country using the Aladhan API.",
  inputSchema: {
    city: z.string().min(1).describe("City name in English or Arabic (e.g. Riyadh, Cairo, Istanbul)."),
    country: z.string().min(1).describe("Country name in English (e.g. Saudi Arabia, Egypt, Turkey)."),
    method: z
      .number()
      .int()
      .min(0)
      .max(15)
      .optional()
      .describe("Calculation method id (Aladhan). Default 4 (Umm Al-Qura)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: false, openWorldHint: true },
  handler: async ({ city, country, method }) => {
    const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method ?? 4}`;
    const res = await fetch(url);
    if (!res.ok) {
      return {
        content: [{ type: "text", text: `تعذّر جلب مواقيت الصلاة لـ ${city}, ${country}.` }],
        isError: true,
      };
    }
    const json: any = await res.json();
    const t = json?.data?.timings ?? {};
    const date = json?.data?.date?.readable ?? "";
    const hijri = json?.data?.date?.hijri?.date ?? "";
    const rows = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"]
      .filter((k) => t[k])
      .map((k) => `${k}: ${t[k]}`)
      .join("\n");
    return {
      content: [
        {
          type: "text",
          text: `مواقيت الصلاة — ${city}, ${country}\n${date} (${hijri})\n\n${rows}`,
        },
      ],
      structuredContent: {
        city,
        country,
        date,
        hijri,
        timings: t,
      },
    };
  },
});
