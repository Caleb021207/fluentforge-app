
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Puzzle, Check, X, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

interface VocabularyLessonProps {
  vocabulary: string[];
  onComplete: () => void;
}

const VocabularyLesson = ({ vocabulary, onComplete }: VocabularyLessonProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const [translations, setTranslations] = useState<string[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedTranslation, setSelectedTranslation] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const words = vocabulary.map(pair => pair.split(' - ')[0]);
    const trans = vocabulary.map(pair => pair.split(' - ')[1]);
    setShuffledWords(shuffleArray([...words]));
    setTranslations(shuffleArray([...trans]));
  }, [vocabulary]);

  const shuffleArray = (array: string[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const handleSelection = (type: 'word' | 'translation', value: string) => {
    if (type === 'word') {
      setSelectedWord(value);
    } else {
      setSelectedTranslation(value);
    }

    if ((type === 'word' && selectedTranslation) || (type === 'translation' && selectedWord)) {
      const word = type === 'word' ? value : selectedWord!;
      const translation = type === 'translation' ? value : selectedTranslation!;
      
      const isMatch = vocabulary.some(pair => {
        const [w, t] = pair.split(' - ');
        return (w === word && t === translation);
      });

      if (isMatch) {
        setMatchedPairs(prev => new Set([...prev, word]));
        setScore(prev => prev + 10);
        if (matchedPairs.size + 1 === vocabulary.length) {
          onComplete();
        }
      } else {
        setScore(prev => Math.max(0, prev - 5));
      }

      setAttempts(prev => prev + 1);
      setSelectedWord(null);
      setSelectedTranslation(null);
    }
  };

  const progress = (matchedPairs.size / vocabulary.length) * 100;

  return (
    <div className="space-y-8">
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="space-y-2">
            <h3 className="font-medium">Progress</h3>
            <Progress value={progress} className="h-2 w-[200px]" />
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{score}</p>
            <p className="text-sm text-muted-foreground">points</p>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h4 className="font-medium mb-4">Spanish Words</h4>
          <div className="space-y-2">
            {shuffledWords.map((word) => (
              <motion.div
                key={word}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  variant={selectedWord === word ? "default" : "outline"}
                  className={`w-full justify-start ${
                    matchedPairs.has(word) ? "bg-green-100 text-green-800" : ""
                  }`}
                  onClick={() => !matchedPairs.has(word) && handleSelection('word', word)}
                  disabled={matchedPairs.has(word)}
                >
                  {matchedPairs.has(word) ? <Check className="h-4 w-4 mr-2" /> : <Puzzle className="h-4 w-4 mr-2" />}
                  {word}
                  <Volume2 
                    className="ml-auto h-4 w-4 cursor-pointer hover:text-blue-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Text-to-speech functionality can be added here
                    }}
                  />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-4">English Translations</h4>
          <div className="space-y-2">
            {translations.map((translation) => (
              <motion.div
                key={translation}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  variant={selectedTranslation === translation ? "default" : "outline"}
                  className={`w-full justify-start ${
                    vocabulary.some(pair => {
                      const [word, trans] = pair.split(' - ');
                      return trans === translation && matchedPairs.has(word);
                    }) ? "bg-green-100 text-green-800" : ""
                  }`}
                  onClick={() => {
                    const isMatched = vocabulary.some(pair => {
                      const [word, trans] = pair.split(' - ');
                      return trans === translation && matchedPairs.has(word);
                    });
                    if (!isMatched) {
                      handleSelection('translation', translation);
                    }
                  }}
                  disabled={vocabulary.some(pair => {
                    const [word, trans] = pair.split(' - ');
                    return trans === translation && matchedPairs.has(word);
                  })}
                >
                  {vocabulary.some(pair => {
                    const [word, trans] = pair.split(' - ');
                    return trans === translation && matchedPairs.has(word);
                  }) ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <Puzzle className="h-4 w-4 mr-2" />
                  )}
                  {translation}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <Card className="p-4 mt-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">
              Matched: {matchedPairs.size}/{vocabulary.length}
            </p>
            <p className="text-sm text-muted-foreground">
              Attempts: {attempts}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">
              Accuracy: {attempts > 0 ? Math.round((matchedPairs.size / attempts) * 100) : 0}%
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default VocabularyLesson;
