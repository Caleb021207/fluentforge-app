
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import FreeTierPractice from './pages/FreeTierPractice';
import StudyPage from './pages/StudyPage';
import PremiumVoiceChat from './pages/PremiumVoiceChat';
import { Toaster } from "@/components/ui/toaster";
import { LocalizationProvider } from './context/LocalizationContext';
import { MotionConfig } from 'framer-motion';
import ElevenLabsProvider from './providers/ElevenLabsProvider';

function App() {
  return (
    <ElevenLabsProvider>
      <LocalizationProvider>
        <MotionConfig reducedMotion="user">
          <Router>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/practice" element={<FreeTierPractice />} />
              <Route path="/voice-chat" element={<PremiumVoiceChat />} />
              <Route path="/study/:studyId" element={<StudyPage />} />
            </Routes>
            <Toaster />
          </Router>
        </MotionConfig>
      </LocalizationProvider>
    </ElevenLabsProvider>
  );
}

export default App;
