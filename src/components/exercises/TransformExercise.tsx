import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Check, X, BookmarkPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Exercise, TransformPayload } from '@/types/exercises';

interface Props {
  exercise: Exercise;
  onComplete: (outcome: 'correct' | 'partial' | 'incorrect', score: number) => void;
  onSaveWord?: (word: { lemma: string; display: string; translation: string }) => void;
}

const TransformExercise = ({ exercise, onComplete, onSaveWord }: Props) => {
  const payload = exercise.payload as TransformPayload;
  const [userAnswer, setUserAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const getInstructionText = () => {
    const map = {
      negative: 'Make this sentence negative',
      question: 'Turn this into a question',
      third_person: 'Change to third person',
      past: 'Change to past tense'
    };
    return map[payload.instruction] || 'Transform the sentence';
  };

  const checkAnswer = () => {
    const normalized = userAnswer.trim().toLowerCase().replace(/[?.!]/g, '');
    const correct = payload.solutions.some(sol => 
      sol.toLowerCase().replace(/[?.!]/g, '') === normalized
    );
    
    setIsCorrect(correct);
    setSubmitted(true);

    setTimeout(() => {
      onComplete(correct ? 'correct' : 'incorrect', correct ? 100 : 0);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold">{getInstructionText()}</h3>
      </div>

      <Card className="p-6 bg-muted/30">
        <p className="text-xl text-center font-medium">{payload.input}</p>
      </Card>

      <Card className="p-8">
        {!submitted ? (
          <div className="space-y-4">
            <Input
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && userAnswer.trim() && checkAnswer()}
              placeholder="Type your answer..."
              className="text-lg"
              autoFocus
            />
            <Button 
              onClick={checkAnswer} 
              disabled={!userAnswer.trim()}
              className="w-full"
            >
              Check Answer
            </Button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="text-center">
              {isCorrect ? (
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <Check className="w-6 h-6" />
                  <span className="text-lg font-semibold">Excellent!</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-red-600">
                    <X className="w-6 h-6" />
                    <span className="text-lg font-semibold">Not quite</span>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Your answer:</p>
                    <p className="font-medium mb-3">{userAnswer}</p>
                    <p className="text-sm text-muted-foreground mb-1">Correct answer:</p>
                    <p className="font-medium text-green-600">{payload.solutions[0]}</p>
                  </div>
                </div>
              )}
            </div>
            
            {onSaveWord && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Extract key words from the solution
                  const words = payload.solutions[0].split(' ');
                  words.forEach(word => {
                    onSaveWord({
                      lemma: word.toLowerCase(),
                      display: word,
                      translation: ''
                    });
                  });
                }}
              >
                <BookmarkPlus className="w-4 h-4 mr-2" />
                Save Key Words
              </Button>
            )}
          </motion.div>
        )}
      </Card>
    </div>
  );
};

export default TransformExercise;
