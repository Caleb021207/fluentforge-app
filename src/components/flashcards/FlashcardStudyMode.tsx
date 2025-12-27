import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PersonalizedFlashcard } from '@/hooks/usePersonalizedFlashcards';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Check, X, ArrowRight, Trophy } from 'lucide-react';

interface FlashcardStudyModeProps {
  cards: PersonalizedFlashcard[];
  onComplete: () => void;
  onUpdateMastery: (flashcardId: string, quality: number) => Promise<void>;
}

export const FlashcardStudyMode: React.FC<FlashcardStudyModeProps> = ({
  cards,
  onComplete,
  onUpdateMastery
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [results, setResults] = useState<{ correct: number; incorrect: number }>({
    correct: 0,
    incorrect: 0
  });
  const [isComplete, setIsComplete] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex) / cards.length) * 100;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleResponse = async (quality: number) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    
    // Update results
    if (quality >= 3) {
      setResults(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setResults(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
    }

    // Update mastery in database
    await onUpdateMastery(currentCard.id, quality);
    
    setIsUpdating(false);

    // Move to next card or complete
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      setIsComplete(true);
    }
  };

  if (isComplete) {
    const score = Math.round((results.correct / cards.length) * 100);
    
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
        >
          <div className="p-6 rounded-full bg-primary/10">
            <Trophy className="h-16 w-16 text-primary" />
          </div>
        </motion.div>

        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Session Complete!</h2>
          <p className="text-muted-foreground">
            You reviewed {cards.length} cards
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 text-center">
          <div>
            <p className="text-4xl font-bold text-green-500">{results.correct}</p>
            <p className="text-sm text-muted-foreground">Correct</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-red-500">{results.incorrect}</p>
            <p className="text-sm text-muted-foreground">Needs Review</p>
          </div>
        </div>

        <div className="w-48">
          <Progress value={score} className="h-3" />
          <p className="text-center mt-2 text-sm text-muted-foreground">
            {score}% accuracy
          </p>
        </div>

        <Button onClick={onComplete} size="lg">
          <ArrowRight className="mr-2 h-4 w-4" />
          Back to Flashcards
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-6 py-8">
      {/* Progress */}
      <div className="w-full max-w-lg space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Card {currentIndex + 1} of {cards.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Flashcard */}
      <div 
        className="perspective-1000 w-full max-w-lg cursor-pointer"
        onClick={handleFlip}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentCard.id}-${isFlipped}`}
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="min-h-[300px] flex items-center justify-center">
              <CardContent className="p-8 text-center">
                {!isFlipped ? (
                  <div className="space-y-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      {currentCard.category}
                    </p>
                    <h3 className="text-3xl font-bold">{currentCard.term}</h3>
                    <p className="text-sm text-muted-foreground mt-4">
                      Tap to reveal answer
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-lg">{currentCard.definition}</p>
                    {currentCard.example && (
                      <p className="text-sm italic text-muted-foreground border-t pt-4 mt-4">
                        "{currentCard.example}"
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      {isFlipped && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-4"
        >
          <Button
            variant="outline"
            size="lg"
            className="border-red-500/50 text-red-500 hover:bg-red-500/10"
            onClick={() => handleResponse(1)}
            disabled={isUpdating}
          >
            <X className="mr-2 h-5 w-5" />
            Again
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="border-orange-500/50 text-orange-500 hover:bg-orange-500/10"
            onClick={() => handleResponse(3)}
            disabled={isUpdating}
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            Hard
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="border-green-500/50 text-green-500 hover:bg-green-500/10"
            onClick={() => handleResponse(4)}
            disabled={isUpdating}
          >
            <Check className="mr-2 h-5 w-5" />
            Good
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="border-blue-500/50 text-blue-500 hover:bg-blue-500/10"
            onClick={() => handleResponse(5)}
            disabled={isUpdating}
          >
            <Trophy className="mr-2 h-5 w-5" />
            Easy
          </Button>
        </motion.div>
      )}

      {/* Exit button */}
      <Button variant="ghost" onClick={onComplete}>
        Exit Study Session
      </Button>
    </div>
  );
};
