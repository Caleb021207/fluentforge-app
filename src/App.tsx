
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
import Vocabulary from "@/pages/Vocabulary";
import ExampleData from "@/pages/ExampleData";
import AdminDashboard from "@/pages/AdminDashboard";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/placement-quiz" element={<PlacementQuiz />} />
            <Route path="/certifications" element={<Certificates />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/vocabulary" element={<Vocabulary />} />
            <Route path="/example-data" element={<ExampleData />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
