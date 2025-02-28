
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, AlertCircle } from "lucide-react";

interface NoTranscriptFoundProps {
  onBack: () => void;
}

const NoTranscriptFound = ({ onBack }: NoTranscriptFoundProps) => {
  return (
    <div className="space-y-4">
      <Button variant="outline" onClick={onBack}>
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center text-center p-6">
            <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Transcript Found</h3>
            <p className="text-gray-600 mb-4">
              We couldn't find a transcript for this attempt. This might be because the test was
              taken before transcript saving was implemented.
            </p>
            <Button variant="outline" onClick={onBack}>
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NoTranscriptFound;
