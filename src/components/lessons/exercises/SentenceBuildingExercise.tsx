
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Volume2, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Exercise {
  id: number;
  type: string;
  question: string;
  answer?: string | string[];
  words?: string[];
  audio?: string;
  points: number;
  timeLimit?: number;
}

interface SentenceBuildingExerciseProps {
  exercise: Exercise;
  onAnswer: (isCorrect: boolean) => void;
  timeLeft: number | null;
}

const SentenceBuildingExercise: React.FC<SentenceBuildingExerciseProps> = ({
  exercise,
  onAnswer,
  timeLeft
}) => {
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);

  useEffect(() => {
    if (exercise.words) {
      // Shuffle the words
      setAvailableWords([...exercise.words].sort(() => Math.random() - 0.5));
    }
  }, [exercise]);

  const handleSelectWord = (word: string, index: number) => {
    // Remove from available and add to selected
    const newAvailable = [...availableWords];
    newAvailable.splice(index, 1);
    setAvailableWords(newAvailable);
    setSelectedWords([...selectedWords, word]);
  };

  const handleRemoveWord = (index: number) => {
    // Remove from selected and add back to available
    const newSelected = [...selectedWords];
    const removedWord = newSelected.splice(index, 1)[0];
    setSelectedWords(newSelected);
    setAvailableWords([...availableWords, removedWord]);
  };

  const handleSubmit = () => {
    const userSentence = selectedWords.join(' ');
    let isCorrect = false;
    
    if (typeof exercise.answer === 'string') {
      isCorrect = userSentence.toLowerCase() === exercise.answer.toLowerCase();
    } else if (Array.isArray(exercise.answer)) {
      isCorrect = exercise.answer.some(
        answer => userSentence.toLowerCase() === answer.toLowerCase()
      );
    }
    
    onAnswer(isCorrect);
  };

  const handleClearAll = () => {
    // Reset to initial state
    if (exercise.words) {
      setAvailableWords([...exercise.words].sort(() => Math.random() - 0.5));
      setSelectedWords([]);
    }
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
        <div className="space-y-6">
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

export default SentenceBuildingExercise;
