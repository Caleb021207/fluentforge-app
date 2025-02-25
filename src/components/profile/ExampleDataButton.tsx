
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { createExampleProfile, addExampleCertificationScores } from "@/utils/seedExampleProfile";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const ExampleDataButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSeedData = async () => {
    setIsLoading(true);
    try {
      // Add 50% certification scores instead of creating a new profile
      const result = await addExampleCertificationScores();
      if (result && result.success && result.userId) {
        toast({
          title: "Success!",
          description: `Added 50% certification scores for user profile: ${result.userId}`,
        });
      } else {
        toast({
          title: "Error",
          description: result?.error || "Failed to add certification scores. See console for details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding certification scores:", error);
      toast({
        title: "Error",
        description: "Failed to add certification scores. See console for details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSeedData}
      disabled={isLoading}
      variant="outline"
      size="sm"
      className="mt-4"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Adding 50% Scores...
        </>
      ) : (
        "Add 50% Certification Scores"
      )}
    </Button>
  );
};

export default ExampleDataButton;
