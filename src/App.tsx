import { Routes, Route } from "react-router-dom";
import "./App.css";
import Layout from "@/components/Layout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LocalizationProvider } from "@/context/LocalizationContext";
import { ElevenLabsProvider } from "@/providers/ElevenLabsProvider";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LocalizationProvider>
        <ElevenLabsProvider>
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/practice" element={<Practice />} />
                <Route path="/voice-chat" element={<VoiceChat />} />
                <Route path="/premium-voice-chat" element={<PremiumVoiceChat />} />
                <Route path="/example-data" element={<ExampleData />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/safety-policy" element={<SafetyPolicy />} />
                <Route path="/certification/writing" element={<WritingCertification />} />
                <Route path="/certification/reading/:level?" element={<ReadingCertification />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </ElevenLabsProvider>
      </LocalizationProvider>
    </QueryClientProvider>
  );
}

export default App;
