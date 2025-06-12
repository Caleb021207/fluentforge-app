import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import NewLayout from "@/components/layout/NewLayout";
import NewLandingPage from "@/components/layout/NewLandingPage";
import Practice from "@/pages/Practice";
import Lessons from "@/pages/Lessons";
import TranscriptAnalysis from "@/pages/TranscriptAnalysis";
import Progress from "@/pages/Progress";
import Accuracy from "@/pages/Accuracy";
import Profile from "@/pages/Profile";
import Pronunciation from "@/pages/Pronunciation";
import Vocabulary from "@/pages/Vocabulary";
import Classroom from "@/pages/Classroom";
import PremiumVoice from "@/pages/PremiumVoice";
import Compliance from "@/pages/Compliance";

function App() {
  return (
    <Router>
      <NewLayout>
        <Routes>
          <Route path="/" element={<NewLandingPage />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/analysis" element={<TranscriptAnalysis />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/accuracy" element={<Accuracy />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/pronunciation" element={<Pronunciation />} />
          <Route path="/vocabulary" element={<Vocabulary />} />
          <Route path="/classroom" element={<Classroom />} />
          <Route path="/premium-voice" element={<PremiumVoice />} />
          <Route path="/compliance" element={<Compliance />} />
        </Routes>
        <Toaster />
      </NewLayout>
    </Router>
  );
}

export default App;
