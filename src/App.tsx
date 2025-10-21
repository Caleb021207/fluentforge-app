
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import NewLayout from "@/components/layout/NewLayout";
import NewLandingPage from "@/components/layout/NewLandingPage";
import Practice from "@/pages/Practice";
import Lessons from "@/pages/Lessons";
import TranscriptAnalysis from "@/pages/TranscriptAnalysis";
import Progress from "@/pages/Progress";
import Profile from "@/pages/Profile";
import PronunciationPracticeContainer from "@/components/pronunciation/PronunciationPracticeContainer";
import VoiceChat from "@/pages/VoiceChat";
import Settings from "@/pages/Settings";
import CertificationCodeTester from "@/pages/CertificationCodeTester";
import PremiumVoicePractice from "@/pages/PremiumVoicePractice";
import SafetyPolicy from "@/pages/SafetyPolicy";
import Leaderboard from "@/pages/Leaderboard";
import Learn from "@/pages/Learn";
import LessonPlayer from "@/pages/LessonPlayer";

function App() {
  return (
    <Router>
      <NewLayout>
        <Routes>
          <Route path="/" element={<NewLandingPage />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/voice-chat" element={<VoiceChat />} />
          <Route path="/pronunciation-practice" element={<PronunciationPracticeContainer />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/analysis" element={<TranscriptAnalysis />} />
          <Route path="/code-tester" element={<CertificationCodeTester />} />
          <Route path="/premium-voice-practice" element={<PremiumVoicePractice />} />
          <Route path="/safety-policy" element={<SafetyPolicy />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
        <Toaster />
      </NewLayout>
    </Router>
  );
}

export default App;
