
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
      <div className="flex justify-between items-center p-6 bg-blue-50 rounded-lg">
        <div className="flex items-center">
          {conversationStatus === "connected" ? (
            <Mic className="h-7 w-7 text-green-500 mr-3 animate-pulse" />
          ) : (
            <MicOff className="h-7 w-7 text-red-500 mr-3" />
          )}
          <span className="font-medium text-lg md:text-xl">
            {conversationStatus === "connected" 
              ? "Speak in Spanish to the AI tutor" 
              : "Connecting to AI tutor..."}
          </span>
        </div>
        <div className="text-right">
          <div className="text-2xl md:text-3xl font-bold">{formatTime(timeRemaining)}</div>
          <div className="text-sm md:text-base text-gray-500">remaining</div>
        </div>
      </div>
      
      <TestInstructions />
      
      <div className="flex justify-between">
        <Button 
          variant="outline"
          className="text-base md:text-lg px-6 py-6"
          onClick={() => {
            if (window.confirm("Are you sure you want to end the test early?")) {
              onEndEarly();
            }
          }}
        >
          End Test Early
        </Button>
        <div className="text-base md:text-lg text-gray-500 pt-2">
          Test will automatically end in {formatTime(timeRemaining)}
        </div>
      </div>
    </div>
  );
};

export default ActiveTest;
