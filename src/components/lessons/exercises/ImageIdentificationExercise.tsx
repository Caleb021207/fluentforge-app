
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface ImageIdentificationExerciseProps {
  exercise: {
    title: string;
    description: string;
    items: {
      imageUrl: string;
      options: string[];
      correctAnswer: number;
    }[];
    points: number;
  };
  onAnswer: (isCorrect: boolean) => void;
  timeLeft: number | null;
}

const ImageIdentificationExercise: React.FC<ImageIdentificationExerciseProps> = ({
  exercise,
  onAnswer,
}) => {
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  
  const currentItem = exercise.items[currentItemIndex];
  
  const handleOptionSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex);
    
    const isCorrect = optionIndex === currentItem.correctAnswer;
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    }
    
    // Move to next item after a short delay
    setTimeout(() => {
      if (currentItemIndex < exercise.items.length - 1) {
        setCurrentItemIndex(currentItemIndex + 1);
        setSelectedOption(null);
      } else {
        // All items answered
        const finalScore = correctAnswers / exercise.items.length;
        onAnswer(finalScore > 0.7); // Pass if 70% correct
      }
    }, 1000);
  };

  const getButtonVariant = (index: number) => {
    if (selectedOption === null) return "outline";
    if (index === currentItem.correctAnswer) return "default";
    if (index === selectedOption && index !== currentItem.correctAnswer) return "destructive";
    return "outline";
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-slate-50 p-6 rounded-lg">
        <h3 className="text-xl font-medium mb-3">{exercise.title}</h3>
        <p className="text-slate-600 mb-4">{exercise.description}</p>
        
        <div className="border rounded-lg p-4 bg-white">
          <div className="mb-4 flex justify-center">
            <img 
              src={currentItem?.imageUrl || '/placeholder.svg'} 
              alt="Identify this" 
              className="max-h-48 object-contain rounded-lg"
            />
          </div>
          
          <div className="space-y-3 mt-4">
            {currentItem?.options.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleOptionSelect(index)}
                variant={getButtonVariant(index)}
                disabled={selectedOption !== null}
                className="w-full justify-start text-left h-auto py-3 px-4"
              >
                {option}
                {selectedOption !== null && index === currentItem.correctAnswer && (
                  <Check className="ml-auto h-4 w-4" />
                )}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="mt-4 text-sm text-slate-500 flex justify-between">
          <p>Progress: {currentItemIndex + 1}/{exercise.items.length}</p>
          <p>Score: {correctAnswers}/{currentItemIndex}</p>
        </div>
      </div>
    </div>
  );
};

export default ImageIdentificationExercise;

