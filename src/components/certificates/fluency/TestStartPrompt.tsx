
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TestStartPromptProps {
  isLoading: boolean;
  isLoggedIn: boolean;
  microphoneAccess: boolean;
  onStart: () => void;
}

const TestStartPrompt = ({
  isLoading,
  isLoggedIn,
  microphoneAccess,
  onStart
}: TestStartPromptProps) => {
  const [hasStudyMaterials, setHasStudyMaterials] = useState(true);
  
  useEffect(() => {
    const hasStudyMaterials = sessionStorage.getItem("hasStudyMaterials") === "true";
    setHasStudyMaterials(hasStudyMaterials);
  }, []);

  return (
    <div className="bg-gray-50 rounded-lg p-6 text-center">
      <p className="text-gray-500 mb-4">Ready to test your conversational Spanish skills?</p>
      
      {!hasStudyMaterials && (
        <Alert variant="warning" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            This test is not yet available for your selected language combination.
          </AlertDescription>
        </Alert>
      )}
      
      <Button 
        onClick={onStart} 
        disabled={isLoading || !isLoggedIn || !microphoneAccess || !hasStudyMaterials}
        className="bg-blue-500 hover:bg-blue-600"
      >
        {isLoading ? "Processing..." : "Start Test"}
      </Button>
      
      {!isLoggedIn && (
        <p className="text-sm text-red-400 mt-3">Please login to take the test</p>
      )}
      {!microphoneAccess && (
        <p className="text-sm text-red-400 mt-3">Microphone access required</p>
      )}
    </div>
  );
};

export default TestStartPrompt;
