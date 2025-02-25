
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import ChallengeList from "./ChallengeList";

interface LessonCardProps {
  lesson: {
    id: number;
    title: string;
    description: string;
    duration: string;
    icon: JSX.Element;
    challenges?: string[];
    progress?: number;
  };
  onStart?: () => void;
}

const LessonCard = ({ lesson, onStart }: LessonCardProps) => {
  const { title, description, duration, icon, challenges = [], progress = 0 } = lesson;

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-primary">{icon}</div>
          <CardTitle className="text-lg sm:text-xl">{title}</CardTitle>
        </div>
        <CardDescription className="text-xs sm:text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {challenges && challenges.length > 0 && (
          <div className="mt-2">
            <h4 className="text-sm font-medium mb-2">Challenges:</h4>
            <ChallengeList challenges={challenges} />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-2 pt-2">
        <div className="w-full flex items-center justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex items-center justify-between w-full mt-2">
          <span className="text-xs text-muted-foreground">{duration}</span>
          {onStart && (
            <Button size="sm" onClick={onStart} className="px-3 py-1 h-auto text-xs sm:text-sm">
              Start Lesson
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default LessonCard;
