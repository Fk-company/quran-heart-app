import { defineMcp } from "@lovable.dev/mcp-js";
import searchQuranTool from "./tools/search-quran";
import getAyahTool from "./tools/get-ayah";
import getSurahInfoTool from "./tools/get-surah-info";
import getPrayerTimesTool from "./tools/get-prayer-times";

export default defineMcp({
  name: "quran-heart-mcp",
  title: "قلب القرآن — Quran Heart",
  version: "0.1.0",
  instructions:
    "أدوات إسلامية عامة من تطبيق قلب القرآن: البحث في القرآن الكريم، جلب آية مع تفسيرها، معلومات السور، ومواقيت الصلاة لأي مدينة.",
  tools: [searchQuranTool, getAyahTool, getSurahInfoTool, getPrayerTimesTool],
});
