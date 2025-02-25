
import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Volume2, Mic } from 'lucide-react';

interface Exercise {
  id: number;
  type: string;
  question: string;
  options?: string[];
  answer?: string | string[];
  image?: string;
  audio?: string;
  points: number;
  feedback?: {
    correct: string;
    incorrect: string;
  };
  timeLimit?: number;
}

interface ListenRepeatExerciseProps {
  exercise: Exercise;
  onAnswer: (isCorrect: boolean) => void;
  timeLeft?: number | null;
}

const ListenRepeatExercise: React.FC<ListenRepeatExerciseProps> = ({
  exercise,
  onAnswer,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasListened, setHasListened] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = () => {
    if (audioRef.current && exercise.audio) {
      audioRef.current.play();
      setHasListened(true);
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    // In a real implementation, this would start recording the user's voice
    setTimeout(() => {
      setIsRecording(false);
      // For demo purposes, we'll assume the user got it right
      onAnswer(true);
    }, 3000);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{exercise.question}</h3>
          
          <div className="flex items-center gap-4 my-4 justify-center">
            <Button 
              onClick={playAudio} 
              className="flex items-center gap-2"
              size="lg"
            >
              <Volume2 className="h-6 w-6" />
              Listen
            </Button>

            <Button 
              onClick={startRecording} 
              className="flex items-center gap-2"
              variant={isRecording ? "destructive" : "default"}
              disabled={!hasListened || isRecording}
              size="lg"
            >
              <Mic className="h-6 w-6" />
              {isRecording ? "Recording..." : "Repeat"}
            </Button>
          </div>

          {exercise.audio && (
            <audio ref={audioRef} src={exercise.audio} className="hidden" />
          )}
          
          <p className="text-sm text-gray-500 italic text-center">
            First listen to the audio, then press "Repeat" and say the phrase
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ListenRepeatExercise;
