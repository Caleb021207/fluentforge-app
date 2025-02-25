
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
import Lessons from "@/pages/Lessons";
import ExampleData from "@/pages/ExampleData";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Index />} />
        <Route path="/placement" element={<PlacementQuiz />} />
        <Route path="/certifications" element={<Certificates />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/lessons" element={<Lessons />} />
        <Route path="/example-data" element={<ExampleData />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
