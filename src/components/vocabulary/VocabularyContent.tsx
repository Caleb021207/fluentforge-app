
import { toast } from "@/components/ui/use-toast";
import FlashcardSetsList from "@/components/vocabulary/FlashcardSetsList";
import FlashcardView from "@/components/vocabulary/FlashcardView";
import GrammarRules from "@/components/vocabulary/GrammarRules";
import { 
  getFlashcardsForSet, 
  getAllFlashcardSets 
} from "@/components/vocabulary/data/flashcardData";

interface VocabularyContentProps {
  showGrammar: boolean;
  level: string;
  activeSetId: string | null;
  flashcardSets: any[];
  onSelectSet: (setId: string) => void;
  onCompleteStudy: (score?: number) => void;
}

const VocabularyContent = ({ 
  showGrammar, 
  level, 
  activeSetId, 
  flashcardSets, 
  onSelectSet, 
  onCompleteStudy 
}: VocabularyContentProps) => {
  // Get the full set data for the active set
  const activeSet = activeSetId 
    ? getAllFlashcardSets().find(set => set.id === activeSetId) 
    : null;
  
  // Get flashcards for the active set
  const flashcardsForActiveSet = activeSetId 
    ? getFlashcardsForSet(activeSetId)
    : [];
    
  if (showGrammar) {
    return <GrammarRules />;
  }
  
  if (activeSetId && activeSet) {
    return (
      <FlashcardView
        flashcards={flashcardsForActiveSet}
        onClose={() => onCompleteStudy()}
        setTitle={activeSet.title}
        onComplete={onCompleteStudy}
      />
    );
  }
  
  return (
    <>
      <h2 className="text-lg font-medium mb-2">Available Flashcard Sets for {level}</h2>
      <FlashcardSetsList 
        sets={flashcardSets} 
        onSelectSet={onSelectSet}
      />
    </>
  );
};

export default VocabularyContent;
