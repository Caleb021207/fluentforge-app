
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Layout from "@/components/Layout";
import Index from "@/pages/Index";
import Practice from "@/pages/Practice";
import NotFound from "@/pages/NotFound";
import ExampleData from "@/pages/ExampleData";
import AdminDashboard from "@/pages/AdminDashboard";
import LanguageFrameworks from "@/pages/LanguageFrameworks";
import VoiceChat from "@/pages/VoiceChat";
import PremiumVoiceChat from "@/pages/PremiumVoiceChat";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LocalizationProvider } from "@/context/LocalizationContext";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LocalizationProvider>
        <AuthProvider>
          <ThemeProvider>
            <BrowserRouter>
              <Layout>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/language-frameworks" element={<LanguageFrameworks />} />
                  <Route path="/practice" element={<Practice />} />
                  <Route path="/voice-chat" element={<VoiceChat />} />
                  <Route path="/premium-voice-chat" element={<PremiumVoiceChat />} />
                  <Route path="/example-data" element={<ExampleData />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            </BrowserRouter>
          </ThemeProvider>
        </AuthProvider>
      </LocalizationProvider>
    </QueryClientProvider>
  );
}

export default App;
