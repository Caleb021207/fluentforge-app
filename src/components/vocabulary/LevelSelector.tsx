
import { Button } from "@/components/ui/button";
import { Info, Book } from "lucide-react";

interface LevelSelectorProps {
  currentLevel: string;
  onLevelChange: (level: string) => void;
  onB1Selected?: () => void;
  onB2Selected?: () => void;
  onC1C2Selected?: () => void;
  onGrammarSelected?: () => void;
}

const LevelSelector = ({ 
  currentLevel, 
  onLevelChange, 
  onB1Selected,
  onB2Selected,
  onC1C2Selected,
  onGrammarSelected
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
  };
  
  return (
    <div className="space-y-3">
      <div className="flex flex-col space-y-2">
        {levels.map((level) => (
          <Button
            key={level}
            variant={currentLevel === level ? "default" : "outline"}
            className={`justify-start ${
              currentLevel === level 
                ? "bg-lingua-primary hover:bg-lingua-primary/90" 
                : ""
            }`}
            onClick={() => handleLevelClick(level)}
          >
            {icons[level]}
            <span className="font-bold mr-2">{level}</span>
            <span className="text-xs">{levelDescriptions[level]}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default LevelSelector;
