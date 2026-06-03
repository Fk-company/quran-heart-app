import { useState } from "react";
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
import SplashScreen from "@/components/SplashScreen";
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
import HijriCalendarPage from "./pages/HijriCalendarPage";
import KhatmPlanPage from "./pages/KhatmPlanPage";
import DailyWirdPage from "./pages/DailyWirdPage";
import TasbihStatsPage from "./pages/TasbihStatsPage";
import DeveloperSocialPage from "./pages/DeveloperSocialPage";
import SmartWirdPage from "./pages/SmartWirdPage";
import WeeklyChallengePage from "./pages/WeeklyChallengePage";
import ReciterComparePage from "./pages/ReciterComparePage";
import RevelationMapPage from "./pages/RevelationMapPage";
import MutashabihatPage from "./pages/MutashabihatPage";
import GuidedTadabburPage from "./pages/GuidedTadabburPage";
import HeartAmbientPage from "./pages/HeartAmbientPage";
import DailyImanPage from "./pages/DailyImanPage";
import SurahSummaryPage from "./pages/SurahSummaryPage";
import QiblaPage from "./pages/QiblaPage";
import ZakatPage from "./pages/ZakatPage";
import FastingTrackerPage from "./pages/FastingTrackerPage";
import IslamicQuizPage from "./pages/IslamicQuizPage";
import NearbyMosquesPage from "./pages/NearbyMosquesPage";
import FaithJournalPage from "./pages/FaithJournalPage";
import NotificationSettingsPage from "./pages/NotificationSettingsPage";
import DailyKhatirahPage from "./pages/DailyKhatirahPage";
import PersonalDashboardPage from "./pages/PersonalDashboardPage";
import NotFound from "./pages/NotFound";
import { useSettings } from "@/hooks/useSettings";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <main>
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
          <Route path="/hijri-calendar" element={<PageTransition><HijriCalendarPage /></PageTransition>} />
          <Route path="/khatm-plan" element={<PageTransition><KhatmPlanPage /></PageTransition>} />
          <Route path="/daily-wird" element={<PageTransition><DailyWirdPage /></PageTransition>} />
          <Route path="/tasbih-stats" element={<PageTransition><TasbihStatsPage /></PageTransition>} />
          <Route path="/developer-social" element={<PageTransition><DeveloperSocialPage /></PageTransition>} />
          <Route path="/smart-wird" element={<PageTransition><SmartWirdPage /></PageTransition>} />
          <Route path="/weekly-challenge" element={<PageTransition><WeeklyChallengePage /></PageTransition>} />
          <Route path="/reciter-compare" element={<PageTransition><ReciterComparePage /></PageTransition>} />
          <Route path="/revelation-map" element={<PageTransition><RevelationMapPage /></PageTransition>} />
          <Route path="/mutashabihat" element={<PageTransition><MutashabihatPage /></PageTransition>} />
          <Route path="/guided-tadabbur" element={<PageTransition><GuidedTadabburPage /></PageTransition>} />
          <Route path="/heart-ambient" element={<PageTransition><HeartAmbientPage /></PageTransition>} />
          <Route path="/daily-iman" element={<PageTransition><DailyImanPage /></PageTransition>} />
          <Route path="/surah-summary" element={<PageTransition><SurahSummaryPage /></PageTransition>} />
          <Route path="/qibla" element={<PageTransition><QiblaPage /></PageTransition>} />
          <Route path="/zakat" element={<PageTransition><ZakatPage /></PageTransition>} />
          <Route path="/fasting-tracker" element={<PageTransition><FastingTrackerPage /></PageTransition>} />
          <Route path="/islamic-quiz" element={<PageTransition><IslamicQuizPage /></PageTransition>} />
          <Route path="/nearby-mosques" element={<PageTransition><NearbyMosquesPage /></PageTransition>} />
          <Route path="/faith-journal" element={<PageTransition><FaithJournalPage /></PageTransition>} />
          <Route path="/notification-settings" element={<PageTransition><NotificationSettingsPage /></PageTransition>} />
          <Route path="/daily-khatirah" element={<PageTransition><DailyKhatirahPage /></PageTransition>} />
          <Route path="/dashboard" element={<PageTransition><PersonalDashboardPage /></PageTransition>} />
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </AnimatePresence>
    </main>
  );
};

const SettingsBootstrap = () => { useSettings(); return null; };

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Sonner />
          <AudioProvider>
            <BrowserRouter>
              <SettingsBootstrap />
              {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
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
};

export default App;
