
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { createExampleProfile } from "@/utils/seedExampleProfile";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const ExampleDataButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSeedData = async () => {
    setIsLoading(true);
    try {
      const result = await createExampleProfile();
      if (result && result.success && result.userId) {
        toast({
          title: "Success!",
          description: `Added example data for user profile: ${result.userId}`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add example data. See console for details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error seeding example data:", error);
      toast({
        title: "Error",
        description: "Failed to add example data. See console for details.",
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
          Adding Example Data...
        </>
      ) : (
        "Add Example Data"
      )}
    </Button>
  );
};

export default ExampleDataButton;
