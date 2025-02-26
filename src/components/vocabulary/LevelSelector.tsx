
import { Button } from "@/components/ui/button";

interface LevelSelectorProps {
  currentLevel: string;
  onLevelChange: (level: string) => void;
  onB1Selected?: () => void;
  onB2Selected?: () => void;
  onC1Selected?: () => void;
  onC2Selected?: () => void;
}

const LevelSelector = ({ 
  currentLevel, 
  onLevelChange, 
  onB1Selected,
  onB2Selected,
  onC1Selected,
  onC2Selected
}: LevelSelectorProps) => {
  const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];
  
  const levelDescriptions: Record<string, string> = {
    "A1": "Beginner",
    "A2": "Elementary",
    "B1": "Intermediate",
    "B2": "Upper Intermediate",
    "C1": "Advanced",
    "C2": "Proficient"
  };
  
  const handleLevelClick = (level: string) => {
    onLevelChange(level);
    
    // Call appropriate handler based on the level selected
    if (level === "B1" && onB1Selected) {
      onB1Selected();
    } else if (level === "B2" && onB2Selected) {
      onB2Selected();
    } else if (level === "C1" && onC1Selected) {
      onC1Selected();
    } else if (level === "C2" && onC2Selected) {
      onC2Selected();
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
            <span className="font-bold mr-2">{level}</span>
            <span className="text-xs">{levelDescriptions[level]}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default LevelSelector;
