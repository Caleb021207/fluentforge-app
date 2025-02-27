
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FlashcardSet } from "./types";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface FlashcardSetCardProps {
  set: FlashcardSet;
  onSelect: (setId: string) => void;
}

const FlashcardSetCard = ({ set, onSelect }: FlashcardSetCardProps) => {
  const progress = set.masteredCount ? Math.round((set.masteredCount / set.cardCount) * 100) : 0;
  const { toast } = useToast();
  
  const handleSelectSet = () => {
    // Add logging to debug the set selection
    console.log(`Selecting flashcard set: ${set.id}`, set);
    
    // Call the onSelect handler with the set ID
    onSelect(set.id);
  };
  
  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="text-lingua-primary">
            {set.icon}
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs font-semibold text-lingua-primary px-2 py-1 bg-lingua-secondary/20 rounded-full">
              {set.level}
            </div>
            {set.completed && (
              <div className="text-green-600">
                <CheckCircle2 size={18} />
              </div>
            )}
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
        {set.completed && set.score !== undefined && (
          <div className="mt-3 text-sm">
            <span className="font-medium">Quiz Score: </span>
            <span className={`${set.score >= 80 ? 'text-green-600' : set.score >= 60 ? 'text-yellow-600' : 'text-red-600'} font-semibold`}>
              {set.score}%
            </span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={handleSelectSet}
        >
          {set.completed ? "Review Again" : "Study Now"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FlashcardSetCard;
