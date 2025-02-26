
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import LevelSelector from "@/components/vocabulary/LevelSelector";
import FlashcardSetsList from "@/components/vocabulary/FlashcardSetsList";
import FlashcardView from "@/components/vocabulary/FlashcardView";
import { getFlashcardSetsByLevel, getFlashcardsBySetId, getAllFlashcardSets } from "@/components/vocabulary/data/flashcardData";

const Vocabulary = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const level = searchParams.get("level") || "A1";
  const { toast } = useToast();
  const [activeSetId, setActiveSetId] = useState<string | null>(null);
  
  // Fetch flashcard sets for the current level
  const flashcardSets = getFlashcardSetsByLevel(level);
  
  // Get the full set data for the active set
  const activeSet = activeSetId 
    ? getAllFlashcardSets().find(set => set.id === activeSetId) 
    : null;
  
  // Get flashcards for the active set
  const flashcardsForActiveSet = activeSetId 
    ? getFlashcardsBySetId(activeSetId)
    : [];
  
  const handleLevelChange = (newLevel: string) => {
    setSearchParams({ level: newLevel });
    setActiveSetId(null);
  };

  const handleSelectSet = (setId: string) => {
    setActiveSetId(setId);
    // In a real app, we would fetch the flashcards for this set from the API
    const cards = getFlashcardsBySetId(setId);
    if (cards.length === 0) {
      toast({
        title: "No flashcards available",
        description: "This set doesn't have any flashcards yet.",
        variant: "destructive",
      });
      setActiveSetId(null);
    }
  };

  const handleCompleteStudy = () => {
    toast({
      title: "Study session completed",
      description: "Great job! Your progress has been saved.",
    });
    setActiveSetId(null);
  };

  const getLevelDescription = (level: string) => {
    const descriptions: Record<string, string> = {
      "A1": "Beginner",
      "A2": "Elementary",
      "B1": "Intermediate",
      "B2": "Upper Intermediate",
      "C1": "Advanced",
      "C2": "Proficient"
    };
    return descriptions[level] || "Beginner";
  };

  return (
    <div className="container mx-auto px-4 pb-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">
          Vocabulary <span className="text-green-600 font-normal">{level} - {getLevelDescription(level)}</span>
        </h1>
        
        <div className="mb-6 mt-4 flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/4">
            <h2 className="text-lg font-medium mb-2">CEFR Levels</h2>
            <LevelSelector 
              currentLevel={level} 
              onLevelChange={handleLevelChange} 
            />
          </div>
          
          <div className="w-full md:w-3/4">
            {activeSetId && activeSet ? (
              <FlashcardView
                flashcards={flashcardsForActiveSet}
                onClose={() => setActiveSetId(null)}
                setTitle={activeSet.title}
              />
            ) : (
              <>
                <h2 className="text-lg font-medium mb-2">Available Flashcard Sets</h2>
                <FlashcardSetsList 
                  sets={flashcardSets} 
                  onSelectSet={handleSelectSet}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vocabulary;
