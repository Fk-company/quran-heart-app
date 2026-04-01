const ALQURAN_BASE = 'https://api.alquran.cloud/v1';
const ALADHAN_BASE = 'https://api.aladhan.com/v1';
const MP3QURAN_BASE = 'https://mp3quran.net/api/v3';

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  page: number;
  audio?: string;
}

export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export interface Reciter {
  id: number;
  name: string;
  letter: string;
  moshaf: Array<{
    id: number;
    name: string;
    server: string;
    surah_list: string;
  }>;
}

export interface RadioStation {
  id: number;
  name: string;
  url: string;
}

// Quran API
export async function fetchSurahs(): Promise<Surah[]> {
  const res = await fetch(`${ALQURAN_BASE}/surah`);
  const data = await res.json();
  return data.data;
}

export async function fetchSurahAyahs(surahNumber: number): Promise<Ayah[]> {
  const res = await fetch(`${ALQURAN_BASE}/surah/${surahNumber}`);
  const data = await res.json();
  return data.data.ayahs;
}

export async function fetchSurahWithAudio(surahNumber: number, reciterId: string = 'ar.alafasy'): Promise<Ayah[]> {
  const res = await fetch(`${ALQURAN_BASE}/surah/${surahNumber}/${reciterId}`);
  const data = await res.json();
  return data.data.ayahs;
}

export async function fetchTafsir(surahNumber: number): Promise<Ayah[]> {
  const res = await fetch(`${ALQURAN_BASE}/surah/${surahNumber}/ar.muyassar`);
  const data = await res.json();
  return data.data.ayahs;
}

export async function searchQuran(query: string): Promise<any> {
  const res = await fetch(`${ALQURAN_BASE}/search/${encodeURIComponent(query)}/all/ar`);
  const data = await res.json();
  return data.data;
}

// Prayer Times API
export async function fetchPrayerTimes(latitude: number, longitude: number): Promise<{ timings: PrayerTimes; date: any }> {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();
  const res = await fetch(
    `${ALADHAN_BASE}/timings/${dd}-${mm}-${yyyy}?latitude=${latitude}&longitude=${longitude}&method=4`
  );
  const data = await res.json();
  return data.data;
}

export async function fetchPrayerTimesByCity(city: string, country: string): Promise<{ timings: PrayerTimes; date: any }> {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();
  const res = await fetch(
    `${ALADHAN_BASE}/timingsByCity/${dd}-${mm}-${yyyy}?city=${city}&country=${country}&method=4`
  );
  const data = await res.json();
  return data.data;
}

// Reciters API
export async function fetchReciters(): Promise<Reciter[]> {
  const res = await fetch(`${MP3QURAN_BASE}/reciters?language=ar`);
  const data = await res.json();
  return data.reciters || [];
}

// Quran Page API
export async function fetchQuranPage(pageNumber: number): Promise<{ ayahs: Ayah[]; surahs: Record<string, string> }> {
  const res = await fetch(`${ALQURAN_BASE}/page/${pageNumber}`);
  const data = await res.json();
  const ayahs: Ayah[] = data.data.ayahs;
  const surahs: Record<string, string> = {};
  for (const a of ayahs) {
    const sNum = String(a.number > 0 ? Math.floor(a.number / 1000) || 1 : 1);
    // extract surah info from ayah
  }
  return { ayahs, surahs };
}

// Radio API
export async function fetchRadioStations(): Promise<RadioStation[]> {
  const res = await fetch(`${MP3QURAN_BASE}/radios?language=ar`);
  const data = await res.json();
  return data.radios || [];
}
