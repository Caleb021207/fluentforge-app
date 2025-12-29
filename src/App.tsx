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

import PremiumVoicePractice from "@/pages/PremiumVoicePractice";
import Certificate from "@/pages/Certificate";
import PersonalFlashcards from "@/pages/PersonalFlashcards";
import TeacherDashboard from "@/pages/TeacherDashboard";
import ChallengeMode from "@/pages/ChallengeMode";

// Previously unrouted pages - now properly routed
import Accuracy from "@/pages/Accuracy";
import Certificates from "@/pages/Certificates";
import Classroom from "@/pages/Classroom";
import Compliance from "@/pages/Compliance";
import SafetyPolicy from "@/pages/SafetyPolicy";
import PlacementQuiz from "@/pages/PlacementQuiz";
import LessonPlayer from "@/pages/LessonPlayer";
import ReadingCertification from "@/pages/ReadingCertification";
import WritingCertification from "@/pages/WritingCertification";
import StudentClass from "@/pages/StudentClass";
import PremiumVoice from "@/pages/PremiumVoice";

function App() {
  return (
    <Router>
      <XPNotificationProvider>
        <UsageLimitAlert />
        <NewLayout>
          <Routes>
            {/* Core pages */}
            <Route path="/" element={<NewLandingPage />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/voice-chat" element={<VoiceChat />} />
            <Route path="/pronunciation-practice" element={<PronunciationPracticeContainer />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/legal" element={<Legal />} />
            <Route path="/analysis" element={<TranscriptAnalysis />} />
            
            {/* Practice & Learning */}
            <Route path="/premium-voice-practice" element={<PremiumVoicePractice />} />
            <Route path="/premium-voice" element={<PremiumVoice />} />
            <Route path="/certificate" element={<Certificate />} />
            <Route path="/personal-flashcards" element={<PersonalFlashcards />} />
            <Route path="/challenge-mode" element={<ChallengeMode />} />
            
            {/* Accuracy & Progress */}
            <Route path="/accuracy" element={<Accuracy />} />
            <Route path="/progress" element={<Progress />} />
            
            {/* Certifications */}
            <Route path="/certificates" element={<Certificates />} />
            <Route path="/reading-certification" element={<ReadingCertification />} />
            <Route path="/reading-certification/:level" element={<ReadingCertification />} />
            <Route path="/writing-certification" element={<WritingCertification />} />
            
            {/* Lessons & Placement */}
            <Route path="/placement-quiz" element={<PlacementQuiz />} />
            <Route path="/lessons/:lessonId" element={<LessonPlayer />} />
            
            {/* Classroom & Student */}
            <Route path="/classroom" element={<Classroom />} />
            <Route path="/student/class" element={<StudentClass />} />
            <Route path="/student/class/:classId" element={<StudentClass />} />
            
            {/* Teacher Dashboard - unified entry point */}
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            
            {/* Admin/Compliance */}
            <Route path="/compliance" element={<Compliance />} />
            <Route path="/safety-policy" element={<SafetyPolicy />} />
          </Routes>
          <Toaster />
        </NewLayout>
      </XPNotificationProvider>
    </Router>
  );
}

export default App;
