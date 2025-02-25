
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