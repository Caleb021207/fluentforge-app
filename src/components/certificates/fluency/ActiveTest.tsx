
import React from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import TestInstructions from "./TestInstructions";
import { formatTime } from "@/utils/timeUtils";

interface ActiveTestProps {
  timeRemaining: number;
  conversationStatus: string;
  onEndEarly: () => void;
}

const ActiveTest = ({
  timeRemaining,
  conversationStatus,
  onEndEarly
}: ActiveTestProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center">
          {conversationStatus === "connected" ? (
            <Mic className="h-5 w-5 text-green-500 mr-2 animate-pulse" />
          ) : (
            <MicOff className="h-5 w-5 text-red-500 mr-2" />
          )}
          <span className="font-medium">
            {conversationStatus === "connected" 
              ? "Speak in Spanish to the AI tutor" 
              : "Connecting to AI tutor..."}
          </span>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold">{formatTime(timeRemaining)}</div>
          <div className="text-xs text-gray-500">remaining</div>
        </div>
      </div>
      
      <TestInstructions />
      
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => {
            if (window.confirm("Are you sure you want to end the test early?")) {
              onEndEarly();
            }
          }}
        >
          End Test Early
        </Button>
        <div className="text-sm text-gray-500 pt-2">
          Test will automatically end in {formatTime(timeRemaining)}
        </div>
      </div>
    </div>
  );
};

export default ActiveTest;
