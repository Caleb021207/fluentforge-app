
import React, { useEffect } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";

interface SpeechRateControlProps {
  speechRate: number;
  setSpeechRate: (rate: number) => void;
}

const SpeechRateControl: React.FC<SpeechRateControlProps> = ({ 
  speechRate, 
  setSpeechRate 
}) => {
  const { t } = useLocalization();

  useEffect(() => {
    // Load speech rate from localStorage on component mount
    const savedRate = localStorage.getItem("speechRate");
    if (savedRate) {
      setSpeechRate(parseFloat(savedRate));
    }
  }, [setSpeechRate]);

  const handleRateChange = (values: number[]) => {
    const newRate = values[0];
    setSpeechRate(newRate);
    localStorage.setItem("speechRate", newRate.toString());
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="w-[180px] justify-start">
          <Volume2 className="mr-2 h-4 w-4" />
          {t("speechRate")}: {speechRate.toFixed(1)}x
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="speech-rate">{t("speechRate")}</Label>
            <span className="text-sm font-medium">{speechRate.toFixed(1)}x</span>
          </div>
          <Slider
            id="speech-rate"
            min={0.5}
            max={2.0}
            step={0.1}
            defaultValue={[speechRate]}
            onValueChange={handleRateChange}
          />
          <div className="flex justify-between text-xs text-muted-foreground pt-1">
            <span>0.5x</span>
            <span>1.0x</span>
            <span>2.0x</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SpeechRateControl;
