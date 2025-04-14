
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { LocalizationProvider } from './context/LocalizationContext';
import { MotionConfig } from 'framer-motion';
import ElevenLabsProviderComponent from './providers/ElevenLabsProvider';
import FreeTierPractice from './pages/FreeTierPractice';
import PremiumVoiceChat from './pages/PremiumVoiceChat';

function App() {
  return (
    <ElevenLabsProviderComponent>
      <LocalizationProvider>
        <MotionConfig reducedMotion="user">
          <Router>
            <Routes>
              <Route path="/" element={<FreeTierPractice />} />
              <Route path="/practice" element={<FreeTierPractice />} />
              <Route path="/voice-chat" element={<PremiumVoiceChat />} />
            </Routes>
            <Toaster />
          </Router>
        </MotionConfig>
      </LocalizationProvider>
    </ElevenLabsProviderComponent>
  );
}

export default App;
