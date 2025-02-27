
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PracticeRecommendationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onGoToPractice: () => void;
}

const PracticeRecommendationDialog = ({
  open,
  onOpenChange,
  title,
  description,
  onGoToPractice,
}: PracticeRecommendationDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="p-4 bg-blue-50 rounded-md my-2">
          <p className="text-sm">
            Now that you've reached an advanced vocabulary level, try our AI Practice feature to engage in text conversations and practice everyday spoken Spanish.
          </p>
        </div>
        <DialogFooter className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Maybe Later
          </Button>
          <Button onClick={onGoToPractice} className="bg-lingua-primary hover:bg-lingua-primary/90">
            Go to Practice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PracticeRecommendationDialog;
