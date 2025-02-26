
import { Button } from "@/components/ui/button";

interface LevelSelectorProps {
  currentLevel: string;
  onLevelChange: (level: string) => void;
  onB1Selected?: () => void;
}

const LevelSelector = ({ currentLevel, onLevelChange, onB1Selected }: LevelSelectorProps) => {
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
    
    // If B1 is clicked and we have a handler for it, call it
    if (level === "B1" && onB1Selected) {
      onB1Selected();
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
