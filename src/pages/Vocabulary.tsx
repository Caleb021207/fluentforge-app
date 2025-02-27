
import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import LevelSelector from "@/components/vocabulary/LevelSelector";
import { 
  getFlashcardSetsByLevel, 
  getFlashcardsForSet, 
  updateFlashcardSetProgress 
} from "@/components/vocabulary/data/flashcardData";
import {
  saveFlashcardSetProgress
} from "@/components/vocabulary/utils/levelUnlockUtils";
import { supabase } from "@/integrations/supabase/client";
import VocabularyContent from "@/components/vocabulary/VocabularyContent";
import PracticeRecommendationDialog from "@/components/vocabulary/PracticeRecommendationDialog";
import LevelUnlockManager from "@/components/vocabulary/LevelUnlockManager";

const Vocabulary = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  // Default to A1 level
  const level = searchParams.get("level") || "A1";
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeSetId, setActiveSetId] = useState<string | null>(null);
  const [showPracticeDialog, setShowPracticeDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("Ready for Conversation Practice?");
  const [dialogDescription, setDialogDescription] = useState("");
  // Set A1 to always be unlocked by default
  const [unlockedLevels, setUnlockedLevels] = useState<Record<string, boolean>>({
    "A1": true,  // A1 is always unlocked
    "Grammar": true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [flashcardSets, setFlashcardSets] = useState<any[]>([]);
  
  // Get the current authenticated user
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    
    fetchUser();
  }, []);
  
  // Handler for when levels are loaded from LevelUnlockManager
  const handleLevelsLoaded = useCallback((levels: Record<string, boolean>) => {
    setUnlockedLevels(levels);
    setIsLoading(false);
  }, []);
  
  // Load flashcard sets for the current level
  useEffect(() => {
    // Force A1 level to be unlocked always, regardless of other settings
    if (!unlockedLevels["A1"]) {
      setUnlockedLevels(prev => ({...prev, "A1": true}));
    }
    
    // For A1 level, directly get the sets without any checks
    if (level === "A1") {
      const sets = getFlashcardSetsByLevel("A1");
      console.log(`Loading ${sets.length} A1 flashcard sets (always accessible)`);
      setFlashcardSets(sets);
      return;
    }
    
    // For other levels, get sets as normal
    const sets = getFlashcardSetsByLevel(level);
    console.log(`Loading ${sets.length} flashcard sets for level ${level}`);
    setFlashcardSets(sets);
  }, [level, unlockedLevels]);
  
  const handleLevelChange = (newLevel: string) => {
    // A1 and Grammar are always available, no need to check
    if (newLevel === "A1" || newLevel === "Grammar") {
      setSearchParams({ level: newLevel });
      setActiveSetId(null);
      return;
    }
    
    // Check if other levels are unlocked
    if (!unlockedLevels[newLevel]) {
      toast({
        title: "Level Locked",
        description: `You need to complete the previous level with at least 75% accuracy or pass a certification exam to unlock ${newLevel}.`,
        variant: "destructive",
      });
      return;
    }
    
    setSearchParams({ level: newLevel });
    setActiveSetId(null);
  };

  const handleB1Selected = () => {
    if (!unlockedLevels["B1"]) return;
    
    setDialogTitle("Ready for Conversation Practice?");
    setDialogDescription("Congratulations on reaching the B1 level! At this stage, it's highly recommended that you begin practicing real conversations to improve your fluency.");
    setShowPracticeDialog(true);
  };

  const handleB2Selected = () => {
    if (!unlockedLevels["B2"]) return;
    
    setDialogTitle("Advanced Conversation Practice");
    setDialogDescription("Great job reaching B2 level! At this upper intermediate stage, you should be able to discuss a wide range of topics with increased fluency and accuracy.");
    setShowPracticeDialog(true);
  };

  const handleC1C2Selected = () => {
    if (!unlockedLevels["C1-C2"]) return;
    
    setDialogTitle("Advanced Proficiency");
    setDialogDescription("Excellent work reaching the advanced C1-C2 levels! At this stage, you should focus on mastering nuanced expression, idioms, and native-like fluency through extensive conversation practice.");
    setShowPracticeDialog(true);
  };

  const handleGrammarSelected = () => {
    // No dialog needed for grammar, it just displays the grammar content
  };

  const handleGoToPractice = () => {
    setShowPracticeDialog(false);
    navigate("/practice");
  };

  const handleSelectSet = (setId: string) => {
    console.log(`Selecting flashcard set: ${setId}`);
    setActiveSetId(setId);
    
    // In a real app, we would fetch the flashcards for this set from the API
    const cards = getFlashcardsForSet(setId);
    if (cards.length === 0) {
      toast({
        title: "No flashcards available",
        description: "This set doesn't have any flashcards yet.",
        variant: "destructive",
      });
      setActiveSetId(null);
    }
  };

  const handleCompleteStudy = (score?: number) => {
    // Skip progress tracking for A1 level
    if (level === "A1") {
      toast({
        title: "Study session completed",
        description: "Great job! A1 level sets are always available and don't track progress.",
      });
      setActiveSetId(null);
      return;
    }
    
    if (activeSetId && score !== undefined) {
      // Update the completion status and score for this set
      updateFlashcardSetProgress(activeSetId, true, score);
      
      // Save the progress for level unlocking
      if (user?.id) {
        saveFlashcardSetProgress(user.id, level, activeSetId, score);
        
        // Check unlocked levels after progress update
        const checkUnlockedLevels = async () => {
          const updatedLevels = {...unlockedLevels};
          const levels = ["A2", "B1", "B2", "C1-C2"];
          
          for (const lvl of levels) {
            updatedLevels[lvl] = await isLevelUnlocked(lvl, user.id);
          }
          
          setUnlockedLevels(updatedLevels);
        };
        
        checkUnlockedLevels();
      }
      
      toast({
        title: "Study session completed",
        description: `Great job! You scored ${score}% and your progress has been saved.`,
      });
    } else {
      toast({
        title: "Study session completed",
        description: "Your progress has been saved.",
      });
    }
    setActiveSetId(null);
  };

  const getLevelDescription = (level: string) => {
    const descriptions: Record<string, string> = {
      "A1": "Beginner",
      "A2": "Elementary",
      "B1": "Intermediate",
      "B2": "Upper Intermediate",
      "C1-C2": "Advanced",
      "Grammar": "Rules & Tips"
    };
    return descriptions[level] || "Beginner";
  };

  // Determine if we should show grammar content instead of flashcards
  const showGrammar = level === "Grammar";

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8 flex justify-center items-center">
      <p>Loading vocabulary levels...</p>
    </div>;
  }

  return (
    <div className="container mx-auto px-4 pb-16">
      <LevelUnlockManager 
        userId={user?.id}
        onLevelsLoaded={handleLevelsLoaded}
      />
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">
          {showGrammar ? "Spanish Grammar" : "Vocabulary"} <span className="text-green-600 font-normal">{level} - {getLevelDescription(level)}</span>
        </h1>
        
        <div className="mb-6 mt-4 flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/4">
            <h2 className="text-lg font-medium mb-2">CEFR Levels</h2>
            <LevelSelector 
              currentLevel={level} 
              onLevelChange={handleLevelChange} 
              onB1Selected={handleB1Selected}
              onB2Selected={handleB2Selected}
              onC1C2Selected={handleC1C2Selected}
              onGrammarSelected={handleGrammarSelected}
              unlockedLevels={unlockedLevels}
            />
          </div>
          
          <div className="w-full md:w-3/4">
            <VocabularyContent
              showGrammar={showGrammar}
              level={level}
              activeSetId={activeSetId}
              flashcardSets={flashcardSets}
              onSelectSet={handleSelectSet}
              onCompleteStudy={handleCompleteStudy}
            />
          </div>
        </div>
      </div>

      <PracticeRecommendationDialog
        open={showPracticeDialog}
        onOpenChange={setShowPracticeDialog}
        title={dialogTitle}
        description={dialogDescription}
        onGoToPractice={handleGoToPractice}
      />
    </div>
  );
};

export default Vocabulary;
