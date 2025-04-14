
import { Routes, Route, BrowserRouter } from "react-router-dom";
import "./App.css";
import Layout from "@/components/Layout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LocalizationProvider } from "@/context/LocalizationContext";
import Index from "@/pages/Index";
import Practice from "@/pages/Practice";
import VoiceChat from "@/pages/VoiceChat";
import PremiumVoiceChat from "@/pages/PremiumVoiceChat";
import ProVoiceChat from "@/pages/ProVoiceChat";
import ExampleData from "@/pages/ExampleData";
import Settings from "@/pages/Settings";
import SafetyPolicy from "@/pages/SafetyPolicy";
import WritingCertification from "@/pages/WritingCertification";
import ReadingCertification from "@/pages/ReadingCertification";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LocalizationProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/practice" element={<Practice />} />
              <Route path="/voice-chat" element={<VoiceChat />} />
              <Route path="/pro-voice-chat" element={<ProVoiceChat />} />
              <Route path="/premium-voice-chat" element={<PremiumVoiceChat />} />
              <Route path="/example-data" element={<ExampleData />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/safety-policy" element={<SafetyPolicy />} />
              <Route path="/certification/writing" element={<WritingCertification />} />
              <Route path="/certification/reading/:level?" element={<ReadingCertification />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </LocalizationProvider>
    </QueryClientProvider>
  );
}

export default App;
