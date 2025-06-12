
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
import PronunciationPractice from "@/pages/PronunciationPractice";
import VoiceChat from "@/pages/VoiceChat";
import Certificates from "@/pages/Certificates";
import Settings from "@/pages/Settings";

function App() {
  return (
    <Router>
      <NewLayout>
        <Routes>
          <Route path="/" element={<NewLandingPage />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/voice-chat" element={<VoiceChat />} />
          <Route path="/pronunciation-practice" element={<PronunciationPractice />} />
          <Route path="/accuracy" element={<Accuracy />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/certificates" element={<Certificates />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/analysis" element={<TranscriptAnalysis />} />
        </Routes>
        <Toaster />
      </NewLayout>
    </Router>
  );
}

export default App;
