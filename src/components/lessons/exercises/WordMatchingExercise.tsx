
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Volume2, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface MatchPair {
  word: string;
  match: string;
  isImage?: boolean;
}

interface Exercise {
  id: number;
  type: string;
  question: string;
  pairs?: MatchPair[];
  points: number;
  timeLimit?: number;
}

interface WordMatchingExerciseProps {
  exercise: Exercise;
  onAnswer: (isCorrect: boolean) => void;
  timeLeft: number | null;
}

const WordMatchingExercise: React.FC<WordMatchingExerciseProps> = ({
  exercise,
  onAnswer,
  timeLeft
}) => {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [words, setWords] = useState<string[]>([]);
  const [matches, setMatches] = useState<string[]>([]);

  useEffect(() => {
    if (exercise.pairs) {
      // Shuffle the words and matches
      const shuffledWords = exercise.pairs.map(pair => pair.word).sort(() => Math.random() - 0.5);
      const shuffledMatches = exercise.pairs.map(pair => pair.match).sort(() => Math.random() - 0.5);
      
      setWords(shuffledWords);
      setMatches(shuffledMatches);
    }
  }, [exercise]);

  const handleSelectWord = (word: string) => {
    // Skip if this word is already matched
    if (Array.from(matchedPairs).includes(word)) return;
    
    setSelectedWord(word);
    
    // If a match is already selected, check if they form a correct pair
    if (selectedMatch) {
      checkMatch(word, selectedMatch);
    }
  };

  const handleSelectMatch = (match: string) => {
    // Skip if this match belongs to a word that's already matched
    const matchedWord = exercise.pairs?.find(pair => pair.match === match)?.word;
    if (matchedWord && Array.from(matchedPairs).includes(matchedWord)) return;
    
    setSelectedMatch(match);
    
    // If a word is already selected, check if they form a correct pair
    if (selectedWord) {
      checkMatch(selectedWord, match);
    }
  };

  const checkMatch = (word: string, match: string) => {
    // Find the correct pair for the selected word
    const correctPair = exercise.pairs?.find(pair => pair.word === word);
    
    if (correctPair && correctPair.match === match) {
      // Correct match
      setMatchedPairs(prev => new Set([...prev, word]));
      
      // Reset selections
      setSelectedWord(null);
      setSelectedMatch(null);
      
      // Check if all pairs are matched
      if (matchedPairs.size + 1 === exercise.pairs?.length) {
        setTimeout(() => onAnswer(true), 500);
      }
    } else {
      // Incorrect match
      setTimeout(() => {
        setSelectedWord(null);
        setSelectedMatch(null);
      }, 1000);
    }
  };

  const isWordMatched = (word: string) => {
    return matchedPairs.has(word);
  };

  const isMatchMatched = (match: string) => {
    const matchedWord = exercise.pairs?.find(pair => pair.match === match)?.word;
    return matchedWord ? matchedPairs.has(matchedWord) : false;
  };

  const playAudio = (word: string) => {
    try {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'es-ES';
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  // Check if the match is an image URL
  const isImage = (match: string) => {
    const pair = exercise.pairs?.find(p => p.match === match);
    return pair?.isImage;
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium mb-4">{exercise.question}</h3>

          <div className="grid grid-cols-2 gap-6">
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
                    variant={word === selectedWord ? "default" : "outline"}
                    className={`w-full justify-between ${
                      isWordMatched(word) ? "bg-green-100 text-green-800 border-green-300" : ""
                    }`}
                    onClick={() => handleSelectWord(word)}
                    disabled={isWordMatched(word)}
                  >
                    <span>{word}</span>
                    <div className="flex items-center">
                      {isWordMatched(word) && <Check className="h-4 w-4 mr-2" />}
                      <Volume2 
                        className="h-4 w-4 cursor-pointer hover:text-blue-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          playAudio(word);
                        }}
                      />
                    </div>
                  </Button>
                </motion.div>
              ))}
            </div>

            <div className="space-y-2">
              <h4 className="font-medium mb-2">Matches</h4>
              {matches.map((match) => (
                <motion.div
                  key={match}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Button
                    variant={match === selectedMatch ? "default" : "outline"}
                    className={`w-full ${
                      isMatchMatched(match) ? "bg-green-100 text-green-800 border-green-300" : ""
                    }`}
                    onClick={() => handleSelectMatch(match)}
                    disabled={isMatchMatched(match)}
                  >
                    {isImage(match) ? (
                      <img 
                        src={match} 
                        alt="Match" 
                        className="h-10 object-contain"
                      />
                    ) : (
                      <span>{match}</span>
                    )}
                    {isMatchMatched(match) && <Check className="h-4 w-4 ml-2" />}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WordMatchingExercise;
