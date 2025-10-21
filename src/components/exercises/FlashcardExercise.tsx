import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Volume2, BookmarkPlus, Check } from 'lucide-react';
import type { Exercise, FlashcardPayload } from '@/types/exercises';

interface Props {
  exercise: Exercise;
  onComplete: (outcome: 'correct' | 'partial' | 'incorrect', score: number) => void;
  onSaveWord?: (word: { lemma: string; display: string; translation: string; ipa?: string }) => void;
}

const FlashcardExercise = ({ exercise, onComplete, onSaveWord }: Props) => {
  const payload = exercise.payload as FlashcardPayload;
  const [currentCard, setCurrentCard] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [mode, setMode] = useState<'learn' | 'quiz'>('learn');
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set());

  const card = payload.cards[currentCard];

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  };

  const handleSaveWord = () => {
    if (onSaveWord && card) {
      onSaveWord({
        lemma: card.lemma,
        display: card.display,
        translation: card.translation,
        ipa: card.ipa
      });
      setSavedWords(prev => new Set(prev).add(card.lemma));
    }
  };

  const handleNext = () => {
    if (currentCard < payload.cards.length - 1) {
      setCurrentCard(prev => prev + 1);
      setShowBack(false);
    } else {
      // All cards reviewed
      onComplete('correct', 100);
    }
  };

  const handleQuizAnswer = (remembered: boolean) => {
    if (currentCard < payload.cards.length - 1) {
      setCurrentCard(prev => prev + 1);
      setShowBack(false);
    } else {
      onComplete('correct', 100);
    }
  };

  if (mode === 'learn') {
    return (
      <div className="space-y-6">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold">Flashcards - Learn</h3>
          <p className="text-sm text-muted-foreground">
            Study these cards, then test yourself
          </p>
        </div>

        <Card className="p-8 min-h-[300px] flex items-center justify-center relative cursor-pointer"
          onClick={() => setShowBack(!showBack)}
        >
          <div className="text-center">
            {!showBack ? (
              <>
                <div className="text-4xl font-bold mb-4">{card.display}</div>
                {card.ipa && (
                  <div className="text-lg text-muted-foreground mb-4">/{card.ipa}/</div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); speak(card.display); }}
                >
                  <Volume2 className="w-4 h-4 mr-2" />
                  Listen
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="text-2xl font-semibold text-primary">{card.translation}</div>
                {card.example && (
                  <div className="text-sm border-t pt-4 mt-4">
                    <p className="italic mb-1">{card.example.en}</p>
                    {card.example.trans && (
                      <p className="text-muted-foreground">{card.example.trans}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {showBack && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4"
              onClick={(e) => { e.stopPropagation(); handleSaveWord(); }}
              disabled={savedWords.has(card.lemma)}
            >
              {savedWords.has(card.lemma) ? (
                <Check className="w-4 h-4 mr-1" />
              ) : (
                <BookmarkPlus className="w-4 h-4 mr-1" />
              )}
              Save
            </Button>
          )}
        </Card>

        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Card {currentCard + 1} of {payload.cards.length}
          </div>
          <div className="space-x-2">
            {currentCard === payload.cards.length - 1 && showBack ? (
              <Button onClick={() => { setMode('quiz'); setCurrentCard(0); setShowBack(false); }}>
                Start Quiz
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={!showBack}>
                Next Card
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Quiz mode
  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold">Flashcards - Quiz</h3>
        <p className="text-sm text-muted-foreground">
          Do you remember this word?
        </p>
      </div>

      <Card className="p-8 min-h-[300px] flex items-center justify-center cursor-pointer"
        onClick={() => setShowBack(!showBack)}
      >
        <div className="text-center">
          {!showBack ? (
            <div className="text-2xl font-semibold text-primary">{card.translation}</div>
          ) : (
            <>
              <div className="text-4xl font-bold mb-4">{card.display}</div>
              {card.ipa && (
                <div className="text-lg text-muted-foreground mb-4">/{card.ipa}/</div>
              )}
            </>
          )}
        </div>
      </Card>

      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Card {currentCard + 1} of {payload.cards.length}
        </div>
        {showBack && (
          <div className="space-x-2">
            <Button variant="outline" onClick={() => handleQuizAnswer(false)}>
              Need Practice
            </Button>
            <Button onClick={() => handleQuizAnswer(true)}>
              Got It!
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashcardExercise;
