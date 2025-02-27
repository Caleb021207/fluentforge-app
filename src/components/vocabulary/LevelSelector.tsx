
import { Button } from "@/components/ui/button";
import { Book, Lock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LevelSelectorProps {
  currentLevel: string;
  onLevelChange: (level: string) => void;
  onB1Selected?: () => void;
  onB2Selected?: () => void;
  onC1C2Selected?: () => void;
  onGrammarSelected?: () => void;
  unlockedLevels?: Record<string, boolean>;
}

const LevelSelector = ({ 
  currentLevel, 
  onLevelChange, 
  onB1Selected,
  onB2Selected,
  onC1C2Selected,
  onGrammarSelected,
  unlockedLevels = { "A1": true, "Grammar": true }
}: LevelSelectorProps) => {
  const levels = ["A1", "A2", "B1", "B2", "C1-C2", "Grammar"];
  
  const levelDescriptions: Record<string, string> = {
    "A1": "Beginner",
    "A2": "Elementary",
    "B1": "Intermediate",
    "B2": "Upper Intermediate",
    "C1-C2": "Advanced",
    "Grammar": "Rules & Tips"
  };
  
  const icons: Record<string, JSX.Element> = {
    "Grammar": <Book className="h-4 w-4 mr-2" />
  };
  
  const handleLevelClick = (level: string) => {
    // Only change level if it's unlocked
    if (unlockedLevels[level]) {
      onLevelChange(level);
      
      // Call appropriate handler based on the level selected
      if (level === "B1" && onB1Selected) {
        onB1Selected();
      } else if (level === "B2" && onB2Selected) {
        onB2Selected();
      } else if (level === "C1-C2" && onC1C2Selected) {
        onC1C2Selected();
      } else if (level === "Grammar" && onGrammarSelected) {
        onGrammarSelected();
      }
    }
  };
  
  return (
    <div className="space-y-3">
      <div className="flex flex-col space-y-2">
        {levels.map((level) => {
          const isLocked = !unlockedLevels[level];
          
          return (
            <TooltipProvider key={level}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      variant={currentLevel === level ? "default" : "outline"}
                      className={`justify-start w-full ${
                        currentLevel === level 
                          ? "bg-lingua-primary hover:bg-lingua-primary/90" 
                          : ""
                      } ${isLocked ? "opacity-70" : ""}`}
                      onClick={() => handleLevelClick(level)}
                      disabled={isLocked}
                    >
                      {isLocked && <Lock className="h-4 w-4 mr-2 text-gray-400" />}
                      {!isLocked && icons[level]}
                      <span className={`font-bold mr-2 ${isLocked ? "text-gray-400" : ""}`}>{level}</span>
                      <span className={`text-xs ${isLocked ? "text-gray-400" : ""}`}>{levelDescriptions[level]}</span>
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {isLocked 
                    ? "Complete previous levels to unlock"
                    : `${level} - ${levelDescriptions[level]}`
                  }
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );
};

export default LevelSelector;
