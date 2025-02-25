
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Volume2 } from 'lucide-react';

interface Exercise {
  id: number;
  type: string;
  question: string;
  answer?: string | string[];
  audio?: string;
  points: number;
  blanks?: string[];
  timeLimit?: number;
}

interface FillInBlanksExerciseProps {
  exercise: Exercise;
  onAnswer: (isCorrect: boolean) => void;
  timeLeft: number | null;
}

const FillInBlanksExercise: React.FC<FillInBlanksExerciseProps> = ({
  exercise,
  onAnswer,
  timeLeft
}) => {
  const [answers, setAnswers] = useState<string[]>(Array(exercise.blanks?.length || 0).fill(''));

  const handleChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    // If the answer is a string array, compare each input with the corresponding answer
    if (Array.isArray(exercise.answer)) {
      const isCorrect = answers.every((answer, index) => 
        answer.toLowerCase().trim() === (exercise.answer as string[])[index].toLowerCase().trim()
      );
      onAnswer(isCorrect);
    } 
    // If the answer is a single string, join the user's inputs and compare
    else if (typeof exercise.answer === 'string') {
      const userAnswer = answers.join(' ').toLowerCase().trim();
      const isCorrect = userAnswer === exercise.answer.toLowerCase().trim();
      onAnswer(isCorrect);
    }
  };

  const playAudio = () => {
    if (exercise.audio) {
      const audio = new Audio(exercise.audio);
      audio.play();
    }
  };

  // Split the question by blanks and render inputs in between
  const renderQuestionWithBlanks = () => {
    if (!exercise.blanks) {
      return <p>{exercise.question}</p>;
    }

    // Parse the question looking for ___ placeholders
    const parts = exercise.question.split('___');
    
    return (
      <div className="space-y-4">
        {parts.map((part, index) => (
          <div key={index} className="inline">
            {part}
            {index < parts.length - 1 && (
              <Input
                value={answers[index] || ''}
                onChange={(e) => handleChange(index, e.target.value)}
                className="inline-block w-32 mx-1"
                placeholder="Type here"
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex-1">
              {renderQuestionWithBlanks()}
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

          <Button 
            onClick={handleSubmit} 
            disabled={answers.some(a => !a.trim())}
            className="w-full mt-4"
          >
            Submit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FillInBlanksExercise;
