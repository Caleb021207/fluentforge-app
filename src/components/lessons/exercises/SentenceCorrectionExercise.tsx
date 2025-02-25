
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

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

interface SentenceCorrectionExerciseProps {
  exercise: Exercise;
  onAnswer: (isCorrect: boolean) => void;
  timeLeft?: number | null;
}

const SentenceCorrectionExercise: React.FC<SentenceCorrectionExerciseProps> = ({
  exercise,
  onAnswer,
}) => {
  const [userAnswer, setUserAnswer] = useState(exercise.question || '');

  const handleSubmit = () => {
    if (!exercise.answer) return;
    
    // For string array answers, check if the user's answer matches any correct version
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
          <div>
            <h3 className="text-lg font-medium">Correct the sentence:</h3>
            <p className="text-red-500 font-medium mt-2">{exercise.question}</p>
          </div>
          
          <Textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Write the corrected sentence..."
            className="mt-4"
            rows={3}
          />
          
          <Button 
            onClick={handleSubmit}
            className="w-full mt-4"
            disabled={!userAnswer.trim() || userAnswer === exercise.question}
          >
            Submit Correction
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SentenceCorrectionExercise;
