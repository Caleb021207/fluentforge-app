
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Check } from 'lucide-react';

interface SentenceCorrectionExerciseProps {
  exercise: {
    title: string;
    description: string;
    sentences: {
      incorrect: string;
      correct: string;
      hint?: string;
    }[];
    points: number;
  };
  onAnswer: (isCorrect: boolean) => void;
  timeLeft: number | null;
}

const SentenceCorrectionExercise: React.FC<SentenceCorrectionExerciseProps> = ({
  exercise,
  onAnswer,
}) => {
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [userCorrection, setUserCorrection] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  
  const currentSentence = exercise.sentences[currentSentenceIndex];
  
  const checkAnswer = () => {
    const isCorrect = userCorrection.trim().toLowerCase() === currentSentence.correct.toLowerCase();
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    }
    
    if (currentSentenceIndex < exercise.sentences.length - 1) {
      setCurrentSentenceIndex(currentSentenceIndex + 1);
      setUserCorrection('');
      setShowHint(false);
    } else {
      // All sentences corrected
      const finalScore = correctAnswers / exercise.sentences.length;
      onAnswer(finalScore > 0.7); // Pass if 70% correct
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-slate-50 p-6 rounded-lg">
        <h3 className="text-xl font-medium mb-3">{exercise.title}</h3>
        <p className="text-slate-600 mb-4">{exercise.description}</p>
        
        <div className="border rounded-lg p-4 bg-white">
          <div className="p-3 bg-red-50 text-red-800 rounded-md mb-4">
            <p className="font-medium">Incorrect sentence:</p>
            <p>{currentSentence?.incorrect}</p>
          </div>
          
          <label className="block text-sm font-medium mb-2">
            Write the corrected sentence:
          </label>
          <Textarea
            value={userCorrection}
            onChange={(e) => setUserCorrection(e.target.value)}
            placeholder="Type the corrected sentence here..."
            className="mb-4"
            rows={3}
          />
          
          <div className="flex space-x-3">
            {currentSentence?.hint && (
              <Button
                variant="outline"
                onClick={() => setShowHint(!showHint)}
                className="flex-1"
              >
                {showHint ? 'Hide Hint' : 'Show Hint'}
              </Button>
            )}
            
            <Button
              onClick={checkAnswer}
              disabled={!userCorrection.trim()}
              className="flex-1"
            >
              <Check className="h-4 w-4 mr-2" />
              Submit Correction
            </Button>
          </div>
          
          {showHint && currentSentence?.hint && (
            <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 rounded-md text-sm">
              <strong>Hint:</strong> {currentSentence.hint}
            </div>
          )}
        </div>
        
        <div className="mt-4 text-sm text-slate-500 flex justify-between">
          <p>Sentence {currentSentenceIndex + 1}/{exercise.sentences.length}</p>
          <p>Score: {correctAnswers}/{currentSentenceIndex}</p>
        </div>
      </div>
    </div>
  );
};

export default SentenceCorrectionExercise;
