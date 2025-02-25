
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Volume2 } from 'lucide-react';

interface Exercise {
  id: number;
  type: string;
  question: string;
  options?: string[];
  answer?: string | string[];
  audio?: string;
  points: number;
  timeLimit?: number;
}

interface MultipleChoiceExerciseProps {
  exercise: Exercise;
  onAnswer: (isCorrect: boolean) => void;
  timeLeft: number | null;
}

const MultipleChoiceExercise: React.FC<MultipleChoiceExerciseProps> = ({
  exercise,
  onAnswer,
  timeLeft
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleSubmit = () => {
    if (selectedOption === null) return;
    const isCorrect = selectedOption === exercise.answer;
    onAnswer(isCorrect);
  };

  const playAudio = () => {
    if (exercise.audio) {
      const audio = new Audio(exercise.audio);
      audio.play();
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex-1">
              <h3 className="text-lg font-medium mb-2">{exercise.question}</h3>
            </div>
            {exercise.audio && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={playAudio}
                className="ml-2"
              >
                <Volume2 className="h-5 w-5" />
              </Button>
            )}
          </div>

          <RadioGroup 
            value={selectedOption || ''} 
            onValueChange={setSelectedOption}
            className="space-y-3"
          >
            {exercise.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 border rounded-md hover:bg-gray-50 transition-colors">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <Button 
            onClick={handleSubmit} 
            disabled={selectedOption === null}
            className="w-full mt-4"
          >
            Submit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MultipleChoiceExercise;
