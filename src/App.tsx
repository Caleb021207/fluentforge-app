
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Layout from "@/components/Layout";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import ExampleData from "@/pages/ExampleData";
import AdminDashboard from "@/pages/AdminDashboard";
import LanguageFrameworks from "@/pages/LanguageFrameworks";
import VoiceChat from "@/pages/VoiceChat";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LocalizationProvider } from "@/context/LocalizationContext";
import { AuthProvider } from "@/context/AuthContext";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import TextPractice from "@/pages/TextPractice";
import AdvancedConversation from "@/pages/AdvancedConversation";
import UnlimitedVoicePractice from "@/pages/UnlimitedVoicePractice";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LocalizationProvider>
        <BrowserRouter>
          <AuthProvider>
            <Layout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/language-frameworks" element={<LanguageFrameworks />} />
                <Route path="/text-practice" element={<TextPractice />} />
                <Route path="/advanced-conversation" element={<AdvancedConversation />} />
                <Route path="/unlimited-voice-practice" element={<UnlimitedVoicePractice />} />
                <Route path="/voice-chat" element={<VoiceChat />} />
                <Route path="/example-data" element={<ExampleData />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </AuthProvider>
        </BrowserRouter>
      </LocalizationProvider>
    </QueryClientProvider>
  );
}

export default App;
