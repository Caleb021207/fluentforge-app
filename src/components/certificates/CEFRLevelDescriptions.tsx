
import React from "react";
import { getLevelDescription } from "@/components/certifications/utils/scoreUtils";
import { rubricData } from "./CEFRLevelRubric";
import { useLocalization } from "@/context/LocalizationContext";

const CEFRLevelDescriptions = () => {
  const { currentLanguage } = useLocalization();
  
  return (
    <div className="mt-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        {currentLanguage === "spanish" ? "Descripciones de Niveles CEFR" : "CEFR Level Descriptions"}
      </h3>
      <div className="grid gap-4">
        {rubricData.map((item) => (
          <div key={item.level} className="p-4 bg-white rounded border">
            <h4 className="font-medium mb-2">
              {currentLanguage === "spanish" ? "Nivel " : "Level "}{item.level}
            </h4>
            <p className="text-sm text-gray-600">{getLevelDescription(item.level)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CEFRLevelDescriptions;
