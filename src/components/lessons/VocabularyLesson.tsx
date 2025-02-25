
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Puzzle, Check, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';

interface VocabularyLessonProps {
  vocabulary: string[];
  onComplete: () => void;
}

const VocabularyLesson = ({ vocabulary, onComplete }: VocabularyLessonProps) => {
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'incorrect' | null>(null);
  
  // Split vocabulary into groups of 6 pairs for each card
  const vocabGroups = vocabulary.reduce((acc, curr, i) => {
    const groupIndex = Math.floor(i / 6);
    if (!acc[groupIndex]) acc[groupIndex] = [];
    acc[groupIndex].push(curr);
    return acc;
  }, [] as string[][]);

  const [selectedWord, setSelectedWord] = useState<{ word: string; groupIndex: number } | null>(null);
  const [selectedTranslation, setSelectedTranslation] = useState<{ translation: string; groupIndex: number } | null>(null);

  const playAudio = async (text: string) => {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  const handleSelection = (
    type: 'word' | 'translation',
    value: string,
    groupIndex: number
  ) => {
    if (type === 'word') {
      setSelectedWord({ word: value, groupIndex });
    } else {
      setSelectedTranslation({ translation: value, groupIndex });
    }

    if (
      (type === 'word' && selectedTranslation?.groupIndex === groupIndex) ||
      (type === 'translation' && selectedWord?.groupIndex === groupIndex)
    ) {
      const word = type === 'word' ? value : selectedWord!.word;
      const translation = type === 'translation' ? value : selectedTranslation!.translation;
      
      const isMatch = vocabulary.some(pair => {
        const [w, t] = pair.split(' - ');
        return (w === word && t === translation);
      });

      if (isMatch) {
        setMatchedPairs(prev => new Set([...prev, word]));
        setScore(prev => prev + 10);
        setShowFeedback('correct');
        if (matchedPairs.size + 1 === vocabulary.length) {
          onComplete();
        }
      } else {
        setScore(prev => Math.max(0, prev - 5));
        setShowFeedback('incorrect');
      }

      setAttempts(prev => prev + 1);
      
      setTimeout(() => {
        setSelectedWord(null);
        setSelectedTranslation(null);
        setShowFeedback(null);
      }, 1000);
    }
  };

  const progress = (matchedPairs.size / vocabulary.length) * 100;

  return (
    <ScrollArea className="h-[calc(100vh-12rem)] px-4">
      <div className="space-y-8 max-w-4xl mx-auto">
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

        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-center p-4 rounded-lg ${
              showFeedback === 'correct' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {showFeedback === 'correct' ? "¡Correcto! 🎉" : "¡Inténtalo de nuevo! 💪"}
          </motion.div>
        )}

        <div className="grid gap-6">
          {vocabGroups.map((group, groupIndex) => {
            const words = group.map(pair => pair.split(' - ')[0]);
            const translations = group.map(pair => pair.split(' - ')[1]);
            
            return (
              <Card key={groupIndex} className="p-4">
                <CardHeader>
                  <CardTitle className="text-lg">Set {groupIndex + 1}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <h4 className="font-medium mb-2">Spanish Words</h4>
                      {words.map((word) => (
                        <motion.div
                          key={word}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Button
                            variant={selectedWord?.word === word ? "default" : "outline"}
                            className={`w-full justify-start ${
                              matchedPairs.has(word) ? "bg-green-100 text-green-800" : ""
                            }`}
                            onClick={() => !matchedPairs.has(word) && handleSelection('word', word, groupIndex)}
                            disabled={matchedPairs.has(word)}
                          >
                            {matchedPairs.has(word) ? <Check className="h-4 w-4 mr-2" /> : <Puzzle className="h-4 w-4 mr-2" />}
                            {word}
                            <Volume2 
                              className="ml-auto h-4 w-4 cursor-pointer hover:text-blue-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                playAudio(word);
                              }}
                            />
                          </Button>
                        </motion.div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium mb-2">English Translations</h4>
                      {translations.map((translation) => (
                        <motion.div
                          key={translation}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Button
                            variant={selectedTranslation?.translation === translation ? "default" : "outline"}
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
                                handleSelection('translation', translation, groupIndex);
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
                </CardContent>
              </Card>
            );
          })}
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
    </ScrollArea>
  );
};

export default VocabularyLesson;

