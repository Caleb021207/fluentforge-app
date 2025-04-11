
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TimeControlsTabContentProps {
  timedUsage: boolean;
  dailyTimeLimit: number;
  onTimedUsageChange: (checked: boolean) => void;
  onTimeLimitChange: (value: string) => void;
}

const TimeControlsTabContent: React.FC<TimeControlsTabContentProps> = ({
  timedUsage,
  dailyTimeLimit,
  onTimedUsageChange,
  onTimeLimitChange
}) => {
  const { t } = useLocalization();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">{t("timeUsageLimits")}</h3>
          <p className="text-sm text-gray-500">{t("timeUsageLimitsDescription")}</p>
        </div>
        <Switch 
          checked={timedUsage} 
          onCheckedChange={onTimedUsageChange}
        />
      </div>
      
      {timedUsage && (
        <div>
          <Label>{t("dailyTimeLimit")}</Label>
          <div className="flex items-center gap-2 mt-1">
            <Input 
              type="number" 
              value={dailyTimeLimit}
              onChange={(e) => onTimeLimitChange(e.target.value)}
              min={0}
            />
            <span>{t("minutes")}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeControlsTabContent;
