
import React from "react";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";

interface ActiveTestProps {
  timeRemaining: number;
  conversationStatus: string;
  onEndEarly: () => void;
  formatTime?: (seconds: number) => string;
}

const ActiveTest: React.FC<ActiveTestProps> = ({
  timeRemaining,
  conversationStatus,
  onEndEarly,
  formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
}) => {
  const { t } = useLocalization();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <Mic className="h-5 w-5 text-blue-500" />
          <span className="font-medium">{t("listeningNow")}</span>
        </div>
        <div className="text-lg font-bold">
          {formatTime(timeRemaining)}
        </div>
      </div>
      
      <p className="text-sm text-gray-600">
        {t("speakClearlyInstructions")}
      </p>
      
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={onEndEarly}
          className="mt-2"
        >
          {t("endTestEarly")}
        </Button>
      </div>
      
      <div className="text-xs text-gray-500 text-center mt-4">
        {conversationStatus === "connected" 
          ? t("activeConnection") 
          : t("connectingToService")}
      </div>
    </div>
  );
};

export default ActiveTest;
