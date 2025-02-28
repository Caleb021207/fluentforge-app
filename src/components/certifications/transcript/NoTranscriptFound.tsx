
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ChevronLeft } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface NoTranscriptFoundProps {
  onBack: () => void;
}

const NoTranscriptFound: React.FC<NoTranscriptFoundProps> = ({ onBack }) => {
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
            <AlertTitle>No Transcript Found</AlertTitle>
            <AlertDescription>
              We couldn't find a transcript for this test attempt. It may have been deleted or may not exist.
            </AlertDescription>
          </Alert>
          
          <div className="mt-6 text-center">
            <Button onClick={onBack} variant="default">
              Return to Certificates
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NoTranscriptFound;
