
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

interface AIWritingPromptExerciseProps {
  exercise: Exercise;
  onAnswer: (isCorrect: boolean) => void;
  timeLeft?: number | null;
}

const AIWritingPromptExercise: React.FC<AIWritingPromptExerciseProps> = ({
  exercise,
  onAnswer,
}) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const minimumLength = 20; // Minimum character count

  const handleSubmit = () => {
    // For AI exercises, we'll consider any substantial answer to be correct
    // In a real implementation, we'd send this to an AI model for evaluation
    
    setIsSubmitting(true);
    
    // Simulate an API call to an AI service
    setTimeout(() => {
      setIsSubmitting(false);
      
      // Consider an answer with sufficient length as correct
      const isCorrect = userAnswer.trim().length >= minimumLength;
      onAnswer(isCorrect);
    }, 1500);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{exercise.question}</h3>
          
          <Textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Write your response..."
            className="mt-4"
            rows={6}
          />
          
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Characters: {userAnswer.length}
              {userAnswer.length < minimumLength && (
                <span className="text-amber-600"> (minimum {minimumLength})</span>
              )}
            </p>
            
            <Button 
              onClick={handleSubmit}
              className="mt-4"
              disabled={isSubmitting || userAnswer.trim().length < minimumLength}
            >
              {isSubmitting ? "Analyzing..." : "Submit"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIWritingPromptExercise;
