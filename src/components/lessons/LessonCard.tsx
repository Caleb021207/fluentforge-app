
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import ChallengeList from "./ChallengeList";
import { Lesson } from "./types";

interface LessonCardProps {
  lesson: Lesson;
  onStart?: () => void;
}

const LessonCard = ({ lesson, onStart }: LessonCardProps) => {
  const { title, description, duration, icon, challenges = [], progress = 0 } = lesson;

  // Convert Challenge[] to string[] for ChallengeList component
  const challengeDescriptions = challenges.map(challenge => challenge.description);

  return (
    <Card className="h-full flex flex-col overflow-hidden shadow-sm">
      <CardHeader className="p-3">
        <div className="flex items-center gap-2">
          <div className="text-primary text-sm">{icon}</div>
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
        <CardDescription className="text-xs mt-1">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-3 pt-0">
        {challenges && challenges.length > 0 && (
          <div className="mt-1">
            <h4 className="text-xs font-medium mb-1">Challenges:</h4>
            <ChallengeList challenges={challengeDescriptions} />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-1 p-3 pt-0">
        <div className="w-full flex items-center justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-1" />
        <div className="flex items-center justify-between w-full mt-1">
          <span className="text-xs text-muted-foreground">{duration}</span>
          {onStart && (
            <Button size="sm" onClick={onStart} className="h-7 text-xs">
              Start Lesson
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default LessonCard;
