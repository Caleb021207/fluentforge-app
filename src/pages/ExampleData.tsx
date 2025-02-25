
import { useEffect, useState } from "react";
import { createExampleProfile } from "@/utils/seedExampleProfile";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Define a type that matches what createExampleProfile can return
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

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Example Data Generator</h1>
        
        <div className="mb-6">
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
