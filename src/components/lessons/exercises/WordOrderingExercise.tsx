
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

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

interface WordOrderingExerciseProps {
  exercise: Exercise;
  onAnswer: (isCorrect: boolean) => void;
  timeLeft?: number | null;
}

const WordOrderingExercise: React.FC<WordOrderingExerciseProps> = ({
  exercise,
  onAnswer,
}) => {
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);

  useEffect(() => {
    // Initialize available words from options
    if (exercise.options) {
      setAvailableWords([...exercise.options].sort(() => Math.random() - 0.5));
    }
  }, [exercise]);

  const handleSelectWord = (word: string, index: number) => {
    // Move word from available to selected
    const newAvailableWords = [...availableWords];
    newAvailableWords.splice(index, 1);
    
    setAvailableWords(newAvailableWords);
    setSelectedWords([...selectedWords, word]);
  };

  const handleRemoveWord = (index: number) => {
    // Move word from selected back to available
    const newSelectedWords = [...selectedWords];
    const word = newSelectedWords[index];
    newSelectedWords.splice(index, 1);
    
    setSelectedWords(newSelectedWords);
    setAvailableWords([...availableWords, word]);
  };

  const handleClearAll = () => {
    // Reset all words
    if (exercise.options) {
      setAvailableWords([...exercise.options].sort(() => Math.random() - 0.5));
      setSelectedWords([]);
    }
  };

  const handleSubmit = () => {
    const userAnswer = selectedWords.join(' ');
    
    // Check if user's answer matches any of the correct answers
    if (Array.isArray(exercise.answer)) {
      const isCorrect = exercise.answer.includes(userAnswer);
      onAnswer(isCorrect);
    } else if (typeof exercise.answer === 'string') {
      const isCorrect = userAnswer === exercise.answer;
      onAnswer(isCorrect);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{exercise.question}</h3>
          
          {/* Selected words area */}
          <div className="p-4 min-h-16 border rounded-md bg-gray-50 flex flex-wrap gap-2">
            {selectedWords.length === 0 ? (
              <p className="text-gray-400 italic">Select words to build your sentence</p>
            ) : (
              selectedWords.map((word, index) => (
                <motion.button
                  key={`selected-${index}`}
                  className="bg-blue-500 text-white px-3 py-1 rounded-full"
                  onClick={() => handleRemoveWord(index)}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  {word}
                </motion.button>
              ))
            )}
          </div>
          
          {/* Available words area */}
          <div className="flex flex-wrap gap-2">
            {availableWords.map((word, index) => (
              <motion.button
                key={`available-${index}`}
                className="bg-gray-200 px-3 py-1 rounded-full hover:bg-gray-300"
                onClick={() => handleSelectWord(word, index)}
                whileHover={{ scale: 1.05 }}
              >
                {word}
              </motion.button>
            ))}
          </div>
          
          {/* Controls */}
          <div className="flex justify-between mt-4">
            <Button 
              variant="outline" 
              onClick={handleClearAll}
            >
              Clear All
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={selectedWords.length === 0}
            >
              Submit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WordOrderingExercise;
