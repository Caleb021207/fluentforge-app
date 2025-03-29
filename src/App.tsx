
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Layout from "@/components/Layout";
import Index from "@/pages/Index";
import PlacementQuiz from "@/pages/PlacementQuiz";
import Certificates from "@/pages/Certificates";
import Practice from "@/pages/Practice";
import Profile from "@/pages/Profile";
import Progress from "@/pages/Progress";
import NotFound from "@/pages/NotFound";
import ExampleData from "@/pages/ExampleData";
import AdminDashboard from "@/pages/AdminDashboard";
import ReadingCertificationPage from "@/pages/ReadingCertification";
import WritingCertificationPage from "@/pages/WritingCertification";
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
              <Route path="/placement-quiz" element={<PlacementQuiz />} />
              <Route path="/certificates" element={<Certificates />} />
              <Route path="/certificates/reading" element={<ReadingCertificationPage />} />
              <Route path="/certificates/reading/:level" element={<ReadingCertificationPage />} />
              <Route path="/certificates/writing" element={<WritingCertificationPage />} />
              <Route path="/certificates/writing/:level" element={<WritingCertificationPage />} />
              <Route path="/practice" element={<Practice />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/example-data" element={<ExampleData />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </LocalizationProvider>
    </QueryClientProvider>
  );
}

export default App;
