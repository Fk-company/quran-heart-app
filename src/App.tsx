import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AudioProvider } from "@/contexts/AudioContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AnimatePresence } from "framer-motion";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import MiniPlayer from "@/components/MiniPlayer";
import PageTransition from "@/components/PageTransition";
import HomePage from "./pages/HomePage";
import QuranPage from "./pages/QuranPage";
import SurahDetailPage from "./pages/SurahDetailPage";
import RecitersPage from "./pages/RecitersPage";
import AdhkarPage from "./pages/AdhkarPage";
import RadioPage from "./pages/RadioPage";
import SearchPage from "./pages/SearchPage";
import MorePage from "./pages/MorePage";
import ProphetsPage from "./pages/ProphetsPage";
import HadithPage from "./pages/HadithPage";
import AsmaAlHusnaPage from "./pages/AsmaAlHusnaPage";
import SakinahPage from "./pages/SakinahPage";
import QuranStatsPage from "./pages/QuranStatsPage";
import DuaPage from "./pages/DuaPage";
import TafsirPage from "./pages/TafsirPage";
import KidsStoriesPage from "./pages/KidsStoriesPage";
import FavoritesPage from "./pages/FavoritesPage";
import ReadingStatsPage from "./pages/ReadingStatsPage";
import MushafPage from "./pages/MushafPage";
import SettingsPage from "./pages/SettingsPage";
import MemorizationTestPage from "./pages/MemorizationTestPage";
import EmotionQuranPage from "./pages/EmotionQuranPage";
import HeartQuranPage from "./pages/HeartQuranPage";
import DailyReflectionPage from "./pages/DailyReflectionPage";
import AiTafsirPage from "./pages/AiTafsirPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
        <Route path="/quran" element={<PageTransition><QuranPage /></PageTransition>} />
        <Route path="/quran/:id" element={<PageTransition><SurahDetailPage /></PageTransition>} />
        <Route path="/mushaf" element={<PageTransition><MushafPage /></PageTransition>} />
        <Route path="/reciters" element={<PageTransition><RecitersPage /></PageTransition>} />
        <Route path="/adhkar" element={<PageTransition><AdhkarPage /></PageTransition>} />
        <Route path="/radio" element={<PageTransition><RadioPage /></PageTransition>} />
        <Route path="/search" element={<PageTransition><SearchPage /></PageTransition>} />
        <Route path="/more" element={<PageTransition><MorePage /></PageTransition>} />
        <Route path="/prophets" element={<PageTransition><ProphetsPage /></PageTransition>} />
        <Route path="/hadith" element={<PageTransition><HadithPage /></PageTransition>} />
        <Route path="/asma-al-husna" element={<PageTransition><AsmaAlHusnaPage /></PageTransition>} />
        <Route path="/sakinah" element={<PageTransition><SakinahPage /></PageTransition>} />
        <Route path="/quran-stats" element={<PageTransition><QuranStatsPage /></PageTransition>} />
        <Route path="/dua" element={<PageTransition><DuaPage /></PageTransition>} />
        <Route path="/tafsir" element={<PageTransition><TafsirPage /></PageTransition>} />
        <Route path="/kids-stories" element={<PageTransition><KidsStoriesPage /></PageTransition>} />
        <Route path="/favorites" element={<PageTransition><FavoritesPage /></PageTransition>} />
        <Route path="/reading-stats" element={<PageTransition><ReadingStatsPage /></PageTransition>} />
        <Route path="/settings" element={<PageTransition><SettingsPage /></PageTransition>} />
        <Route path="/memorization-test" element={<PageTransition><MemorizationTestPage /></PageTransition>} />
        <Route path="/emotion-quran" element={<PageTransition><EmotionQuranPage /></PageTransition>} />
        <Route path="/heart-quran" element={<PageTransition><HeartQuranPage /></PageTransition>} />
        <Route path="/daily-reflection" element={<PageTransition><DailyReflectionPage /></PageTransition>} />
        <Route path="/ai-tafsir" element={<PageTransition><AiTafsirPage /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Sonner />
        <AudioProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-background islamic-bg">
              <TopBar />
              <AnimatedRoutes />
              <MiniPlayer />
              <BottomNav />
            </div>
          </BrowserRouter>
        </AudioProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
