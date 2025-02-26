
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FlashcardSet } from "./types";
import { Progress } from "@/components/ui/progress";

interface FlashcardSetCardProps {
  set: FlashcardSet;
  onSelect: (setId: string) => void;
}

const FlashcardSetCard = ({ set, onSelect }: FlashcardSetCardProps) => {
  const progress = set.masteredCount ? Math.round((set.masteredCount / set.cardCount) * 100) : 0;
  
  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="text-lingua-primary">
            {set.icon}
          </div>
          <div className="text-xs font-semibold text-lingua-primary px-2 py-1 bg-lingua-secondary/20 rounded-full">
            {set.level}
          </div>
        </div>
        <CardTitle className="text-lg">{set.title}</CardTitle>
        <CardDescription>{set.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="text-sm text-muted-foreground">
          {set.cardCount} cards in this set
        </div>
        {set.masteredCount !== undefined && (
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => onSelect(set.id)}
        >
          Study Now
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FlashcardSetCard;
