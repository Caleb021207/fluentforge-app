
import { Button } from "@/components/ui/button";
import { Book, Globe } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LevelSelectorProps {
  currentLevel: string;
  currentLanguage: string;
  onLevelChange: (level: string) => void;
  onLanguageChange: (language: string) => void;
  onB1Selected?: () => void;
  onB2Selected?: () => void;
  onC1C2Selected?: () => void;
  onGrammarSelected?: () => void;
  unlockedLevels?: Record<string, boolean>;
  availableLanguages?: string[];
}

const LevelSelector = ({ 
  currentLevel, 
  currentLanguage,
  onLevelChange, 
  onLanguageChange,
  onB1Selected,
  onB2Selected,
  onC1C2Selected,
  onGrammarSelected,
  unlockedLevels = { "A1": true, "Grammar": true },
  availableLanguages = ["Spanish", "French", "German", "Italian"]
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
      <div className="mb-4">
        <label htmlFor="language-select" className="text-sm font-medium mb-1 block">
          Language
        </label>
        <Select value={currentLanguage} onValueChange={onLanguageChange}>
          <SelectTrigger id="language-select" className="w-full">
            <div className="flex items-center">
              <Globe className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select language" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {availableLanguages.map((language) => (
              <SelectItem key={language} value={language}>
                {language}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <h2 className="text-sm font-medium mb-1">CEFR Levels</h2>
        <div className="flex flex-col space-y-2">
          {levels.map((level) => {
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
                        }`}
                        onClick={() => handleLevelClick(level)}
                      >
                        {icons[level]}
                        <span className="font-bold mr-2">{level}</span>
                        <span className="text-xs">{levelDescriptions[level]}</span>
                      </Button>
                    </div>
                  </TooltipTrigger>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LevelSelector;
