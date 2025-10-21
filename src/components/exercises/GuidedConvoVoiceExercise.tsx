import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useVoiceSpeechRecognition } from '@/hooks/useVoiceSpeechRecognition';
import { useVoiceTTS } from '@/hooks/useVoiceTTS';
import { motion, AnimatePresence } from 'framer-motion';
import type { Exercise, GuidedConvoVoicePayload } from '@/types/exercises';

interface Props {
  exercise: Exercise;
  onComplete: (outcome: 'correct' | 'partial' | 'incorrect', score: number) => void;
}

const GuidedConvoVoiceExercise = ({ exercise, onComplete }: Props) => {
  const payload = exercise.payload as GuidedConvoVoicePayload;
  const [currentStep, setCurrentStep] = useState(0);
  const [conversation, setConversation] = useState<Array<{ role: string; content: string; transcript?: string }>>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const { speakWithAzureTTS, isSpeaking } = useVoiceTTS({
    practiceLanguage: 'english',
    speechRate: 0.9
  });

  const step = payload.steps[currentStep];

  const handleTranscriptChange = (transcript: string) => {
    console.log('Transcript:', transcript);
  };

  const handleSendTranscript = async (transcript: string) => {
    if (!transcript.trim() || isProcessing) return;
    
    setIsProcessing(true);
    
    // Simple keyword matching for voice recognition
    const normalized = transcript.toLowerCase().trim();
    let matchScore = 0;
    
    if (step.kind === 'cloze_voice') {
      // Check if response matches expected answers
      matchScore = step.answers.some(ans => 
        normalized.includes(ans.toLowerCase())
      ) ? 1 : 0;
    } else {
      // For free voice, accept any reasonable attempt
      matchScore = transcript.length > 10 ? 0.8 : 0.5;
    }

    const stepScore = matchScore >= 0.5 ? 100 / payload.steps.length : 50 / payload.steps.length;
    setTotalScore(prev => prev + stepScore);

    const promptText = step.kind === 'cloze_voice' ? step.promptText : step.system;
    setConversation(prev => [
      ...prev,
      { role: 'system', content: promptText },
      { role: 'user', content: transcript, transcript }
    ]);

    if (currentStep < payload.steps.length - 1) {
      // Speak the next prompt
      const nextStep = payload.steps[currentStep + 1];
      const nextPrompt = nextStep.kind === 'cloze_voice' ? nextStep.promptText : nextStep.system;
      await speakWithAzureTTS(nextPrompt);
      setCurrentStep(prev => prev + 1);
    } else {
      // Conversation complete
      const finalScore = totalScore + stepScore;
      onComplete(finalScore >= 60 ? 'correct' : 'partial', finalScore);
    }

    setIsProcessing(false);
  };

  const {
    isListening,
    toggleListening,
    transcript
  } = useVoiceSpeechRecognition({
    targetLanguage: 'en',
    onTranscriptChange: handleTranscriptChange,
    onSendTranscript: handleSendTranscript
  });

  const handleStart = async () => {
    const promptText = step.kind === 'cloze_voice' ? step.promptText : step.system;
    await speakWithAzureTTS(promptText);
  };

  const currentPromptText = step.kind === 'cloze_voice' ? step.promptText : step.system;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-4"
      >
        <h3 className="text-lg font-semibold">Voice Conversation</h3>
        <p className="text-sm text-muted-foreground">
          Topic: {payload.topic} • Level: {payload.cefr}
        </p>
        <div className="text-xs text-muted-foreground mt-2">
          Step {currentStep + 1} of {payload.steps.length}
        </div>
      </motion.div>

      {/* Conversation history */}
      <AnimatePresence mode="popLayout">
        {conversation.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="p-4 max-h-64 overflow-y-auto space-y-3">
              {conversation.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`text-sm ${msg.role === 'user' ? 'text-right' : ''}`}
                >
                  <span className={`inline-block px-4 py-2 rounded-lg ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {msg.content}
                    {msg.transcript && (
                      <span className="block text-xs opacity-70 mt-1">
                        You said: {msg.transcript}
                      </span>
                    )}
                  </span>
                </motion.div>
              ))}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current prompt */}
      <Card className="p-8">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="text-center space-y-4">
            <p className="text-xl font-medium">{currentPromptText}</p>
            
            {conversation.length === 0 && (
              <Button onClick={handleStart} variant="outline" size="sm">
                <Volume2 className="w-4 h-4 mr-2" />
                Play Prompt
              </Button>
            )}

            {step.kind === 'cloze_voice' && step.answers && step.answers.length > 0 && (
              <div className="text-xs text-muted-foreground">
                Expected answers: {step.answers.join(' or ')}
              </div>
            )}
          </div>

          {/* Live transcript */}
          <AnimatePresence>
            {transcript && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-muted/50 p-4 rounded-lg text-center"
              >
                <p className="text-sm text-muted-foreground mb-1">You're saying:</p>
                <p className="font-medium">{transcript}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Microphone button */}
          <div className="flex justify-center">
            <motion.div
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
            >
              <Button
                onClick={toggleListening}
                disabled={isProcessing || isSpeaking}
                size="lg"
                className={`w-20 h-20 rounded-full ${
                  isListening ? 'bg-destructive hover:bg-destructive/90' : ''
                }`}
              >
                {isListening ? (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <MicOff className="w-8 h-8" />
                  </motion.div>
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </Button>
            </motion.div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            {isListening ? 'Listening... Tap to stop' : 'Tap to speak'}
          </p>
        </motion.div>
      </Card>
    </div>
  );
};

export default GuidedConvoVoiceExercise;
