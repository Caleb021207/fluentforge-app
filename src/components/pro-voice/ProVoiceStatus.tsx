
import React from "react";
import { Mic, MicOff, Loader2, Volume2 } from "lucide-react";
import { formatTime } from "@/utils/timeUtils";

interface ProVoiceStatusProps {
  status: "idle" | "listening" | "processing" | "speaking";
  isActive: boolean;
  timeRemaining: number;
  statusText: string;
}

const ProVoiceStatus: React.FC<ProVoiceStatusProps> = ({
  status,
  isActive,
  timeRemaining,
  statusText
}) => {
  return (
    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
      <div className="flex items-center">
        {status === "idle" && <MicOff className="h-5 w-5 text-gray-500 mr-2" />}
        {status === "listening" && <Mic className="h-5 w-5 text-green-500 mr-2 animate-pulse" />}
        {status === "processing" && <Loader2 className="h-5 w-5 text-blue-500 mr-2 animate-spin" />}
        {status === "speaking" && <Volume2 className="h-5 w-5 text-indigo-500 mr-2 animate-pulse" />}
        <span className="font-medium">{statusText}</span>
      </div>
      {isActive && (
        <div className="text-right">
          <div className="text-lg font-bold">{formatTime(timeRemaining)}</div>
          <div className="text-xs text-gray-500">remaining</div>
        </div>
      )}
    </div>
  );
};

export default ProVoiceStatus;
