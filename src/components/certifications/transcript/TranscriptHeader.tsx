
import React from "react";
import { CardTitle, CardDescription } from "@/components/ui/card";

interface TranscriptHeaderProps {
  prompt?: string | null;
}

const TranscriptHeader: React.FC<TranscriptHeaderProps> = ({ prompt }) => {
  return (
    <>
      <CardTitle>Test Transcript & Assessment</CardTitle>
      {prompt && (
        <CardDescription>
          Prompt: {prompt}
        </CardDescription>
      )}
    </>
  );
};

export default TranscriptHeader;
