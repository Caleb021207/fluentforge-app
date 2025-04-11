
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Layout from "@/components/Layout";
import Index from "@/pages/Index";
import Practice from "@/pages/Practice";
import NotFound from "@/pages/NotFound";
import ExampleData from "@/pages/ExampleData";
import AdminDashboard from "@/pages/AdminDashboard";
import VoiceChat from "@/pages/VoiceChat";
import FrenchVoiceChat from "@/pages/FrenchVoiceChat";
import PortugueseVoiceChat from "@/pages/PortugueseVoiceChat";
import LearnFrenchVoiceChat from "@/pages/LearnFrenchVoiceChat";
import LearnPortugueseVoiceChat from "@/pages/LearnPortugueseVoiceChat";
import PremiumVoiceChat from "@/pages/PremiumVoiceChat";
import Settings from "@/pages/Settings";
import SafetyPolicy from "@/pages/SafetyPolicy";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LocalizationProvider } from "@/context/LocalizationContext";

// Create a client
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
              <Route path="/french-voice-chat" element={<FrenchVoiceChat />} />
              <Route path="/portuguese-voice-chat" element={<PortugueseVoiceChat />} />
              <Route path="/learn-french" element={<LearnFrenchVoiceChat />} />
              <Route path="/learn-portuguese" element={<LearnPortugueseVoiceChat />} />
              <Route path="/premium-voice-chat" element={<PremiumVoiceChat />} />
              <Route path="/example-data" element={<ExampleData />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/safety-policy" element={<SafetyPolicy />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </LocalizationProvider>
    </QueryClientProvider>
  );
}

export default App;
