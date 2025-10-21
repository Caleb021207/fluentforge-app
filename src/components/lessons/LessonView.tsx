import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import VocabularyLesson from './VocabularyLesson';
import { useToast } from '@/components/ui/use-toast';
import { Award, ArrowLeft, Volume2 } from 'lucide-react';
import { useGamification } from '@/hooks/useGamification';
import LevelUpModal from '@/components/gamification/LevelUpModal';

interface LessonViewProps {
  onClose: () => void;
  onComplete: () => void;
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

const LessonView = ({ lesson, onClose, onComplete }: LessonViewProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const [earnedXP, setEarnedXP] = useState(0);
  const { awardXP, showLevelUpModal, setShowLevelUpModal, levelUpData, progression } = useGamification();

  const handleComplete = async (xpEarned: number) => {
    setEarnedXP((prev) => prev + xpEarned);
    setProgress((prev) => prev + (100 / lesson.challenges.length));
    
    if (currentStep === lesson.challenges.length - 1) {
      // Award XP for completing the lesson
      await awardXP('lesson', { difficulty: 'Medium' });
      
      toast({
        title: "Lesson Complete! 🎉",
        description: `You've earned ${earnedXP + xpEarned} XP points!`,
      });
      onComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const currentChallenge = lesson.challenges[currentStep];

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <Card className="w-full max-w-4xl overflow-hidden">
        <CardHeader className="relative py-3 px-3 sm:py-4 sm:px-6">
          <Button 
            variant="ghost" 
            className="absolute left-2 top-2 sm:left-4 sm:top-4 h-8 w-8 sm:h-9 sm:w-9 p-0"
            onClick={onClose}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Lessons</span>
          </Button>
          <div className="text-center pt-6 sm:pt-8">
            <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold">{lesson.title}</CardTitle>
            <p className="text-muted-foreground mt-3 text-base sm:text-lg md:text-xl">{lesson.description}</p>
          </div>
          <div className="mt-6">
            <div className="flex justify-between text-base sm:text-lg md:text-xl mb-3">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          {currentChallenge && (
            <>
              <div className="flex justify-between items-center mb-6 sm:mb-8">
                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold">
                  Challenge {currentStep + 1}/{lesson.challenges.length}
                </h3>
                <div className="flex items-center gap-2 sm:gap-3">
                  <Award className="h-6 w-6 sm:h-7 sm:w-7 text-yellow-500" />
                  <span className="font-medium text-base sm:text-lg md:text-xl">{currentChallenge.xpReward} XP</span>
                </div>
              </div>
              
              {currentChallenge.type === "vocabulary" && (
                <VocabularyLesson
                  vocabulary={lesson.vocabulary}
                  onComplete={() => handleComplete(currentChallenge.xpReward)}
                />
              )}
              {/* Add more challenge types here as needed */}
            </>
          )}
        </CardContent>
      </Card>

      {showLevelUpModal && levelUpData && (
        <LevelUpModal
          open={showLevelUpModal}
          onClose={() => setShowLevelUpModal(false)}
          oldLevel={levelUpData.oldLevel}
          newLevel={levelUpData.newLevel}
          totalXP={progression?.total_xp || 0}
        />
      )}
    </div>
  );
};

export default LessonView;
