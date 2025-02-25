
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import VocabularyLesson from './VocabularyLesson';
import { useToast } from '@/components/ui/use-toast';
import { Award, ArrowLeft, VolumeUp } from 'lucide-react';

interface LessonViewProps {
  onClose: () => void;
  lesson: {
    id: number;
    title: string;
    description: string;
    vocabulary: string[];
    challenges: {
      type: string;
      description: string;
      xpReward: number;
      unlocked: boolean;
    }[];
    xpPoints: number;
  };
}

const LessonView = ({ lesson, onClose }: LessonViewProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const [earnedXP, setEarnedXP] = useState(0);

  const handleComplete = (xpEarned: number) => {
    setEarnedXP((prev) => prev + xpEarned);
    setProgress((prev) => prev + (100 / lesson.challenges.length));
    
    if (currentStep === lesson.challenges.length - 1) {
      toast({
        title: "Lesson Complete! 🎉",
        description: `You've earned ${earnedXP + xpEarned} XP points!`,
      });
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const currentChallenge = lesson.challenges[currentStep];

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="relative">
          <Button 
            variant="ghost" 
            className="absolute left-4 top-4"
            onClick={onClose}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Lessons
          </Button>
          <div className="text-center pt-8">
            <CardTitle className="text-2xl font-bold">{lesson.title}</CardTitle>
            <p className="text-muted-foreground mt-2">{lesson.description}</p>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {currentChallenge && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">
                  Challenge {currentStep + 1}/{lesson.challenges.length}
                </h3>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium">{currentChallenge.xpReward} XP</span>
                </div>
              </div>
              
              {currentChallenge.type === "vocabulary" && (
                <VocabularyLesson
                  vocabulary={lesson.vocabulary}
                  onComplete={() => handleComplete(currentChallenge.xpReward)}
                />
              )}
              {/* Add more challenge types here */}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LessonView;

