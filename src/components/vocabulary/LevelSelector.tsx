
import { Button } from "@/components/ui/button";
import { Info, Book, Lock } from "lucide-react";
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
    // A1 should always be available to everyone - absolutely ensure this
    if (level === "A1") {
      console.log("A1 level selected - this should always work");
      onLevelChange(level);
      return;
    }
    
    // Grammar is also always available
    if (level === "Grammar") {
      onLevelChange(level);
      if (onGrammarSelected) {
        onGrammarSelected();
      }
      return;
    }
    
    // Check if the level is unlocked
    if (!unlockedLevels[level]) {
      return;
    }
    
    onLevelChange(level);
    
    // Call appropriate handler based on the level selected
    if (level === "B1" && onB1Selected) {
      onB1Selected();
    } else if (level === "B2" && onB2Selected) {
      onB2Selected();
    } else if (level === "C1-C2" && onC1C2Selected) {
      onC1C2Selected();
    }
  };
  
  return (
    <div className="space-y-3">
      <div className="flex flex-col space-y-2">
        {levels.map((level) => {
          // Always make A1 and Grammar unlocked, never show as locked
          const isLocked = (level === "A1" || level === "Grammar") 
            ? false 
            : !unlockedLevels[level];
          
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
                      } ${
                        isLocked ? "opacity-70" : ""
                      }`}
                      onClick={() => handleLevelClick(level)}
                      disabled={isLocked}
                    >
                      {icons[level]}
                      <span className="font-bold mr-2">{level}</span>
                      <span className="text-xs">{levelDescriptions[level]}</span>
                      {isLocked && <Lock className="h-4 w-4 ml-auto" />}
                    </Button>
                  </div>
                </TooltipTrigger>
                {isLocked && (
                  <TooltipContent>
                    <p>Complete the previous level with at least 75% accuracy<br/>or pass a certification exam to unlock</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );
};

export default LevelSelector;
