
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface WordOrderingExerciseProps {
  exercise: {
    title: string;
    description: string;
    sentences: {
      words: string[];
      correctOrder: number[];
    }[];
    points: number;
  };
  onAnswer: (isCorrect: boolean) => void;
  timeLeft: number | null;
}

const WordOrderingExercise: React.FC<WordOrderingExerciseProps> = ({
  exercise,
  onAnswer,
}) => {
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  
  const currentSentence = exercise.sentences[currentSentenceIndex];
  
  useEffect(() => {
    if (currentSentence) {
      // Shuffle the words for the current sentence
      setAvailableWords([...currentSentence.words].sort(() => Math.random() - 0.5));
      setSelectedWords([]);
    }
  }, [currentSentenceIndex, currentSentence]);
  
  const addWord = (word: string, index: number) => {
    setSelectedWords([...selectedWords, word]);
    setAvailableWords(availableWords.filter((_, i) => i !== index));
  };
  
  const removeWord = (index: number) => {
    const word = selectedWords[index];
    setSelectedWords(selectedWords.filter((_, i) => i !== index));
    setAvailableWords([...availableWords, word]);
  };
  
  const checkAnswer = () => {
    // Compare the user's word order with the correct order
    const userSentence = selectedWords.join(' ');
    const correctSentence = currentSentence.correctOrder.map(i => currentSentence.words[i]).join(' ');
    
    const isCorrect = userSentence === correctSentence;
    
    if (currentSentenceIndex < exercise.sentences.length - 1) {
      setCurrentSentenceIndex(currentSentenceIndex + 1);
    } else {
      // Last sentence completed
      onAnswer(isCorrect);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-slate-50 p-6 rounded-lg">
        <h3 className="text-xl font-medium mb-3">{exercise.title}</h3>
        <p className="text-slate-600 mb-4">{exercise.description}</p>
        
        <div className="border rounded-lg p-4 bg-white">
          {/* Selected words area */}
          <div className="min-h-20 p-4 border border-dashed border-gray-300 rounded-lg mb-4 flex flex-wrap gap-2">
            {selectedWords.length === 0 ? (
              <p className="text-gray-400 w-full text-center">Arrange the words to form a correct sentence</p>
            ) : (
              selectedWords.map((word, index) => (
                <Button
                  key={index}
                  variant="secondary"
                  className="px-3 py-1 h-auto"
                  onClick={() => removeWord(index)}
                >
                  {word}
                </Button>
              ))
            )}
          </div>
          
          {/* Available words */}
          <div className="flex flex-wrap gap-2 mb-4">
            {availableWords.map((word, index) => (
              <Button
                key={index}
                variant="outline"
                className="px-3 py-1 h-auto"
                onClick={() => addWord(word, index)}
              >
                {word}
              </Button>
            ))}
          </div>
          
          <Button
            onClick={checkAnswer}
            disabled={selectedWords.length !== currentSentence?.words.length}
            className="w-full"
          >
            <Check className="h-4 w-4 mr-2" />
            Check Answer
          </Button>
        </div>
        
        <div className="mt-4 text-sm text-slate-500">
          <p>Progress: {currentSentenceIndex + 1}/{exercise.sentences.length}</p>
        </div>
      </div>
    </div>
  );
};

export default WordOrderingExercise;
