
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

interface ShortAnswerExerciseProps {
  exercise: {
    title: string;
    description: string;
    questions: {
      text: string;
      acceptableAnswers: string[];
      hint?: string;
    }[];
    points: number;
  };
  onAnswer: (isCorrect: boolean) => void;
  timeLeft: number | null;
}

const ShortAnswerExercise: React.FC<ShortAnswerExerciseProps> = ({
  exercise,
  onAnswer,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  
  const currentQuestion = exercise.questions[currentQuestionIndex];
  
  const checkAnswer = () => {
    const isCorrect = currentQuestion.acceptableAnswers.some(
      answer => userAnswer.trim().toLowerCase() === answer.toLowerCase()
    );
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    }
    
    if (currentQuestionIndex < exercise.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer('');
      setShowHint(false);
    } else {
      // All questions answered
      const finalScore = correctAnswers / exercise.questions.length;
      onAnswer(finalScore > 0.7); // Pass if 70% correct
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-slate-50 p-6 rounded-lg">
        <h3 className="text-xl font-medium mb-3">{exercise.title}</h3>
        <p className="text-slate-600 mb-4">{exercise.description}</p>
        
        <div className="border rounded-lg p-4 bg-white">
          <p className="text-lg font-medium mb-4">{currentQuestion?.text}</p>
          
          <Textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Write your answer here..."
            className="mb-4"
            rows={4}
          />
          
          <div className="flex space-x-3">
            {currentQuestion?.hint && (
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
              disabled={!userAnswer.trim()}
              className="flex-1"
            >
              <Send className="h-4 w-4 mr-2" />
              Submit
            </Button>
          </div>
          
          {showHint && currentQuestion?.hint && (
            <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 rounded-md text-sm">
              <strong>Hint:</strong> {currentQuestion.hint}
            </div>
          )}
        </div>
        
        <div className="mt-4 text-sm text-slate-500 flex justify-between">
          <p>Question {currentQuestionIndex + 1}/{exercise.questions.length}</p>
          <p>Score: {correctAnswers}/{currentQuestionIndex}</p>
        </div>
      </div>
    </div>
  );
};

export default ShortAnswerExercise;
