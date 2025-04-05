
import React from "react";
import { Mic } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";

interface LoadingIndicatorProps {
  isListening?: boolean;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ isListening }) => {
  const { t } = useLocalization();
  
  return (
    <div className="flex flex-col items-center my-6">
      <div className="flex space-x-2">
        <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" />
        <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
        <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
      </div>
      
      {isListening && (
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <Mic className="w-4 h-4 mr-1 text-red-500 animate-pulse" />
          <span>{t("listeningNow")}...</span>
        </div>
      )}
    </div>
  );
};

export default LoadingIndicator;
