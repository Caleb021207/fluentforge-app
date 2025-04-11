import { Routes, Route } from "react-router-dom";
import "./App.css";
import Layout from "@/components/Layout";
import Index from "@/pages/Index";
import Practice from "@/pages/Practice";
import NotFound from "@/pages/NotFound";
import ExampleData from "@/pages/ExampleData";
import AdminDashboard from "@/pages/AdminDashboard";
import VoiceChat from "@/pages/VoiceChat";
import PremiumVoiceChat from "@/pages/PremiumVoiceChat";
import PremiumVoiceRouter from "@/pages/PremiumVoiceRouter";
import Settings from "@/pages/Settings";
import SafetyPolicy from "@/pages/SafetyPolicy";
import WritingCertification from "@/pages/WritingCertification";
import ReadingCertification from "@/pages/ReadingCertification";
import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LocalizationProvider } from "@/context/LocalizationContext";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LocalizationProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/practice" element={<Practice />} />
              <Route path="/voice-chat" element={<VoiceChat />} />
              <Route path="/premium-voice" element={<PremiumVoiceRouter />} />
              <Route path="/example-data" element={<ExampleData />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/safety-policy" element={<SafetyPolicy />} />
              <Route path="/certification/writing" element={<WritingCertification />} />
              <Route path="/certification/reading/:level?" element={<ReadingCertification />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </Router>
      </LocalizationProvider>
    </QueryClientProvider>
  );
}

export default App;
