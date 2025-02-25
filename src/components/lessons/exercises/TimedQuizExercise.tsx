
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock } from 'lucide-react';

interface TimedQuizExerciseProps {
  exercise: {
    title: string;
    description: string;
    questions: {
      text: string;
      options: string[];
      correctAnswer: number;
    }[];
    timeLimit: number;
    points: number;
  };
  onAnswer: (isCorrect: boolean) => void;
  timeLeft: number | null;
}

const TimedQuizExercise: React.FC<TimedQuizExerciseProps> = ({
  exercise,
  onAnswer,
  timeLeft,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  
  const currentQuestion = exercise.questions[currentQuestionIndex];
  
  const handleOptionSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex);
    
    const isCorrect = optionIndex === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    }
    
    // Move to next question after a short delay
    setTimeout(() => {
      if (currentQuestionIndex < exercise.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedOption(null);
      } else {
        // All questions answered
        const finalScore = correctAnswers / exercise.questions.length;
        onAnswer(finalScore > 0.7); // Pass if 70% correct
      }
    }, 1000);
  };

  const getButtonVariant = (index: number) => {
    if (selectedOption === null) return "outline";
    if (index === currentQuestion.correctAnswer) return "default";
    if (index === selectedOption && index !== currentQuestion.correctAnswer) return "destructive";
    return "outline";
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-slate-50 p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-medium">{exercise.title}</h3>
          
          {timeLeft !== null && (
            <div className="flex items-center text-amber-600">
              <Clock className="h-4 w-4 mr-1" />
              <span>{timeLeft}s</span>
            </div>
          )}
        </div>
        
        <p className="text-slate-600 mb-4">{exercise.description}</p>
        
        <div className="mb-2 flex justify-between text-sm">
          <span>Question {currentQuestionIndex + 1}/{exercise.questions.length}</span>
          <span>Score: {correctAnswers}/{currentQuestionIndex}</span>
        </div>
        
        <Progress 
          value={(currentQuestionIndex / exercise.questions.length) * 100} 
          className="h-2 mb-4" 
        />
        
        <div className="border rounded-lg p-4 bg-white mb-4">
          <p className="text-lg font-medium mb-4">{currentQuestion?.text}</p>
          
          <div className="space-y-3">
            {currentQuestion?.options.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleOptionSelect(index)}
                variant={getButtonVariant(index)}
                disabled={selectedOption !== null}
                className="w-full justify-start text-left h-auto py-3 px-4"
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimedQuizExercise;

