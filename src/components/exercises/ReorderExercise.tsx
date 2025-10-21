import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, X, Shuffle } from 'lucide-react';
import { shuffle } from '@/lib/utils';
import type { Exercise, ReorderPayload } from '@/types/exercises';

interface Props {
  exercise: Exercise;
  onComplete: (outcome: 'correct' | 'partial' | 'incorrect', score: number) => void;
}

const ReorderExercise = ({ exercise, onComplete }: Props) => {
  const payload = exercise.payload as ReorderPayload;
  const [tokens, setTokens] = useState(() => shuffle([...payload.tokens]));
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleTokenClick = (index: number) => {
    if (submitted) return;
    
    if (selectedIndices.includes(index)) {
      setSelectedIndices(prev => prev.filter(i => i !== index));
    } else {
      setSelectedIndices(prev => [...prev, index]);
    }
  };

  const handleShuffle = () => {
    setTokens(shuffle([...payload.tokens]));
    setSelectedIndices([]);
  };

  const checkAnswer = () => {
    const userOrder = selectedIndices.map(i => tokens[i]);
    const correct = JSON.stringify(userOrder) === JSON.stringify(payload.solution);
    
    setIsCorrect(correct);
    setSubmitted(true);

    setTimeout(() => {
      onComplete(correct ? 'correct' : 'incorrect', correct ? 100 : 0);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold">Arrange the Words</h3>
        <p className="text-sm text-muted-foreground">
          Tap the words in the correct order
        </p>
        {payload.hint && (
          <p className="text-sm text-muted-foreground mt-2">Hint: {payload.hint}</p>
        )}
      </div>

      {/* Selected words area */}
      <Card className="p-4 min-h-[100px] flex flex-wrap gap-2 items-start bg-muted/30">
        {selectedIndices.length === 0 ? (
          <div className="w-full text-center text-muted-foreground text-sm py-4">
            Tap words below to build your sentence
          </div>
        ) : (
          selectedIndices.map((tokenIndex, position) => (
            <Button
              key={`selected-${position}`}
              variant="secondary"
              onClick={() => handleTokenClick(tokenIndex)}
              disabled={submitted}
              className={submitted ? (isCorrect ? 'bg-green-500/20' : 'bg-red-500/20') : ''}
            >
              {tokens[tokenIndex]}
            </Button>
          ))
        )}
      </Card>

      {/* Available words */}
      <div className="flex flex-wrap gap-2 justify-center">
        {tokens.map((token, index) => (
          <Button
            key={index}
            variant="outline"
            onClick={() => handleTokenClick(index)}
            disabled={submitted}
            className={`transition-opacity ${
              selectedIndices.includes(index) ? 'opacity-30' : 'opacity-100'
            }`}
          >
            {token}
          </Button>
        ))}
      </div>

      <div className="flex justify-between items-center pt-4">
        <Button variant="ghost" size="sm" onClick={handleShuffle} disabled={submitted}>
          <Shuffle className="w-4 h-4 mr-2" />
          Shuffle
        </Button>

        {!submitted ? (
          <Button 
            onClick={checkAnswer} 
            disabled={selectedIndices.length !== tokens.length}
          >
            Check Answer
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            {isCorrect ? (
              <>
                <Check className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-600">Perfect!</span>
              </>
            ) : (
              <>
                <X className="w-5 h-5 text-red-600" />
                <span className="font-semibold text-red-600">Try Again</span>
              </>
            )}
          </div>
        )}
      </div>

      {submitted && !isCorrect && (
        <Card className="p-4 bg-muted/50">
          <p className="text-sm text-muted-foreground mb-2">Correct order:</p>
          <p className="font-medium">{payload.solution.join(' ')}</p>
        </Card>
      )}
    </div>
  );
};

export default ReorderExercise;
