import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Check, X, BookmarkPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Exercise, ClozePayload } from '@/types/exercises';

interface Props {
  exercise: Exercise;
  onComplete: (outcome: 'correct' | 'partial' | 'incorrect', score: number) => void;
  onSaveWord?: (word: { lemma: string; display: string; translation: string }) => void;
}

const ClozeExercise = ({ exercise, onComplete, onSaveWord }: Props) => {
  const payload = exercise.payload as ClozePayload;
  const [userAnswer, setUserAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const checkAnswer = () => {
    const normalized = userAnswer.trim().toLowerCase();
    const correct = payload.answer.some(ans => ans.toLowerCase() === normalized);
    
    setIsCorrect(correct);
    setSubmitted(true);

    setTimeout(() => {
      onComplete(correct ? 'correct' : 'incorrect', correct ? 100 : 0);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold">Fill in the Blank</h3>
        {payload.hint && (
          <p className="text-sm text-muted-foreground mt-2">Hint: {payload.hint}</p>
        )}
      </div>

      <Card className="p-8">
        <div className="text-xl text-center mb-6">
          {payload.prompt.split('___').map((part, i) => (
            <span key={i}>
              {part}
              {i < payload.prompt.split('___').length - 1 && (
                <span className="inline-block mx-2">
                  {submitted ? (
                    <span className={isCorrect ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                      {userAnswer || '___'}
                    </span>
                  ) : (
                    <span className="border-b-2 border-primary px-4">
                      <span className="invisible">placeholder</span>
                    </span>
                  )}
                </span>
              )}
            </span>
          ))}
        </div>

        {!submitted ? (
          <div className="flex gap-2">
            <Input
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
              placeholder="Type your answer..."
              className="text-lg"
              autoFocus
            />
            <Button onClick={checkAnswer} disabled={!userAnswer.trim()}>
              Check
            </Button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4"
          >
            {isCorrect ? (
              <div className="flex items-center justify-center gap-2 text-green-600">
                <Check className="w-6 h-6" />
                <span className="text-lg font-semibold">Correct!</span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-red-600">
                  <X className="w-6 h-6" />
                  <span className="text-lg font-semibold">Not quite</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Correct answer: <span className="font-bold">{payload.answer[0]}</span>
                </p>
              </div>
            )}
            
            {onSaveWord && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSaveWord({
                  lemma: payload.answer[0],
                  display: payload.answer[0],
                  translation: payload.hint || ''
                })}
              >
                <BookmarkPlus className="w-4 h-4 mr-2" />
                Save Word
              </Button>
            )}
          </motion.div>
        )}
      </Card>
    </div>
  );
};

export default ClozeExercise;
