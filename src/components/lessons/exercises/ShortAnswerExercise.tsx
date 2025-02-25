
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

interface ShortAnswerExerciseProps {
  exercise: Exercise;
  onAnswer: (isCorrect: boolean) => void;
  timeLeft?: number | null;
}

const ShortAnswerExercise: React.FC<ShortAnswerExerciseProps> = ({
  exercise,
  onAnswer,
}) => {
  const [userAnswer, setUserAnswer] = useState('');

  const handleSubmit = () => {
    if (!exercise.answer) {
      // If there's no defined answer, we'll just count it as correct
      // This might be used for practice exercises
      onAnswer(true);
      return;
    }
    
    // For string array answers, check if any key phrases are included
    if (Array.isArray(exercise.answer)) {
      const lowerUserAnswer = userAnswer.toLowerCase();
      
      // Check if all required phrases are in the answer (more strict)
      // Or check if any key phrase is in the answer (more lenient)
      
      // Using lenient approach for better user experience
      const isCorrect = exercise.answer.some(phrase => 
        lowerUserAnswer.includes(phrase.toLowerCase())
      );
      onAnswer(isCorrect);
    } else {
      // For single string answer, check if it matches closely
      const similarity = calculateSimilarity(
        userAnswer.toLowerCase(), 
        exercise.answer.toLowerCase()
      );
      
      // Accept answers with at least 80% similarity
      const isCorrect = similarity >= 0.8;
      onAnswer(isCorrect);
    }
  };

  // Simple string similarity calculation
  const calculateSimilarity = (s1: string, s2: string): number => {
    const shorter = s1.length < s2.length ? s1 : s2;
    const longer = s1.length < s2.length ? s2 : s1;
    
    if (longer.length === 0) return 1.0;
    
    return (longer.length - editDistance(shorter, longer)) / longer.length;
  };

  // Levenshtein distance calculation for string similarity
  const editDistance = (s1: string, s2: string): number => {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
    
    const costs = [];
    
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(
              Math.min(newValue, lastValue),
              costs[j]
            ) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    
    return costs[s2.length];
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
                alt="Exercise visual" 
                className="max-h-40 rounded-md" 
              />
            </div>
          )}
          
          <Textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Write your answer..."
            className="mt-4"
            rows={4}
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

export default ShortAnswerExercise;
