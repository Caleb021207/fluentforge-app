
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, AlertCircle } from "lucide-react";

interface TranscriptErrorProps {
  error: string;
  onBack: () => void;
}

const TranscriptError = ({ error, onBack }: TranscriptErrorProps) => {
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
            <p className="text-gray-600 mb-4">{error}</p>
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
