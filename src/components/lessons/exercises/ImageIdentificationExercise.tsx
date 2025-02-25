
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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

interface ImageIdentificationExerciseProps {
  exercise: Exercise;
  onAnswer: (isCorrect: boolean) => void;
  timeLeft?: number | null;
}

const ImageIdentificationExercise: React.FC<ImageIdentificationExerciseProps> = ({
  exercise,
  onAnswer,
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

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{exercise.question}</h3>
          
          {exercise.image && (
            <div className="flex justify-center my-4">
              <img 
                src={exercise.image} 
                alt="Identify this" 
                className="max-h-60 rounded-md border" 
              />
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-3 mt-4">
            {exercise.options?.map((option, index) => (
              <Button
                key={index}
                variant={selectedOption === option ? "default" : "outline"}
                className="w-full justify-center text-center h-auto py-3 px-4"
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

export default ImageIdentificationExercise;
