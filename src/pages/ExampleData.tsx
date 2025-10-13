
import { useEffect, useState } from "react";
import { createExampleProfile, addExampleCertificationScores } from "@/utils/seedExampleProfile";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Define a type that matches what our profile functions can return
type ExampleProfileResult = {
  success: boolean;
  userId?: string;
  error?: any;
};

const ExampleDataPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ExampleProfileResult | null>(null);
  const { toast } = useToast();

  const handleSeedData = async () => {
    setIsLoading(true);
    try {
      const seedResult = await createExampleProfile();
      setResult(seedResult || null);
      
      if (seedResult && seedResult.success) {
        toast({
          title: "Success!",
          description: `Added example data for user profile with ID: ${seedResult.userId}.`,
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

  const handleAddCertScores = async () => {
    setIsLoading(true);
    try {
      const scoreResult = await addExampleCertificationScores();
      setResult(scoreResult || null);
      
      if (scoreResult && scoreResult.success) {
        toast({
          title: "Success!",
          description: `Added 50% certification scores for user profile: ${scoreResult.userId}`,
        });
      } else {
        toast({
          title: "Error",
          description: scoreResult?.error || "Failed to add certification scores. See console for details.",
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
    <div className="max-w-4xl mx-auto p-4">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Example Data Generator</h1>
        
        <div className="mb-4">
          <p className="text-gray-700 mb-4">
            This tool adds example data for the Example@gmail.com profile, which will populate:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>User profile with learning goals</li>
            <li>Certification attempts for A2 level across all skills</li>
            <li>Lesson progress for A1 (completed) and A2 (in progress)</li>
          </ul>
          <p className="text-sm text-gray-500">
            Note: This will create a new Example@gmail.com account with password 123456.
          </p>
        </div>

        <div className="flex flex-col space-y-4">
          <Button
            onClick={handleSeedData}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Example Data...
              </>
            ) : (
              "Generate Example Data"
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>

          <Button
            onClick={handleAddCertScores}
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Certification Scores...
              </>
            ) : (
              "Add 50% Certification Scores Only"
            )}
          </Button>
        </div>

        {result && result.success && result.userId && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <h3 className="font-semibold text-green-800 mb-2">Success!</h3>
            <p>Added example data for user {result.userId}</p>
            <p className="mt-2 text-sm">
              You can now login with Example@gmail.com (password: 123456) to see the populated profile.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExampleDataPage;
