import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { UsageLimitAlert } from "@/components/usage/UsageLimitAlert";
import { XPNotificationProvider } from "@/contexts/XPNotificationContext";
import AgeGate from "@/components/compliance/AgeGate";
import NewLayout from "@/components/layout/NewLayout";
import NewLandingPage from "@/components/layout/NewLandingPage";

// Route components are lazy-loaded so each page ships in its own chunk. This
// keeps the initial bundle small — only the shell + landing page load up front.
const Practice = lazy(() => import("@/pages/Practice"));
const TranscriptAnalysis = lazy(() => import("@/pages/TranscriptAnalysis"));
const Progress = lazy(() => import("@/pages/Progress"));
const Profile = lazy(() => import("@/pages/Profile"));
const PronunciationPracticeContainer = lazy(
  () => import("@/components/pronunciation/PronunciationPracticeContainer"),
);
const VoiceChat = lazy(() => import("@/pages/VoiceChat"));
const Settings = lazy(() => import("@/pages/Settings"));
const Legal = lazy(() => import("@/pages/Legal"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const PremiumVoicePractice = lazy(() => import("@/pages/PremiumVoicePractice"));
const Certificate = lazy(() => import("@/pages/Certificate"));
const Learn = lazy(() => import("@/pages/Learn"));
const VocabReview = lazy(() => import("@/pages/VocabReview"));
const TeacherDashboard = lazy(() => import("@/pages/TeacherDashboard"));
const ChallengeMode = lazy(() => import("@/pages/ChallengeMode"));
const XPRewards = lazy(() => import("@/pages/XPRewards"));
const Assignments = lazy(() => import("@/pages/Assignments"));
const Accuracy = lazy(() => import("@/pages/Accuracy"));
const Certificates = lazy(() => import("@/pages/Certificates"));
const Classroom = lazy(() => import("@/pages/Classroom"));
const Compliance = lazy(() => import("@/pages/Compliance"));
const Author = lazy(() => import("@/pages/Author"));
const SafetyPolicy = lazy(() => import("@/pages/SafetyPolicy"));
const PlacementQuiz = lazy(() => import("@/pages/PlacementQuiz"));
const LessonPlayer = lazy(() => import("@/pages/LessonPlayer"));
const ReadingCertification = lazy(() => import("@/pages/ReadingCertification"));
const WritingCertification = lazy(() => import("@/pages/WritingCertification"));
const StudentClass = lazy(() => import("@/pages/StudentClass"));
const PremiumVoice = lazy(() => import("@/pages/PremiumVoice"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));

function PageLoader() {
  return (
    <div
      className="flex min-h-[60vh] w-full items-center justify-center"
      role="status"
      aria-label="Loading"
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

function App() {
  return (
    <Router>
      <XPNotificationProvider>
        <UsageLimitAlert />
        <NewLayout>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Core pages */}
              <Route path="/" element={<NewLandingPage />} />
              <Route path="/practice" element={<Practice />} />
              <Route path="/voice-chat" element={<VoiceChat />} />
              <Route path="/pronunciation-practice" element={<PronunciationPracticeContainer />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/legal" element={<Legal />} />
              <Route path="/analysis" element={<TranscriptAnalysis />} />
              <Route path="/xp" element={<XPRewards />} />
              <Route path="/assignments" element={<Assignments />} />

              {/* Practice & Learning */}
              <Route path="/premium-voice-practice" element={<PremiumVoicePractice />} />
              <Route path="/premium-voice" element={<PremiumVoice />} />
              <Route path="/certificate" element={<Certificate />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/review" element={<VocabReview />} />
              {/* Generated flashcards were replaced by the curriculum-backed FSRS deck. */}
              <Route path="/personal-flashcards" element={<Navigate to="/review" replace />} />
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
              <Route path="/author" element={<Author />} />
              <Route path="/safety-policy" element={<SafetyPolicy />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <AgeGate />
          <Toaster />
        </NewLayout>
      </XPNotificationProvider>
    </Router>
  );
}

export default App;
