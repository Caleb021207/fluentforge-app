
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useLocalization } from '@/context/LocalizationContext';
import { getLanguagePair } from '@/utils/languageUtils';
import { supabase } from "@/integrations/supabase/client";

interface AudioTranscriptionExerciseProps {
  exercise: {
    title: string;
    description: string;
    audio: {
      url: string;
      transcript: string;
    }[];
    points: number;
  };
  onAnswer: (isCorrect: boolean) => void;
  timeLeft: number | null;
}

const AudioTranscriptionExercise: React.FC<AudioTranscriptionExerciseProps> = ({
  exercise,
  onAnswer,
}) => {
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [hasPlayed, setHasPlayed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { currentLanguage } = useLocalization();
  
  const currentAudio = exercise.audio[currentAudioIndex];

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setHasPlayed(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Get user's practice language based on their interface language
      const languagePair = getLanguagePair(currentLanguage);
      const practiceLanguage = languagePair.practice.toLowerCase();
      
      // Map languages to OpenAI Whisper's supported language codes
      const languageCodeMap: Record<string, string> = {
        'english': 'en',
        'spanish': 'es',
        'portuguese': 'pt',
        'french': 'fr',
        'mandarin': 'zh',
        'arabic': 'ar',
        'japanese': 'ja',
        'korean': 'ko',
        'russian': 'ru',
        'ukrainian': 'uk',
        'vietnamese': 'vi',
        'indonesian': 'id',
        'hindi': 'hi'
      };
      
      // Default to English if language not in map
      const languageCode = languageCodeMap[practiceLanguage] || 'en';
      
      // For now we'll still use the simple string comparison, but this prepares for future improvements
      // In a real implementation, we might want to send the user input to the API for comparison
      const isCorrect = compareAnswers(userInput, currentAudio.transcript);
      
      if (currentAudioIndex < exercise.audio.length - 1) {
        setCurrentAudioIndex(currentAudioIndex + 1);
        setUserInput('');
        setHasPlayed(false);
      } else {
        // Last audio, complete exercise
        onAnswer(isCorrect);
      }
    } catch (error) {
      console.error("Error in audio transcription exercise:", error);
      onAnswer(false);
    }
  };

  // Simple string comparison (a more sophisticated implementation would use fuzzy matching)
  const compareAnswers = (userAnswer: string, correctAnswer: string): boolean => {
    return userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 p-6 rounded-lg">
        <h3 className="text-xl font-medium mb-3">{exercise.title}</h3>
        <p className="text-slate-600 mb-4">{exercise.description}</p>
        
        <div className="border rounded-lg p-4 bg-white">
          <Button 
            onClick={playAudio} 
            variant="outline"
            className="flex items-center space-x-2 mb-4 mx-auto"
          >
            <Volume2 className="h-4 w-4" />
            <span>Play Audio</span>
          </Button>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="transcription" className="block text-sm font-medium mb-1">
                What did you hear? Type the exact words:
              </label>
              <Input
                id="transcription"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type what you heard..."
                disabled={!hasPlayed}
                className="w-full"
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={!hasPlayed || !userInput.trim()}
              className="w-full"
            >
              Submit
            </Button>
          </form>
        </div>
        
        <div className="mt-4 text-sm text-slate-500">
          <p>Progress: {currentAudioIndex + 1}/{exercise.audio.length}</p>
        </div>
      </div>
      
      {currentAudio?.url && (
        <audio ref={audioRef} src={currentAudio.url} className="hidden" />
      )}
    </div>
  );
};

export default AudioTranscriptionExercise;
