
import React from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square } from "lucide-react";

interface ProVoiceControlsProps {
  isActive: boolean;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
}

const ProVoiceControls: React.FC<ProVoiceControlsProps> = ({
  isActive,
  onStart,
  onStop,
  disabled = false
}) => {
  return (
    <div className="flex justify-center mt-6">
      {!isActive ? (
        <Button
          onClick={onStart}
          disabled={disabled}
          className="flex items-center gap-2 px-6 py-4 text-lg bg-green-600 hover:bg-green-700"
        >
          <Mic className="h-5 w-5" />
          <span>Start Pro Voice Chat</span>
        </Button>
      ) : (
        <Button
          onClick={onStop}
          variant="destructive"
          className="flex items-center gap-2 px-6 py-4 text-lg"
        >
          <Square className="h-5 w-5" />
          <span>End Session</span>
        </Button>
      )}
    </div>
  );
};

export default ProVoiceControls;
