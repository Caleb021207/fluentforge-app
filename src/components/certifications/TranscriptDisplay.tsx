
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ChevronLeft } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface TranscriptDisplayProps {
  attemptId: string;
  onBack: () => void;
}

const TranscriptDisplay = ({ attemptId, onBack }: TranscriptDisplayProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Button onClick={onBack} variant="outline" className="flex items-center">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Certificates
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Transcript</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Transcript In Development</AlertTitle>
            <AlertDescription>
              Transcript viewing is currently under development. This feature will be available soon!
            </AlertDescription>
          </Alert>
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
            <h3 className="font-medium mb-2">About Speaking & Listening Tests</h3>
            <p className="text-sm text-gray-600">
              Speaking and listening assessments evaluate your ability to communicate verbally in Spanish and understand spoken language. 
              These skills are crucial for real-world language use and complement your reading and writing abilities.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TranscriptDisplay;
