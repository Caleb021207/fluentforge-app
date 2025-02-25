
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
    <Card className="h-full flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2 px-3 pt-3 sm:px-4 sm:pt-4">
        <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
          <div className="text-primary text-sm sm:text-base">{icon}</div>
          <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
        </div>
        <CardDescription className="text-xs line-clamp-2">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 px-3 sm:px-4 py-1 sm:py-2 text-sm">
        {challenges && challenges.length > 0 && (
          <div className="mt-1">
            <h4 className="text-xs sm:text-sm font-medium mb-1.5">Challenges:</h4>
            <ChallengeList challenges={challengeDescriptions} />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-1.5 pt-1 pb-3 px-3 sm:px-4">
        <div className="w-full flex items-center justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-1.5" />
        <div className="flex items-center justify-between w-full mt-1.5">
          <span className="text-xs text-muted-foreground">{duration}</span>
          {onStart && (
            <Button size="sm" onClick={onStart} className="h-7 px-2 py-0.5 text-xs">
              Start Lesson
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default LessonCard;
