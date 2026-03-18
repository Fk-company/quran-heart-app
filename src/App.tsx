import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AudioProvider } from "@/contexts/AudioContext";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <AudioProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/quran" element={<QuranPage />} />
              <Route path="/quran/:id" element={<SurahDetailPage />} />
              <Route path="/reciters" element={<RecitersPage />} />
              <Route path="/adhkar" element={<AdhkarPage />} />
              <Route path="/radio" element={<RadioPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/more" element={<MorePage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <MiniPlayer />
            <BottomNav />
          </div>
        </BrowserRouter>
      </AudioProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
