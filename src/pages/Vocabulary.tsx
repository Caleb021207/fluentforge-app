
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import LevelSelector from "@/components/vocabulary/LevelSelector";
import FlashcardSetsList from "@/components/vocabulary/FlashcardSetsList";
import FlashcardView from "@/components/vocabulary/FlashcardView";
import GrammarRules from "@/components/vocabulary/GrammarRules";
import { 
  getFlashcardSetsByLevelAndLanguage, 
  getFlashcardsForSet, 
  getAllFlashcardSets, 
  updateFlashcardSetProgress 
} from "@/components/vocabulary/data/flashcardData";
import {
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

const Vocabulary = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const level = searchParams.get("level") || "A1";
  const language = searchParams.get("language") || "Spanish";
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeSetId, setActiveSetId] = useState<string | null>(null);
  const [showPracticeDialog, setShowPracticeDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("Ready for Conversation Practice?");
  const [dialogDescription, setDialogDescription] = useState("");
  // Set all levels to be unlocked by default
  const [unlockedLevels, setUnlockedLevels] = useState<Record<string, boolean>>({
    "A1": true,
    "A2": true,
    "B1": true,
    "B2": true,
    "C1-C2": true,
    "Grammar": true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [availableLanguages, setAvailableLanguages] = useState(["Spanish", "French", "German", "Italian"]);
  
  // Get the current authenticated user
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setIsLoading(false);
    };
    
    fetchUser();
  }, []);
  
  // Fetch flashcard sets for the current level and language
  const flashcardSets = getFlashcardSetsByLevelAndLanguage(level, language);
  
  // Get the full set data for the active set
  const activeSet = activeSetId 
    ? getAllFlashcardSets().find(set => set.id === activeSetId) 
    : null;
  
  // Get flashcards for the active set
  const flashcardsForActiveSet = activeSetId 
    ? getFlashcardsForSet(activeSetId)
    : [];
  
  const handleLevelChange = (newLevel: string) => {
    setSearchParams({ level: newLevel, language });
    setActiveSetId(null);
  };

  const handleLanguageChange = (newLanguage: string) => {
    setSearchParams({ level, language: newLanguage });
    setActiveSetId(null);
    toast({
      title: `Language changed to ${newLanguage}`,
      description: `You are now learning ${newLanguage} at ${level} level.`,
    });
  };

  const handleB1Selected = () => {
    setDialogTitle("Ready for Conversation Practice?");
    setDialogDescription(`Congratulations on reaching the B1 level in ${language}! At this stage, it's highly recommended that you begin practicing real conversations to improve your fluency.`);
    setShowPracticeDialog(true);
  };

  const handleB2Selected = () => {
    setDialogTitle("Advanced Conversation Practice");
    setDialogDescription(`Great job reaching B2 level in ${language}! At this upper intermediate stage, you should be able to discuss a wide range of topics with increased fluency and accuracy.`);
    setShowPracticeDialog(true);
  };

  const handleC1C2Selected = () => {
    setDialogTitle("Advanced Proficiency");
    setDialogDescription(`Excellent work reaching the advanced C1-C2 levels in ${language}! At this stage, you should focus on mastering nuanced expression, idioms, and native-like fluency through extensive conversation practice.`);
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
          {showGrammar ? `${language} Grammar` : `${language} Vocabulary`} <span className="text-green-600 font-normal">{level} - {getLevelDescription(level)}</span>
        </h1>
        
        <div className="mb-6 mt-4 flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/4">
            <LevelSelector 
              currentLevel={level} 
              currentLanguage={language}
              onLevelChange={handleLevelChange}
              onLanguageChange={handleLanguageChange}
              onB1Selected={handleB1Selected}
              onB2Selected={handleB2Selected}
              onC1C2Selected={handleC1C2Selected}
              onGrammarSelected={handleGrammarSelected}
              unlockedLevels={unlockedLevels}
              availableLanguages={availableLanguages}
            />
          </div>
          
          <div className="w-full md:w-3/4">
            {showGrammar ? (
              <GrammarRules language={language} />
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
                {flashcardSets.length > 0 ? (
                  <FlashcardSetsList 
                    sets={flashcardSets} 
                    onSelectSet={handleSelectSet}
                  />
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <p className="text-yellow-700">
                      We're still working on {language} flashcards for {level} level. 
                      Please check back soon or try another level or language!
                    </p>
                  </div>
                )}
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
              Now that you've reached an advanced vocabulary level, try our AI Practice feature to engage in text conversations and practice everyday spoken {language}.
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
