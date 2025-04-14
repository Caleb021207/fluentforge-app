
import React from "react";
import { Check } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";

const ProVoiceBenefits: React.FC = () => {
  const { t } = useLocalization();
  
  const benefits = [
    "highQualityVoices",
    "naturalConversations", 
    "realTimeTranscription",
    "fifteenMinutesWeekly"
  ];
  
  return (
    <div className="mt-8 bg-blue-50 p-6 rounded-xl">
      <h3 className="text-xl font-semibold mb-4">Pro Voice Chat Benefits</h3>
      <ul className="space-y-3">
        {benefits.map((benefit, index) => (
          <li key={index} className="flex items-start gap-2">
            <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <span>{t(benefit)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProVoiceBenefits;
