
import React from "react";
import { Button } from "@/components/ui/button";

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
  return (
    <div className="bg-gray-50 rounded-lg p-6 text-center">
      <p className="text-gray-500 mb-4">Ready to test your conversational Spanish skills?</p>
      <Button 
        onClick={onStart} 
        disabled={isLoading || !isLoggedIn || !microphoneAccess}
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
