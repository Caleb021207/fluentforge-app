
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Rotate3D, Volume, X, CheckCircle } from "lucide-react";
import { Flashcard } from "./types";
import { useToast } from "@/components/ui/use-toast";
import FlashcardQuiz from "./FlashcardQuiz";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

interface FlashcardViewProps {
  flashcards: Flashcard[];
  onClose: () => void;
  setTitle: string;
}

const FlashcardView = ({ flashcards, onClose, setTitle }: FlashcardViewProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [completed, setCompleted] = useState<number[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showPracticeDialog, setShowPracticeDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const currentCard = flashcards[currentIndex];
  const totalCards = flashcards.length;
  
  const handleNext = () => {
    if (currentIndex < totalCards - 1) {
      setCurrentIndex(currentIndex + 1);
      setFlipped(false);
    } else {
      if (completed.length === totalCards) {
        toast({
          title: "Set completed!",
          description: `You've reviewed all ${totalCards} cards in this set. Ready for a quiz?`,
        });
        setShowQuiz(true);
        
        // Show practice recommendation dialog if this is a B1 level flashcard
        if (currentCard && currentCard.level === "B1") {
          setShowPracticeDialog(true);
        }
      } else {
        toast({
          title: "Set completed!",
          description: `You've reviewed all ${totalCards} cards. Mark all as learned to take the quiz.`,
        });
      }
    }
  };
  
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setFlipped(false);
    }
  };
  
  const handleFlip = () => {
    setFlipped(!flipped);
  };
  
  const handleMarkLearned = () => {
    if (!completed.includes(currentIndex)) {
      setCompleted([...completed, currentIndex]);
      
      const newCompletedCount = completed.length + 1;
      toast({
        title: "Card marked as learned",
        description: `${newCompletedCount} of ${totalCards} cards completed.`,
        variant: "default",
      });
      
      if (newCompletedCount === totalCards && currentIndex === totalCards - 1) {
        setTimeout(() => {
          toast({
            title: "All cards learned!",
            description: "Great job! You're ready for the quiz.",
            variant: "default",
          });
          setShowQuiz(true);
          
          // Show practice recommendation dialog if this is a B1 level flashcard
          if (currentCard && currentCard.level === "B1") {
            setShowPracticeDialog(true);
          }
        }, 1000);
      }
    }
    handleNext();
  };
  
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      window.speechSynthesis.speak(utterance);
    } else {
      toast({
        title: "Speech not supported",
        description: "Your browser doesn't support text-to-speech functionality.",
        variant: "destructive",
      });
    }
  };
  
  const handleQuizCompletion = (score: number) => {
    toast({
      title: "Quiz completed!",
      description: `You scored ${score}% on this quiz. Great job!`,
    });
    
    // Show practice recommendation dialog if this is a B1 level flashcard
    if (currentCard && currentCard.level === "B1") {
      setShowPracticeDialog(true);
    } else {
      onClose();
    }
  };
  
  const handleGoToPractice = () => {
    setShowPracticeDialog(false);
    navigate("/practice");
  };
  
  if (showQuiz) {
    return (
      <FlashcardQuiz 
        flashcards={flashcards}
        onComplete={handleQuizCompletion}
        onBack={() => setShowQuiz(false)}
        setTitle={setTitle}
      />
    );
  }
  
  if (!currentCard) return null;
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{setTitle}</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="text-sm mb-2">
        Card {currentIndex + 1} of {totalCards} 
        {completed.length > 0 && ` • ${completed.length} learned`}
      </div>
      
      <div 
        className="flex-grow flex items-center justify-center cursor-pointer"
        onClick={handleFlip}
      >
        <Card className={`w-full h-64 relative ${flipped ? 'bg-gray-50' : 'bg-white'}`}>
          <CardContent className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            {!flipped ? (
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">{currentCard.term}</h3>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakText(currentCard.term);
                  }}
                >
                  <Volume className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-xl font-medium">{currentCard.definition}</h3>
                {currentCard.example && (
                  <p className="text-sm text-muted-foreground italic">
                    "{currentCard.example}"
                  </p>
                )}
              </div>
            )}
            
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
              {currentCard.level} • {currentCard.category}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex items-center justify-between mt-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handleFlip}
            className="flex items-center"
          >
            <Rotate3D className="h-4 w-4 mr-2" />
            Flip
          </Button>
          
          <Button 
            variant="default" 
            onClick={handleMarkLearned}
            className="bg-green-600 hover:bg-green-700"
          >
            Mark as Learned
          </Button>
        </div>
        
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleNext}
          disabled={currentIndex === totalCards - 1 && completed.length === totalCards}
        >
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
      
      {completed.length === totalCards && currentIndex === totalCards - 1 && (
        <div className="mt-4 text-center">
          <Button 
            variant="default" 
            onClick={() => setShowQuiz(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Take Quiz
          </Button>
        </div>
      )}

      {/* B1 Level Practice Recommendation Dialog */}
      <Dialog open={showPracticeDialog} onOpenChange={setShowPracticeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ready for Conversation Practice?</DialogTitle>
            <DialogDescription>
              Congratulations on reaching the B1 level! At this stage, it's highly recommended that you begin practicing real conversations to improve your fluency.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-blue-50 rounded-md my-2">
            <p className="text-sm">
              Now that you've mastered intermediate vocabulary, try our AI Practice feature to engage in text conversations and practice everyday spoken Spanish.
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

export default FlashcardView;
