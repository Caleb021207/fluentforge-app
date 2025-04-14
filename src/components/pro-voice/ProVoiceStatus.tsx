
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
        {status === "listening" && (
          <div className="relative mr-2">
            <Mic className="h-5 w-5 text-green-500" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </div>
        )}
        {status === "processing" && <Loader2 className="h-5 w-5 text-blue-500 mr-2 animate-spin" />}
        {status === "speaking" && (
          <div className="relative mr-2">
            <Volume2 className="h-5 w-5 text-indigo-500" />
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 flex space-x-1">
              <div className="w-1 h-2 bg-indigo-500 rounded-full animate-soundwave"></div>
              <div className="w-1 h-3 bg-indigo-500 rounded-full animate-soundwave animation-delay-150"></div>
              <div className="w-1 h-2 bg-indigo-500 rounded-full animate-soundwave animation-delay-300"></div>
            </div>
          </div>
        )}
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
