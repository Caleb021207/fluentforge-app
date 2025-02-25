
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock } from 'lucide-react';

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

interface TimedQuizExerciseProps {
  exercise: Exercise;
  onAnswer: (isCorrect: boolean) => void;
  timeLeft?: number | null;
}

const TimedQuizExercise: React.FC<TimedQuizExerciseProps> = ({
  exercise,
  onAnswer,
  timeLeft,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    
    if (!exercise.answer) return;
    
    // For string array answers, check if the option matches any answer
    if (Array.isArray(exercise.answer)) {
      const isCorrect = exercise.answer.includes(option);
      onAnswer(isCorrect);
    } else {
      // For single string answer
      const isCorrect = option === exercise.answer;
      onAnswer(isCorrect);
    }
  };

  // Calculate time percentage
  const timePercentage = timeLeft !== null && exercise.timeLimit 
    ? (timeLeft / exercise.timeLimit) * 100 
    : 100;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {timeLeft !== null && (
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-amber-500" />
                <span className="text-sm font-medium">{timeLeft}s remaining</span>
              </div>
              <Progress value={timePercentage} className="h-2 w-32" />
            </div>
          )}
          
          <h3 className="text-lg font-medium">{exercise.question}</h3>
          
          {exercise.image && (
            <div className="flex justify-center my-4">
              <img src={exercise.image} alt="Quiz question" className="max-h-40 rounded-md" />
            </div>
          )}
          
          <div className="space-y-2 mt-4">
            {exercise.options?.map((option, index) => (
              <Button
                key={index}
                variant={selectedOption === option ? "default" : "outline"}
                className="w-full justify-start text-left h-auto py-3 px-4"
                onClick={() => handleOptionSelect(option)}
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimedQuizExercise;
