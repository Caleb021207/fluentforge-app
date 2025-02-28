
import React from "react";
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { ChevronLeft, MessageSquare, Activity } from "lucide-react";
import { formatCreatedAt } from "./utils/transcriptUtils";

interface TranscriptHeaderProps {
  onBack: () => void;
  createdAt: string;
  certificationType: string;
  score: number;
  level: string;
}

const TranscriptHeader = ({ 
  onBack, 
  createdAt, 
  certificationType,
  score,
  level
}: TranscriptHeaderProps) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Certificates
        </Button>
        <div className="text-sm text-gray-500">
          {formatCreatedAt(createdAt)}
        </div>
      </div>
      <CardTitle className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <span className="capitalize">{certificationType.replace('_', ' ')} Test Transcript</span>
        </div>
        <div className="flex items-center gap-2 text-base font-normal">
          <Activity className="h-4 w-4 text-lingua-primary" />
          Score: <span className="font-medium">{score}%</span> 
          <span className="text-gray-500">(Level {level})</span>
        </div>
      </CardTitle>
    </>
  );
};

export default TranscriptHeader;
