
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, AlertCircle } from "lucide-react";

interface TranscriptErrorProps {
  error: string;
  onBack: () => void;
}

const TranscriptError = ({ error, onBack }: TranscriptErrorProps) => {
  // Format error message to be more user-friendly
  const formatErrorMessage = (error: string) => {
    // Handle common errors
    if (error.includes('No transcript found')) {
      return "No transcript was found for this test. This can happen if the test was not completed properly or if there was an issue with saving your responses.";
    }
    if (error.includes('permission')) {
      return "You don't have permission to view this transcript. This transcript may belong to another user.";
    }
    if (error.includes('Authentication error')) {
      return "You need to be logged in to view transcripts. Please log in and try again.";
    }
    // Return original error if no specific handling
    return error || "There was an error loading the transcript. Please try again later.";
  };

  // Log the error for debugging purposes
  console.error("TranscriptError component received error:", error);

  return (
    <div className="space-y-4">
      <Button variant="outline" onClick={onBack}>
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center text-center p-6">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Transcript</h3>
            <p className="text-gray-600 mb-4">
              {formatErrorMessage(error)}
            </p>
            <div className="text-left p-4 bg-gray-50 rounded-md border border-gray-200 mb-4 w-full max-w-lg">
              <p className="text-sm text-gray-500 italic mb-2">Troubleshooting tips:</p>
              <ul className="text-sm text-gray-500 list-disc list-inside">
                <li>Check if you're logged in</li>
                <li>Make sure you've completed a speaking or listening test by clicking the "End Test" button</li>
                <li>The test must be properly ended - if the timer reaches zero, make sure you still click "End Test"</li>
                <li>Try refreshing the page</li>
                <li>Try taking the test again and make sure to submit it using the "End Test" button</li>
              </ul>
            </div>
            <Button variant="outline" onClick={onBack}>
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TranscriptError;
