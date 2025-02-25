
import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface VocabularyProgressProps {
  score: number;
  progress: number;
  matchedCount: number;
  totalCount: number;
  attempts: number;
}

const VocabularyProgress: React.FC<VocabularyProgressProps> = ({
  score,
  progress,
  matchedCount,
  totalCount,
  attempts,
}) => {
  return (
    <>
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="space-y-2">
            <h3 className="font-medium">Progress</h3>
            <Progress value={progress} className="h-2 w-[200px]" />
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{score}</p>
            <p className="text-sm text-muted-foreground">points</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 mt-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">
              Matched: {matchedCount}/{totalCount}
            </p>
            <p className="text-sm text-muted-foreground">
              Attempts: {attempts}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">
              Accuracy: {attempts > 0 ? Math.round((matchedCount / attempts) * 100) : 0}%
            </p>
          </div>
        </div>
      </Card>
    </>
  );
};

export default VocabularyProgress;
