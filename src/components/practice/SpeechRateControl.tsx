
import React from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useLocalization } from "@/context/LocalizationContext";

interface SpeechRateControlProps {
  speechRate: number;
  onChange: (value: number) => void;
}

const SpeechRateControl: React.FC<SpeechRateControlProps> = ({
  speechRate,
  onChange
}) => {
  const { t } = useLocalization();
  
  const handleSliderChange = (value: number[]) => {
    onChange(value[0]);
  };
  
  const getRateLabel = (rate: number) => {
    if (rate <= 0.6) return t("verySlow") || "Very slow";
    if (rate <= 0.8) return t("slow") || "Slow";
    if (rate >= 0.95 && rate <= 1.05) return t("normal") || "Normal";
    if (rate <= 1.5) return t("fast") || "Fast";
    return t("veryFast") || "Very fast";
  };

  return (
    <div className="flex flex-col space-y-2 w-full max-w-xs">
      <div className="flex items-center justify-between">
        <Label htmlFor="speech-rate">{t("speechRate") || "Speech Rate"}</Label>
        <span className="text-sm font-medium">{getRateLabel(speechRate)}</span>
      </div>
      
      <Slider
        id="speech-rate"
        min={0.5}
        max={2}
        step={0.1}
        value={[speechRate]}
        onValueChange={handleSliderChange}
        className="w-full"
      />
    </div>
  );
};

export default SpeechRateControl;
