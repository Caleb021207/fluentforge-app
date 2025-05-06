
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, Mic } from 'lucide-react';

interface ListenRepeatExerciseProps {
  exercise: {
    title: string;
    description: string;
    phrases: {
      text: string;
      audioUrl?: string;
    }[];
    points: number;
  };
  onAnswer: (isCorrect: boolean) => void;
  timeLeft: number | null;
}

const ListenRepeatExercise: React.FC<ListenRepeatExerciseProps> = ({
  exercise,
  onAnswer,
}) => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [hasListened, setHasListened] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const currentPhrase = exercise.phrases[currentPhraseIndex];

  const playAudio = () => {
    if (audioRef.current && currentPhrase.audioUrl) {
      audioRef.current.play();
      setHasListened(true);
    } else {
      // Fallback if no audio URL - use text-to-speech
      const utterance = new SpeechSynthesisUtterance(currentPhrase.text);
      utterance.lang = 'es-ES'; // Spanish language
      window.speechSynthesis.speak(utterance);
      setHasListened(true);
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    // In a real implementation, this would start audio recording
    // For now, we'll simulate recording
    setTimeout(() => {
      stopRecording();
    }, 3000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    
    // For this demo, we'll just assume the user said it correctly
    handleNextPhrase(true);
  };

  const handleNextPhrase = (wasCorrect: boolean) => {
    if (currentPhraseIndex < exercise.phrases.length - 1) {
      setCurrentPhraseIndex(currentPhraseIndex + 1);
      setHasListened(false);
    } else {
      // All phrases completed
      onAnswer(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 p-6 rounded-lg">
        <h3 className="text-xl font-medium mb-3">{exercise.title}</h3>
        <p className="text-slate-600 mb-4">{exercise.description}</p>
        
        <div className="border rounded-lg p-4 bg-white">
          <p className="text-lg font-medium mb-4">{currentPhrase.text}</p>
          
          <div className="flex space-x-4 items-center">
            <Button 
              onClick={playAudio} 
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Volume2 className="h-4 w-4" />
              <span>Listen</span>
            </Button>
            
            <Button
              onClick={startRecording}
              variant={isRecording ? "destructive" : (hasListened ? "default" : "outline")}
              disabled={!hasListened || isRecording}
              className="flex items-center space-x-2"
            >
              <Mic className="h-4 w-4" />
              <span>{isRecording ? "Recording..." : "Speak"}</span>
            </Button>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-slate-500">
          <p>Listen to the phrase first, then click "Speak" to repeat it.</p>
          <p className="mt-1">Progress: {currentPhraseIndex + 1}/{exercise.phrases.length}</p>
        </div>
      </div>
      
      {currentPhrase.audioUrl && (
        <audio ref={audioRef} src={currentPhrase.audioUrl} className="hidden" />
      )}
    </div>
  );
};

export default ListenRepeatExercise;
