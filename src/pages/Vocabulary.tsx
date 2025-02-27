
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import LevelSelector from "@/components/vocabulary/LevelSelector";
import FlashcardSetsList from "@/components/vocabulary/FlashcardSetsList";
import FlashcardView from "@/components/vocabulary/FlashcardView";
import GrammarRules from "@/components/vocabulary/GrammarRules";
import { 
  getFlashcardSetsByLevel, 
  getFlashcardsForSet, 
  getAllFlashcardSets, 
  updateFlashcardSetProgress 
} from "@/components/vocabulary/data/flashcardData";
import {
  isLevelUnlocked,
  saveFlashcardSetProgress
} from "@/components/vocabulary/utils/levelUnlockUtils";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

const Vocabulary = () => {
  const [searchParams, setSearchParams] = useSearchParams();
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
  
  // Get the current authenticated user
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      
      // Check which levels are unlocked
      await checkUnlockedLevels(data.user?.id);
      setIsLoading(false);
    };
    
    fetchUser();
  }, []);
  
  // Check which levels are unlocked for the current user
  const checkUnlockedLevels = async (userId?: string) => {
    const levels = ["A1", "A2", "B1", "B2", "C1-C2", "Grammar"];
    const unlocked: Record<string, boolean> = {};
    
    for (const lvl of levels) {
      unlocked[lvl] = await isLevelUnlocked(lvl, userId);
    }
    
    // Ensure A1 is always unlocked regardless of the response from isLevelUnlocked
    unlocked["A1"] = true;
    
    setUnlockedLevels(unlocked);
  };
  
  // Fetch flashcard sets for the current level
  const flashcardSets = getFlashcardSetsByLevel(level);
  
  // Get the full set data for the active set
  const activeSet = activeSetId 
    ? getAllFlashcardSets().find(set => set.id === activeSetId) 
    : null;
  
  // Get flashcards for the active set
  const flashcardsForActiveSet = activeSetId 
    ? getFlashcardsForSet(activeSetId)
    : [];
  
  const handleLevelChange = (newLevel: string) => {
    // A1 is always available
    if (newLevel === "A1") {
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
    if (activeSetId && score !== undefined) {
      // Update the completion status and score for this set
      updateFlashcardSetProgress(activeSetId, true, score);
      
      // Save the progress for level unlocking
      if (user?.id) {
        saveFlashcardSetProgress(user.id, level, activeSetId, score);
        
        // Check if this completion unlocks a new level
        checkUnlockedLevels(user.id);
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
            {showGrammar ? (
              <GrammarRules />
            ) : activeSetId && activeSet ? (
              <FlashcardView
                flashcards={flashcardsForActiveSet}
                onClose={() => setActiveSetId(null)}
                setTitle={activeSet.title}
                onComplete={handleCompleteStudy}
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

      {/* Practice Recommendation Dialog */}
      <Dialog open={showPracticeDialog} onOpenChange={setShowPracticeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>
              {dialogDescription}
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-blue-50 rounded-md my-2">
            <p className="text-sm">
              Now that you've reached an advanced vocabulary level, try our AI Practice feature to engage in text conversations and practice everyday spoken Spanish.
            </p>
          </div>
          <DialogFooter className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setShowPracticeDialog(false)}>
              Maybe Later
            </Button>
            <Button onClick={handleGoToPractice} className="bg-lingua-primary hover:bg-lingua-primary/90">
              Go to Practice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Vocabulary;
