
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface TranscriptDisplayProps {
  attemptId: string;
  onBack: () => void;
}

const TranscriptDisplay = ({ attemptId, onBack }: TranscriptDisplayProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button onClick={onBack} variant="outline">
          Back to Certificates
        </Button>
      </div>

      <Card>
        <CardHeader>
          {/* Empty header */}
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Transcript Unavailable</AlertTitle>
            <AlertDescription>
              This feature has been temporarily removed and will be rebuilt in a future update.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default TranscriptDisplay;
