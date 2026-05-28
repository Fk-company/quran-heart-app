// Generates public/sitemap.xml — runs via predev/prebuild hooks.
import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://quran-heart-app.lovable.app";

interface Entry {
  path: string;
  changefreq?: "daily" | "weekly" | "monthly";
  priority?: string;
}

const entries: Entry[] = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/quran", changefreq: "weekly", priority: "0.9" },
  { path: "/mushaf", changefreq: "weekly", priority: "0.9" },
  { path: "/reciters", changefreq: "weekly", priority: "0.8" },
  { path: "/radio", changefreq: "weekly", priority: "0.7" },
  { path: "/tafsir", changefreq: "weekly", priority: "0.8" },
  { path: "/ai-tafsir", changefreq: "monthly", priority: "0.7" },
  { path: "/adhkar", changefreq: "weekly", priority: "0.8" },
  { path: "/dua", changefreq: "weekly", priority: "0.8" },
  { path: "/hadith", changefreq: "weekly", priority: "0.8" },
  { path: "/prophets", changefreq: "monthly", priority: "0.7" },
  { path: "/kids-stories", changefreq: "monthly", priority: "0.7" },
  { path: "/asma-al-husna", changefreq: "monthly", priority: "0.7" },
  { path: "/sakinah", changefreq: "monthly", priority: "0.6" },
  { path: "/quran-stats", changefreq: "monthly", priority: "0.6" },
  { path: "/qibla", changefreq: "monthly", priority: "0.8" },
  { path: "/zakat", changefreq: "monthly", priority: "0.8" },
  { path: "/fasting-tracker", changefreq: "monthly", priority: "0.6" },
  { path: "/hijri-calendar", changefreq: "weekly", priority: "0.7" },
  { path: "/islamic-quiz", changefreq: "monthly", priority: "0.7" },
  { path: "/memorization-test", changefreq: "monthly", priority: "0.6" },
  { path: "/mutashabihat", changefreq: "monthly", priority: "0.6" },
  { path: "/nearby-mosques", changefreq: "monthly", priority: "0.7" },
  { path: "/faith-journal", changefreq: "monthly", priority: "0.5" },
  { path: "/daily-wird", changefreq: "daily", priority: "0.7" },
  { path: "/daily-reflection", changefreq: "daily", priority: "0.7" },
  { path: "/daily-iman", changefreq: "daily", priority: "0.7" },
  { path: "/heart-quran", changefreq: "monthly", priority: "0.6" },
  { path: "/heart-ambient", changefreq: "monthly", priority: "0.5" },
  { path: "/emotion-quran", changefreq: "monthly", priority: "0.6" },
  { path: "/smart-wird", changefreq: "monthly", priority: "0.6" },
  { path: "/guided-tadabbur", changefreq: "monthly", priority: "0.6" },
  { path: "/weekly-challenge", changefreq: "weekly", priority: "0.6" },
  { path: "/khatm-plan", changefreq: "monthly", priority: "0.6" },
  { path: "/reading-stats", changefreq: "monthly", priority: "0.5" },
  { path: "/tasbih-stats", changefreq: "monthly", priority: "0.5" },
  { path: "/favorites", changefreq: "monthly", priority: "0.5" },
  { path: "/search", changefreq: "monthly", priority: "0.5" },
  { path: "/more", changefreq: "monthly", priority: "0.5" },
  { path: "/settings", changefreq: "monthly", priority: "0.3" },
  { path: "/notification-settings", changefreq: "monthly", priority: "0.3" },
  { path: "/developer-social", changefreq: "monthly", priority: "0.3" },
];

// Per-surah pages (1..114)
for (let i = 1; i <= 114; i++) {
  entries.push({ path: `/quran/${i}`, changefreq: "monthly", priority: "0.6" });
}

const xml = [
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
  ...entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  ),
  `</urlset>`,
].join("\n");

writeFileSync(resolve("public/sitemap.xml"), xml);
console.log(`sitemap.xml written (${entries.length} entries)`);
