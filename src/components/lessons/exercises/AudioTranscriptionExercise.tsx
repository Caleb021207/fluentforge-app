
import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Volume2 } from 'lucide-react';

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

interface AudioTranscriptionExerciseProps {
  exercise: Exercise;
  onAnswer: (isCorrect: boolean) => void;
  timeLeft?: number | null;
}

const AudioTranscriptionExercise: React.FC<AudioTranscriptionExerciseProps> = ({
  exercise,
  onAnswer,
}) => {
  const [userAnswer, setUserAnswer] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = () => {
    if (audioRef.current && exercise.audio) {
      audioRef.current.play();
    }
  };

  const handleSubmit = () => {
    if (!exercise.answer) return;
    
    // For string array answers, check if any answer matches
    if (Array.isArray(exercise.answer)) {
      const isCorrect = exercise.answer.some(answer => 
        userAnswer.toLowerCase().trim() === answer.toLowerCase().trim()
      );
      onAnswer(isCorrect);
    } else {
      // For single string answer
      const isCorrect = userAnswer.toLowerCase().trim() === exercise.answer.toLowerCase().trim();
      onAnswer(isCorrect);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{exercise.question}</h3>
          
          <div className="flex justify-center my-4">
            <Button 
              onClick={playAudio} 
              className="flex items-center gap-2"
              size="lg"
            >
              <Volume2 className="h-6 w-6" />
              Play Audio
            </Button>
          </div>

          {exercise.audio && (
            <audio ref={audioRef} src={exercise.audio} className="hidden" />
          )}
          
          <Textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Write what you hear..."
            className="mt-4"
            rows={3}
          />
          
          <Button 
            onClick={handleSubmit}
            className="w-full mt-4"
            disabled={!userAnswer.trim()}
          >
            Submit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AudioTranscriptionExercise;
