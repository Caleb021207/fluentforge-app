
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

interface AIWritingPromptExerciseProps {
  exercise: {
    title: string;
    description: string;
    prompts: {
      instructions: string;
      minWords: number;
      topics: string[];
    }[];
    points: number;
  };
  onAnswer: (isCorrect: boolean) => void;
  timeLeft: number | null;
}

const AIWritingPromptExercise: React.FC<AIWritingPromptExerciseProps> = ({
  exercise,
  onAnswer,
}) => {
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [userResponse, setUserResponse] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  
  const currentPrompt = exercise.prompts[currentPromptIndex];
  
  const wordCount = userResponse.trim() ? userResponse.trim().split(/\s+/).length : 0;
  const hasMinWords = wordCount >= currentPrompt.minWords;
  
  const submitResponse = () => {
    // In a real app, this would send the response to an AI for evaluation
    // For this demo, we'll just check if it meets the minimum word count
    
    if (currentPromptIndex < exercise.prompts.length - 1) {
      setCurrentPromptIndex(currentPromptIndex + 1);
      setUserResponse('');
      setSelectedTopic(null);
    } else {
      // All prompts completed - simulate AI evaluation based on word count
      onAnswer(hasMinWords);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-slate-50 p-6 rounded-lg">
        <h3 className="text-xl font-medium mb-3">{exercise.title}</h3>
        <p className="text-slate-600 mb-4">{exercise.description}</p>
        
        <div className="border rounded-lg p-4 bg-white">
          <div className="mb-4">
            <p className="font-medium mb-2">Instructions:</p>
            <p>{currentPrompt?.instructions}</p>
            <p className="text-sm text-gray-500 mt-1">
              Write at least {currentPrompt?.minWords} words
            </p>
          </div>
          
          {currentPrompt?.topics.length > 0 && (
            <div className="mb-4">
              <p className="font-medium mb-2">Choose a topic:</p>
              <div className="flex flex-wrap gap-2">
                {currentPrompt.topics.map((topic, index) => (
                  <Button
                    key={index}
                    variant={selectedTopic === topic ? "default" : "outline"}
                    onClick={() => setSelectedTopic(topic)}
                    className="text-sm"
                  >
                    {topic}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          <div className="mb-4">
            <Textarea
              value={userResponse}
              onChange={(e) => setUserResponse(e.target.value)}
              placeholder="Write your response here..."
              className="min-h-[150px] resize-none"
            />
            <div className="flex justify-between mt-2 text-sm text-gray-500">
              <span>Word count: {wordCount}</span>
              {!hasMinWords && (
                <span className="text-amber-600">
                  {currentPrompt?.minWords - wordCount} more words needed
                </span>
              )}
            </div>
          </div>
          
          <Button
            onClick={submitResponse}
            disabled={!hasMinWords}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIWritingPromptExercise;
