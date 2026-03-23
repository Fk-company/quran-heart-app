import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AudioProvider } from "@/contexts/AudioContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import BottomNav from "@/components/BottomNav";
import MiniPlayer from "@/components/MiniPlayer";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Sonner />
        <AudioProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-background islamic-bg">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/quran" element={<QuranPage />} />
                <Route path="/quran/:id" element={<SurahDetailPage />} />
                <Route path="/reciters" element={<RecitersPage />} />
                <Route path="/adhkar" element={<AdhkarPage />} />
                <Route path="/radio" element={<RadioPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/more" element={<MorePage />} />
                <Route path="/prophets" element={<ProphetsPage />} />
                <Route path="/hadith" element={<HadithPage />} />
                <Route path="/asma-al-husna" element={<AsmaAlHusnaPage />} />
                <Route path="/sakinah" element={<SakinahPage />} />
                <Route path="/quran-stats" element={<QuranStatsPage />} />
                <Route path="/dua" element={<DuaPage />} />
                <Route path="/tafsir" element={<TafsirPage />} />
                <Route path="/kids-stories" element={<KidsStoriesPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
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
