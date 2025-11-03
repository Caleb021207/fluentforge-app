import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { UsageLimitAlert } from "@/components/usage/UsageLimitAlert";
import { XPNotificationProvider } from "@/contexts/XPNotificationContext";
import NewLayout from "@/components/layout/NewLayout";
import NewLandingPage from "@/components/layout/NewLandingPage";
import Practice from "@/pages/Practice";
import TranscriptAnalysis from "@/pages/TranscriptAnalysis";
import Progress from "@/pages/Progress";
import Profile from "@/pages/Profile";
import PronunciationPracticeContainer from "@/components/pronunciation/PronunciationPracticeContainer";
import VoiceChat from "@/pages/VoiceChat";
import Settings from "@/pages/Settings";
import Legal from "@/pages/Legal";
import CertificationCodeTester from "@/pages/CertificationCodeTester";
import PremiumVoicePractice from "@/pages/PremiumVoicePractice";
import ClassMetrics from "@/pages/ClassMetrics";
import Certificate from "@/pages/Certificate";

function App() {
  return (
    <Router>
      <XPNotificationProvider>
        <UsageLimitAlert />
        <NewLayout>
          <Routes>
            <Route path="/" element={<NewLandingPage />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/voice-chat" element={<VoiceChat />} />
            <Route path="/pronunciation-practice" element={<PronunciationPracticeContainer />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/legal" element={<Legal />} />
            <Route path="/analysis" element={<TranscriptAnalysis />} />
            <Route path="/code-tester" element={<CertificationCodeTester />} />
            <Route path="/premium-voice-practice" element={<PremiumVoicePractice />} />
            <Route path="/class-metrics" element={<ClassMetrics />} />
            <Route path="/certificate" element={<Certificate />} />
            
          </Routes>
          <Toaster />
        </NewLayout>
      </XPNotificationProvider>
    </Router>
  );
}

export default App;
