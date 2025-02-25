
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Square } from 'lucide-react';

interface Exercise {
  id: number;
  type: string;
  question: string;
  options?: string[];
  answer?: string | string[];
  image?: string;
  audio?: string;
  points: number;
  feedback?: {
    correct: string;
    incorrect: string;
  };
  timeLimit?: number;
}

interface SpeechToTextExerciseProps {
  exercise: Exercise;
  onAnswer: (isCorrect: boolean) => void;
  timeLeft?: number | null;
}

const SpeechToTextExercise: React.FC<SpeechToTextExerciseProps> = ({
  exercise,
  onAnswer,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedText, setRecordedText] = useState('');
  
  const startRecording = () => {
    setIsRecording(true);
    
    // In a real implementation, this would use the Web Speech API
    // For demo purposes, we'll simulate recording after a delay
    setTimeout(() => {
      stopRecording();
    }, 3000);
  };
  
  const stopRecording = () => {
    setIsRecording(false);
    
    // Simulate transcription result
    // In a real app, this would come from speech recognition API
    const simulatedText = Array.isArray(exercise.answer) 
      ? exercise.answer[0] 
      : (exercise.answer || "Simulated transcription");
    
    setRecordedText(simulatedText);
    
    // Automatically check if correct after slight delay
    setTimeout(() => {
      checkAnswer(simulatedText);
    }, 1000);
  };
  
  const checkAnswer = (text: string) => {
    if (!exercise.answer) return;
    
    // For string array answers, check if the text matches any correct answer
    if (Array.isArray(exercise.answer)) {
      const isCorrect = exercise.answer.some(answer => 
        text.toLowerCase().trim() === answer.toLowerCase().trim()
      );
      onAnswer(isCorrect);
    } else {
      // For single string answer
      const isCorrect = text.toLowerCase().trim() === exercise.answer.toLowerCase().trim();
      onAnswer(isCorrect);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{exercise.question}</h3>
          
          {exercise.image && (
            <div className="flex justify-center my-4">
              <img 
                src={exercise.image} 
                alt="Exercise visual" 
                className="max-h-40 rounded-md" 
              />
            </div>
          )}
          
          <div className="flex justify-center my-6">
            {isRecording ? (
              <Button
                variant="destructive"
                size="lg"
                className="rounded-full h-16 w-16 p-0 flex items-center justify-center"
                onClick={stopRecording}
              >
                <Square className="h-6 w-6" />
              </Button>
            ) : (
              <Button
                variant="default"
                size="lg"
                className="rounded-full h-16 w-16 p-0 flex items-center justify-center"
                onClick={startRecording}
              >
                <Mic className="h-6 w-6" />
              </Button>
            )}
          </div>
          
          {recordedText && (
            <div className="bg-gray-50 p-4 rounded-md border">
              <p className="font-medium text-center">{recordedText}</p>
            </div>
          )}
          
          <p className="text-sm text-gray-500 italic text-center">
            {isRecording 
              ? "Listening... Speak clearly" 
              : "Press the microphone and speak the phrase in Spanish"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SpeechToTextExercise;
