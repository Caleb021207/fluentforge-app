
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ChevronLeft } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface TranscriptErrorProps {
  error: string;
  onBack: () => void;
}

const TranscriptError: React.FC<TranscriptErrorProps> = ({ error, onBack }) => {
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
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Transcript</AlertTitle>
            <AlertDescription>
              {error}
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

export default TranscriptError;
